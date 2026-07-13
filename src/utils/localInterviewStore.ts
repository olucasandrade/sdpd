import type { InterviewSession, InterviewStoredState } from '../types/interview';
import { MAX_INTERVIEW_SESSIONS } from './interviewScore';

const SCHEMA_VERSION = 1;
const STORAGE_KEY = 'sdpd-interview-state';

function emptyState(): InterviewStoredState {
  return { schemaVersion: SCHEMA_VERSION, sessions: [] };
}

function isInterviewState(value: unknown): value is InterviewStoredState {
  if (!value || typeof value !== 'object') return false;
  const state = value as Record<string, unknown>;
  return state.schemaVersion === SCHEMA_VERSION && Array.isArray(state.sessions);
}

export function loadInterviewState(): InterviewStoredState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as unknown;
    return isInterviewState(parsed) ? parsed : emptyState();
  } catch {
    return emptyState();
  }
}

export function saveInterviewState(state: InterviewStoredState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage full or unavailable
  }
}

/** Appends a session, dropping the oldest once the cap is exceeded. */
export function appendInterviewSession(
  sessions: InterviewSession[],
  session: InterviewSession,
  cap = MAX_INTERVIEW_SESSIONS,
): InterviewSession[] {
  const next = [...sessions, session];
  return next.length <= cap ? next : next.slice(next.length - cap);
}
