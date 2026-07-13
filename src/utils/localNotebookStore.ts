import type { NotebookCard, NotebookState } from '../types/notebook';

const SCHEMA_VERSION = 1;
const STORAGE_KEY = 'sdpd-review-state';

function emptyState(): NotebookState {
  return { schemaVersion: SCHEMA_VERSION, cards: [] };
}

function isNotebookState(value: unknown): value is NotebookState {
  if (!value || typeof value !== 'object') return false;
  const state = value as Record<string, unknown>;
  return state.schemaVersion === SCHEMA_VERSION && Array.isArray(state.cards);
}

export function loadNotebookState(): NotebookState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as unknown;
    return isNotebookState(parsed) ? parsed : emptyState();
  } catch {
    return emptyState();
  }
}

export function saveNotebookState(state: NotebookState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage full or unavailable
  }
}

/** Drops cards whose refs no longer resolve to real content (removed cases/concepts). */
export function pruneDanglingCards(
  cards: NotebookCard[],
  validCaseIds: Set<string>,
  validTermCardIds: Set<string>,
): NotebookCard[] {
  return cards.filter((card) =>
    card.type === 'question'
      ? validCaseIds.has((card.ref as { caseId: string }).caseId)
      : validTermCardIds.has(card.id),
  );
}
