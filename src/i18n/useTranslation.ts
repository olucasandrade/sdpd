import { useCallback } from 'react';
import { useGameState } from '../hooks/useGameState';
import en from './locales/en.json';
import ptBR from './locales/pt-BR.json';

const messages: Record<string, Record<string, string>> = {
  en,
  'pt-BR': ptBR,
};

export function useTranslation() {
  const locale = useGameState((s) => s.locale);

  const t = useCallback(
    (key: string): string => {
      return messages[locale]?.[key] ?? messages.en[key] ?? key;
    },
    [locale],
  );

  return { t, locale };
}
