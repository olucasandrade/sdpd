import { describe, it, expect, beforeEach } from 'vitest';
import { loadState, saveState } from './storage';

const STORAGE_KEY = 'sdpd-game-state';

interface Sample {
  foo: string;
  bar: number;
}

const defaultValue: Sample = { foo: 'default', bar: 0 };

describe('loadState', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns the default value when nothing is stored', () => {
    expect(loadState(defaultValue)).toEqual(defaultValue);
  });

  it('returns the default value on corrupt JSON', () => {
    localStorage.setItem(STORAGE_KEY, '{not valid json');
    expect(loadState(defaultValue)).toEqual(defaultValue);
  });

  it('returns the default value when schemaVersion does not match', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ foo: 'stale', bar: 99, schemaVersion: 1 }),
    );
    expect(loadState(defaultValue)).toEqual(defaultValue);
  });

  it('accepts blobs with no schemaVersion (legacy v1 shape)', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ foo: 'legacy', bar: 5 }));
    expect(loadState(defaultValue)).toEqual({ foo: 'legacy', bar: 5 });
  });

  it('merges stored state over defaults, filling in missing fields', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ foo: 'partial', schemaVersion: 2 }));
    expect(loadState(defaultValue)).toEqual({ foo: 'partial', bar: 0 });
  });
});

describe('saveState', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('round-trips through loadState with the current schema version', () => {
    const state: Sample = { foo: 'saved', bar: 42 };
    saveState(state);
    expect(loadState(defaultValue)).toEqual(state);

    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) as string);
    expect(raw.schemaVersion).toBe(2);
  });
});
