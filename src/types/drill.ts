export interface DrillHistoryEntry {
  caseId: string;
  rootCauseStars: number;
  fixStars: number;
  /** rootCauseStars + fixStars, 0-6. Kept alongside the split for quick display. */
  stars: number;
  seconds: number;
}

export interface DrillState {
  schemaVersion: number;
  lastPlayedDate: string | null;
  streak: number;
  bestStreak: number;
  history: Record<string, DrillHistoryEntry>;
}
