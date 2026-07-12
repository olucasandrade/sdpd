# FEATURE-01: System Builder mode — design the architecture, don't just diagnose it

**Audience fit:** Interview preppers (primary). System design interviews are *construction* exercises; SDPD today only tests *diagnosis* via multiple choice. Highest-value feature in the backlog.
**Effort:** ~1–2 weeks
**Infra:** none (pure client-side)
**Unlocks:** the 46 already-authored JSON files in `src/data/builder/` (23 challenges × EN/pt-BR) currently shipping unused — see `ISSUE-04-dead-code-audit.md` §4b.

## Concept

A new game mode at `/builder` (list) and `/builder/:challengeId` (play). Each challenge gives a scenario ("Rush Hour API — traffic surges are causing police report timeouts"), constraints, and a palette of components. The player drags components onto a canvas, connects them into an architecture, and submits. The engine grades the design against the challenge's concept rules and returns per-concept pass/fail with explanations — a system design interview with instant feedback.

## Existing data (build to it — do not redesign it)

Each `src/data/builder/challenges-NN.json` has this shape (from `challenges-01.json`):

```json
{
  "id": "builder-01",
  "number": 1,
  "title": "Rush Hour API",
  "subtitle": "Traffic surges are causing police report timeouts",
  "objective": "Choose and connect components that absorb spikes…",
  "constraints": ["Prioritize horizontal scalability", "…"],
  "availableComponents": ["client", "cdn", "loadBalancer", "api", "cache", "database"],
  "concepts": [
    {
      "id": "c1",
      "title": "Traffic Distribution",
      "description": "Use a load balancer in front of API services.",
      "requiredAll": ["client", "loadBalancer", "api"],
      "preferredConnections": [
        { "from": "client", "to": "loadBalancer" },
        { "from": "loadBalancer", "to": "api" }
      ]
    },
    {
      "id": "c2",
      "title": "Read Acceleration",
      "requiredAnyOf": ["cache", "cdn"],
      "preferredConnections": [{ "from": "api", "to": "cache" }]
    }
  ]
}
```

**First step for the implementer:** read ALL 23 EN files; produce the union of `availableComponents` values (at minimum `client`, `cdn`, `loadBalancer`, `api`, `cache`, `database`, `blobStorage` — verify by grep) and the union of concept-rule fields (`requiredAll`, `requiredAnyOf`, `preferredConnections`; check for others). Also read and run `node scripts/validate-builder-challenges.js` — an existing validator that encodes the intended schema.

## Implementation plan

### 1. Types — `src/types/builder.ts`

```ts
export type ComponentKind = 'client' | 'cdn' | 'loadBalancer' | 'api' | 'cache' | 'database' | 'blobStorage'; // extend per data audit

export interface BuilderConcept {
  id: string;
  title: string;
  description: string;
  requiredAll?: ComponentKind[];
  requiredAnyOf?: ComponentKind[];
  preferredConnections?: { from: ComponentKind; to: ComponentKind }[];
}

export interface BuilderChallenge {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  objective: string;
  constraints: string[];
  availableComponents: ComponentKind[];
  concepts: BuilderConcept[];
}

export interface PlacedComponent { instanceId: string; kind: ComponentKind; position: { x: number; y: number } }
export interface PlacedConnection { id: string; from: string; to: string } // instanceIds
```

### 2. Grading engine — `src/engine/builderGrader.ts` (pure, unit-tested)

Input: challenge + placed components + connections. Per concept:

- `requiredAll`: every listed kind has ≥1 placed instance.
- `requiredAnyOf`: at least one listed kind placed.
- `preferredConnections`: for each `{from, to}`, some connection exists whose source instance is of kind `from` and target of kind `to` (direction-sensitive; ANY matching instance pair satisfies it).

Per-concept score: `pass` (all rules hold), `partial` (required components present but connections missing), `fail`. Overall pass = every concept passes. Return structured results so the UI can say exactly which rule failed — the concept `description` doubles as the hint text. Also compute a non-blocking "orphan components" warning (placed but unconnected). Do NOT penalize extra components — real interviews reward defensible additions.

**Unit tests mandatory** (Vitest — setup per ISSUE-03): one test per rule type plus full pass/partial/fail scenarios using the real `challenges-01.json` as fixture.

### 3. Canvas — reuse the React Flow stack

`@xyflow/react` already renders case diagrams (`SystemDiagram.tsx`) with custom nodes (`src/components/diagram/DatabaseNode.tsx`, `ServerNode.tsx`, `ClientNode.tsx`). For the builder:

- Enable what the case diagram disables: `nodesDraggable`, `nodesConnectable`, `elementsSelectable`.
- Palette: left rail listing `availableComponents` with icons. V1: click-to-add at a default position (simplest); drag-from-palette via `@dnd-kit/core` (already a dependency) as polish.
- Node visuals for kinds without an existing component (`cdn`, `loadBalancer`, `cache`, `api`, `blobStorage`): one parameterized `BuilderNode` component cloned from `ServerNode.tsx`'s structure. Keep the noir style (`node-glow-*`, mono labels).
- Connections: React Flow `onConnect` appends to state. Deletion: select + Delete key, plus an × affordance for mobile.

### 4. Pages & routing

- `src/pages/BuilderListPage.tsx` (`/builder`): grid of 23 challenges with completion state — same card style as the home case board.
- `src/pages/BuilderPage.tsx` (`/builder/:challengeId`): brief panel (objective + constraints, reuse `CaseBrief` styling) + canvas + "Submit design" → per-concept report card (green/amber/red with `description` as the explanation). Free iterate-and-resubmit; count attempts.
- Register routes in `src/App.tsx`; add `[ BUILDER ]` to `Header.tsx`; add a promo card on Home mirroring the chaos card.
- Load challenge JSONs with lazy `import.meta.glob` from day one (pattern in `ISSUE-07-seo-performance.md` Part B), both locales keyed by `useGameState().locale`.

### 5. Persistence & progression

- Per-challenge state (components, connections, completed, attempts) under localStorage key `sdpd-builder-state` **with `schemaVersion` from day one** (follow `src/utils/localCaseStore.ts`'s pattern).
- Keep builder completions out of the 33-case `RANKS` math; show "N/23 designs approved" separately (hero/header).

### 6. i18n

All UI strings as `builder.*` keys in both locale files. Challenge content is already bilingual (`src/data/builder/pt-BR/`).

## Scope control (v1 excludes)

- No component properties (replica counts, TTLs) — the data doesn't model them.
- No auto-layout.
- No design sharing (FEATURE-04 territory).

## Verification

1. `node scripts/validate-builder-challenges.js` passes on all files.
2. Grader unit tests green.
3. Play-through of challenges 1, one with `requiredAnyOf`, and 23, in both locales: wrong design → partial/fail with correct explanations; corrected design → pass; state survives reload.
4. `npm run build` — challenge JSONs are lazy chunks, not in the entry bundle.

## Acceptance criteria

- [ ] All 23 challenges playable and gradable in EN and pt-BR.
- [ ] Grading is a pure, unit-tested module; feedback names the failed concept and why.
- [ ] Designs persist across reloads; attempts counted.
- [ ] Builder discoverable from header + home; noir visual language consistent.
- [ ] Case-mode diagram behavior untouched.
