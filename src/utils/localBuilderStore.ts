import type { BuilderChallengeState, BuilderProgressState } from '../types/builder';

const STORAGE_KEY = 'sdpd-builder-state';
export const BUILDER_SCHEMA_VERSION = 1;

function isChallengeState(value: unknown): value is BuilderChallengeState {
  if (!value || typeof value !== 'object') return false;
  const state = value as Record<string, unknown>;
  return (
    Array.isArray(state.components) &&
    Array.isArray(state.connections) &&
    typeof state.completed === 'boolean' &&
    typeof state.attempts === 'number'
  );
}

function isBuilderProgressState(value: unknown): value is BuilderProgressState {
  if (!value || typeof value !== 'object') return false;
  const state = value as Record<string, unknown>;
  if (state.schemaVersion !== BUILDER_SCHEMA_VERSION) return false;
  if (!state.challenges || typeof state.challenges !== 'object') return false;
  return Object.values(state.challenges as Record<string, unknown>).every(isChallengeState);
}

export function loadBuilderState(defaultValue: BuilderProgressState): BuilderProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultValue;
    const parsed = JSON.parse(raw) as unknown;
    return isBuilderProgressState(parsed) ? parsed : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function saveBuilderState(state: BuilderProgressState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage full or unavailable
  }
}
