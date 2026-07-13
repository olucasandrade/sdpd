import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCase, useConcepts } from '../hooks/useCase';
import { useTranslation } from '../i18n';
import { useDailyDrill } from '../hooks/useDailyDrill';
import { useGameState } from '../hooks/useGameState';
import { SystemDiagram } from '../components/game/SystemDiagram';
import { CaseBrief } from '../components/game/CaseBrief';
import { DiagnosisPanel } from '../components/game/DiagnosisPanel';
import { NodeInspector } from '../components/game/NodeInspector';
import { Button } from '../components/common/Button';
import { msUntilNextUtcMidnight } from '../data/dailyDrill';
import { buildShareText, copyToClipboard } from '../utils/drillShare';
import type { DiagramNode } from '../types/case';

function formatMmSs(totalSeconds: number): string {
  const mm = Math.floor(totalSeconds / 60);
  const ss = totalSeconds % 60;
  return `${mm}:${String(ss).padStart(2, '0')}`;
}

function formatCountdown(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hh = Math.floor(totalSeconds / 3600);
  const mm = Math.floor((totalSeconds % 3600) / 60);
  const ss = totalSeconds % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}

function useCountdownToNextDrill(): string {
  const [remaining, setRemaining] = useState(() => msUntilNextUtcMidnight());
  useEffect(() => {
    const id = window.setInterval(() => setRemaining(msUntilNextUtcMidnight()), 1000);
    return () => window.clearInterval(id);
  }, []);
  return formatCountdown(remaining);
}

function StarRow({ count }: { count: number }) {
  return (
    <span aria-hidden="true">
      {'⭐️'.repeat(count)}
      {'☆'.repeat(Math.max(0, 3 - count))}
    </span>
  );
}

