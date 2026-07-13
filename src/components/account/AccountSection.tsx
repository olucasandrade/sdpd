import { useCloudAccount } from '../../context/CloudAccountContext';
import { useTranslation } from '../../i18n';

interface AccountSectionProps {
  className?: string;
}

const STATUS_KEY: Partial<Record<string, string>> = {
  syncing: 'account.statusSyncing',
  offline: 'account.statusOffline',
  stale: 'account.statusStale',
};

/**
 * Sign-in / sync-status control for the header settings popover and mobile
 * menu. Renders nothing when Supabase env vars are absent — the account
 * feature must feature-detect and disappear cleanly, never crash
 * (FEATURE-04 constraint).
 */
export function AccountSection({ className = '' }: AccountSectionProps) {
  const { enabled, session, profile, status, loading, signInWithGithub, signOut } = useCloudAccount();
  const { t } = useTranslation();

  if (!enabled) return null;

  if (!session) {
    return (
      <button
        onClick={signInWithGithub}
        disabled={loading}
        className={`text-xs font-mono text-noir-300 hover:text-amber-400 transition-colors min-h-11 px-3 rounded border border-noir-600/40 hover:border-amber-500/30 text-left flex items-center ${className}`}
      >
        {loading ? t('account.signingIn') : t('account.signIn')}
      </button>
    );
  }

  const statusKey = STATUS_KEY[status];

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {profile && (
        <p className="text-xs font-mono text-white/70 px-3">
          {t('account.syncedAs')} <span className="text-amber-300">@{profile.handle}</span>
        </p>
      )}
      {statusKey && <p className="text-xs font-mono text-white/45 px-3">{t(statusKey)}</p>}
      <button
        onClick={signOut}
        className="text-xs font-mono text-noir-300 hover:text-status-failed transition-colors min-h-11 px-3 rounded border border-noir-600/40 hover:border-status-failed/40 text-left flex items-center"
      >
        {t('account.signOut')}
      </button>
    </div>
  );
}
