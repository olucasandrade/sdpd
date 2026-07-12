# UX-03: Game-flow polish — onboarding, unlock friction, feedback loops, chaos discoverability

**Severity:** High UX impact (first-session retention)
**Type:** UX/UI improvement
**Effort:** ~2–3 days total; each numbered item independently shippable, ordered by value
**Files touched:** `src/pages/HomePage.tsx`, `src/pages/CasePage.tsx`, `src/components/game/*`, `src/hooks/useGameState.ts`, `src/pages/ChaosPage.tsx`, `src/types/chaos.ts`, `src/data/chaos/presets.ts`, locale files

## 1. First-case onboarding (highest value)

A brand-new player lands on a hero, a chaos card, and 33 case rows — nothing explains *how to play*. The core loop (read brief → **click glowing nodes to gather evidence** → diagnose → prescribe) is discoverable only by accident; the pulsing node glow is the sole hint that the diagram is interactive.

**Fix:** a one-time, 3-step coach-mark overlay on the first visit to case-01 (trigger: `progress` empty and route `/case/case-01`):
1. Point at the brief panel: "Read the case file. The symptoms are your first clues."
2. Point at the diagram: "Tap the glowing components to inspect logs and evidence."
3. Point at the diagnosis panel: "When you know what broke, make the call."

Implementation: a `TutorialOverlay` component rendered from `CasePage.tsx`; persist `tutorialSeen: boolean` in the game state (extend `GameState`; bump schema version per `ISSUE-03-state-persistence-flaws.md`). Fixed-position callouts, no library. Skippable with one tap + a "skip" link. All strings in both locale files.

## 2. Soften strict sequential unlocking

`isCaseUnlocked` requires completing case N to open N+1 — across all 33 cases. An interview prepper who needs caching for tomorrow's interview cannot touch case 14 without grinding 13 cases. Strict linearity also inflates drop-off: one boring case blocks everything.

**Fix (recommended policy): unlock by category.** The first case of every category is always unlocked; within a category, cases unlock sequentially. Category ranges already exist in `HomePage.tsx` (`categoryKeys`: replication 1–3, consistency 4–8, loadBalancing 9–13, caching 14–17, messaging 18–21, storage 22–25, network 26–29, advanced 30–33).

- Move the ranges to a shared module (`src/data/categories.ts`) so `useGameState.ts` can import them (currently private to `HomePage.tsx`).
- New logic: `isCaseUnlocked(n)` = `n` is the first case of its category OR case `n-1` is completed.
- Ranks still require total completions, preserving long-term progression.

## 3. Rank-up celebration

Ranks (Rookie→Chief, `RANKS` in `src/types/game.ts`) change silently in the header. Crossing a threshold is the best dopamine hit available and it's currently dropped on the floor.

**Fix:** in `submitFix` (where rank is recomputed), detect `newRank.id !== oldRank.id` and set a transient `pendingRankUp: Rank | null` in the store. `CaseSuccess.tsx` reads it, renders a "PROMOTED" banner (reuse the particle burst already in that file) above the badge, then clears it. Keys: `"rankUp.title": "PROMOTED"`, `"rankUp.subtitle": "You are now {rank}"` (+ pt-BR).

## 4. "Continue" affordance on Home

Returning players must remember where they were. Add a prominent "Continue: Case 07 — …" button in the hero, powered by the currently-dead `currentCaseId` (see ISSUE-03 §3e: set it from `CasePage`, read it here). Fallback when null: first uncompleted unlocked case.

## 5. Reset progress + minimal settings surface

`resetProgress` exists but is unreachable from the UI (ISSUE-03 §3b). Add a small settings popover in the Header (gear icon): reset progress (**with a confirm step — destructive**), locale toggle (its mobile home), GitHub link. Keep it a popover; don't build a settings page.

## 6. Chaos Simulator: log spam + no goal

Two problems, verified in `src/hooks/useChaosSimulator.ts`:

- **Log spam:** the `useEffect` keyed on `tick` re-appends up to 3 fault + 2 fix log lines *every second* while faults are active — an endless scroll of near-identical messages. Fix: emit logs only when the active fault/fix **set changes** (log on toggle, not on tick), or throttle to one line per fault per ~10s with a "×N" repeat suffix.
- **No goal:** the simulator is a sandbox with no win state, so it reads as a demo. Cheap fix: add a per-preset "stabilize" objective — e.g. "Availability ≥ 99% and p95 < 300ms with ≥ 2 faults active". Add an `objective` field to `ChaosPreset` (`src/types/chaos.ts`, values in `src/data/chaos/presets.ts`), render it above the KPIs in `ChaosPage.tsx`, and show a success state (reuse `neon-border`) when the pure-function check over `metrics` + `activeFaults.length` passes. Strings in both locales.

## 7. Case board scannability

Case cards show title/subtitle/status but no metadata for *planning* a study session. Add one small line per card: the concept chip (map `conceptId` → localized concept title via `useConcepts()`) and, when completed, the attempt count ("solved in 1 attempt" is a flex worth showing). Depends on `UX-01-readability.md` landing first to have room.

## Verification

- Fresh profile (clear localStorage): tutorial appears once on case-01, never again; skip works.
- Category unlock: fresh profile can immediately open cases 1, 4, 9, 14, 18, 22, 26, 30; case 5 still requires case 4.
- Complete 1st and 5th cases → rank-up banner at Cadet and Officer thresholds.
- Home shows Continue pointing at the last opened case.
- Chaos: toggling a fault logs once (not once per second); objective chip flips to success when conditions are met.
- Grep the running UI for raw i18n keys (none should leak) in both locales.

## Acceptance criteria

- [ ] One-time skippable tutorial on the first case.
- [ ] Category-based unlocking; ranges centralized in one module.
- [ ] Rank-up celebrated on the success screen.
- [ ] Continue button on Home.
- [ ] Reset progress reachable with confirmation.
- [ ] Chaos logs deduplicated; every preset has a win condition.
