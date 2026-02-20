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

  return (
    <aside className="w-72 bg-noir-800/60 border-l border-noir-600/30 flex flex-col shrink-0 max-lg:hidden backdrop-blur-sm">
      <div className="flex items-center justify-between p-4 border-b border-noir-600/30">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          <h2 className="text-[11px] font-mono text-cyan-400 uppercase tracking-widest">{t('guide.title')}</h2>
        </div>
        <button onClick={toggleGuide} className="text-white/20 hover:text-white/50 transition-colors">&times;</button>
      </div>

      {concept ? (
        <div className="p-4 overflow-y-auto space-y-4">
          <div>
            <h3 className="font-display text-lg text-white tracking-wide">{concept.title}</h3>
            <p className="text-xs text-white/30 mt-1">{concept.summary}</p>
          </div>

          <div className="space-y-3">
            {concept.explanation.map((para, i) => (
              <p key={i} className="text-xs text-white/45 leading-relaxed">{para}</p>
            ))}
          </div>

          <div>
            <p className="text-[10px] font-mono text-amber-500/60 uppercase tracking-widest mb-2">{t('guide.keyTerms')}</p>
            <div className="space-y-2">
              {concept.keyTerms.map((kt) => (
                <div key={kt.term} className="bg-noir-950/60 rounded-lg p-3 border border-noir-700/30">
                  <p className="text-[11px] font-mono text-amber-400/80 mb-0.5">{kt.term}</p>
                  <p className="text-[11px] text-white/30">{kt.definition}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 text-center text-white/20 text-xs font-mono mt-8">
          <p>{t('guide.placeholder1')}</p>
          <p>{t('guide.placeholder2')}</p>
        </div>
      )}
    </aside>
  );
}
