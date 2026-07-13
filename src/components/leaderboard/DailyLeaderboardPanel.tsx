import { useEffect, useState } from 'react';
import { useCloudAccount } from '../../context/CloudAccountContext';
import { fetchDailyLeaderboard, fetchUserPercentile } from '../../lib/leaderboard';
import type { LeaderboardEntry } from '../../types/account';
import { useTranslation } from '../../i18n';
import { Button } from '../common/Button';

interface DailyLeaderboardPanelProps {
  drillDay: number;
  className?: string;
}

/**
 * "Today's precinct ranking" panel from FEATURE-04. Built ahead of its host
 * screen: the spec places this on the Daily Drill post-play screen
 * (FEATURE-02), which hasn't landed yet. This component is self-contained
 * and ready to drop in once it does — pass the same `dayIndex` FEATURE-02
 * computes for case selection.
 */
export function DailyLeaderboardPanel({ drillDay, className = '' }: DailyLeaderboardPanelProps) {
  const { enabled, session, profile, signInWithGithub } = useCloudAccount();
  const { t } = useTranslation();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [percentile, setPercentile] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setErrored(false);

    (async () => {
      const { entries: rows, error } = await fetchDailyLeaderboard(drillDay);
      if (cancelled) return;
      if (error) {
        setErrored(true);
        setLoading(false);
        return;
      }
      setEntries(rows);

      if (profile) {
        const mine = await fetchUserPercentile(drillDay, profile.handle);
        if (!cancelled && mine) setPercentile(mine.percentile);
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled, drillDay, profile]);

  if (!enabled) return null;

  return (
    <div className={`bg-noir-800/60 border border-noir-600/40 rounded-xl p-4 ${className}`}>
      <p className="text-xs font-mono text-amber-400/80 uppercase tracking-widest mb-3">
        {t('leaderboard.title')}
      </p>

      {!session && (
        <div className="text-center py-4">
          <p className="text-sm text-white/70 mb-3">{t('leaderboard.signInCta')}</p>
          <Button variant="secondary" onClick={signInWithGithub}>
            {t('account.signIn')}
          </Button>
        </div>
      )}

      {session && loading && <p className="text-xs font-mono text-white/45">{t('leaderboard.loading')}</p>}

      {session && !loading && errored && (
        <p className="text-xs font-mono text-white/45">{t('leaderboard.unavailable')}</p>
      )}

      {session && !loading && !errored && (
        <>
          {percentile !== null && (
            <p className="text-sm text-white/90 mb-3">
              {t('leaderboard.percentilePrefix')} <span className="text-amber-300">{percentile}</span>
              {t('leaderboard.percentileSuffix')}
            </p>
          )}

          {entries.length === 0 ? (
            <p className="text-xs font-mono text-white/45">{t('leaderboard.empty')}</p>
          ) : (
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="text-white/45 text-left">
                  <th className="pb-2 font-normal">{t('leaderboard.rank')}</th>
                  <th className="pb-2 font-normal">{t('leaderboard.stars')}</th>
                  <th className="pb-2 font-normal">{t('leaderboard.time')}</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, i) => {
                  const isYou = profile && entry.handle === profile.handle;
                  return (
                    <tr
                      key={`${entry.handle}-${i}`}
                      className={isYou ? 'text-amber-300' : 'text-white/70'}
                    >
                      <td className="py-1">
                        {i + 1}. {isYou ? t('leaderboard.you') : entry.handle}
                      </td>
                      <td className="py-1">{'★'.repeat(entry.stars)}</td>
                      <td className="py-1">
                        {Math.floor(entry.seconds / 60)}:{String(entry.seconds % 60).padStart(2, '0')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}
