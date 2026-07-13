import { supabase } from './supabase';
import type { DrillResultInput, LeaderboardEntry } from '../types/account';

/**
 * Daily-drill leaderboard queries (FEATURE-04). These land ahead of
 * FEATURE-02 (Daily Drill) — see docs/backlog/FEATURE-04-accounts-leaderboard.md's
 * "Order dependency" note: "Sync alone can ship first." The
 * `DailyLeaderboardPanel` component (src/components/leaderboard) is built
 * and ready to drop onto the Daily Drill post-play screen once FEATURE-02
 * lands; there is no host screen for it yet.
 *
 * Anti-cheat is explicitly out of scope: scores are client-computed and
 * trusted, same as the rest of this client-side game.
 */

export async function submitDrillResult(
  userId: string,
  result: DrillResultInput,
): Promise<{ error: string | null }> {
  if (!supabase) return { error: 'disabled' };
  const { error } = await supabase.from('drill_results').insert({
    user_id: userId,
    drill_day: result.drillDay,
    case_id: result.caseId,
    stars: result.stars,
    seconds: result.seconds,
  });
  // The (user_id, drill_day) primary key rejects a second same-day insert —
  // that unique-violation is expected once a client has already submitted.
  return { error: error ? error.message : null };
}

export async function fetchDailyLeaderboard(
  drillDay: number,
  limit = 100,
): Promise<{ entries: LeaderboardEntry[]; error: string | null }> {
  if (!supabase) return { entries: [], error: 'disabled' };
  const { data, error } = await supabase
    .from('daily_leaderboard')
    .select('handle, drill_day, stars, seconds')
    .eq('drill_day', drillDay)
    .order('stars', { ascending: false })
    .order('seconds', { ascending: true })
    .limit(limit);
  return { entries: (data as LeaderboardEntry[] | null) ?? [], error: error?.message ?? null };
}

/**
 * Percentile of `handle` among all entries for that day, computed as
 * `count(strictly worse than you) / count(all)`. Two extra lightweight
 * queries (counts, not full row fetches) per the spec's "one extra query".
 */
export async function fetchUserPercentile(
  drillDay: number,
  handle: string,
): Promise<{ rank: number; total: number; percentile: number } | null> {
  if (!supabase) return null;

  const { data: mine } = await supabase
    .from('daily_leaderboard')
    .select('stars, seconds')
    .eq('drill_day', drillDay)
    .eq('handle', handle)
    .maybeSingle();
  if (!mine) return null;

  const { count: total } = await supabase
    .from('daily_leaderboard')
    .select('*', { count: 'exact', head: true })
    .eq('drill_day', drillDay);

  const { count: better } = await supabase
    .from('daily_leaderboard')
    .select('*', { count: 'exact', head: true })
    .eq('drill_day', drillDay)
    .or(`stars.gt.${mine.stars},and(stars.eq.${mine.stars},seconds.lt.${mine.seconds})`);

  const totalCount = total ?? 1;
  const betterCount = better ?? 0;
  const percentile = totalCount > 0 ? Math.round(((totalCount - betterCount) / totalCount) * 100) : 100;

  return { rank: betterCount + 1, total: totalCount, percentile };
}
