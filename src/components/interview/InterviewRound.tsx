import { useEffect, useRef, useState } from 'react';
import { useCase } from '../../hooks/useCase';
import { useInterviewSession } from '../../hooks/useInterviewSession';
import { useTranslation } from '../../i18n';
import { SystemDiagram } from '../game/SystemDiagram';
import { CaseBrief } from '../game/CaseBrief';
import { DiagnosisPanel } from '../game/DiagnosisPanel';
import { NodeInspector } from '../game/NodeInspector';
import type { DiagramNode } from '../../types/case';
import { ROUND_DURATION_SECONDS } from '../../utils/interviewScore';

export function InterviewRound() {
  const { t } = useTranslation();
  const { caseIds, roundIndex, roundStartedAt, recordAnswer, finishRound } = useInterviewSession();
  const { caseData, loading } = useCase(caseIds[roundIndex]);
  const [inspectedNode, setInspectedNode] = useState<DiagramNode | null>(null);
  const [mobileTab, setMobileTab] = useState<'file' | 'diagram'>('file');
  const [, forceTick] = useState(0);
  const timedOutRef = useRef(false);

  useEffect(() => {
    timedOutRef.current = false;
  }, [roundStartedAt]);

  useEffect(() => {
    const interval = setInterval(() => forceTick((n) => n + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const elapsed = roundStartedAt ? Math.floor((Date.now() - roundStartedAt) / 1000) : 0;
  const remaining = Math.max(0, ROUND_DURATION_SECONDS - elapsed);

  useEffect(() => {
    if (remaining === 0 && !timedOutRef.current) {
      timedOutRef.current = true;
      finishRound();
    }
  }, [remaining, finishRound]);

  if (loading || !caseData) return null;

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');
  const urgent = remaining <= 30;
  const inspectableCount = caseData.diagram.nodes.filter((n) => n.inspectable).length;

  return (
    <div className="h-full flex flex-col">
      {/* Round header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-noir-600/40 shrink-0 bg-noir-900/60">
        <span className="text-xs font-mono text-amber-400/80 uppercase tracking-widest">
          {t('interview.round.label')} {roundIndex + 1} {t('interview.round.of')} {caseIds.length}
        </span>
        <span className={`text-sm font-mono tabular-nums ${urgent ? 'text-status-failed animate-pulse' : 'text-white/70'}`}>
          {mm}:{ss}
        </span>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Mobile tabs */}
        <div className="lg:hidden flex border-b border-noir-600/50 shrink-0">
          <button
            onClick={() => setMobileTab('file')}
            className={`flex-1 min-h-11 text-xs font-mono uppercase tracking-widest transition-colors border-b-2 ${
              mobileTab === 'file' ? 'text-amber-400 border-amber-400' : 'text-white/45 border-transparent'
            }`}
          >
            {t('case.tabFile')}
          </button>
          <button
            onClick={() => setMobileTab('diagram')}
            className={`flex-1 min-h-11 text-xs font-mono uppercase tracking-widest transition-colors border-b-2 flex items-center justify-center gap-2 ${
              mobileTab === 'diagram' ? 'text-cyan-400 border-cyan-400' : 'text-white/45 border-transparent'
            }`}
          >
            {t('case.tabDiagram')}
            {inspectableCount > 0 && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 normal-case tracking-normal">
                {inspectableCount} {t('case.tabDiagramBadge')}
              </span>
            )}
          </button>
        </div>

        <div className={`flex-1 min-h-[300px] ${mobileTab === 'diagram' ? '' : 'max-lg:hidden'}`}>
          <SystemDiagram caseData={caseData} onNodeClick={setInspectedNode} />
        </div>

        <div
          className={`lg:w-[400px] border-l border-navy-700 overflow-y-auto p-4 space-y-4 bg-navy-900/50 ${
            mobileTab === 'file' ? '' : 'max-lg:hidden'
          }`}
        >
          <CaseBrief caseData={caseData} />
          <DiagnosisPanel
            key={caseData.id}
            caseData={caseData}
            mode="interview"
            onAnswer={recordAnswer}
            onCaseComplete={finishRound}
          />
        </div>

        <NodeInspector node={inspectedNode} onClose={() => setInspectedNode(null)} />
      </div>
    </div>
  );
}
