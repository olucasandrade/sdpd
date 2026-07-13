import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useGameState } from '../../hooks/useGameState';
import { useInterviewSession } from '../../hooks/useInterviewSession';
import { useNotebook } from '../../hooks/useNotebook';
import { isDue } from '../../utils/reviewScheduler';
import { getUtcDateString } from '../../data/dailyDrill';
import { useTranslation } from '../../i18n';
import { CaseList } from './CaseList';
import { ResetProgressButton } from './ResetProgressButton';
import { AccountSection } from '../account/AccountSection';

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const { locale, setLocale, toggleGuide, guideOpen } = useGameState();
  const { t } = useTranslation();
  const interviewStatus = useInterviewSession((s) => s.status);
  const guideDisabled = interviewStatus === 'round' || interviewStatus === 'postmortem';
  const notebookCards = useNotebook((s) => s.cards);
  const dueCount = notebookCards.filter((c) => !c.retired && isDue(c.dueDate, getUtcDateString())).length;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={t('menu.title')}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-noir-950/80 backdrop-blur-sm z-50 lg:hidden"
          onClick={onClose}
        >
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="h-full w-full max-w-xs bg-noir-900 border-r border-noir-600/50 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3 pl-4 border-b border-noir-600/50">
              <span className="text-xs font-mono text-noir-500 uppercase tracking-widest">{t('menu.title')}</span>
              <button
                onClick={onClose}
                className="text-white/50 hover:text-white/80 transition-colors text-lg w-11 h-11 flex items-center justify-center"
              >
                &times;
              </button>
            </div>

            <CaseList onNavigate={onClose} />

            <div className="p-3 border-t border-noir-600/50 flex flex-col gap-2">
              <button
                onClick={() => setLocale(locale === 'en' ? 'pt-BR' : 'en')}
                className="text-xs font-mono text-noir-300 hover:text-amber-400 transition-colors px-3 min-h-11 rounded border border-noir-600/40 hover:border-amber-500/30 text-left flex items-center"
              >
                {locale === 'en' ? 'PT-BR' : 'EN'}
              </button>
              <Link
                to="/daily"
                onClick={onClose}
                className="text-xs font-mono text-noir-300 hover:text-amber-400 transition-colors px-3 min-h-11 rounded border border-noir-600/40 hover:border-amber-500/30 flex items-center"
              >
                {t('header.daily')}
              </Link>
              <Link
                to="/chaos"
                onClick={onClose}
                className="text-xs font-mono text-noir-300 hover:text-amber-400 transition-colors px-3 min-h-11 rounded border border-noir-600/40 hover:border-amber-500/30 flex items-center"
              >
                {t('header.chaos')}
              </Link>
              <Link
                to="/builder"
                onClick={onClose}
                className="text-xs font-mono text-noir-300 hover:text-amber-400 transition-colors px-3 min-h-11 rounded border border-noir-600/40 hover:border-amber-500/30 flex items-center"
              >
                {t('header.builder')}
              </Link>
              <Link
                to="/interview"
                onClick={onClose}
                className="text-xs font-mono text-noir-300 hover:text-amber-400 transition-colors px-3 min-h-11 rounded border border-noir-600/40 hover:border-amber-500/30 flex items-center"
              >
                {t('header.interview')}
              </Link>
              <Link
                to="/notebook"
                onClick={onClose}
                className="text-xs font-mono text-noir-300 hover:text-amber-400 transition-colors px-3 min-h-11 rounded border border-noir-600/40 hover:border-amber-500/30 flex items-center justify-between"
              >
                {t('header.notebook')}
                {dueCount > 0 && (
                  <span className="min-w-4 h-4 px-1 rounded-full bg-amber-500 text-noir-950 text-[10px] font-mono font-bold flex items-center justify-center">
                    {dueCount}
                  </span>
                )}
              </Link>
              <button
                onClick={() => {
                  toggleGuide();
                  onClose();
                }}
                disabled={guideDisabled}
                className="text-xs font-mono text-noir-300 hover:text-amber-400 transition-colors px-3 min-h-11 rounded border border-noir-600/40 hover:border-amber-500/30 text-left flex items-center disabled:opacity-40 disabled:pointer-events-none"
              >
                {guideOpen ? t('header.guide.close') : t('header.guide.open')}
              </button>
              <a
                href="https://github.com/olucasandrade/sdpd"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-noir-300 hover:text-amber-400 transition-colors px-3 min-h-11 rounded border border-noir-600/40 hover:border-amber-500/30 flex items-center"
              >
                {t('social.github')}
              </a>
              <AccountSection />
              <ResetProgressButton />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