export function DailyDrillPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toggleGuide, guideOpen } = useGameState();
  const drill = useDailyDrill();
  const caseData = useCase(drill.caseId);
  const concepts = useConcepts();
  const [inspectedNode, setInspectedNode] = useState<DiagramNode | null>(null);
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied' | 'failed'>('idle');
  const countdown = useCountdownToNextDrill();

  if (!caseData) {
    return (
      <div className="flex items-center justify-center h-full text-white/45">
        <p>{t('daily.caseNotFound')}</p>
      </div>
    );
  }

  const concept = concepts.find((c) => c.id === caseData.conceptId) ?? null;

  const handleReviewConcept = () => {
    navigate(`/case/${caseData.id}`);
    if (!guideOpen) toggleGuide();
  };

  const handleShare = async () => {
    const entry = drill.todayEntry;
    if (!entry) return;
    const text = buildShareText({
      drillNumber: drill.drillNumber,
      rootCauseStars: entry.rootCauseStars,
      fixStars: entry.fixStars,
      seconds: entry.seconds,
      streak: drill.drillState.streak,
      url: `${window.location.origin}/daily`,
    });
    const ok = await copyToClipboard(text);
    setShareStatus(ok ? 'copied' : 'failed');
  };

  if (drill.phase === 'pre') {
    return (
      <div className="h-full overflow-y-auto flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-noir-800/60 border border-amber-500/20 rounded-xl p-6 text-center backdrop-blur-sm neon-border">
          <p className="text-xs font-mono text-amber-500/80 uppercase tracking-widest mb-1">{t('daily.pageLabel')}</p>
          <h1 className="font-display text-3xl text-white tracking-wide mb-4">
            {t('daily.drillHash')}{drill.drillNumber}
          </h1>

          <div className="flex justify-center gap-6 my-4 text-xs font-mono text-white/45">
            <div>
              {t('daily.streakLabel')} <span className="text-amber-300 text-sm">🔥 {drill.drillState.streak}</span>
            </div>
            <div>
              {t('daily.bestStreakLabel')} <span className="text-white/70 text-sm">{drill.drillState.bestStreak}</span>
            </div>
          </div>

          <div className="bg-noir-950/60 border border-noir-700/30 rounded-lg p-4 text-left mb-5">
            <p className="text-xs font-mono text-cyan-400/60 uppercase tracking-widest mb-2">{t('daily.rulesTitle')}</p>
            <ul className="space-y-1.5 text-sm text-white/70">
              <li>&gt; {t('daily.rule1')}</li>
              <li>&gt; {t('daily.rule2')}</li>
              <li>&gt; {t('daily.rule3')}</li>
            </ul>
          </div>

          <Button onClick={drill.start} className="w-full">
            {t('daily.startButton')}
          </Button>
        </div>
      </div>
    );
  }

  if (drill.phase === 'complete') {
    const entry = drill.todayEntry;
    return (
      <div className="h-full overflow-y-auto flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-noir-800/60 border border-amber-500/20 rounded-xl p-6 text-center backdrop-blur-sm neon-border">
          <p className="text-xs font-mono text-amber-500/80 uppercase tracking-widest mb-1">
            {t('daily.drillHash')}{drill.drillNumber}
          </p>
          <h1 className="font-display text-2xl text-amber-400 tracking-wide mb-4">{t('daily.resultTitle')}</h1>

          {entry && (
            <div className="space-y-2 mb-5">
              <p className="text-sm text-white/70">
                {t('daily.diagnosisStars')} <StarRow count={entry.rootCauseStars} />
              </p>
              <p className="text-sm text-white/70">
                {t('daily.fixStars')} <StarRow count={entry.fixStars} />
              </p>
              <p className="text-xs font-mono text-white/45 mt-2">
                {t('daily.timerLabel')} {formatMmSs(entry.seconds)} · 🔥 {drill.drillState.streak}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-2 mb-5">
            <Button onClick={handleShare}>{t('daily.shareButton')}</Button>
            {shareStatus === 'copied' && (
              <p className="text-xs font-mono text-status-healthy">{t('daily.shareCopied')}</p>
            )}
            {shareStatus === 'failed' && (
              <p className="text-xs font-mono text-status-failed">{t('daily.shareFailed')}</p>
            )}
          </div>

          {concept && (
            <button
              onClick={handleReviewConcept}
              className="text-xs font-mono text-cyan-400/80 hover:text-cyan-400 underline underline-offset-2 mb-5 block mx-auto"
            >
              {t('daily.reviewConcept')}: {concept.title}
            </button>
          )}

          <p className="text-xs font-mono text-white/45">
            {t('daily.nextDrillIn')} {countdown}
          </p>

          <button onClick={() => navigate('/')} className="text-amber-400 text-sm hover:underline mt-4">
            {t('daily.backToBoard')}
          </button>
        </div>
      </div>
    );
  }

  // phase === 'playing'
  return (
    <div className="h-full flex flex-col">
      <div className="shrink-0 flex items-center justify-between px-4 py-2 border-b border-noir-600/50 bg-noir-900/60">
        <span className="text-xs font-mono text-amber-500/80 uppercase tracking-widest">
          {t('daily.drillHash')}{drill.drillNumber}
        </span>
        <span className="text-sm font-mono text-white/80">
          {t('daily.timerLabel')} {formatMmSs(drill.elapsedSeconds)}
        </span>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className="flex-1 min-h-[300px]">
          <SystemDiagram caseData={caseData} onNodeClick={setInspectedNode} />
        </div>

        <div className="lg:w-[400px] border-l border-navy-700 overflow-y-auto p-4 space-y-4 bg-navy-900/50">
          <CaseBrief caseData={caseData} />
          <DiagnosisPanel
            caseData={caseData}
            mode="drill"
            onCaseComplete={() => {}}
            onDrillComplete={drill.complete}
          />
        </div>
      </div>

      <NodeInspector node={inspectedNode} onClose={() => setInspectedNode(null)} />
    </div>
  );
}
