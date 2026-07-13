import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useCase, useConcepts } from '../../hooks/useCase';
import { useGameState } from '../../hooks/useGameState';
import { useNotebook } from '../../hooks/useNotebook';
import { termCardId } from '../../utils/reviewScheduler';
import { useTranslation } from '../../i18n';
import type { Concept } from '../../types/game';

export function GuidePanel() {
  const { caseId } = useParams();
  const { caseData } = useCase(caseId);
  const { toggleGuide } = useGameState();
  const { t } = useTranslation();
  const concepts = useConcepts();
  const captureConceptTerm = useNotebook((s) => s.captureConceptTerm);
  const notebookCards = useNotebook((s) => s.cards);
  const bookmarkedIds = new Set(notebookCards.map((c) => c.id));

  const concept = caseData
    ? (concepts as Concept[]).find((c) => c.id === caseData.conceptId)
    : null;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') toggleGuide();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggleGuide]);

  return (
    <aside
      role="dialog"
      aria-modal="true"
      aria-label={t('guide.title')}
      className="lg:static lg:w-72 lg:shrink-0 max-lg:fixed max-lg:inset-0 max-lg:z-50 max-lg:w-full bg-noir-800/60 max-lg:bg-noir-950/95 border-l border-noir-600/30 flex flex-col backdrop-blur-sm"
    >
      <div className="flex items-center justify-between p-4 border-b border-noir-600/30">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          <h2 className="text-xs font-mono text-cyan-400 uppercase tracking-widest">{t('guide.title')}</h2>
        </div>
        <button
          onClick={toggleGuide}
          aria-label={t('guide.close')}
          className="text-white/40 hover:text-white/70 transition-colors w-11 h-11 flex items-center justify-center -mr-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 rounded"
        >
          &times;
        </button>
      </div>

      {concept ? (
        <div className="p-4 overflow-y-auto space-y-4">
          <div>
            <h3 className="font-display text-lg text-white tracking-wide">{concept.title}</h3>
            <p className="text-sm text-white/70 mt-1 leading-relaxed">{concept.summary}</p>
          </div>

          <div className="space-y-3">
            {concept.explanation.map((para, i) => (
              <p key={i} className="text-sm text-white/75 leading-relaxed">{para}</p>
            ))}
          </div>

          <div>
            <p className="text-xs font-mono text-amber-500/60 uppercase tracking-widest mb-2">{t('guide.keyTerms')}</p>
            <div className="space-y-2">
              {concept.keyTerms.map((kt, i) => {
                const id = termCardId(concept.id, i);
                const bookmarked = bookmarkedIds.has(id);
                return (
                  <div key={kt.term} className="bg-noir-950/60 rounded-lg p-3 border border-noir-700/30">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-mono text-amber-400/80 mb-0.5">{kt.term}</p>
                      <button
                        onClick={() => captureConceptTerm(concept.id, i)}
                        disabled={bookmarked}
                        aria-label={bookmarked ? t('notebook.added') : t('notebook.addBookmark')}
                        className="shrink-0 text-white/30 hover:text-amber-400 disabled:text-amber-400/70 disabled:hover:text-amber-400/70 transition-colors text-xs"
                      >
                        {bookmarked ? '★' : '☆'}
                      </button>
                    </div>
                    <p className="text-xs text-white/60">{kt.definition}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 text-center text-white/60 text-sm font-mono mt-8">
          <p>{t('guide.placeholder1')}</p>
          <p>{t('guide.placeholder2')}</p>
        </div>
      )}
    </aside>
  );
}
