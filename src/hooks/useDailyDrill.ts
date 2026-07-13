import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  caseIdForNumber,
  computeStreakUpdate,
  getDailyCaseNumber,
  getDayIndex,
  getDrillNumber,
  getUtcDateString,
  starsForAttempts,
} from '../data/dailyDrill';
import { loadDrillState, saveDrillState } from '../utils/localDrillStore';
import type { DrillHistoryEntry, DrillState } from '../types/drill';

export type DrillPhase = 'pre' | 'playing' | 'complete';

export interface DrillCompletionInput {
  rootCauseAttempts: number;
  fixAttempts: number;
}

export function useDailyDrill() {
  // Locked once at mount so a day rollover mid-session never swaps the case
  // or date out from under an in-progress attempt.
  const [{ dayIndex, todayUtc, caseNumber, caseId }] = useState(() => {
    const dayIndex = getDayIndex();
    const caseNumber = getDailyCaseNumber(dayIndex);
    return {
      dayIndex,
      todayUtc: getUtcDateString(),
      caseNumber,
      caseId: caseIdForNumber(caseNumber),
    };
  });

  const [drillState, setDrillState] = useState<DrillState>(() => loadDrillState());
  const todayEntry = drillState.history[todayUtc] ?? null;

  const [phase, setPhase] = useState<DrillPhase>(todayEntry ? 'complete' : 'pre');
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (phase !== 'playing' || startedAt === null) return;
    const tick = () => setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [phase, startedAt]);

  const start = useCallback(() => {
    setStartedAt(Date.now());
    setElapsedSeconds(0);
    setPhase('playing');
  }, []);

  const complete = useCallback(
    ({ rootCauseAttempts, fixAttempts }: DrillCompletionInput) => {
      const seconds = startedAt !== null ? Math.floor((Date.now() - startedAt) / 1000) : elapsedSeconds;
      const rootCauseStars = starsForAttempts(rootCauseAttempts);
      const fixStars = starsForAttempts(fixAttempts);
      const entry: DrillHistoryEntry = { caseId, rootCauseStars, fixStars, stars: rootCauseStars + fixStars, seconds };

      setDrillState((current) => {
        const { streak, bestStreak } = computeStreakUpdate(current, todayUtc);
        const next: DrillState = {
          ...current,
          lastPlayedDate: todayUtc,
          streak,
          bestStreak,
          history: { ...current.history, [todayUtc]: entry },
        };
        saveDrillState(next);
        return next;
      });

      setElapsedSeconds(seconds);
      setPhase('complete');
    },
    [caseId, elapsedSeconds, startedAt, todayUtc],
  );

  const drillNumber = useMemo(() => getDrillNumber(dayIndex), [dayIndex]);

  return {
    dayIndex,
    drillNumber,
    todayUtc,
    caseNumber,
    caseId,
    phase,
    elapsedSeconds,
    drillState,
    todayEntry,
    start,
    complete,
  };
}
