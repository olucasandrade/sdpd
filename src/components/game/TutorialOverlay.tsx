import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from '../../i18n';

interface TutorialOverlayProps {
  step: number;
  onNext: () => void;
  onSkip: () => void;
}

const STEPS = [
  { title: 'tutorial.step1Title', body: 'tutorial.step1Body' },
  { title: 'tutorial.step2Title', body: 'tutorial.step2Body' },
  { title: 'tutorial.step3Title', body: 'tutorial.step3Body' },
];

export function TutorialOverlay({ step, onNext, onSkip }: TutorialOverlayProps) {
  const { t } = useTranslation();
  const current = STEPS[step - 1];
  if (!current) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-noir-950/85 backdrop-blur-sm z-[60] flex items-end md:items-center justify-center p-4"
      >
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-noir-800 border border-amber-500/30 rounded-xl p-5 max-w-sm w-full neon-border"
        >
          <p className="text-xs font-mono text-amber-400/80 uppercase tracking-widest mb-1">
            {t('tutorial.stepLabel')} {step}/3
          </p>
          <h3 className="font-display text-lg text-white mb-2">{t(current.title)}</h3>
          <p className="text-sm text-white/70 leading-relaxed mb-5">{t(current.body)}</p>
          <div className="flex items-center justify-between">
            <button
              onClick={onSkip}
              className="text-xs font-mono text-white/45 hover:text-white/70 transition-colors min-h-11 px-2"
            >
              {t('tutorial.skip')}
            </button>
            <button
              onClick={onNext}
              className="text-xs font-mono bg-amber-500 hover:bg-amber-400 text-noir-950 font-bold px-4 min-h-11 rounded-lg transition-colors"
            >
              {step < 3 ? t('tutorial.next') : t('tutorial.done')}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
