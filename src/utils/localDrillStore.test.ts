import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DrillState } from '../types/drill';

// Minimal in-memory localStorage stub — no jsdom dependency needed for
// these pure-logic tests (see ISSUE-03 notes on Vitest + localStorage).
class MemoryStorage implements Storage {
  private store = new Map<string, string>();
  get length() {
    return this.store.size;
  }
  clear(): void {
    this.store.clear();
  }
  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }
  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }
  removeItem(key: string): void {
    this.store.delete(key);
  }
  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
}

vi.stubGlobal('localStorage', new MemoryStorage());

const { loadDrillState, saveDrillState, defaultDrillState } = await import('./localDrillStore');

beforeEach(() => {
  localStorage.clear();
});

describe('loadDrillState', () => {
  it('returns defaults when nothing is stored', () => {
    expect(loadDrillState()).toEqual(defaultDrillState());
  });

  it('returns defaults on corrupt JSON', () => {
    localStorage.setItem('sdpd-drill-state', '{not json');
    expect(loadDrillState()).toEqual(defaultDrillState());
  });

  it('returns defaults when schemaVersion does not match', () => {
    localStorage.setItem(
      'sdpd-drill-state',
      JSON.stringify({ schemaVersion: 999, lastPlayedDate: null, streak: 0, bestStreak: 0, history: {} }),
    );
    expect(loadDrillState()).toEqual(defaultDrillState());
  });

  it('round-trips a valid state', () => {
    const state: DrillState = {
      schemaVersion: 1,
      lastPlayedDate: '2026-07-11',
      streak: 4,
      bestStreak: 11,
      history: { '2026-07-11': { caseId: 'case-07', rootCauseStars: 3, fixStars: 2, stars: 5, seconds: 143 } },
    };
    saveDrillState(state);
    expect(loadDrillState()).toEqual(state);
  });
});

describe('saveDrillState history cap', () => {
  it('caps history at 400 entries, dropping the oldest first', () => {
    const history: DrillState['history'] = {};
    for (let i = 0; i < 405; i++) {
      const date = new Date(Date.UTC(2020, 0, 1 + i)).toISOString().slice(0, 10);
      history[date] = { caseId: 'case-01', rootCauseStars: 3, fixStars: 3, stars: 6, seconds: 60 };
    }
    saveDrillState({ schemaVersion: 1, lastPlayedDate: null, streak: 0, bestStreak: 0, history });

    const loaded = loadDrillState();
    const keys = Object.keys(loaded.history);
    expect(keys).toHaveLength(400);
    // the 5 oldest dates (2020-01-01 .. 2020-01-05) should have been dropped
    expect(loaded.history['2020-01-01']).toBeUndefined();
    expect(loaded.history['2020-01-05']).toBeUndefined();
    expect(loaded.history['2020-01-06']).toBeDefined();
  });
});
