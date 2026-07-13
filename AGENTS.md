# AGENTS.md — SDPD Developer Guide

This file is written for AI coding agents. It assumes no prior knowledge of the project. Read it before modifying code, adding features, or debugging.

> **Important:** The top-level `README.md` is outdated. The codebase has grown well beyond the 33-case campaign described there. This file reflects the actual project state.

---

## 1. Project Overview

**SDPD (Systems Design Police Department)** is an interactive, gamified learning platform for distributed systems design. The primary audience is system-design interview preppers, but it is also usable for courses and self-paced learning.

The app is a single-page React application that runs almost entirely in the browser:

- **Detective Campaign** — 33 sequential failure cases. Inspect diagrams, diagnose root cause, prescribe a fix.
- **System Builder** — 23 drag-and-drop architecture-design challenges graded against concept rules.
- **Chaos Simulator** — 3 presets where players inject faults and apply fixes while watching metrics/logs.
- **Daily Drill** — One timed case per UTC day, same for everyone worldwide, with stars + streaks.
- **Mock Interview** — 3 timed one-attempt rounds plus a written postmortem with a scoring rubric.
- **Detective's Notebook** — Spaced-repetition review built from missed questions and saved key terms.
- **System Design Cheatsheet** — 45 decision cards, searchable and tabbed by category.
- **Optional accounts / leaderboard** — GitHub OAuth via Supabase for cross-device sync and daily-drill leaderboard. Fully playable without it.

All gameplay progress is stored in `localStorage` by default. Supabase is strictly opt-in.

---

## 2. Technology Stack

| Layer | Technology |
|-------|------------|
| Framework | React 19 (StrictMode) |
| Language | TypeScript 5.8 |
| Build tool | Vite 6.3 |
| Styling | Tailwind CSS 4.1 with custom theme (`src/index.css`) |
| Routing | React Router 6.30 (`react-router-dom`) |
| State | Zustand 5.0 |
| Diagrams | XYFlow (`@xyflow/react`) for case and builder canvases |
| Drag & drop | `@dnd-kit/core` (builder palette) |
| Animation | Framer Motion 12.34 |
| Fonts | Fontsource: Bebas Neue, DM Sans, Space Mono |
| Optional backend | Supabase (`@supabase/supabase-js`) |
| Testing | Vitest 4.1 + jsdom |
| Linting | ESLint 9.25 + `typescript-eslint` + `eslint-plugin-react-hooks` + `eslint-plugin-react-refresh` |

Node 20+ and npm 8+ are expected.

---

## 3. Project Structure

