# SDPD Backlog

Task documents produced by a full project investigation (July 2026). Each document is self-contained and written to be executed by a developer or an AI coding agent **without additional context**: it states the problem with file/line references, exact implementation steps, what not to touch, and acceptance criteria.

**Product context that shaped these docs:** primary audience is **interview preppers** (system-design interview practice); a light free-tier backend (Supabase-class) is acceptable, but the game must stay anonymous-first and fully playable offline.

## Suggested execution order

Dependencies are noted in each doc; this is the recommended sequence.

### Issues (correctness, hygiene, foundations)

| # | Doc | One-liner | Priority |
|---|-----|-----------|----------|
| 1 | [ISSUE-01](ISSUE-01-ci-never-runs.md) | CI triggers on `main`/`develop` but the branch is `master` — it has never run | Critical |
| 2 | [ISSUE-02](ISSUE-02-answer-reveal-exploit.md) | Wrong answers highlight the correct option, trivializing the game | High |
| 3 | [ISSUE-05](ISSUE-05-repo-hygiene.md) | Missing LICENSE (README claims MIT), committed junk, placeholder metadata | Medium |
| 4 | [ISSUE-03](ISSUE-03-state-persistence-flaws.md) | Stale persisted rank, reset wipes locale, no schema versioning; first tests | Medium |
| 5 | [ISSUE-04](ISSUE-04-dead-code-audit.md) | Dead Investigation Workspace (~700 lines) and unused builder data — decisions + cleanup | Medium |
| 6 | [ISSUE-06](ISSUE-06-accessibility.md) | Keyboard-unusable cards/modal, WCAG contrast, reduced motion | Medium-High |
| 7 | [ISSUE-07](ISSUE-07-seo-performance.md) | No OG/social meta; all 66 case JSONs eagerly bundled | Medium |

### UX/UI improvements

| # | Doc | One-liner |
|---|-----|-----------|
| 8 | [UX-01](UX-01-readability.md) | Readability overhaul: type scale, contrast ladder, density (biggest visual win) |
| 9 | [UX-02](UX-02-mobile.md) | Mobile: dead GUIDE button < 1024px, cramped header, no case nav, tabs for case page |
| 10 | [UX-03](UX-03-game-flow.md) | Onboarding tutorial, category-based unlocking, rank-up celebration, chaos win-states |

### New features (for interview preppers)

| # | Doc | One-liner | Infra |
|---|-----|-----------|-------|
| 11 | [FEATURE-01](FEATURE-01-system-builder-mode.md) | System Builder mode — drag-and-drop architecture design, graded; activates 46 already-authored challenge files | none |
| 12 | [FEATURE-02](FEATURE-02-daily-drill.md) | Daily Drill — same case for everyone daily, timed, streaks, Wordle-style share card | none |
| 13 | [FEATURE-03](FEATURE-03-detectives-notebook.md) | Detective's Notebook — spaced-repetition review built from the player's own mistakes | none |
| 14 | [FEATURE-04](FEATURE-04-accounts-leaderboard.md) | Accounts + cross-device sync + daily-drill leaderboard | Supabase free tier |
| 15 | [FEATURE-05](FEATURE-05-mock-interview-mode.md) | Mock Interview — 3 timed one-attempt rounds + written postmortem with rubric | none |
| 16 | [FEATURE-06](FEATURE-06-cheatsheet.md) | System Design Cheatsheet — 45 authored "When X → use Y / or M" decision cards, tabbed by category with global search (EN dataset already written in `src/data/cheatsheet/en.json`) | none |

### Cross-cutting rules for whoever implements

1. Every user-facing string goes in **both** `src/i18n/locales/en.json` and `pt-BR.json` — no hardcoded UI text.
2. Every new localStorage blob carries a `schemaVersion` (pattern: `src/utils/localCaseStore.ts`).
3. ISSUE-02 must land before FEATURE-02/04/05 (scores must be legitimate).
4. New routes register in `src/App.tsx` inside the `GameLayout` route; new nav entries go in `src/components/layout/Header.tsx`.
5. Match the noir visual language: palette/tokens in `src/index.css` `@theme`, card patterns in existing components. Don't invent new styles.
6. Run `npm run lint` and `npm run build` before declaring any doc done; add Vitest tests where the doc requires them.
