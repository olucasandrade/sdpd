import { useEffect, useState } from 'react';
import type { BuilderChallenge } from '../types/builder';
import { useGameState } from './useGameState';
import type { Locale } from '../i18n';

// Lazy globs: challenge JSON is never part of the entry bundle. Each file
// becomes its own chunk, fetched only when a builder page is visited.
const enLoaders = import.meta.glob<{ default: BuilderChallenge }>('../data/builder/challenges-*.json');
const ptBrLoaders = import.meta.glob<{ default: BuilderChallenge }>('../data/builder/pt-BR/challenges-*.json');

function loadersForLocale(locale: Locale): Record<string, () => Promise<{ default: BuilderChallenge }>> {
  return locale === 'pt-BR' ? ptBrLoaders : enLoaders;
}

function sortedPaths(loaders: Record<string, () => Promise<{ default: BuilderChallenge }>>): string[] {
  return Object.keys(loaders).sort();
}

/** Loads the full list of builder challenges (all 23) for the current locale. */
export function useBuilderChallengeList(): { challenges: BuilderChallenge[]; loading: boolean } {
  const locale = useGameState((s) => s.locale);
  const [challenges, setChallenges] = useState<BuilderChallenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const loaders = loadersForLocale(locale);
    const paths = sortedPaths(loaders);

    Promise.all(paths.map((path) => loaders[path]()))
      .then((modules) => {
        if (cancelled) return;
        setChallenges(modules.map((m) => m.default));
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setChallenges([]);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [locale]);

  return { challenges, loading };
}

/** Loads a single builder challenge by id (e.g. "builder-01") for the current locale. */
export function useBuilderChallenge(challengeId: string | undefined): {
  challenge: BuilderChallenge | null;
  loading: boolean;
} {
  const locale = useGameState((s) => s.locale);
  const [challenge, setChallenge] = useState<BuilderChallenge | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setChallenge(null);

    const number = challengeId?.match(/(\d+)$/)?.[1];
    if (!number) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const loaders = loadersForLocale(locale);
    const paddedNumber = number.padStart(2, '0');
    const path = sortedPaths(loaders).find((p) => p.endsWith(`challenges-${paddedNumber}.json`));

    if (!path) {
      setLoading(false);
      return;
    }

    loaders[path]()
      .then((module) => {
        if (cancelled) return;
        setChallenge(module.default);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setChallenge(null);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [challengeId, locale]);

  return { challenge, loading };
}
