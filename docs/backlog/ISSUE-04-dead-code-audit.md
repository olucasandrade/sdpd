# ISSUE-04: Dead code audit — Investigation Workspace, builder data, unused store fields

**Severity:** Medium (maintenance drag, confusing for contributors)
**Type:** Cleanup / Product decision
**Effort:** ~1 hour (removal path)
**Files touched:** see per-item lists

This doc inventories everything in the repo that is written but unreachable, with a recommendation for each. The owner marked the two big items "undecided", so each recommendation includes reasoning; follow the recommendation unless the owner overrides.

## 4a. Investigation Workspace (evidence board) — RECOMMEND: remove from `src/`, keep in git history

**Files (all unreferenced by any page/component):**

- `src/components/game/InvestigationWorkspace.tsx` (~340 lines: evidence/timeline/contradictions tabs)
- `src/hooks/useInvestigationBoard.ts` (~315 lines: state machine with debounced localStorage saves)
- `src/utils/localCaseStore.ts` (versioned persistence for the board)
- `src/types/investigation.ts`

Verified: `grep -rln "InvestigationWorkspace\|useInvestigationBoard\|localCaseStore" src/` matches only these files themselves — `CasePage.tsx` never imports the workspace. Additionally the component references ~30 i18n keys (`investigation.*`) that **do not exist** in either `src/i18n/locales/en.json` or `pt-BR.json`, so even if wired in, every label would render as a raw key string.

**Why remove rather than finish:**

1. The target audience is interview preppers. The workspace's loop (manually collect evidence cards, hand-type timeline events, mark contradictions "resolved") is busywork with no correctness check — nothing validates that a timeline is *right*, and the unlock gate (`computeUnlock`: ≥3 evidence, ≥2 events, ≥2 links, ≥1 resolved contradiction) can be satisfied by typing gibberish. It gates the diagnosis behind clicking, not thinking.
2. Interview-prep value comes from *deciding under uncertainty* (already covered by cases) and *designing* (covered by `FEATURE-01-system-builder-mode.md`), not free-form note-taking.
3. It is ~700 lines of orphaned code every contributor must read around, plus a missing-translations trap.

**Removal steps:** delete the four files. Run `npm run build` and `npm run lint` to confirm nothing referenced them.

**If the owner overrides and wants to ship it instead**, the minimum work is: (1) render it in `CasePage.tsx`'s right panel above `DiagnosisPanel`, passing `useInvestigationBoard(caseData)`; (2) add all `investigation.*` keys to both locale files; (3) make `DiagnosisPanel`'s fix phase actually consume `board.state.unlock.unlockedFix`; (4) mobile layout. Estimate 1–2 days. Not recommended.

## 4b. Builder challenge data (46 JSON files) — RECOMMEND: keep, and ship the feature

**Files:** `src/data/builder/challenges-01.json` … `challenges-23.json` plus `src/data/builder/pt-BR/challenges-01..23.json`, and `scripts/validate-builder-challenges.js` (a validator for this data).

Verified: no source file imports anything from `src/data/builder/` (`grep -rn "data/builder" src/` is empty), so the data costs nothing in the bundle today.

**Why keep:** this is fully-authored, bilingual content for a "design the system" game mode — each file has `id`, `title`, `subtitle`, `objective`, `constraints[]`, `availableComponents[]` (e.g. `client`, `cdn`, `loadBalancer`, `api`, `cache`, `database`), and per-concept grading rules (`requiredAll`, `requiredAnyOf`, `preferredConnections` as `{from, to}` pairs — see `challenges-01.json`). Building is the single most interview-relevant mechanic possible, and `@dnd-kit/core` + `@xyflow/react` are already dependencies. Implementation is specced in **`FEATURE-01-system-builder-mode.md`**.

**Action now:** none on the data. Wire `scripts/validate-builder-challenges.js` into CI when the feature ships.

## 4c. Unused store members — resolve via ISSUE-03

`currentCaseId` / `setCurrentCase` in `src/hooks/useGameState.ts` are never read/called. Covered in `ISSUE-03-state-persistence-flaws.md` §3e (recommendation: use them for a "Continue" button; otherwise delete).

## 4d. Repo-root artifacts — covered by ISSUE-05

`PODCAST_COPILOTO.md` (personal podcast prep script, not project docs), `case1.png`, `case1-complete.png`, `case2-guide.png`, `homepage.png`, `sdpd-homepage-full.png`, `.playwright-mcp/*.log`, `.DS_Store`, `src/.DS_Store`. See `ISSUE-05-repo-hygiene.md`.

## Acceptance criteria

- [ ] The four Investigation Workspace files are deleted (or a written owner decision to ship instead is recorded, superseding this doc).
- [ ] Builder JSON data remains untouched and is referenced by FEATURE-01.
- [ ] `npm run build` and `npm run lint` pass after deletions.
- [ ] No `investigation.*` keys are added to locale files (they would be dead too).