```
sdpd/
├── public/                    # Static assets (og-image, vite.svg)
├── scripts/
│   ├── generate-case-index.mjs         # Builds src/data/case-index*.json
│   ├── validate-builder-challenges.js  # Schema/parity check for builder JSONs
│   ├── randomize-answers.js            # One-off helper (not used in build)
│   └── randomize-answers.py            # One-off helper (not used in build)
├── src/
│   ├── components/
│   │   ├── account/           # Sign-in, handle picker, account section
│   │   ├── builder/           # Builder canvas, palette, report card
│   │   ├── chaos/             # Chaos diagram
│   │   ├── common/            # Button, Badge, ProgressBar
│   │   ├── diagram/           # React Flow nodes (database, server, client, builder)
│   │   ├── game/              # CaseBrief, DiagnosisPanel, SystemDiagram, etc.
│   │   ├── guide/             # Educational concept guide panel
│   │   ├── interview/         # Interview setup, round, postmortem, debrief
│   │   ├── layout/            # Header, Sidebar, GameLayout, MobileMenu
│   │   └── leaderboard/       # Daily leaderboard panel
│   ├── context/
│   │   └── CloudAccountContext.tsx
│   ├── data/
│   │   ├── builder/           # 23 EN + 23 pt-BR challenge JSONs
│   │   ├── cases/             # 33 EN case JSONs
│   │   │   └── pt-BR/         # 33 pt-BR case translations
│   │   ├── case-index.json    # Generated lightweight case list (EN)
│   │   ├── case-index.pt-BR.json
│   │   ├── categories.ts      # Case category ranges
│   │   ├── chaos/presets.ts   # 3 chaos simulator presets
│   │   ├── cheatsheet/        # en.json + pt-BR.json + parity test
│   │   ├── concepts.json      # Educational concept material (EN)
│   │   └── concepts-pt-BR.json
│   ├── engine/
│   │   ├── validator.ts       # Multiple-choice answer validation
│   │   └── builderGrader.ts   # Pure grading engine for builder designs
│   ├── hooks/
│   │   ├── useGameState.ts    # Main campaign progress store
│   │   ├── useBuilderChallenges.ts
│   │   ├── useBuilderProgress.ts
│   │   ├── useChaosSimulator.ts
│   │   ├── useCheatsheet.ts
│   │   ├── useCloudAuth.ts
│   │   ├── useCloudSync.ts
│   │   ├── useDailyDrill.ts
│   │   ├── useInterviewSession.ts
│   │   └── useNotebook.ts
│   ├── i18n/
│   │   ├── index.ts
│   │   ├── useTranslation.ts
│   │   └── locales/
│   │       ├── en.json
│   │       └── pt-BR.json
│   ├── lib/
│   │   ├── leaderboard.ts     # Supabase leaderboard queries
│   │   └── supabase.ts        # Optional Supabase client
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── CasePage.tsx
│   │   ├── BuilderListPage.tsx
│   │   ├── BuilderPage.tsx
│   │   ├── ChaosPage.tsx
│   │   ├── CheatsheetPage.tsx
│   │   ├── DailyDrillPage.tsx
│   │   ├── InterviewPage.tsx
│   │   └── NotebookPage.tsx
│   ├── types/
│   │   ├── account.ts
│   │   ├── builder.ts
│   │   ├── case.ts
│   │   ├── chaos.ts
│   │   ├── cheatsheet.ts
│   │   ├── drill.ts
│   │   ├── game.ts
│   │   ├── interview.ts
│   │   └── notebook.ts
│   ├── utils/
│   │   ├── storage.ts         # Generic localStorage helper (campaign state)
│   │   ├── caseIds.ts
│   │   ├── drillShare.ts
│   │   ├── interviewSampling.ts
│   │   ├── interviewScore.ts
│   │   ├── localBuilderStore.ts
│   │   ├── localChaosStore.ts
│   │   ├── localDrillStore.ts
│   │   ├── localInterviewStore.ts
│   │   ├── localNotebookStore.ts
│   │   └── reviewScheduler.ts
│   ├── App.tsx                # Route definitions
│   ├── index.css              # Tailwind theme + custom noir styles
│   ├── main.tsx               # Entry point
│   └── vite-env.d.ts
├── supabase/
│   └── migrations/
│       └── 0001_accounts_leaderboard.sql
├── docs/backlog/              # Feature/issue specs (executed July 2026)
├── .env.example
├── .github/workflows/ci-cd.yml
├── eslint.config.js
├── index.html
├── package.json
├── tsconfig.json              # References tsconfig.app.json + tsconfig.node.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vercel.json
└── vite.config.ts
```

---

## 4. Build and Development Commands

```bash
# Install dependencies
npm install

# Start dev server (also regenerates case indexes)
npm run dev
# App is served at http://localhost:5173

# Production build
npm run build
# Runs: generate-case-index.mjs -> tsc -b -> vite build

# Preview production build locally
npm run preview

# Lint
npm run lint

# Lint with auto-fix
npm run lint -- --fix

# Run tests
npm test

# Type-check only
npx tsc --noEmit
```

The `predev` and `prebuild` scripts run `scripts/generate-case-index.mjs`, which scans `src/data/cases/` and `src/data/cases/pt-BR/` and writes `src/data/case-index.json` and `src/data/case-index.pt-BR.json`. Commit those generated files when cases change.

---

## 5. Code Style Guidelines

Follow the existing conventions. The linter and TypeScript configuration enforce most of this.

