import { describe, expect, it } from 'vitest';
import {
  DRILL_PERMUTATION,
  addUtcDays,
  computeStreakUpdate,
  getDailyCaseNumber,
  getDayIndex,
  getDrillNumber,
  getUtcDateString,
  msUntilNextUtcMidnight,
  starsForAttempts,
} from './dailyDrill';

describe('DRILL_PERMUTATION', () => {
  it('is a permutation of 1..33 (no duplicates, no gaps)', () => {
    expect(DRILL_PERMUTATION).toHaveLength(33);
    expect(new Set(DRILL_PERMUTATION).size).toBe(33);
    expect([...DRILL_PERMUTATION].sort((a, b) => a - b)).toEqual(
      Array.from({ length: 33 }, (_, i) => i + 1),
    );
  });
});

describe('getDayIndex / getUtcDateString', () => {
  it('is stable for any two instants within the same UTC day', () => {
    const morning = new Date('2026-07-12T00:00:01.000Z');
    const night = new Date('2026-07-12T23:59:59.000Z');
    expect(getDayIndex(morning)).toBe(getDayIndex(night));
    expect(getUtcDateString(morning)).toBe('2026-07-12');
    expect(getUtcDateString(night)).toBe('2026-07-12');
  });

  it('changes across the UTC midnight boundary even for the same local time', () => {
    const beforeMidnight = new Date('2026-07-12T23:59:00.000Z');
    const afterMidnight = new Date('2026-07-13T00:01:00.000Z');
    expect(getDayIndex(afterMidnight)).toBe(getDayIndex(beforeMidnight) + 1);
    expect(getUtcDateString(beforeMidnight)).toBe('2026-07-12');
    expect(getUtcDateString(afterMidnight)).toBe('2026-07-13');
  });

  it('is unaffected by the local timezone of the Date object (Date is always UTC-backed)', () => {
    // A timestamp expressed with a non-UTC offset still resolves to the same
    // instant, and getUtcDateString always reports the UTC calendar date.
    const late = new Date('2026-07-12T23:30:00-05:00'); // 2026-07-13T04:30:00Z
    expect(getUtcDateString(late)).toBe('2026-07-13');
  });
});

describe('getDailyCaseNumber', () => {
  it('is deterministic for a given day index', () => {
    const dayIndex = getDayIndex(new Date('2026-07-12T12:00:00Z'));
    expect(getDailyCaseNumber(dayIndex)).toBe(getDailyCaseNumber(dayIndex));
  });

  it('changes on the next day (for this permutation, consecutive entries differ)', () => {
    const dayIndex = getDayIndex(new Date('2026-07-12T12:00:00Z'));
    expect(getDailyCaseNumber(dayIndex)).not.toBe(getDailyCaseNumber(dayIndex + 1));
  });

  it('always returns a value within 1..33', () => {
    for (let day = 0; day < 100; day++) {
      const num = getDailyCaseNumber(day);
      expect(num).toBeGreaterThanOrEqual(1);
      expect(num).toBeLessThanOrEqual(33);
    }
  });

  it('cycles every 33 days', () => {
    const dayIndex = 12345;
    expect(getDailyCaseNumber(dayIndex)).toBe(getDailyCaseNumber(dayIndex + 33));
  });
});

describe('getDrillNumber', () => {
  it('increases by exactly 1 per day', () => {
    const dayIndex = getDayIndex();
    expect(getDrillNumber(dayIndex + 1)).toBe(getDrillNumber(dayIndex) + 1);
  });
});

describe('addUtcDays', () => {
  it('adds and subtracts days across month/year boundaries', () => {
    expect(addUtcDays('2026-07-12', 1)).toBe('2026-07-13');
    expect(addUtcDays('2026-07-12', -1)).toBe('2026-07-11');
    expect(addUtcDays('2026-01-01', -1)).toBe('2025-12-31');
    expect(addUtcDays('2026-02-28', 1)).toBe('2026-03-01');
  });
});

describe('starsForAttempts', () => {
  it('awards 3 stars on the first try, 2 on the second, 1 thereafter', () => {
    expect(starsForAttempts(1)).toBe(3);
    expect(starsForAttempts(2)).toBe(2);
    expect(starsForAttempts(3)).toBe(1);
    expect(starsForAttempts(10)).toBe(1);
  });
});

describe('computeStreakUpdate', () => {
  it('increments the streak when the last play was exactly yesterday', () => {
    const result = computeStreakUpdate(
      { lastPlayedDate: '2026-07-11', streak: 4, bestStreak: 11 },
      '2026-07-12',
    );
    expect(result).toEqual({ streak: 5, bestStreak: 11 });
  });

  it('bumps bestStreak once the current streak surpasses it', () => {
    const result = computeStreakUpdate(
      { lastPlayedDate: '2026-07-11', streak: 11, bestStreak: 11 },
      '2026-07-12',
    );
    expect(result).toEqual({ streak: 12, bestStreak: 12 });
  });

  it('resets the streak to 1 after a gap of more than a day', () => {
    const result = computeStreakUpdate(
      { lastPlayedDate: '2026-07-01', streak: 9, bestStreak: 20 },
      '2026-07-12',
    );
    expect(result).toEqual({ streak: 1, bestStreak: 20 });
  });

  it('resets the streak to 1 on a first-ever play (lastPlayedDate null)', () => {
    const result = computeStreakUpdate({ lastPlayedDate: null, streak: 0, bestStreak: 0 }, '2026-07-12');
    expect(result).toEqual({ streak: 1, bestStreak: 1 });
  });

  it('handles the yesterday check correctly across a UTC month boundary', () => {
    const result = computeStreakUpdate(
      { lastPlayedDate: '2026-06-30', streak: 2, bestStreak: 2 },
      '2026-07-01',
    );
    expect(result).toEqual({ streak: 3, bestStreak: 3 });
  });
});

describe('msUntilNextUtcMidnight', () => {
  it('returns a value within (0, 24h] and shrinks as time advances', () => {
    const early = msUntilNextUtcMidnight(new Date('2026-07-12T00:00:01.000Z'));
    const late = msUntilNextUtcMidnight(new Date('2026-07-12T23:59:59.000Z'));
    expect(early).toBeLessThanOrEqual(24 * 60 * 60 * 1000);
    expect(late).toBeLessThanOrEqual(1000);
    expect(late).toBeGreaterThan(0);
    expect(early).toBeGreaterThan(late);
  });
});
