import { create } from 'zustand';
import type { NotebookCard, QuestionCardRef, TermCardRef } from '../types/notebook';
import { loadNotebookState, saveNotebookState, pruneDanglingCards } from '../utils/localNotebookStore';
import { gradeReview, dueDateForRung, questionCardId, termCardId } from '../utils/reviewScheduler';
import { getUtcDateString } from '../data/dailyDrill';

interface NotebookStore {
  cards: NotebookCard[];
  captureMissedQuestion: (caseId: string, phase: 'rootCause' | 'fix') => void;
  captureConceptTerm: (conceptId: string, termIndex: number) => void;
  gradeCard: (id: string, correct: boolean) => void;
  pruneDangling: (validCaseIds: Set<string>, validTermCardIds: Set<string>) => void;
}

function persist(cards: NotebookCard[]): void {
  saveNotebookState({ schemaVersion: 1, cards });
}

/** Inserts a new card at rung 0, or (if `resetIfExists`) resets an existing one back to rung 0. */
function upsert(
  cards: NotebookCard[],
  id: string,
  type: 'question' | 'term',
  ref: QuestionCardRef | TermCardRef,
  resetIfExists: boolean,
): NotebookCard[] {
  const today = getUtcDateString();
  const existingIndex = cards.findIndex((c) => c.id === id);
  if (existingIndex === -1) {
    const card: NotebookCard = {
      id,
      type,
      ref,
      rung: 0,
      dueDate: dueDateForRung(0, today),
      addedAt: today,
      lapses: 0,
      retired: false,
    };
    return [...cards, card];
  }
  if (!resetIfExists) return cards;
  const next = [...cards];
  const existing = next[existingIndex];
  next[existingIndex] = {
    ...existing,
    rung: 0,
    dueDate: dueDateForRung(0, today),
    lapses: existing.lapses + 1,
    retired: false,
  };
  return next;
}

const persisted = loadNotebookState();

export const useNotebook = create<NotebookStore>((set, get) => ({
  cards: persisted.cards,

  // Capture hooks are fire-and-forget: they must never throw into the game loop.
  captureMissedQuestion: (caseId, phase) => {
    try {
      const id = questionCardId(caseId, phase);
      const cards = upsert(get().cards, id, 'question', { caseId, phase }, true);
      set({ cards });
      persist(cards);
    } catch {
      // swallow — a broken capture must not break the underlying game action
    }
  },

  captureConceptTerm: (conceptId, termIndex) => {
    try {
      const id = termCardId(conceptId, termIndex);
      const cards = upsert(get().cards, id, 'term', { conceptId, termIndex }, false);
      set({ cards });
      persist(cards);
    } catch {
      // swallow — see captureMissedQuestion
    }
  },

  gradeCard: (id, correct) => {
    const today = getUtcDateString();
    const cards = get().cards.map((card) => {
      if (card.id !== id) return card;
      const result = gradeReview(card, correct, today);
      return { ...card, ...result };
    });
    set({ cards });
    persist(cards);
  },

  pruneDangling: (validCaseIds, validTermCardIds) => {
    const current = get().cards;
    const cards = pruneDanglingCards(current, validCaseIds, validTermCardIds);
    if (cards.length !== current.length) {
      set({ cards });
      persist(cards);
    }
  },
}));
