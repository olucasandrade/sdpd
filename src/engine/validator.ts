import type { DiagnosisOption } from '../types/case';

export function checkAnswer(options: DiagnosisOption[], selectedId: string) {
  const selected = options.find((o) => o.id === selectedId);
  if (!selected) return { correct: false, feedback: 'Invalid selection.' };
  return { correct: selected.correct, feedback: selected.feedback };
}
