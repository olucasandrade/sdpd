import { create } from 'zustand';
import type { InterviewPhaseKey, InterviewRoundResult, InterviewSession, InterviewStatus } from '../types/interview';
import { loadInterviewState, saveInterviewState, appendInterviewSession } from '../utils/localInterviewStore';
import { ROUND_DURATION_SECONDS, sessionScore, worstRoundIndex } from '../utils/interviewScore';
import { useGameState } from './useGameState';

interface EphemeralSessionState {
  status: InterviewStatus;
  track: string | null;
  caseIds: string[];
  roundIndex: number;
  roundStartedAt: number | null;
  sessionStartedAt: string | null;
  rounds: InterviewRoundResult[];
  currentRootCauseCorrect: boolean | null;
  currentFixCorrect: boolean | null;
  postmortemCaseId: string | null;
  debriefSessionId: string | null;
}

interface InterviewSessionStore extends EphemeralSessionState {
  sessions: InterviewSession[];
  beginSession: (track: string, caseIds: string[]) => void;
  recordAnswer: (phase: InterviewPhaseKey, correct: boolean) => void;
  finishRound: () => void;
  submitPostmortem: (text: string, rubric: boolean[]) => void;
  abandon: () => void;
  newSession: () => void;
}

const ephemeralDefaults: EphemeralSessionState = {
  status: 'setup',
  track: null,
  caseIds: [],
  roundIndex: 0,
  roundStartedAt: null,
  sessionStartedAt: null,
  rounds: [],
  currentRootCauseCorrect: null,
  currentFixCorrect: null,
  postmortemCaseId: null,
  debriefSessionId: null,
};

export const useInterviewSession = create<InterviewSessionStore>((set, get) => ({
  sessions: loadInterviewState().sessions,
  ...ephemeralDefaults,

  beginSession: (track, caseIds) => {
    if (useGameState.getState().guideOpen) {
      useGameState.getState().toggleGuide();
    }
    set({
      ...ephemeralDefaults,
      status: 'round',
      track,
      caseIds,
      roundStartedAt: Date.now(),
      sessionStartedAt: new Date().toISOString(),
    });
  },

  recordAnswer: (phase, correct) => {
    set(phase === 'rootCause' ? { currentRootCauseCorrect: correct } : { currentFixCorrect: correct });
  },

  finishRound: () => {
    const state = get();
    if (state.status !== 'round' || state.roundStartedAt == null) return;

    const elapsed = Math.min(
      ROUND_DURATION_SECONDS,
      Math.max(0, Math.round((Date.now() - state.roundStartedAt) / 1000)),
    );
    const round: InterviewRoundResult = {
      caseId: state.caseIds[state.roundIndex],
      rootCauseCorrect: state.currentRootCauseCorrect ?? false,
      fixCorrect: state.currentFixCorrect ?? false,
      seconds: elapsed,
    };
    const rounds = [...state.rounds, round];

    if (state.roundIndex < state.caseIds.length - 1) {
      set({
        rounds,
        roundIndex: state.roundIndex + 1,
        roundStartedAt: Date.now(),
        currentRootCauseCorrect: null,
        currentFixCorrect: null,
      });
      return;
    }

    set({
      rounds,
      status: 'postmortem',
      roundStartedAt: null,
      currentRootCauseCorrect: null,
      currentFixCorrect: null,
      postmortemCaseId: rounds[worstRoundIndex(rounds)].caseId,
    });
  },

  submitPostmortem: (text, rubric) => {
    const state = get();
    if (state.status !== 'postmortem' || !state.postmortemCaseId || !state.track || !state.sessionStartedAt) {
      return;
    }
    const session: InterviewSession = {
      id: `iv-${Date.now()}`,
      track: state.track,
      startedAt: state.sessionStartedAt,
      rounds: state.rounds,
      postmortem: { caseId: state.postmortemCaseId, text, rubric },
      score: sessionScore(state.rounds),
    };
    const sessions = appendInterviewSession(state.sessions, session);
    saveInterviewState({ schemaVersion: 1, sessions });
    set({ sessions, status: 'debrief', debriefSessionId: session.id, postmortemCaseId: null });
  },

  abandon: () => {
    set({ ...ephemeralDefaults });
  },

  newSession: () => {
    set({ ...ephemeralDefaults });
  },
}));
