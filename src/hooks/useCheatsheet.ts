import { useEffect, useState } from 'react';
import type { CheatsheetData } from '../types/cheatsheet';
import { useGameState } from './useGameState';

const loaders = import.meta.glob<{ default: CheatsheetData }>('../data/cheatsheet/*.json');
const cache = new Map<string, CheatsheetData>();

function findLoader(locale: string) {
  const suffix = `${locale}.json`;
  const key = Object.keys(loaders).find((k) => k.endsWith(suffix));
  return key ? loaders[key] : undefined;
}

export function useCheatsheet(): { data: CheatsheetData | null; loading: boolean; error: boolean } {
  const locale = useGameState((s) => s.locale);
  const [data, setData] = useState<CheatsheetData | null>(cache.get(locale) ?? null);
  const [loading, setLoading] = useState(!cache.has(locale));
  const [error, setError] = useState(false);

  useEffect(() => {
    if (cache.has(locale)) {
      setData(cache.get(locale)!);
      setLoading(false);
      setError(false);
      return;
    }

    const loader = findLoader(locale) ?? findLoader('en');
    if (!loader) {
      setError(true);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(false);

    loader()
      .then((mod) => {
        if (cancelled) return;
        const loaded = mod.default;
        if (loaded.schemaVersion !== 1) {
          setError(true);
          setData(null);
          return;
        }
        cache.set(locale, loaded);
        setData(loaded);
      })
      .catch(() => {
        if (cancelled) return;
        setError(true);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [locale]);

  return { data, loading, error };
}
