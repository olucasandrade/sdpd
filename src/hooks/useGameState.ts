import { create } from 'zustand';
import type { GameState, CaseProgress } from '../types/game';
import { RANKS } from '../types/game';
import { loadState, saveState } from '../utils/storage';
import type { Locale } from '../i18n';

interface GameStore extends GameState {
  setCurrentCase: (caseId: string) => void;
  submitRootCause: (caseId: string, correct: boolean) => void;
  submitFix: (caseId: string, correct: boolean) => void;
  isCaseUnlocked: (caseNumber: number) => boolean;
  toggleGuide: () => void;
  setLocale: (locale: Locale) => void;
  resetProgress: () => void;
}

const defaultState: GameState = {
  currentCaseId: null,
  progress: {},
  rank: RANKS[0],
  completedCases: 0,
  guideOpen: false,
  locale: 'en',
};

const persisted = loadState<GameState>(defaultState);

export const useGameState = create<GameStore>((set, get) => ({
  ...defaultState,
  ...persisted,

  setCurrentCase: (caseId) => {
    set({ currentCaseId: caseId });
    saveState({ ...get(), currentCaseId: caseId });
  },

  submitRootCause: (caseId, correct) => {
    const progress = { ...get().progress };
    const current: CaseProgress = progress[caseId] ?? {
      caseId,
      completed: false,
      rootCauseAttempts: 0,
      fixAttempts: 0,
      rootCauseFound: false,
      fixFound: false,
    };
    current.rootCauseAttempts += 1;
    if (correct) current.rootCauseFound = true;
    progress[caseId] = current;
    set({ progress });
    saveState(get());
  },

  submitFix: (caseId, correct) => {
    const progress = { ...get().progress };
    const current: CaseProgress = progress[caseId] ?? {
      caseId,
      completed: false,
      rootCauseAttempts: 0,
      fixAttempts: 0,
      rootCauseFound: false,
      fixFound: false,
    };
    current.fixAttempts += 1;
    if (correct) {
      current.fixFound = true;
      current.completed = true;
    }
    progress[caseId] = current;

    const completedCases = Object.values(progress).filter((p) => p.completed).length;
    const rank = [...RANKS].reverse().find((r) => completedCases >= r.requiredCases) ?? RANKS[0];

    set({ progress, completedCases, rank });
    saveState(get());
  },

  isCaseUnlocked: (caseNumber) => {
    if (caseNumber === 1) return true;
    const prevId = `case-${String(caseNumber - 1).padStart(2, '0')}`;
    return get().progress[prevId]?.completed ?? false;
  },

  toggleGuide: () => {
    const guideOpen = !get().guideOpen;
    set({ guideOpen });
    saveState(get());
  },

  setLocale: (locale) => {
    set({ locale });
    saveState({ ...get(), locale });
  },

  resetProgress: () => {
    set(defaultState);
    saveState(defaultState);
  },
}));
