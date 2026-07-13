import type { InterviewRoundResult } from '../types/interview';

/** ≈6 minutes per round, per FEATURE-05. */
export const ROUND_DURATION_SECONDS = 360;
/** Under 4 minutes earns the time bonus point. */
export const TIME_BONUS_THRESHOLD_SECONDS = 240;
/** Minimum postmortem length before it can be submitted. */
export const POSTMORTEM_MIN_CHARS = 200;
/** Oldest sessions are dropped once this cap is reached. */
export const MAX_INTERVIEW_SESSIONS = 50;
/** Free-text self-check items in the postmortem rubric. */
export const RUBRIC_ITEM_COUNT = 5;

export type InterviewVerdict = 'strongHire' | 'hire' | 'leanHire' | 'keepTraining';

/**
 * Per-round score: 2pts root cause correct, 2pts fix correct,
 * 1pt time bonus if the round finished in under 4 minutes.
 */
export function roundScore(round: InterviewRoundResult): number {
  let score = 0;
  if (round.rootCauseCorrect) score += 2;
  if (round.fixCorrect) score += 2;
  if (round.seconds < TIME_BONUS_THRESHOLD_SECONDS) score += 1;
  return score;
}

/** Total across all rounds in a session — max 15 over three rounds. */
export function sessionScore(rounds: InterviewRoundResult[]): number {
  return rounds.reduce((sum, round) => sum + roundScore(round), 0);
}

/**
 * Verdict boundaries: 13-15 STRONG HIRE, 10-12 HIRE, 7-9 LEAN HIRE,
 * below 7 KEEP TRAINING.
 */
export function verdictForScore(score: number): InterviewVerdict {
  if (score >= 13) return 'strongHire';
  if (score >= 10) return 'hire';
  if (score >= 7) return 'leanHire';
  return 'keepTraining';
}

/** Index of the lowest-scoring round (ties resolved to the earliest round). */
export function worstRoundIndex(rounds: InterviewRoundResult[]): number {
  let worst = 0;
  for (let i = 1; i < rounds.length; i++) {
    const current = (rounds[i].rootCauseCorrect ? 1 : 0) + (rounds[i].fixCorrect ? 1 : 0);
    const worstSoFar = (rounds[worst].rootCauseCorrect ? 1 : 0) + (rounds[worst].fixCorrect ? 1 : 0);
    if (current < worstSoFar) worst = i;
  }
  return worst;
}
