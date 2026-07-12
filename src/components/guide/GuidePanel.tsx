import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useCase, useConcepts } from '../../hooks/useCase';
import { useGameState } from '../../hooks/useGameState';
import { useTranslation } from '../../i18n';
import type { Concept } from '../../types/game';

export function GuidePanel() {
  const { caseId } = useParams();
  const caseData = useCase(caseId);
  const { toggleGuide } = useGameState();
  const { t } = useTranslation();
  const concepts = useConcepts();

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
        <button onClick={toggleGuide} className="text-white/40 hover:text-white/70 transition-colors w-11 h-11 flex items-center justify-center -mr-2">&times;</button>
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
              {concept.keyTerms.map((kt) => (
                <div key={kt.term} className="bg-noir-950/60 rounded-lg p-3 border border-noir-700/30">
                  <p className="text-xs font-mono text-amber-400/80 mb-0.5">{kt.term}</p>
                  <p className="text-xs text-white/60">{kt.definition}</p>
                </div>
              ))}
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
