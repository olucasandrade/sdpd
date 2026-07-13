import { create } from 'zustand';
import type { GameState, CaseProgress, Rank } from '../types/game';
import { RANKS } from '../types/game';
import { loadState, saveState } from '../utils/storage';
import { CATEGORIES } from '../data/categories';
import { caseIdForNumber } from '../utils/caseIds';
import type { Locale } from '../i18n';

interface GameStore extends GameState {
  setCurrentCase: (caseId: string) => void;
  submitRootCause: (caseId: string, correct: boolean) => void;
  submitFix: (caseId: string, correct: boolean) => void;
  isCaseUnlocked: (caseNumber: number) => boolean;
  toggleGuide: () => void;
  setLocale: (locale: Locale) => void;
  resetProgress: () => void;
  clearRankUp: () => void;
  dismissTutorial: () => void;
}

const defaultState: GameState = {
  currentCaseId: null,
  progress: {},
  rank: RANKS[0],
  completedCases: 0,
  guideOpen: false,
  locale: 'en',
  pendingRankUp: null,
  tutorialSeen: false,
};

export function deriveRank(completedCases: number): Rank {
  return [...RANKS].reverse().find((r) => completedCases >= r.requiredCases) ?? RANKS[0];
}

export function deriveCompleted(progress: Record<string, CaseProgress>): number {
  return Object.values(progress).filter((p) => p.completed).length;
}

const persisted = loadState<GameState>(defaultState);
const completedCases = deriveCompleted(persisted.progress ?? {});
const hydrated: GameState = {
  ...defaultState,
  ...persisted,
  completedCases,
  rank: deriveRank(completedCases),
};

export const useGameState = create<GameStore>((set, get) => ({
  ...hydrated,

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

    const completedCases = deriveCompleted(progress);
    const oldRank = get().rank;
    const rank = deriveRank(completedCases);
    const pendingRankUp: Rank | null = rank.id !== oldRank.id ? rank : get().pendingRankUp;

    set({ progress, completedCases, rank, pendingRankUp });
    saveState({ ...get(), pendingRankUp: null });
  },

  isCaseUnlocked: (caseNumber) => {
    if (caseNumber === 1) return true;
    const category = CATEGORIES.find((cat) => caseNumber >= cat.range[0] && caseNumber <= cat.range[1]);
    if (category && caseNumber === category.range[0]) return true;
    const prevId = caseIdForNumber(caseNumber - 1);
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
    const { locale, guideOpen } = get();
    const next = { ...defaultState, locale, guideOpen };
    set(next);
    saveState(next);
  },

  clearRankUp: () => {
    set({ pendingRankUp: null });
  },

  dismissTutorial: () => {
    set({ tutorialSeen: true });
    saveState({ ...get(), tutorialSeen: true });
  },
}));
