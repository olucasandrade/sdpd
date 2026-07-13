import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Case, DiagnosisOption } from '../../types/case';
import { checkAnswer } from '../../engine/validator';
import { useGameState } from '../../hooks/useGameState';
import { useTranslation } from '../../i18n';
import { Button } from '../common/Button';

export type DiagnosisPanelMode = 'campaign' | 'drill' | 'interview';

interface DiagnosisPanelProps {
  caseData: Case;
  onCaseComplete: () => void;
  /**
   * 'campaign' (default) reads/writes progress via the global game store, so
   * attempts count toward unlocks and rank. 'drill' tracks attempts locally
   * only — Daily Drill scoring must never touch or be touched by campaign
   * progress. 'interview' allows exactly one attempt per question and always
   * auto-advances, correct or not — the two non-campaign progressions are
   * intentionally independent of campaign state and of each other.
   */
  mode?: DiagnosisPanelMode;
  /** Fires once the fix is solved, only in 'drill' mode. */
  onDrillComplete?: (result: { rootCauseAttempts: number; fixAttempts: number }) => void;
  /** Fires after each submit, only in 'interview' mode. */
  onAnswer?: (phase: 'rootCause' | 'fix', correct: boolean) => void;
}

type Phase = 'rootCause' | 'fix' | 'complete';

export function DiagnosisPanel({
  caseData,
  onCaseComplete,
  mode = 'campaign',
  onDrillComplete,
  onAnswer,
}: DiagnosisPanelProps) {
  const { progress, submitRootCause, submitFix } = useGameState();
  const { t } = useTranslation();
  const isInterview = mode === 'interview';
  const caseProgress = mode === 'campaign' ? progress[caseData.id] : undefined;
  const initialPhase: Phase = caseProgress?.fixFound
    ? 'complete'
    : caseProgress?.rootCauseFound
    ? 'fix'
    : 'rootCause';

  const [phase, setPhase] = useState<Phase>(initialPhase);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ correct: boolean; text: string } | null>(null);
  const [eliminated, setEliminated] = useState<Set<string>>(new Set());
  const [drillAttempts, setDrillAttempts] = useState({ rootCause: 0, fix: 0 });

  const currentDiagnosis = phase === 'rootCause' ? caseData.diagnosis.rootCause : caseData.diagnosis.fix;
  const attempts =
    mode === 'campaign'
      ? phase === 'rootCause'
        ? caseProgress?.rootCauseAttempts ?? 0
        : caseProgress?.fixAttempts ?? 0
      : phase === 'rootCause'
      ? drillAttempts.rootCause
      : drillAttempts.fix;

  function handleSubmit() {
    if (!selected) return;
    const result = checkAnswer(currentDiagnosis.options, selected);
    setFeedback({ correct: result.correct, text: result.feedback });

    if (isInterview) {
      onAnswer?.(phase === 'rootCause' ? 'rootCause' : 'fix', result.correct);
      return;
    }

    if (!result.correct) {
      setEliminated((prev) => new Set(prev).add(selected));
    }

    if (mode === 'campaign') {
      if (phase === 'rootCause') {
        submitRootCause(caseData.id, result.correct);
      } else if (phase === 'fix') {
        submitFix(caseData.id, result.correct);
      }
    } else {
      setDrillAttempts((prev) => ({
        ...prev,
        [phase === 'rootCause' ? 'rootCause' : 'fix']: prev[phase === 'rootCause' ? 'rootCause' : 'fix'] + 1,
      }));
    }
  }

  function handleNext() {
    if (isInterview) {
      // Interview mode: single attempt per question, always advance forward.
      if (phase === 'rootCause') {
        setPhase('fix');
        setSelected(null);
        setFeedback(null);
      } else {
        setPhase('complete');
        onCaseComplete();
      }
      return;
    }

    if (phase === 'rootCause' && feedback?.correct) {
      setPhase('fix');
      setSelected(null);
      setFeedback(null);
      setEliminated(new Set());
    } else if (phase === 'fix' && feedback?.correct) {
      setPhase('complete');
      if (mode === 'drill') {
        onDrillComplete?.({
          rootCauseAttempts: drillAttempts.rootCause,
          fixAttempts: drillAttempts.fix,
        });
      }
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
          <p className="text-xs font-mono text-white/45 uppercase tracking-widest">
            {phase === 'rootCause' ? t('diagnosis.diagnose') : t('diagnosis.prescribe')}
          </p>
          <h3 className="text-base font-medium text-white/90">{currentDiagnosis.question}</h3>
        </div>
        <span className="text-xs font-mono text-white/45 ml-auto">
          {isInterview ? t('diagnosis.oneAttempt') : `${t('diagnosis.attempt')} ${attempts + 1}`}
        </span>
      </div>

      <div className="space-y-2">
        {currentDiagnosis.options.map((opt: DiagnosisOption) => {
          const isSelected = selected === opt.id;
          const isEliminated = eliminated.has(opt.id);
          const showCorrect = feedback?.correct && isSelected;
          const showWrong = feedback && isSelected && !opt.correct;

          return (
            <motion.button
              key={opt.id}
              whileHover={!feedback && !isEliminated ? { x: 4 } : undefined}
              onClick={() => !feedback && !isEliminated && setSelected(opt.id)}
              disabled={!!feedback || isEliminated}
              className={`w-full text-left p-3 rounded-lg border transition-all duration-200 text-sm cursor-pointer ${
                showCorrect
                  ? 'border-status-healthy/50 bg-status-healthy/8 text-white node-glow-healthy'
                  : showWrong
                  ? 'border-status-failed/50 bg-status-failed/8 text-white node-glow-failed'
                  : isEliminated
                  ? 'border-noir-600/40 text-white/30 opacity-40 line-through'
                  : isSelected
                  ? 'border-amber-500/40 bg-amber-500/8 text-white neon-border'
                  : 'border-noir-600/40 text-white/50 hover:border-noir-500/50 hover:text-white/70 hover:bg-noir-700/30'
              }`}
            >
              <span className="font-mono text-xs text-white/45 mr-2">
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
            <p className="text-white/70 text-sm leading-relaxed">{feedback.text}</p>
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
            {isInterview || feedback.correct
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
