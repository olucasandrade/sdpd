export type NotebookCardType = 'question' | 'term';

export interface QuestionCardRef {
  caseId: string;
  phase: 'rootCause' | 'fix';
}

// Key terms have no stable id in concepts.json, only translated text, so refs
// use the term's index within its concept's keyTerms array — index order is
// identical across locale files, term text is not.
export interface TermCardRef {
  conceptId: string;
  termIndex: number;
}

export interface NotebookCard {
  id: string;
  type: NotebookCardType;
  ref: QuestionCardRef | TermCardRef;
  rung: number;
  dueDate: string;
  addedAt: string;
  lapses: number;
  retired: boolean;
}

export interface NotebookState {
  schemaVersion: 1;
  cards: NotebookCard[];
}
