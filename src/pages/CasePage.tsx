import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCase } from '../hooks/useCase';
import { useGameState } from '../hooks/useGameState';
import { useTranslation } from '../i18n';
import { SystemDiagram } from '../components/game/SystemDiagram';
import { CaseBrief } from '../components/game/CaseBrief';
import { DiagnosisPanel } from '../components/game/DiagnosisPanel';
import { NodeInspector } from '../components/game/NodeInspector';
import { CaseSuccess } from '../components/game/CaseSuccess';
import { TutorialOverlay } from '../components/game/TutorialOverlay';
import type { DiagramNode } from '../types/case';

export function CasePage() {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const caseData = useCase(caseId);
  const { progress, isCaseUnlocked, setCurrentCase, tutorialSeen, dismissTutorial } = useGameState();
  const { t } = useTranslation();
  const [inspectedNode, setInspectedNode] = useState<DiagramNode | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [mobileTab, setMobileTab] = useState<'file' | 'diagram'>('file');
  const [tutorialStep, setTutorialStep] = useState(1);

  useEffect(() => {
    if (caseData) setCurrentCase(caseData.id);
  }, [caseData, setCurrentCase]);

  const showTutorial =
    !tutorialSeen && caseId === 'case-01' && Object.keys(progress).length === 0;

  if (!caseData) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <p>{t('case.notFound')}</p>
      </div>
    );
  }

  if (!isCaseUnlocked(caseData.number)) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
        <span className="text-4xl">🔒</span>
        <p>{t('case.locked')}</p>
        <button onClick={() => navigate('/')} className="text-amber-400 text-sm hover:underline">
          {t('case.backToBoard')}
        </button>
      </div>
    );
  }

  const isComplete = progress[caseData.id]?.completed || showSuccess;
  const inspectableCount = caseData.diagram.nodes.filter((n) => n.inspectable).length;

  return (
    <div className="h-full flex flex-col lg:flex-row">
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

      {/* Diagram area */}
      <div className={`flex-1 min-h-[300px] ${mobileTab === 'diagram' ? '' : 'max-lg:hidden'}`}>
        <SystemDiagram caseData={caseData} onNodeClick={setInspectedNode} />
      </div>

      {/* Right panel */}
      <div className={`lg:w-[400px] border-l border-navy-700 overflow-y-auto p-4 space-y-4 bg-navy-900/50 ${mobileTab === 'file' ? '' : 'max-lg:hidden'}`}>
        <CaseBrief caseData={caseData} />

        {isComplete ? (
          <CaseSuccess caseData={caseData} />
        ) : (
          <DiagnosisPanel caseData={caseData} onCaseComplete={() => setShowSuccess(true)} />
        )}
      </div>

      {/* Node Inspector Modal */}
      <NodeInspector node={inspectedNode} onClose={() => setInspectedNode(null)} />

      {showTutorial && (
        <TutorialOverlay
          step={tutorialStep}
          onNext={() => {
            if (tutorialStep < 3) setTutorialStep((s) => s + 1);
            else dismissTutorial();
          }}
          onSkip={dismissTutorial}
        />
      )}
    </div>
  );
}
