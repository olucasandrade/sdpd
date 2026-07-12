import { useMemo, useState } from 'react';
import { Button } from '../common/Button';
import { useInvestigationBoard } from '../../hooks/useInvestigationBoard';
import { useTranslation } from '../../i18n';

type WorkspaceHook = ReturnType<typeof useInvestigationBoard>;
type WorkspaceTab = 'evidence' | 'timeline' | 'contradictions';

interface InvestigationWorkspaceProps {
  board: WorkspaceHook;
}

const confidenceClasses: Record<string, string> = {
  low: 'text-status-failed',
  medium: 'text-status-degraded',
  high: 'text-status-healthy',
};

export function InvestigationWorkspace({ board }: InvestigationWorkspaceProps) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<WorkspaceTab>('evidence');
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventTime, setNewEventTime] = useState('');
  const [newEventConfidence, setNewEventConfidence] = useState<'low' | 'medium' | 'high'>('medium');
  const [newContradictionText, setNewContradictionText] = useState('');
  const [newContradictionEvidence, setNewContradictionEvidence] = useState('');

  const saveStatusText = useMemo(() => {
    if (board.saveStatus === 'saving') return t('investigation.status.saving');
    if (board.saveStatus === 'saved') return t('investigation.status.saved');
    if (board.saveStatus === 'error') {
      return board.saveErrorReason === 'quota'
        ? t('investigation.status.errorQuota')
        : t('investigation.status.error');
    }
    return t('investigation.status.idle');
  }, [board.saveErrorReason, board.saveStatus, t]);

  return (
    <div className="bg-noir-800/60 border border-noir-600/40 rounded-xl p-5 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <p className="text-[10px] font-mono text-cyan-400/70 uppercase tracking-widest">
            {t('investigation.workspace')}
          </p>
          <h3 className="text-base font-medium text-white/90">{t('investigation.title')}</h3>
        </div>
        <p className="text-[10px] font-mono text-white/40 uppercase tracking-wider">{saveStatusText}</p>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <button
          className={`px-2 py-2 rounded-md text-xs cursor-pointer border transition ${
            tab === 'evidence'
              ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300'
              : 'border-noir-600/40 text-white/50 hover:text-white/80'
          }`}
          onClick={() => setTab('evidence')}
        >
          {t('investigation.tab.evidence')}
        </button>
        <button
          className={`px-2 py-2 rounded-md text-xs cursor-pointer border transition ${
            tab === 'timeline'
              ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300'
              : 'border-noir-600/40 text-white/50 hover:text-white/80'
          }`}
          onClick={() => setTab('timeline')}
        >
          {t('investigation.tab.timeline')}
        </button>
        <button
          className={`px-2 py-2 rounded-md text-xs cursor-pointer border transition ${
            tab === 'contradictions'
              ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300'
              : 'border-noir-600/40 text-white/50 hover:text-white/80'
          }`}
          onClick={() => setTab('contradictions')}
        >
          {t('investigation.tab.contradictions')}
        </button>
      </div>

      <div className="mb-4 p-3 rounded-lg border border-amber-500/20 bg-amber-500/5">
        <p className="text-[10px] font-mono text-amber-400/70 uppercase tracking-widest mb-1">
          {t('investigation.lead.title')}
        </p>
        {board.state.unlock.unlockedFix ? (
          <p className="text-sm text-status-healthy">{t('investigation.lead.ready')}</p>
        ) : (
          <ul className="space-y-1">
            {board.state.unlock.pendingConditions.map((item) => (
              <li key={item} className="text-xs text-white/70">
                • {t(item)}
              </li>
            ))}
          </ul>
        )}
      </div>

      {tab === 'evidence' && (
        <div className="space-y-4">
          <div>
            <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-2">
              {t('investigation.available')}
            </p>
            <div className="space-y-2">
              {board.availableTemplates.length === 0 && (
                <p className="text-xs text-white/40">{t('investigation.available.empty')}</p>
              )}
              {board.availableTemplates.map((template) => (
                <div key={template.id} className="p-2 rounded border border-noir-600/40 bg-noir-900/40">
                  <p className="text-xs text-white/80">{template.title}</p>
                  <p className="text-[11px] text-white/40 mt-0.5">{template.detail}</p>
                  <div className="mt-2">
                    <Button onClick={() => board.collectEvidence(template.id)} className="!px-2 !py-1 !text-xs">
                      {t('investigation.collect')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-2">
              {t('investigation.locker')}
            </p>
            <div className="space-y-2">
              {board.state.evidence.length === 0 && (
                <p className="text-xs text-white/40">{t('investigation.locker.empty')}</p>
              )}
              {board.state.evidence.map((evidence) => {
                const linkedEventId =
                  board.state.timelineEvents.find((event) => event.evidenceIds.includes(evidence.id))?.id ?? '';
                return (
                  <div key={evidence.id} className="p-3 rounded border border-noir-600/40 bg-noir-900/40 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-white/90">{evidence.title}</p>
                      <span className="text-[10px] font-mono text-white/30 uppercase">
                        {evidence.sourceType}
                      </span>
                    </div>
                    <p className="text-[11px] text-white/45">{evidence.detail}</p>
                    <textarea
                      value={evidence.note}
                      onChange={(event) => board.updateEvidenceNote(evidence.id, event.target.value)}
                      placeholder={t('investigation.note.placeholder')}
                      className="w-full rounded border border-noir-600/50 bg-noir-950/80 text-xs text-white/70 px-2 py-1.5 min-h-16 resize-y outline-none focus:border-cyan-500/40"
                    />
                    <select
                      value={linkedEventId}
                      onChange={(event) => board.assignEvidenceToEvent(evidence.id, event.target.value || null)}
                      className="w-full rounded border border-noir-600/50 bg-noir-950/80 text-xs text-white/70 px-2 py-1.5 outline-none focus:border-cyan-500/40"
                    >
                      <option value="">{t('investigation.link.none')}</option>
                      {board.state.timelineEvents.map((timelineEvent) => (
                        <option key={timelineEvent.id} value={timelineEvent.id}>
                          {timelineEvent.title}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {tab === 'timeline' && (
        <div className="space-y-4">
          <div className="p-3 rounded border border-noir-600/40 bg-noir-900/40 space-y-2">
            <input
              value={newEventTitle}
              onChange={(event) => setNewEventTitle(event.target.value)}
              placeholder={t('investigation.timeline.titlePlaceholder')}
              className="w-full rounded border border-noir-600/50 bg-noir-950/80 text-xs text-white/70 px-2 py-1.5 outline-none focus:border-cyan-500/40"
            />
            <input
              value={newEventTime}
              onChange={(event) => setNewEventTime(event.target.value)}
              placeholder={t('investigation.timeline.timePlaceholder')}
              className="w-full rounded border border-noir-600/50 bg-noir-950/80 text-xs text-white/70 px-2 py-1.5 outline-none focus:border-cyan-500/40"
            />
            <select
              value={newEventConfidence}
              onChange={(event) => setNewEventConfidence(event.target.value as 'low' | 'medium' | 'high')}
              className="w-full rounded border border-noir-600/50 bg-noir-950/80 text-xs text-white/70 px-2 py-1.5 outline-none focus:border-cyan-500/40"
            >
              <option value="low">{t('investigation.confidence.low')}</option>
              <option value="medium">{t('investigation.confidence.medium')}</option>
              <option value="high">{t('investigation.confidence.high')}</option>
            </select>
            <Button
              onClick={() => {
                board.createTimelineEvent(newEventTitle, newEventTime, newEventConfidence);
                setNewEventTitle('');
                setNewEventTime('');
                setNewEventConfidence('medium');
              }}
              className="!px-3 !py-1.5 !text-xs"
            >
              {t('investigation.timeline.add')}
            </Button>
          </div>

          <div className="space-y-2">
            {board.state.timelineEvents.length === 0 && (
              <p className="text-xs text-white/40">{t('investigation.timeline.empty')}</p>
            )}
            {board.state.timelineEvents.map((timelineEvent) => (
              <div key={timelineEvent.id} className="p-3 rounded border border-noir-600/40 bg-noir-900/40 space-y-2">
                <input
                  value={timelineEvent.title}
                  onChange={(event) => board.updateTimelineEvent(timelineEvent.id, { title: event.target.value })}
                  className="w-full rounded border border-noir-600/50 bg-noir-950/80 text-xs text-white/70 px-2 py-1.5 outline-none focus:border-cyan-500/40"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    value={timelineEvent.timeLabel}
                    onChange={(event) => board.updateTimelineEvent(timelineEvent.id, { timeLabel: event.target.value })}
                    className="rounded border border-noir-600/50 bg-noir-950/80 text-xs text-white/70 px-2 py-1.5 outline-none focus:border-cyan-500/40"
                  />
                  <select
                    value={timelineEvent.confidence}
                    onChange={(event) =>
                      board.updateTimelineEvent(timelineEvent.id, {
                        confidence: event.target.value as 'low' | 'medium' | 'high',
                      })
                    }
                    className="rounded border border-noir-600/50 bg-noir-950/80 text-xs text-white/70 px-2 py-1.5 outline-none focus:border-cyan-500/40"
                  >
                    <option value="low">{t('investigation.confidence.low')}</option>
                    <option value="medium">{t('investigation.confidence.medium')}</option>
                    <option value="high">{t('investigation.confidence.high')}</option>
                  </select>
                </div>
                <textarea
                  value={timelineEvent.note}
                  onChange={(event) => board.updateTimelineEvent(timelineEvent.id, { note: event.target.value })}
                  placeholder={t('investigation.note.placeholder')}
                  className="w-full rounded border border-noir-600/50 bg-noir-950/80 text-xs text-white/70 px-2 py-1.5 min-h-14 resize-y outline-none focus:border-cyan-500/40"
                />
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] text-white/40">
                    {t('investigation.timeline.linked')}: {timelineEvent.evidenceIds.length}
                  </p>
                  <span className={`text-[11px] font-mono uppercase ${confidenceClasses[timelineEvent.confidence]}`}>
                    {timelineEvent.confidence}
                  </span>
                </div>
                <button
                  onClick={() => board.removeTimelineEvent(timelineEvent.id)}
                  className="text-xs text-status-failed/80 hover:text-status-failed transition cursor-pointer"
                >
                  {t('investigation.remove')}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'contradictions' && (
        <div className="space-y-4">
          <div className="p-3 rounded border border-noir-600/40 bg-noir-900/40 space-y-2">
            <textarea
              value={newContradictionText}
              onChange={(event) => setNewContradictionText(event.target.value)}
              placeholder={t('investigation.contradiction.placeholder')}
              className="w-full rounded border border-noir-600/50 bg-noir-950/80 text-xs text-white/70 px-2 py-1.5 min-h-16 resize-y outline-none focus:border-cyan-500/40"
            />
            <select
              value={newContradictionEvidence}
              onChange={(event) => setNewContradictionEvidence(event.target.value)}
              className="w-full rounded border border-noir-600/50 bg-noir-950/80 text-xs text-white/70 px-2 py-1.5 outline-none focus:border-cyan-500/40"
            >
              <option value="">{t('investigation.contradiction.noEvidence')}</option>
              {board.state.evidence.map((evidence) => (
                <option key={evidence.id} value={evidence.id}>
                  {evidence.title}
                </option>
              ))}
            </select>
            <Button
              onClick={() => {
                board.createContradiction(newContradictionText, newContradictionEvidence || undefined);
                setNewContradictionText('');
                setNewContradictionEvidence('');
              }}
              className="!px-3 !py-1.5 !text-xs"
            >
              {t('investigation.contradiction.add')}
            </Button>
          </div>

          <div className="space-y-2">
            {board.state.contradictions.length === 0 && (
              <p className="text-xs text-white/40">{t('investigation.contradiction.empty')}</p>
            )}
            {board.state.contradictions.map((contradiction) => (
              <div key={contradiction.id} className="p-3 rounded border border-noir-600/40 bg-noir-900/40">
                <p className="text-xs text-white/80">{contradiction.text}</p>
                {contradiction.evidenceIds.length > 0 && (
                  <p className="text-[11px] text-white/40 mt-1">
                    {t('investigation.contradiction.linkedEvidence')} {contradiction.evidenceIds.length}
                  </p>
                )}
                <div className="mt-2 flex items-center justify-between gap-2">
                  <button
                    onClick={() => board.toggleContradictionResolved(contradiction.id)}
                    className={`text-xs cursor-pointer transition ${
                      contradiction.resolved
                        ? 'text-status-healthy hover:text-status-healthy/80'
                        : 'text-status-degraded hover:text-status-degraded/80'
                    }`}
                  >
                    {contradiction.resolved
                      ? t('investigation.contradiction.markOpen')
                      : t('investigation.contradiction.markResolved')}
                  </button>
                  <button
                    onClick={() => board.removeContradiction(contradiction.id)}
                    className="text-xs text-status-failed/80 hover:text-status-failed transition cursor-pointer"
                  >
                    {t('investigation.remove')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
