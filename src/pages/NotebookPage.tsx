import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAllCases, useCase, useConcepts } from '../hooks/useCase';
import { useNotebook } from '../hooks/useNotebook';
import { useTranslation } from '../i18n';
import { Button } from '../components/common/Button';
import { checkAnswer } from '../engine/validator';
import { isDue, termCardId } from '../utils/reviewScheduler';
import { getUtcDateString } from '../data/dailyDrill';
import type { NotebookCard, QuestionCardRef, TermCardRef } from '../types/notebook';

function QuestionReviewCard({ card, onGrade }: { card: NotebookCard; onGrade: (correct: boolean) => void }) {
  const { t } = useTranslation();
  const ref = card.ref as QuestionCardRef;
  const { caseData, loading } = useCase(ref.caseId);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ correct: boolean; text: string } | null>(null);

  useEffect(() => {
    setSelected(null);
    setFeedback(null);
  }, [card.id]);

  if (loading || !caseData) return null;

  const diagnosis = ref.phase === 'rootCause' ? caseData.diagnosis.rootCause : caseData.diagnosis.fix;

  function handleSubmit() {
    if (!selected || !caseData) return;
    const result = checkAnswer(diagnosis.options, selected);
    setFeedback({ correct: result.correct, text: result.feedback });
  }

  return (
    <div className="bg-noir-800/60 border border-noir-600/40 rounded-xl p-5 backdrop-blur-sm">
      <p className="text-xs font-mono text-white/45 uppercase tracking-widest mb-2">
        {String(caseData.number).padStart(2, '0')} — {caseData.title} ·{' '}
        {ref.phase === 'rootCause' ? t('diagnosis.diagnose') : t('diagnosis.prescribe')}
      </p>
      <h3 className="text-base font-medium text-white/90 mb-4">{diagnosis.question}</h3>

      <div className="space-y-2">
        {diagnosis.options.map((opt) => {
          const isSelected = selected === opt.id;
          const showCorrect = feedback?.correct && isSelected;
          const showWrong = feedback && isSelected && !opt.correct;
          return (
            <button
              key={opt.id}
              onClick={() => !feedback && setSelected(opt.id)}
              disabled={!!feedback}
              className={`w-full text-left p-3 rounded-lg border transition-all duration-200 text-sm cursor-pointer ${
                showCorrect
                  ? 'border-status-healthy/50 bg-status-healthy/8 text-white'
                  : showWrong
                  ? 'border-status-failed/50 bg-status-failed/8 text-white'
                  : isSelected
                  ? 'border-amber-500/40 bg-amber-500/8 text-white'
                  : 'border-noir-600/40 text-white/50 hover:border-noir-500/50 hover:text-white/70'
              }`}
            >
              {opt.text}
            </button>
          );
        })}
      </div>

      {feedback && (
        <p
          className={`mt-4 text-sm p-3 rounded-lg ${
            feedback.correct
              ? 'bg-status-healthy/8 border border-status-healthy/20 text-status-healthy'
              : 'bg-status-failed/8 border border-status-failed/20 text-status-failed'
          }`}
        >
          {feedback.text}
        </p>
      )}

      <div className="mt-4 flex justify-end">
        {!feedback ? (
          <Button onClick={handleSubmit} disabled={!selected}>
            {t('diagnosis.submit')}
          </Button>
        ) : (
          <Button onClick={() => onGrade(feedback.correct)}>{t('notebook.nextCard')}</Button>
        )}
      </div>
    </div>
  );
}

function TermReviewCard({ card, onGrade }: { card: NotebookCard; onGrade: (correct: boolean) => void }) {
  const { t } = useTranslation();
  const ref = card.ref as TermCardRef;
  const concepts = useConcepts();
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    setRevealed(false);
  }, [card.id]);

  const concept = concepts.find((c) => c.id === ref.conceptId);
  const term = concept?.keyTerms[ref.termIndex];
  if (!concept || !term) return null;

  return (
    <div className="bg-noir-800/60 border border-noir-600/40 rounded-xl p-5 backdrop-blur-sm text-center">
      <p className="text-xs font-mono text-white/45 uppercase tracking-widest mb-2">{concept.title}</p>
      <h3 className="font-display text-2xl text-white tracking-wide mb-4">{term.term}</h3>

      {revealed ? (
        <>
          <p className="text-sm text-white/70 leading-relaxed mb-6">{term.definition}</p>
          <div className="flex justify-center gap-3">
            <Button variant="secondary" onClick={() => onGrade(false)}>
              {t('notebook.forgot')}
            </Button>
            <Button onClick={() => onGrade(true)}>{t('notebook.gotIt')}</Button>
          </div>
        </>
      ) : (
        <Button onClick={() => setRevealed(true)}>{t('notebook.reveal')}</Button>
      )}
    </div>
  );
}

