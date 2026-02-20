import type { Locale } from '../i18n';

export interface CaseProgress {
  caseId: string;
  completed: boolean;
  rootCauseAttempts: number;
  fixAttempts: number;
  rootCauseFound: boolean;
  fixFound: boolean;
}

export interface GameState {
  currentCaseId: string | null;
  progress: Record<string, CaseProgress>;
  rank: Rank;
  completedCases: number;
  guideOpen: boolean;
  locale: Locale;
}

export interface Rank {
  id: string;
  title: string;
  requiredCases: number;
}

export const RANKS: Rank[] = [
  { id: 'rookie', title: 'Rookie', requiredCases: 0 },
  { id: 'cadet', title: 'Cadet', requiredCases: 1 },
  { id: 'officer', title: 'Officer', requiredCases: 5 },
  { id: 'detective', title: 'Detective', requiredCases: 10 },
  { id: 'sergeant', title: 'Sergeant', requiredCases: 17 },
  { id: 'lieutenant', title: 'Lieutenant', requiredCases: 25 },
  { id: 'chief', title: 'Chief', requiredCases: 33 },
];

export interface Concept {
  id: string;
  title: string;
  summary: string;
  explanation: string[];
  keyTerms: { term: string; definition: string }[];
}
