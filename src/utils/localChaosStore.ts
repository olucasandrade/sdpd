import type { ChaosState } from '../types/chaos';

const SCHEMA_VERSION = 1;

function getChaosKey(): string {
  return `chaos-sim:v${SCHEMA_VERSION}`;
}

function isChaosState(value: unknown): value is ChaosState {
  if (!value || typeof value !== 'object') return false;
  const state = value as Record<string, unknown>;
  return (
    typeof state.presetId === 'string' &&
    Array.isArray(state.activeFaults) &&
    Array.isArray(state.activeFixes)
  );
}

export function loadChaosState(defaultValue: ChaosState): ChaosState {
  try {
    const raw = localStorage.getItem(getChaosKey());
    if (!raw) return defaultValue;
    const parsed = JSON.parse(raw) as unknown;
    return isChaosState(parsed) ? parsed : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function saveChaosState(state: ChaosState): void {
  try {
    localStorage.setItem(getChaosKey(), JSON.stringify(state));
  } catch {
    // localStorage full or unavailable
  }
}
