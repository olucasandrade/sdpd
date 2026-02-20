import { useMemo } from 'react';
import type { Case } from '../types/case';
import type { Concept } from '../types/game';
import { useGameState } from './useGameState';

// English cases
import case01 from '../data/cases/case-01.json';
import case02 from '../data/cases/case-02.json';
import case03 from '../data/cases/case-03.json';
import case04 from '../data/cases/case-04.json';
import case05 from '../data/cases/case-05.json';
import case06 from '../data/cases/case-06.json';
import case07 from '../data/cases/case-07.json';
import case08 from '../data/cases/case-08.json';
import case09 from '../data/cases/case-09.json';
import case10 from '../data/cases/case-10.json';
import case11 from '../data/cases/case-11.json';
import case12 from '../data/cases/case-12.json';
import case13 from '../data/cases/case-13.json';
import case14 from '../data/cases/case-14.json';
import case15 from '../data/cases/case-15.json';
import case16 from '../data/cases/case-16.json';
import case17 from '../data/cases/case-17.json';
import case18 from '../data/cases/case-18.json';
import case19 from '../data/cases/case-19.json';
import case20 from '../data/cases/case-20.json';
import case21 from '../data/cases/case-21.json';
import case22 from '../data/cases/case-22.json';
import case23 from '../data/cases/case-23.json';
import case24 from '../data/cases/case-24.json';
import case25 from '../data/cases/case-25.json';
import case26 from '../data/cases/case-26.json';
import case27 from '../data/cases/case-27.json';
import case28 from '../data/cases/case-28.json';
import case29 from '../data/cases/case-29.json';
import case30 from '../data/cases/case-30.json';
import case31 from '../data/cases/case-31.json';
import case32 from '../data/cases/case-32.json';
import case33 from '../data/cases/case-33.json';

// pt-BR cases
import case01PtBR from '../data/cases/pt-BR/case-01.json';
import case02PtBR from '../data/cases/pt-BR/case-02.json';
import case03PtBR from '../data/cases/pt-BR/case-03.json';
import case04PtBR from '../data/cases/pt-BR/case-04.json';
import case05PtBR from '../data/cases/pt-BR/case-05.json';
import case06PtBR from '../data/cases/pt-BR/case-06.json';
import case07PtBR from '../data/cases/pt-BR/case-07.json';
import case08PtBR from '../data/cases/pt-BR/case-08.json';
import case09PtBR from '../data/cases/pt-BR/case-09.json';
import case10PtBR from '../data/cases/pt-BR/case-10.json';
import case11PtBR from '../data/cases/pt-BR/case-11.json';
import case12PtBR from '../data/cases/pt-BR/case-12.json';
import case13PtBR from '../data/cases/pt-BR/case-13.json';
import case14PtBR from '../data/cases/pt-BR/case-14.json';
import case15PtBR from '../data/cases/pt-BR/case-15.json';
import case16PtBR from '../data/cases/pt-BR/case-16.json';
import case17PtBR from '../data/cases/pt-BR/case-17.json';
import case18PtBR from '../data/cases/pt-BR/case-18.json';
import case19PtBR from '../data/cases/pt-BR/case-19.json';
import case20PtBR from '../data/cases/pt-BR/case-20.json';
import case21PtBR from '../data/cases/pt-BR/case-21.json';
import case22PtBR from '../data/cases/pt-BR/case-22.json';
import case23PtBR from '../data/cases/pt-BR/case-23.json';
import case24PtBR from '../data/cases/pt-BR/case-24.json';
import case25PtBR from '../data/cases/pt-BR/case-25.json';
import case26PtBR from '../data/cases/pt-BR/case-26.json';
import case27PtBR from '../data/cases/pt-BR/case-27.json';
import case28PtBR from '../data/cases/pt-BR/case-28.json';
import case29PtBR from '../data/cases/pt-BR/case-29.json';
import case30PtBR from '../data/cases/pt-BR/case-30.json';
import case31PtBR from '../data/cases/pt-BR/case-31.json';
import case32PtBR from '../data/cases/pt-BR/case-32.json';
import case33PtBR from '../data/cases/pt-BR/case-33.json';

// Concepts
import conceptsEn from '../data/concepts.json';
import conceptsPtBR from '../data/concepts-pt-BR.json';

const casesEn = [
  case01, case02, case03, case04, case05, case06, case07, case08,
  case09, case10, case11, case12, case13, case14, case15, case16,
  case17, case18, case19, case20, case21, case22, case23, case24,
  case25, case26, case27, case28, case29, case30, case31, case32, case33,
] as unknown as Case[];

const casesPtBR = [
  case01PtBR, case02PtBR, case03PtBR, case04PtBR, case05PtBR, case06PtBR, case07PtBR, case08PtBR,
  case09PtBR, case10PtBR, case11PtBR, case12PtBR, case13PtBR, case14PtBR, case15PtBR, case16PtBR,
  case17PtBR, case18PtBR, case19PtBR, case20PtBR, case21PtBR, case22PtBR, case23PtBR, case24PtBR,
  case25PtBR, case26PtBR, case27PtBR, case28PtBR, case29PtBR, case30PtBR, case31PtBR, case32PtBR, case33PtBR,
] as unknown as Case[];

const casesByLocale: Record<string, Case[]> = {
  en: casesEn,
  'pt-BR': casesPtBR,
};

const conceptsByLocale: Record<string, Concept[]> = {
  en: conceptsEn as Concept[],
  'pt-BR': conceptsPtBR as Concept[],
};

export function useCase(caseId: string | undefined): Case | null {
  const locale = useGameState((s) => s.locale);
  return useMemo(() => {
    if (!caseId) return null;
    const cases = casesByLocale[locale] ?? casesEn;
    return cases.find((c) => c.id === caseId) ?? null;
  }, [caseId, locale]);
}

export function useAllCases(): Case[] {
  const locale = useGameState((s) => s.locale);
  return casesByLocale[locale] ?? casesEn;
}

export function useConcepts(): Concept[] {
  const locale = useGameState((s) => s.locale);
  return conceptsByLocale[locale] ?? (conceptsEn as Concept[]);
}
