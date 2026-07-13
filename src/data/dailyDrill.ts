// Daily Drill — deterministic, backend-free selection.
//
// Every calendar day (UTC), every player gets the same case. `DRILL_PERMUTATION`
// is a fixed shuffle of case numbers 1..33 generated once (mulberry32 PRNG,
// seed 20260713) and pasted here as a literal array so the sequence never
// changes across builds or deploys. Determinism matters more than the
// shuffling method.
export const DRILL_PERMUTATION: number[] = [
  26, 18, 4, 30, 16, 33, 7, 6, 24, 10, 11, 23, 32, 12, 8, 19, 14, 22, 15, 31,
  3, 25, 29, 20, 2, 21, 9, 1, 17, 27, 28, 5, 13,
];

const MS_PER_DAY = 86_400_000;

// Day index of the drill's public launch. Chosen so drill numbering (see
// `getDrillNumber`) starts at #1 rather than a huge epoch-relative number.
const LAUNCH_DAY_INDEX = Math.floor(Date.UTC(2026, 0, 1) / MS_PER_DAY);

/** Day number since the Unix epoch, UTC. Same value worldwide at any instant. */
export function getDayIndex(now: Date = new Date()): number {
  return Math.floor(now.getTime() / MS_PER_DAY);
}

/** UTC calendar date as `YYYY-MM-DD`. */
export function getUtcDateString(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

/** Add `days` (may be negative) to a `YYYY-MM-DD` UTC date string. */
export function addUtcDays(dateStr: string, days: number): string {
  const date = new Date(`${dateStr}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return getUtcDateString(date);
}

/** 1..33 case number scheduled for the given day index. */
export function getDailyCaseNumber(dayIndex: number): number {
  const idx = ((dayIndex % DRILL_PERMUTATION.length) + DRILL_PERMUTATION.length) % DRILL_PERMUTATION.length;
  return DRILL_PERMUTATION[idx];
}

/** Human-facing drill number ("Daily Drill #412"), 1 on launch day. */
export function getDrillNumber(dayIndex: number): number {
  return dayIndex - LAUNCH_DAY_INDEX + 1;
}

export function caseIdForNumber(caseNumber: number): string {
  return `case-${String(caseNumber).padStart(2, '0')}`;
}

/** Root-cause/fix attempt count -> stars for that phase (1st try = 3, 2nd = 2, 3rd+ = 1). */
export function starsForAttempts(attempts: number): number {
  if (attempts <= 1) return 3;
  if (attempts === 2) return 2;
  return 1;
}

export interface StreakUpdate {
  streak: number;
  bestStreak: number;
}

/**
 * Computes the new streak/bestStreak when a drill is completed on `todayUtc`.
 * Pure — caller is responsible for checking `lastPlayedDate !== todayUtc`
 * (one attempt per day) before calling this.
 */
export function computeStreakUpdate(
  state: { lastPlayedDate: string | null; streak: number; bestStreak: number },
  todayUtc: string,
): StreakUpdate {
  const yesterday = addUtcDays(todayUtc, -1);
  const streak = state.lastPlayedDate === yesterday ? state.streak + 1 : 1;
  const bestStreak = Math.max(state.bestStreak, streak);
  return { streak, bestStreak };
}

/** Milliseconds remaining until the next UTC midnight, from `now`. */
export function msUntilNextUtcMidnight(now: Date = new Date()): number {
  const today = getUtcDateString(now);
  const nextMidnight = new Date(`${addUtcDays(today, 1)}T00:00:00Z`).getTime();
  return Math.max(0, nextMidnight - now.getTime());
}
