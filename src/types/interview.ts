export type InterviewPhaseKey = 'rootCause' | 'fix';

export interface InterviewRoundResult {
  caseId: string;
  rootCauseCorrect: boolean;
  fixCorrect: boolean;
  seconds: number;
}

export interface InterviewPostmortem {
  caseId: string;
  text: string;
  rubric: boolean[];
}

export interface InterviewSession {
  id: string;
  track: string;
  startedAt: string;
  rounds: InterviewRoundResult[];
  postmortem: InterviewPostmortem;
  score: number;
}

export interface InterviewStoredState {
  schemaVersion: 1;
  sessions: InterviewSession[];
}

export type InterviewStatus = 'setup' | 'round' | 'postmortem' | 'debrief';
