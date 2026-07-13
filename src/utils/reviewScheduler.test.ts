import { describe, expect, it } from 'vitest';
import {
  REVIEW_INTERVALS,
  MAX_RUNG,
  dueDateForRung,
  isDue,
  gradeReview,
  questionCardId,
  termCardId,
} from './reviewScheduler';
import { pruneDanglingCards } from './localNotebookStore';
import type { NotebookCard } from '../types/notebook';

describe('dueDateForRung', () => {
  it('adds the interval for each rung', () => {
    REVIEW_INTERVALS.forEach((days, rung) => {
      expect(dueDateForRung(rung, '2026-07-01')).toBe(addDays('2026-07-01', days));
    });
  });

  it('clamps beyond the top rung to the 30-day interval', () => {
    expect(dueDateForRung(99, '2026-07-01')).toBe(dueDateForRung(MAX_RUNG, '2026-07-01'));
  });
});

describe('isDue', () => {
  it('is due when the due date is today or earlier', () => {
    expect(isDue('2026-07-12', '2026-07-13')).toBe(true);
    expect(isDue('2026-07-13', '2026-07-13')).toBe(true);
  });

  it('is not due when the due date is in the future', () => {
    expect(isDue('2026-07-14', '2026-07-13')).toBe(false);
  });

  it('holds across a UTC month boundary', () => {
    expect(isDue('2026-06-30', '2026-07-01')).toBe(true);
    expect(isDue('2026-07-01', '2026-06-30')).toBe(false);
  });
});

describe('gradeReview', () => {
  it('resets to rung 0 and increments lapses on a wrong review, from every rung', () => {
    for (let rung = 0; rung <= MAX_RUNG; rung++) {
      const result = gradeReview({ rung, lapses: 2 }, false, '2026-07-13');
      expect(result.rung).toBe(0);
      expect(result.retired).toBe(false);
      expect(result.lapses).toBe(3);
      expect(result.dueDate).toBe(dueDateForRung(0, '2026-07-13'));
    }
  });

  it('advances one rung on a correct review below the top rung', () => {
    for (let rung = 0; rung < MAX_RUNG; rung++) {
      const result = gradeReview({ rung, lapses: 0 }, true, '2026-07-13');
      expect(result.rung).toBe(rung + 1);
      expect(result.retired).toBe(false);
      expect(result.dueDate).toBe(dueDateForRung(rung + 1, '2026-07-13'));
    }
  });

  it('retires the card on a correct review at the top rung instead of advancing further', () => {
    const result = gradeReview({ rung: MAX_RUNG, lapses: 1 }, true, '2026-07-13');
    expect(result.rung).toBe(MAX_RUNG);
    expect(result.retired).toBe(true);
    expect(result.lapses).toBe(1);
  });
});

describe('card ids', () => {
  it('are stable and distinguish phase/term index', () => {
    expect(questionCardId('case-14', 'rootCause')).toBe('case-14-rootCause');
    expect(questionCardId('case-14', 'fix')).toBe('case-14-fix');
    expect(termCardId('caching-basics', 0)).toBe('term-caching-basics-0');
    expect(termCardId('caching-basics', 1)).toBe('term-caching-basics-1');
  });
});

describe('pruneDanglingCards', () => {
  function makeCard(overrides: Partial<NotebookCard>): NotebookCard {
    return {
      id: 'x',
      type: 'question',
      ref: { caseId: 'case-01', phase: 'rootCause' },
      rung: 0,
      dueDate: '2026-07-14',
      addedAt: '2026-07-13',
      lapses: 0,
      retired: false,
      ...overrides,
    };
  }

  it('drops question cards whose case no longer exists', () => {
    const cards = [
      makeCard({ id: 'a', ref: { caseId: 'case-01', phase: 'rootCause' } }),
      makeCard({ id: 'b', ref: { caseId: 'case-99', phase: 'fix' } }),
    ];
    const pruned = pruneDanglingCards(cards, new Set(['case-01']), new Set());
    expect(pruned.map((c) => c.id)).toEqual(['a']);
  });

  it('drops term cards whose id is not in the valid set', () => {
    const cards = [
      makeCard({ id: 'term-caching-basics-0', type: 'term', ref: { conceptId: 'caching-basics', termIndex: 0 } }),
      makeCard({ id: 'term-caching-basics-9', type: 'term', ref: { conceptId: 'caching-basics', termIndex: 9 } }),
    ];
    const pruned = pruneDanglingCards(cards, new Set(), new Set(['term-caching-basics-0']));
    expect(pruned.map((c) => c.id)).toEqual(['term-caching-basics-0']);
  });
});

function addDays(dateStr: string, days: number): string {
  const date = new Date(`${dateStr}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}