export function NotebookPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const allCases = useAllCases();
  const concepts = useConcepts();
  const cards = useNotebook((s) => s.cards);
  const gradeCard = useNotebook((s) => s.gradeCard);
  const pruneDangling = useNotebook((s) => s.pruneDangling);

  useEffect(() => {
    const validCaseIds = new Set(allCases.map((c) => c.id));
    const validTermCardIds = new Set(
      concepts.flatMap((c) => c.keyTerms.map((_, i) => termCardId(c.id, i))),
    );
    pruneDangling(validCaseIds, validTermCardIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allCases.length, concepts.length]);

  const today = getUtcDateString();
  const dueCards = useMemo(() => cards.filter((c) => !c.retired && isDue(c.dueDate, today)), [cards, today]);
  const retiredCount = cards.filter((c) => c.retired).length;

  const [sessionQueue, setSessionQueue] = useState<NotebookCard[] | null>(null);

  function startSession() {
    setSessionQueue(dueCards);
  }

  function handleGrade(correct: boolean) {
    if (!sessionQueue || sessionQueue.length === 0) return;
    const [current, ...rest] = sessionQueue;
    gradeCard(current.id, correct);
    setSessionQueue(rest);
  }

  if (sessionQueue !== null) {
    const current = sessionQueue[0];
    if (!current) {
      return (
        <div className="h-full overflow-y-auto flex items-center justify-center">
          <div className="text-center px-6">
            <p className="font-display text-2xl text-white tracking-wide mb-4">{t('notebook.sessionDone')}</p>
            <Button onClick={() => setSessionQueue(null)}>{t('notebook.backToNotebook')}</Button>
          </div>
        </div>
      );
    }
    return (
      <div className="h-full overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-10">
          <p className="text-xs font-mono text-amber-500/70 uppercase tracking-widest mb-4">
            {sessionQueue.length} {t('notebook.cardsLeft')}
          </p>
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {current.type === 'question' ? (
                <QuestionReviewCard card={current} onGrade={handleGrade} />
              ) : (
                <TermReviewCard card={current} onGrade={handleGrade} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <p className="text-xs font-mono text-amber-500/70 uppercase tracking-widest">{t('notebook.eyebrow')}</p>
        <h1 className="font-display text-4xl text-white tracking-wide mt-1">{t('notebook.title')}</h1>
        <p className="text-sm text-white/70 mt-3 leading-relaxed max-w-lg">{t('notebook.subtitle')}</p>

        <div className="mt-8 flex items-center gap-8 text-xs font-mono">
          <div className="text-center">
            <p className="text-amber-400 text-lg font-display">{dueCards.length}</p>
            <p className="text-white/45">{t('notebook.due')}</p>
          </div>
          <div className="text-center">
            <p className="text-white/80 text-lg font-display">{cards.length}</p>
            <p className="text-white/45">{t('notebook.total')}</p>
          </div>
          <div className="text-center">
            <p className="text-cyan-400 text-lg font-display">{retiredCount}</p>
            <p className="text-white/45">{t('notebook.retired')}</p>
          </div>
        </div>

        {cards.length === 0 ? (
          <p className="text-sm text-white/60 mt-8">{t('notebook.emptyNew')}</p>
        ) : dueCards.length === 0 ? (
          <p className="text-sm text-white/60 mt-8">{t('notebook.emptyNoneDue')}</p>
        ) : (
          <Button onClick={startSession} className="mt-8">
            {t('notebook.startReview')}
          </Button>
        )}

        <button
          onClick={() => navigate('/')}
          className="block mt-8 text-xs font-mono text-noir-300 hover:text-amber-400 transition-colors"
        >
          {t('success.caseBoard')}
        </button>
      </div>
    </div>
  );
}
