import { describe, it, expect, beforeEach } from 'vitest';
import { useGameState, deriveRank, deriveCompleted } from './useGameState';
import type { CaseProgress } from '../types/game';

function completedProgress(caseId: string): CaseProgress {
  return {
    caseId,
    completed: true,
    rootCauseAttempts: 1,
    fixAttempts: 1,
    rootCauseFound: true,
    fixFound: true,
  };
}

describe('deriveRank', () => {
  it.each([
    [0, 'rookie'],
    [1, 'cadet'],
    [5, 'officer'],
    [10, 'detective'],
    [17, 'sergeant'],
    [25, 'lieutenant'],
    [33, 'chief'],
  ])('completedCases=%i derives rank %s', (completed, expectedId) => {
    expect(deriveRank(completed).id).toBe(expectedId);
  });

  it('picks the highest rank not exceeding completedCases', () => {
    expect(deriveRank(4).id).toBe('cadet');
    expect(deriveRank(100).id).toBe('chief');
  });
});

describe('deriveCompleted', () => {
  it('counts only completed cases', () => {
    const progress = {
      'case-01': completedProgress('case-01'),
      'case-02': { ...completedProgress('case-02'), completed: false },
    };
    expect(deriveCompleted(progress)).toBe(1);
  });

  it('returns 0 for empty progress', () => {
    expect(deriveCompleted({})).toBe(0);
  });
});

describe('useGameState store', () => {
  beforeEach(() => {
    localStorage.clear();
    useGameState.setState({
      currentCaseId: null,
      progress: {},
      rank: deriveRank(0),
      completedCases: 0,
      guideOpen: false,
      locale: 'en',
      pendingRankUp: null,
      tutorialSeen: false,
    });
  });

  describe('resetProgress', () => {
    it('preserves locale and guideOpen but clears progress', () => {
      useGameState.setState({
        locale: 'pt-BR',
        guideOpen: true,
        progress: { 'case-01': completedProgress('case-01') },
        completedCases: 1,
        rank: deriveRank(1),
      });

      useGameState.getState().resetProgress();
      const state = useGameState.getState();

      expect(state.locale).toBe('pt-BR');
      expect(state.guideOpen).toBe(true);
      expect(state.progress).toEqual({});
      expect(state.completedCases).toBe(0);
      expect(state.rank.id).toBe('rookie');
    });
  });

  describe('isCaseUnlocked', () => {
    it('case 1 is always unlocked', () => {
      expect(useGameState.getState().isCaseUnlocked(1)).toBe(true);
    });

    it('is locked when the previous case is not completed', () => {
      expect(useGameState.getState().isCaseUnlocked(2)).toBe(false);
    });

    it('unlocks once the previous case is completed', () => {
      useGameState.setState({ progress: { 'case-01': completedProgress('case-01') } });
      expect(useGameState.getState().isCaseUnlocked(2)).toBe(true);
    });

    it('unlocks the first case of a new category regardless of progress', () => {
      // case 9 starts the "loadBalancing" category (range [9, 13])
      expect(useGameState.getState().isCaseUnlocked(9)).toBe(true);
    });

    it('handles the two-digit case-id boundary (case-09 -> case-10)', () => {
      expect(useGameState.getState().isCaseUnlocked(10)).toBe(false);
      useGameState.setState({ progress: { 'case-09': completedProgress('case-09') } });
      expect(useGameState.getState().isCaseUnlocked(10)).toBe(true);
    });
  });
});
