import { addUtcDays } from '../data/dailyDrill';

/** Fixed interval ladder in days — deliberately simpler than SM-2. */
export const REVIEW_INTERVALS = [1, 3, 7, 14, 30];
export const MAX_RUNG = REVIEW_INTERVALS.length - 1;

export function questionCardId(caseId: string, phase: 'rootCause' | 'fix'): string {
  return `${caseId}-${phase}`;
}

export function termCardId(conceptId: string, termIndex: number): string {
  return `term-${conceptId}-${termIndex}`;
}

export function dueDateForRung(rung: number, fromDateUtc: string): string {
  const clamped = Math.max(0, Math.min(rung, MAX_RUNG));
  return addUtcDays(fromDateUtc, REVIEW_INTERVALS[clamped]);
}

export function isDue(dueDate: string, todayUtc: string): boolean {
  return dueDate <= todayUtc;
}

export interface GradeResult {
  rung: number;
  dueDate: string;
  retired: boolean;
  lapses: number;
}

/**
 * Wrong resets a card to rung 0. Correct advances one rung; correct at the
 * top rung (30d) retires the card instead of advancing further — it stays
 * browsable but no longer resurfaces for review.
 */
export function gradeReview(
  current: { rung: number; lapses: number },
  correct: boolean,
  todayUtc: string,
): GradeResult {
  if (!correct) {
    return { rung: 0, dueDate: dueDateForRung(0, todayUtc), retired: false, lapses: current.lapses + 1 };
  }
  if (current.rung >= MAX_RUNG) {
    return { rung: MAX_RUNG, dueDate: dueDateForRung(MAX_RUNG, todayUtc), retired: true, lapses: current.lapses };
  }
  const rung = current.rung + 1;
  return { rung, dueDate: dueDateForRung(rung, todayUtc), retired: false, lapses: current.lapses };
}