- **TypeScript**: strict mode is on. Avoid `any`. Prefer explicit return types on exported functions when non-obvious.
- **Imports**: use `type` imports for types (`verbatimModuleSyntax` is enabled).
- **Components**: function components as default exports in `pages/`, named exports in `components/`.
- **Hooks**: custom hooks are named `useXxx` and live in `src/hooks/`. Zustand stores are also in `src/hooks/`.
- **State**: use Zustand for global state, `useState`/`useReducer` for local UI state.
- **Strings**: all user-facing strings must come from `src/i18n/locales/en.json` and `src/i18n/locales/pt-BR.json`. No hardcoded UI text. Keys are dot-notated (e.g., `header.builder`, `diagnosis.submit`).
- **Styling**: Tailwind utility classes. Custom design tokens are defined in `src/index.css` under `@theme`:
  - Backgrounds: `bg-noir-950`, `bg-noir-900`, etc.
  - Accents: `text-amber-400`, `text-cyan-400`.
  - Fonts: `font-display`, `font-mono`, `font-sans`.
  - Reuse existing component/card patterns; do not invent new visual styles.
- **Comments**: explain *why*, not what. Complex business logic should have a short comment.
- **Error handling**: localStorage operations and optional Supabase calls should fail silently and degrade gracefully (offline-first).

---

## 6. Testing Instructions

Tests use **Vitest** with **jsdom** (configured in `vite.config.ts`).

```bash
# Run all tests
npm test

# Run a single test file
npx vitest run src/engine/builderGrader.test.ts

# Watch mode
npx vitest
```

Current test files:

- `src/data/cheatsheet/parity.test.ts` — locale parity for cheatsheet cards.
- `src/data/dailyDrill.test.ts` — UTC day math, streak logic, permutation validity.
- `src/engine/builderGrader.test.ts` — builder grading rules.
- `src/hooks/useGameState.test.ts` — rank derivation and unlock logic.
- `src/utils/localDrillStore.test.ts` — drill state persistence and history cap.
- `src/utils/reviewScheduler.test.ts` — spaced-repetition scheduling.
- `src/utils/storage.test.ts` — generic localStorage helper.

When adding new logic that can be unit-tested, add a co-located `*.test.ts` file. The project prefers pure-logic tests with minimal jsdom reliance; use a memory `Storage` stub when testing localStorage directly.

---

## 7. Data and Content Conventions

### 7.1 Cases

- Files: `src/data/cases/case-NN.json` and `src/data/cases/pt-BR/case-NN.json`.
- IDs: `case-01` through `case-33`.
- Categories and ranges are defined in `src/data/categories.ts`.
- Case indexes are generated; run `node scripts/generate-case-index.mjs` after adding or editing cases.

### 7.2 Builder Challenges

- Files: `src/data/builder/challenges-NN.json` and `src/data/builder/pt-BR/challenges-NN.json`.
- IDs: `builder-01` through `builder-23`.
- Component kinds: `client`, `cdn`, `loadBalancer`, `api`, `cache`, `database`, `blobStorage`, `queue`, `worker`.
- Concept rules: `requiredAll`, `requiredAnyOf`, `preferredConnections`, `discouragedComponents`.
- Validate with `node scripts/validate-builder-challenges.js` after edits. It checks schema, numbering, component kinds, and EN/pt-BR parity.

### 7.3 Concepts and Cheatsheet

- `src/data/concepts.json` / `concepts-pt-BR.json` contain educational material keyed by `conceptId`.
- `src/data/cheatsheet/en.json` / `pt-BR.json` contain 45 decision cards. IDs, categories, `relatedCaseIds`, `conceptId`, and option counts must match across locales (enforced by `parity.test.ts`).

### 7.4 Internationalization

- Supported locales: `en`, `pt-BR`.
- Default locale: `en`.
- All new UI strings require entries in both `src/i18n/locales/en.json` and `pt-BR.json`.
- Use `useTranslation()` hook; it falls back from current locale to `en` to the raw key.

---

## 8. State Management and Persistence

### Source of truth

`localStorage` is the source of truth for all gameplay. The app must remain fully playable when Supabase is not configured.

Storage keys:

