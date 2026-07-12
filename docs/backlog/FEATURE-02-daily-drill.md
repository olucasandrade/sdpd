# FEATURE-02: Daily Drill — timed challenge, streaks, and a shareable result card

**Audience fit:** Interview preppers thrive on daily practice habits; a Wordle-style share card is also the cheapest growth loop available (it's how sqlpd — SDPD's acknowledged inspiration — spreads).
**Effort:** ~1 week
**Infra:** none required (fully client-side; deterministic daily selection). Pairs with FEATURE-04 later for global stats.

## Concept

A "Daily Drill" mode at `/daily`: every calendar day, all players worldwide get the *same* case under time pressure. One attempt per day. Result is a score (attempts + time), a streak counter, and a spoiler-free emoji share card copied to the clipboard.

## Mechanics

### Deterministic daily case selection (no backend)

```ts
// day number since epoch, UTC — same for all players
const dayIndex = Math.floor(Date.now() / 86_400_000);
const caseNumber = PERMUTATION[dayIndex % 33]; // 1..33
```

`PERMUTATION` is a hardcoded constant array — a fixed shuffle of 1..33 so consecutive days don't walk categories in order. Implementer: generate once with any shuffle and paste the literal array into the code; determinism matters more than elegance.

The drill ignores campaign unlock state — it may serve a case the player hasn't reached. Intentional (spaced exposure). Completing a drill does NOT mark campaign progress; keep the two progressions separate to avoid unlock-sequence exploits.

### Timer & scoring

- Timer starts when the player dismisses the brief (a "Start investigation" gate, so reading isn't penalized); counts up as `mm:ss` in the drill header.
- Score model (simple, explainable, stable — it appears in share cards): root cause first try ★★★, second try ★★, more ★; same for the fix; total 0–6 stars plus time.
- Reuse `DiagnosisPanel` with a `mode="drill"` prop or a thin wrapper. **The ISSUE-02 fix (no answer reveal on wrong submissions) is a hard prerequisite** — without it drill scores are meaningless.

### Streaks & state

New localStorage blob `sdpd-drill-state`, versioned per the ISSUE-03 pattern:

```json
{
  "schemaVersion": 1,
  "lastPlayedDate": "2026-07-11",
  "streak": 4,
  "bestStreak": 11,
  "history": { "2026-07-11": { "caseId": "case-07", "stars": 5, "seconds": 143 } }
}
```

- Dates: use the **UTC** date string (`new Date().toISOString().slice(0, 10)`) everywhere, matching the UTC `dayIndex` — otherwise players near midnight local time get a case/date mismatch.
- Streak on completion: `lastPlayedDate` was yesterday (UTC) → `streak + 1`; today already played → block replay; otherwise reset to 1.
- Cap `history` at ~400 entries (drop oldest) to respect localStorage limits.

### Share card (the growth loop)

On completion, "Share result" copies plain text via `navigator.clipboard.writeText` (fallback: hidden `<textarea>` + `document.execCommand('copy')`):

```
SDPD Daily Drill #412 🔍
Diagnosis: ⭐️⭐️⭐️ Fix: ⭐️⭐️
⏱ 2:23 · 🔥 4-day streak
https://PRODUCTION-URL/daily
```

Spoiler-free (no case name). `#412` = `dayIndex` minus a chosen launch-epoch offset so numbering starts near #1.

## UI

- Route `/daily` in `App.tsx`; `[ DAILY ]` link in `Header.tsx`; hero chip on Home: "Today's drill: not played / ⭐ 5/6 · 🔥 4".
- Pre-play screen: drill number, current streak, rules ("one attempt, timed, case revealed when you start").
- Post-play screen: stars, time, streak, share button, countdown to next drill (UTC midnight), and "Review the concept" linking to the case's `conceptId` guide entry.
- Already-played state: today's result + countdown instead of the case.
- All strings as `daily.*` keys in `en.json` + `pt-BR.json`.

## Edge cases

- Clock tampering: accept it — client-side game, don't fight cheaters without a backend (FEATURE-04 can harden later).
- Case data lazy-loads (post ISSUE-07): show loading before starting the timer.
- Day rollover mid-session: lock the drill to the `dayIndex` captured at start.

## Verification

1. Unit tests with fake timers (Vitest): selection stable within a day, changes next day; streak increment/reset across yesterday/today/gap; UTC boundary (23:59 vs 00:01 local with non-UTC timezone).
2. Manual: play a drill → share text correct; reload → already-played persists; advance system clock a day → new case, streak +1.

## Acceptance criteria

- [ ] Same case for everyone on a given UTC day; one attempt/day enforced client-side.
- [ ] Stars + time scoring; ISSUE-02 landed first.
- [ ] Streak/best-streak in versioned storage with capped history.
- [ ] Clipboard share card works on mobile Safari and Chrome, spoiler-free.
- [ ] Drill progression fully independent from campaign unlocks.
- [ ] Date/streak logic unit-tested including UTC boundaries.
