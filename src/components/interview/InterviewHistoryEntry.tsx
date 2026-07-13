import { useState } from 'react';
import type { InterviewSession } from '../../types/interview';
import type { InterviewVerdict } from '../../utils/interviewScore';
import { useTranslation } from '../../i18n';

interface InterviewHistoryEntryProps {
  session: InterviewSession;
  trackLabel: string;
  verdict: InterviewVerdict;
}

const verdictColor: Record<InterviewVerdict, string> = {
  strongHire: 'text-status-healthy',
  hire: 'text-status-healthy',
  leanHire: 'text-status-degraded',
  keepTraining: 'text-status-failed',
};

export function InterviewHistoryEntry({ session, trackLabel, verdict }: InterviewHistoryEntryProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const rubricYes = session.postmortem.rubric.filter(Boolean).length;

  return (
    <div className="border border-noir-600/40 rounded-lg bg-noir-800/40">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between gap-3 p-3 text-left"
      >
        <div className="min-w-0">
          <p className="text-xs font-mono text-white/70 truncate">{trackLabel}</p>
          <p className="text-[10px] font-mono text-white/45 mt-0.5">
            {new Date(session.startedAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs font-mono text-white/70">
            {t('interview.setup.historyScore')} {session.score}/15
          </span>
          <span className={`text-xs font-mono ${verdictColor[verdict]}`}>
            {t(`interview.debrief.verdict.${verdict}`)}
          </span>
        </div>
      </button>

      {expanded && (
        <div className="px-3 pb-3 border-t border-noir-700/40 pt-3">
          <p className="text-xs font-mono text-amber-500/60 uppercase tracking-widest mb-1">
            {t('interview.debrief.yourPostmortem')}
          </p>
          <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">{session.postmortem.text}</p>
          <p className="text-xs font-mono text-white/45 mt-2">
            {t('interview.debrief.rubricSelfCheck')}: {rubricYes}/5
          </p>
        </div>
      )}
    </div>
  );
}
