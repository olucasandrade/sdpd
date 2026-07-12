import { useState } from 'react';
import { useGameState } from '../../hooks/useGameState';
import { useTranslation } from '../../i18n';

interface ResetProgressButtonProps {
  className?: string;
}

export function ResetProgressButton({ className = '' }: ResetProgressButtonProps) {
  const { resetProgress } = useGameState();
  const { t } = useTranslation();
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <button
          onClick={() => {
            resetProgress();
            setConfirming(false);
          }}
          className="text-xs font-mono text-status-failed hover:text-status-failed/80 transition-colors min-h-11 px-3 rounded border border-status-failed/40 hover:border-status-failed/60 flex items-center"
        >
          {t('settings.confirmReset')}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs font-mono text-white/45 hover:text-white/70 transition-colors min-h-11 px-3 rounded border border-noir-600/40 flex items-center"
        >
          {t('settings.cancel')}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className={`text-xs font-mono text-noir-300 hover:text-status-failed transition-colors min-h-11 px-3 rounded border border-noir-600/40 hover:border-status-failed/40 text-left flex items-center ${className}`}
    >
      {t('settings.resetProgress')}
    </button>
  );
}
