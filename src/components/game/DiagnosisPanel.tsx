import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Case, DiagnosisOption } from '../../types/case';
import { checkAnswer } from '../../engine/validator';
import { useGameState } from '../../hooks/useGameState';
import { useTranslation } from '../../i18n';
import { Button } from '../common/Button';

interface DiagnosisPanelProps {
  caseData: Case;
  onCaseComplete: () => void;
}

type Phase = 'rootCause' | 'fix' | 'complete';

export function DiagnosisPanel({ caseData, onCaseComplete }: DiagnosisPanelProps) {
  const { progress, submitRootCause, submitFix } = useGameState();
  const { t } = useTranslation();
  const caseProgress = progress[caseData.id];
  const initialPhase: Phase = caseProgress?.fixFound
    ? 'complete'
    : caseProgress?.rootCauseFound
    ? 'fix'
    : 'rootCause';

  const [phase, setPhase] = useState<Phase>(initialPhase);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ correct: boolean; text: string } | null>(null);

  const currentDiagnosis = phase === 'rootCause' ? caseData.diagnosis.rootCause : caseData.diagnosis.fix;

  function handleSubmit() {
    if (!selected) return;
    const result = checkAnswer(currentDiagnosis.options, selected);
    setFeedback({ correct: result.correct, text: result.feedback });

    if (phase === 'rootCause') {
      submitRootCause(caseData.id, result.correct);
    } else if (phase === 'fix') {
      submitFix(caseData.id, result.correct);
    }
  }

  function handleNext() {
    if (phase === 'rootCause' && feedback?.correct) {
      setPhase('fix');
      setSelected(null);
      setFeedback(null);
    } else if (phase === 'fix' && feedback?.correct) {
      setPhase('complete');
      onCaseComplete();
    } else {
      setSelected(null);
      setFeedback(null);
    }
  }

  if (phase === 'complete') return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-noir-800/60 border border-noir-600/40 rounded-xl p-5 backdrop-blur-sm"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-8 h-8 rounded flex items-center justify-center text-sm ${
          phase === 'rootCause'
            ? 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-400'
            : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
        }`}>
          <span className="font-display">{phase === 'rootCause' ? '01' : '02'}</span>
        </div>
        <div>
          <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
            {phase === 'rootCause' ? t('diagnosis.diagnose') : t('diagnosis.prescribe')}
          </p>
          <h3 className="text-sm font-medium text-white/90">{currentDiagnosis.question}</h3>
        </div>
      </div>

      <div className="space-y-2">
        {currentDiagnosis.options.map((opt: DiagnosisOption) => {
          const isSelected = selected === opt.id;
          const showCorrect = feedback && opt.correct;
          const showWrong = feedback && isSelected && !opt.correct;

          return (
            <motion.button
              key={opt.id}
              whileHover={!feedback ? { x: 4 } : undefined}
              onClick={() => !feedback && setSelected(opt.id)}
              disabled={!!feedback}
              className={`w-full text-left p-3 rounded-lg border transition-all duration-200 text-sm cursor-pointer ${
                showCorrect
                  ? 'border-status-healthy/50 bg-status-healthy/8 text-white node-glow-healthy'
                  : showWrong
                  ? 'border-status-failed/50 bg-status-failed/8 text-white node-glow-failed'
                  : isSelected
                  ? 'border-amber-500/40 bg-amber-500/8 text-white neon-border'
                  : 'border-noir-600/40 text-white/50 hover:border-noir-500/50 hover:text-white/70 hover:bg-noir-700/30'
              }`}
            >
              <span className="font-mono text-[10px] text-white/20 mr-2">
                {String.fromCharCode(65 + currentDiagnosis.options.indexOf(opt))}
              </span>
              {opt.text}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className={`mt-4 p-3 rounded-lg text-sm ${
              feedback.correct
                ? 'bg-status-healthy/8 border border-status-healthy/20'
                : 'bg-status-failed/8 border border-status-failed/20'
            }`}
          >
            <p className={`font-display text-base tracking-wide mb-1 ${
              feedback.correct ? 'text-status-healthy' : 'text-status-failed'
            }`}>
              {feedback.correct ? t('diagnosis.correct') : t('diagnosis.incorrect')}
            </p>
            <p className="text-white/50 text-xs leading-relaxed">{feedback.text}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-4 flex justify-end">
        {!feedback ? (
          <Button onClick={handleSubmit} disabled={!selected}>
            {t('diagnosis.submit')}
          </Button>
        ) : (
          <Button onClick={handleNext}>
            {feedback.correct
              ? phase === 'rootCause'
                ? t('diagnosis.continue')
                : t('diagnosis.solveCase')
              : t('diagnosis.tryAgain')}
          </Button>
        )}
      </div>
    </motion.div>
  );
}
