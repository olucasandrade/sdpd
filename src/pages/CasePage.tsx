import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCase } from '../hooks/useCase';
import { useGameState } from '../hooks/useGameState';
import { useTranslation } from '../i18n';
import { SystemDiagram } from '../components/game/SystemDiagram';
import { CaseBrief } from '../components/game/CaseBrief';
import { DiagnosisPanel } from '../components/game/DiagnosisPanel';
import { NodeInspector } from '../components/game/NodeInspector';
import { CaseSuccess } from '../components/game/CaseSuccess';
import type { DiagramNode } from '../types/case';

export function CasePage() {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const caseData = useCase(caseId);
  const { progress, isCaseUnlocked } = useGameState();
  const { t } = useTranslation();
  const [inspectedNode, setInspectedNode] = useState<DiagramNode | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

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

  return (
    <div className="h-full flex flex-col lg:flex-row">
      {/* Diagram area */}
      <div className="flex-1 min-h-[300px]">
        <SystemDiagram caseData={caseData} onNodeClick={setInspectedNode} />
      </div>

      {/* Right panel */}
      <div className="lg:w-[400px] border-l border-navy-700 overflow-y-auto p-4 space-y-4 bg-navy-900/50">
        <CaseBrief caseData={caseData} />

        {isComplete ? (
          <CaseSuccess caseData={caseData} />
        ) : (
          <DiagnosisPanel caseData={caseData} onCaseComplete={() => setShowSuccess(true)} />
        )}
      </div>

      {/* Node Inspector Modal */}
      <NodeInspector node={inspectedNode} onClose={() => setInspectedNode(null)} />
    </div>
  );
}
