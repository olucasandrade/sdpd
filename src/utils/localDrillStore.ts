import type { DrillState } from '../types/drill';

const STORAGE_KEY = 'sdpd-drill-state';
const SCHEMA_VERSION = 1;
const MAX_HISTORY_ENTRIES = 400;

export function defaultDrillState(): DrillState {
  return {
    schemaVersion: SCHEMA_VERSION,
    lastPlayedDate: null,
    streak: 0,
    bestStreak: 0,
    history: {},
  };
}

function isDrillState(value: unknown): value is DrillState {
  if (!value || typeof value !== 'object') return false;
  const state = value as Record<string, unknown>;
  return (
    state.schemaVersion === SCHEMA_VERSION &&
    (state.lastPlayedDate === null || typeof state.lastPlayedDate === 'string') &&
    typeof state.streak === 'number' &&
    typeof state.bestStreak === 'number' &&
    typeof state.history === 'object' &&
    state.history !== null
  );
}

export function loadDrillState(): DrillState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultDrillState();
    const parsed = JSON.parse(raw) as unknown;
    return isDrillState(parsed) ? parsed : defaultDrillState();
  } catch {
    return defaultDrillState();
  }
}

/** Caps `history` at MAX_HISTORY_ENTRIES, dropping the oldest dates first. */
function capHistory(history: DrillState['history']): DrillState['history'] {
  const entries = Object.entries(history).sort(([a], [b]) => a.localeCompare(b));
  if (entries.length <= MAX_HISTORY_ENTRIES) return history;
  return Object.fromEntries(entries.slice(entries.length - MAX_HISTORY_ENTRIES));
}

export function saveDrillState(state: DrillState): void {
  try {
    const toSave: DrillState = {
      ...state,
      schemaVersion: SCHEMA_VERSION,
      history: capHistory(state.history),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {
    // localStorage full or unavailable
  }
}
