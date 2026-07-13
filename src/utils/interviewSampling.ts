import { CATEGORIES } from '../data/categories';

interface SampleableCase {
  id: string;
  number: number;
}

/** Track value meaning "sample from all 33 cases, ignoring category". */
export const FULL_SPECTRUM_TRACK = 'full';

/** Category-suffix track keys, e.g. 'caching', plus the full-spectrum option. */
export function interviewTrackOptions(): string[] {
  return [...CATEGORIES.map((cat) => cat.key.replace('category.', '')), FULL_SPECTRUM_TRACK];
}

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Random-without-replacement case ids for a track, ignoring campaign unlock state. */
export function sampleInterviewCaseIds(cases: SampleableCase[], track: string, count = 3): string[] {
  const pool =
    track === FULL_SPECTRUM_TRACK
      ? cases
      : cases.filter((c) => {
          const category = CATEGORIES.find((cat) => cat.key === `category.${track}`);
          return category ? c.number >= category.range[0] && c.number <= category.range[1] : false;
        });
  return shuffle(pool)
    .slice(0, Math.min(count, pool.length))
    .map((c) => c.id);
}