| Key | Purpose | File |
|-----|---------|------|
| `sdpd-game-state` | Campaign progress, rank, locale, tutorial | `src/utils/storage.ts` |
| `sdpd-builder-state` | Builder designs, attempts, completions | `src/utils/localBuilderStore.ts` |
| `sdpd-drill-state` | Daily drill history, streaks | `src/utils/localDrillStore.ts` |
| `sdpd-interview-state` | Saved mock-interview sessions | `src/utils/localInterviewStore.ts` |
| `sdpd-notebook-state` | Spaced-repetition cards | `src/utils/localNotebookStore.ts` |
| `sdpd-chaos-state` | Chaos simulator presets/state | `src/utils/localChaosStore.ts` |

### Schema versioning

Every localStorage blob must carry a `schemaVersion`. On mismatch, the loader returns defaults (replace with real migrations when needed). See the existing store files for the pattern.

### Zustand stores

- `useGameState` — campaign progress, rank, locale, guide open/closed.
- `useBuilderProgress` — builder designs and completions.
- `useInterviewSession` — ephemeral interview session + saved sessions.
- `useNotebook` — spaced-repetition cards.

Keep Zustand stores action-free when serializing for cloud sync (see `useCloudSync.ts` — it explicitly extracts only plain fields).

---

## 9. Optional Supabase / Cloud Sync Setup

Cloud sync, accounts, and the daily-drill leaderboard are entirely opt-in. Without env vars, the app hides all account UI and makes zero network calls.

To enable:

1. Create a Supabase project.
2. Run `supabase/migrations/0001_accounts_leaderboard.sql` in the SQL editor.
3. In **Authentication → Providers**, enable **GitHub OAuth** with a valid client ID/secret.
4. In **Authentication → URL Configuration**, add allowed redirect origins (`http://localhost:5173`, production URL).
5. Copy `.env.example` to `.env.local` and fill in:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY` (public anon key only — never the service-role key)

Security model:

- The anon key is public by design.
- Row Level Security (RLS) is the real access boundary.
- `profiles` is publicly readable (for handles).
- `progress_sync` is per-user read/write.
- `drill_results` can only be inserted by the owning user; reads go through the `daily_leaderboard` view, which de-identifies rows.

See `docs/backlog/FEATURE-04-accounts-leaderboard.md` for the full spec.

---

## 10. Security Considerations

- **No anti-cheat**: drill scores and leaderboard entries are client-computed and trusted. This is intentional for a friendly, low-stakes game.
- **No service-role key in client code**: only the public anon key belongs in `.env.local`.
- **Sensitive files**: do not read or commit `.env.local`, SSH keys, or credential files.
- **Sanitize user-generated content**: the only user content currently stored is the interview postmortem text (stored locally) and the Supabase handle (validated 3–20 chars).
- **No secrets in logs**: the app logs only non-sensitive info such as "Supabase env vars not set".

---

## 11. Deployment

### Vercel

`vercel.json` contains a single rewrite rule to support client-side routing:

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

Before deploying, update the placeholder `PRODUCTION-URL` in `index.html` for canonical, Open Graph, and Twitter meta tags.

### CI/CD

`.github/workflows/ci-cd.yml` runs on pushes and PRs to `master`:

1. `npm ci`
2. `npm run lint`
3. `npx tsc --noEmit`
4. `npm test`
5. `npm run build`
6. Bundle size check
7. `npm audit --audit-level=moderate` (continue-on-error)

Matrix: Node 20.x and 22.x on Ubuntu.

---

## 12. Adding a New Route or Feature

When adding a new top-level screen:

1. Add the page component under `src/pages/`.
2. Register the route in `src/App.tsx` inside the `GameLayout` wrapper.
3. Add a navigation entry in `src/components/layout/Header.tsx` (and mobile menu if applicable).
4. Add i18n keys to both locale files.
5. If it needs persisted state, create a `localXxxStore.ts` under `src/utils/` with `schemaVersion`.
6. Add Vitest tests for pure logic.
7. Run `npm run lint`, `npm test`, and `npm run build` before declaring done.

---

## 13. Useful References

- Feature/issue specs live in `docs/backlog/` and include implementation steps, file references, and acceptance criteria.
- `README.md` describes the original 33-case campaign but does not cover builder, chaos, daily drill, interview, notebook, cheatsheet, or cloud sync.
- The visual language is intentionally noir/cyberpunk: dark backgrounds (`bg-noir-950`), amber and cyan accents, mono type for logs/data, Bebas Neue for headings.
