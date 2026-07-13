import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAllCases, useConcepts } from '../../hooks/useCase';
import { useInterviewSession } from '../../hooks/useInterviewSession';
import { useTranslation } from '../../i18n';
import { Button } from '../common/Button';
import { FULL_SPECTRUM_TRACK } from '../../utils/interviewSampling';
import { roundScore, verdictForScore, type InterviewVerdict } from '../../utils/interviewScore';

const verdictClasses: Record<InterviewVerdict, string> = {
  strongHire: 'text-status-healthy border-status-healthy/40 bg-status-healthy/8 node-glow-healthy',
  hire: 'text-status-healthy border-status-healthy/40 bg-status-healthy/8',
  leanHire: 'text-status-degraded border-status-degraded/40 bg-status-degraded/8',
  keepTraining: 'text-status-failed border-status-failed/40 bg-status-failed/8 node-glow-failed',
};

export function InterviewDebrief() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { sessions, debriefSessionId, newSession } = useInterviewSession();
  const cases = useAllCases();
  const concepts = useConcepts();

  const session = sessions.find((s) => s.id === debriefSessionId);
  if (!session) return null;

  const verdict = verdictForScore(session.score);
  const trackLabel = session.track === FULL_SPECTRUM_TRACK ? t('interview.setup.trackFull') : t(`category.${session.track}`);
  const rubricYes = session.postmortem.rubric.filter(Boolean).length;

  const weakRounds = session.rounds.filter((r) => !r.rootCauseCorrect || !r.fixCorrect);
  const weakConcepts = weakRounds
    .map((r) => {
      const caseData = cases.find((c) => c.id === r.caseId);
      const concept = caseData ? concepts.find((c) => c.id === caseData.conceptId) : null;
      return caseData && concept ? { caseData, concept } : null;
    })
    .filter((entry): entry is { caseData: (typeof cases)[number]; concept: (typeof concepts)[number] } => entry !== null);

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <p className="text-xs font-mono text-white/45 uppercase tracking-widest">{trackLabel}</p>
          <h1 className="font-display text-3xl text-white tracking-wide mt-1">{t('interview.debrief.title')}</h1>

          <div
            className={`inline-block mt-6 px-6 py-3 rounded-lg border-2 -rotate-3 font-display text-2xl tracking-[0.15em] ${verdictClasses[verdict]}`}
          >
            {t(`interview.debrief.verdict.${verdict}`)}
          </div>

          <p className="text-sm text-white/70 mt-4">
            {t('interview.debrief.scoreLabel')}: <span className="text-white/90 font-medium">{session.score} / 15</span>
          </p>
        </motion.div>

        <div className="mt-8">
          <p className="text-xs font-mono text-white/45 uppercase tracking-widest mb-2">
            {t('interview.debrief.roundBreakdown')}
          </p>
          <div className="space-y-2">
            {session.rounds.map((round, i) => {
              const caseData = cases.find((c) => c.id === round.caseId);
              const mm = String(Math.floor(round.seconds / 60)).padStart(2, '0');
              const ss = String(round.seconds % 60).padStart(2, '0');
              return (
                <div key={round.caseId} className="bg-noir-800/60 border border-noir-600/40 rounded-lg p-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm text-white/80 truncate">
                      {t('interview.round.label')} {i + 1} — {caseData?.title ?? round.caseId}
                    </p>
                    <p className="text-xs font-mono text-white/45 mt-0.5">
                      {t('interview.debrief.rootCause')}: {round.rootCauseCorrect ? t('interview.debrief.correct') : t('interview.debrief.incorrect')} ·{' '}
                      {t('interview.debrief.fix')}: {round.fixCorrect ? t('interview.debrief.correct') : t('interview.debrief.incorrect')} · {mm}:{ss}
                    </p>
                  </div>
                  <span className="text-sm font-mono text-amber-400 shrink-0">{roundScore(round)} pts</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8 bg-noir-800/60 border border-noir-600/40 rounded-xl p-4">
          <p className="text-xs font-mono text-amber-500/60 uppercase tracking-widest mb-1">
            {t('interview.debrief.yourPostmortem')}
          </p>
          <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">{session.postmortem.text}</p>
          <p className="text-xs font-mono text-white/45 mt-3">
            {t('interview.debrief.rubricSelfCheck')}: {rubricYes}/5
          </p>
        </div>

        {weakConcepts.length > 0 && (
          <div className="mt-8">
            <p className="text-xs font-mono text-white/45 uppercase tracking-widest mb-2">
              {t('interview.debrief.weakConcepts')}
            </p>
            <div className="space-y-2">
              {weakConcepts.map(({ caseData, concept }) => (
                <Link
                  key={caseData.id}
                  to={`/case/${caseData.id}`}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg border border-noir-600/40 bg-noir-800/40 hover:border-cyan-500/30 hover:bg-noir-700/40 transition-all duration-200"
                >
                  <div className="min-w-0">
                    <p className="text-sm text-white/80 truncate">{concept.title}</p>
                    <p className="text-xs text-white/45 truncate">{concept.summary}</p>
                  </div>
                  <span className="text-xs font-mono text-cyan-400/80 shrink-0">
                    {t('interview.debrief.reviewCase')}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-center gap-3 mt-10">
          <Button onClick={newSession}>{t('interview.debrief.newInterview')}</Button>
          <Button variant="secondary" onClick={() => navigate('/')}>
            {t('interview.debrief.backToBoard')}
          </Button>
        </div>
      </div>
    </div>
  );
}
