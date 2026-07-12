import type { InvestigationBoardState, InvestigationSaveReason } from '../types/investigation';

const SCHEMA_VERSION = 1;

function getCaseKey(caseId: string): string {
  return `investigation:${caseId}:v${SCHEMA_VERSION}`;
}

function isInvestigationBoardState(value: unknown, caseId: string): value is InvestigationBoardState {
  if (!value || typeof value !== 'object') return false;
  const state = value as Record<string, unknown>;
  return (
    state.schemaVersion === SCHEMA_VERSION &&
    state.caseId === caseId &&
    typeof state.updatedAt === 'string' &&
    typeof state.version === 'number' &&
    Array.isArray(state.evidence) &&
    Array.isArray(state.timelineEvents) &&
    Array.isArray(state.contradictions) &&
    !!state.unlock &&
    typeof state.unlock === 'object'
  );
}

export function loadCaseBoardState(caseId: string): InvestigationBoardState | null {
  try {
    const raw = localStorage.getItem(getCaseKey(caseId));
    if (!raw) return null;

    const parsed = JSON.parse(raw) as unknown;
    if (!isInvestigationBoardState(parsed, caseId)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveCaseBoardState(
  state: InvestigationBoardState,
): { ok: true } | { ok: false; reason: InvestigationSaveReason } {
  try {
    localStorage.setItem(getCaseKey(state.caseId), JSON.stringify(state));
    return { ok: true };
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      return { ok: false, reason: 'quota' };
    }
    return { ok: false, reason: 'unknown' };
  }
}
