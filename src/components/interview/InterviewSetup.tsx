import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAllCases } from '../../hooks/useCase';
import { useGameState } from '../../hooks/useGameState';
import { useInterviewSession } from '../../hooks/useInterviewSession';
import { useTranslation } from '../../i18n';
import { Button } from '../common/Button';
import { FULL_SPECTRUM_TRACK, interviewTrackOptions, sampleInterviewCaseIds } from '../../utils/interviewSampling';
import { verdictForScore } from '../../utils/interviewScore';
import { InterviewHistoryEntry } from './InterviewHistoryEntry';

export function InterviewSetup() {
  const { t } = useTranslation();
  const cases = useAllCases();
  const { completedCases } = useGameState();
  const { sessions, beginSession } = useInterviewSession();
  const [track, setTrack] = useState<string>(FULL_SPECTRUM_TRACK);
  const [showHistory, setShowHistory] = useState(false);

  const trackOptions = interviewTrackOptions();

  function trackLabel(key: string): string {
    return key === FULL_SPECTRUM_TRACK ? t('interview.setup.trackFull') : t(`category.${key}`);
  }

  function handleStart() {
    const caseIds = sampleInterviewCaseIds(cases, track, 3);
    if (caseIds.length < 3) return;
    beginSession(track, caseIds);
  }

  const recentSessions = [...sessions].reverse();

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-mono text-amber-500/70 uppercase tracking-widest">
            {t('interview.setup.eyebrow')}
          </p>
          <h1 className="font-display text-4xl text-white tracking-wide mt-1">{t('interview.setup.title')}</h1>
          <p className="text-sm text-white/70 mt-3 leading-relaxed max-w-lg">{t('interview.setup.subtitle')}</p>

          {completedCases < 5 && (
            <p className="text-xs font-mono text-amber-400/70 mt-4 bg-amber-500/5 border border-amber-500/15 rounded-lg px-3 py-2 inline-block">
              {t('interview.setup.lowRepsWarning')}
            </p>
          )}

          <div className="mt-8 bg-noir-800/60 border border-noir-600/40 rounded-xl p-5 backdrop-blur-sm">
            <p className="text-xs font-mono text-white/45 uppercase tracking-widest mb-3">
              {t('interview.setup.trackLabel')}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {trackOptions.map((key) => {
                const active = track === key;
                return (
                  <button
                    key={key}
                    onClick={() => setTrack(key)}
                    className={`text-left p-2.5 rounded-lg border text-xs font-medium transition-all duration-200 ${
                      active
                        ? 'border-amber-500/40 bg-amber-500/8 text-white'
                        : 'border-noir-600/40 text-white/60 hover:border-noir-500/50 hover:text-white/80'
                    }`}
                  >
                    {trackLabel(key)}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 flex justify-end">
              <Button onClick={handleStart}>{t('interview.setup.start')}</Button>
            </div>
          </div>

          <p className="text-xs text-white/45 mt-4 leading-relaxed">{t('interview.setup.abandonNotice')}</p>

          <div className="mt-10">
            <button
              onClick={() => setShowHistory((v) => !v)}
              className="text-xs font-mono text-noir-300 hover:text-amber-400 transition-colors uppercase tracking-widest"
            >
              {t('interview.setup.historyTitle')} ({sessions.length})
            </button>

            {showHistory && (
              <div className="mt-3 space-y-2">
                {recentSessions.length === 0 ? (
                  <p className="text-xs text-white/45">{t('interview.setup.historyEmpty')}</p>
                ) : (
                  recentSessions.map((session) => (
                    <InterviewHistoryEntry
                      key={session.id}
                      session={session}
                      trackLabel={trackLabel(session.track)}
                      verdict={verdictForScore(session.score)}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
