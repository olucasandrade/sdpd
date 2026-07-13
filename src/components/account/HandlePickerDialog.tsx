import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useCloudAccount } from '../../context/CloudAccountContext';
import { useTranslation } from '../../i18n';

const HANDLE_PATTERN = /^[a-zA-Z0-9_-]{3,20}$/;

/**
 * Shown once, right after a first-ever sign-in, before any sync can happen
 * (progress_sync.user_id has a FK to profiles(id)). Mounted globally in
 * GameLayout so it appears regardless of which route the OAuth redirect
 * lands on.
 */
export function HandlePickerDialog() {
  const { needsHandle, claimHandle } = useCloudAccount();
  const { t } = useTranslation();
  const [value, setValue] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!needsHandle) return null;

  const valid = HANDLE_PATTERN.test(value);

  const handleSubmit = async () => {
    if (!valid || submitting) return;
    setSubmitting(true);
    setError(null);
    const { error: claimError } = await claimHandle(value);
    setSubmitting(false);
    if (claimError) {
      setError(claimError.includes('duplicate') ? t('account.handleTaken') : t('account.error'));
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-noir-950/85 backdrop-blur-sm z-[70] flex items-end md:items-center justify-center p-4"
      >
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-noir-800 border border-amber-500/30 rounded-xl p-5 max-w-sm w-full neon-border"
          role="dialog"
          aria-modal="true"
          aria-label={t('account.handlePickerTitle')}
        >
          <h3 className="font-display text-lg text-white mb-2">{t('account.handlePickerTitle')}</h3>
          <p className="text-sm text-white/70 leading-relaxed mb-4">{t('account.handlePickerBody')}</p>

          <input
            autoFocus
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit();
            }}
            placeholder={t('account.handlePlaceholder')}
            maxLength={20}
            className="w-full bg-noir-950 border border-noir-600/60 focus:border-amber-500/50 rounded-lg px-3 py-2.5 text-sm text-white/90 font-mono outline-none transition-colors mb-2"
          />

          {(error || (value.length > 0 && !valid)) && (
            <p className="text-xs text-status-failed mb-3">{error ?? t('account.handleInvalid')}</p>
          )}

          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={!valid || submitting}
              className="text-xs font-mono bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/30 disabled:text-noir-950/50 text-noir-950 font-bold px-4 min-h-11 rounded-lg transition-colors"
            >
              {submitting ? t('account.signingIn') : t('account.confirm')}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
