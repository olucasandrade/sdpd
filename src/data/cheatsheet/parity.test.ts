import { describe, expect, it } from 'vitest';
import en from './en.json';
import ptBR from './pt-BR.json';
import type { CheatsheetData } from '../../types/cheatsheet';

const enData = en as CheatsheetData;
const ptData = ptBR as CheatsheetData;

describe('cheatsheet locale parity', () => {
  it('both locales declare schemaVersion 1', () => {
    expect(enData.schemaVersion).toBe(1);
    expect(ptData.schemaVersion).toBe(1);
  });

  it('both locales have exactly 45 cards', () => {
    expect(enData.cards).toHaveLength(45);
    expect(ptData.cards).toHaveLength(45);
  });

  it('card ids match exactly, in the same order', () => {
    expect(ptData.cards.map((c) => c.id)).toEqual(enData.cards.map((c) => c.id));
  });

  it('categories, relatedCaseIds, and conceptId match per card', () => {
    enData.cards.forEach((enCard, i) => {
      const ptCard = ptData.cards[i];
      expect(ptCard.category).toBe(enCard.category);
      expect(ptCard.relatedCaseIds).toEqual(enCard.relatedCaseIds);
      expect(ptCard.conceptId).toBe(enCard.conceptId);
      expect(ptCard.options).toHaveLength(enCard.options.length);
    });
  });

  it('no card id appears twice within a locale', () => {
    expect(new Set(enData.cards.map((c) => c.id)).size).toBe(enData.cards.length);
    expect(new Set(ptData.cards.map((c) => c.id)).size).toBe(ptData.cards.length);
  });
});
