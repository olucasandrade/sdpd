import { useState } from 'react';
import { motion } from 'framer-motion';
import { useCase } from '../../hooks/useCase';
import { useInterviewSession } from '../../hooks/useInterviewSession';
import { useTranslation } from '../../i18n';
import { Button } from '../common/Button';
import { categorySuffixForCaseNumber } from '../../data/categories';
import { POSTMORTEM_MIN_CHARS, RUBRIC_ITEM_COUNT } from '../../utils/interviewScore';

export function InterviewPostmortem() {
  const { t } = useTranslation();
  const { postmortemCaseId, submitPostmortem } = useInterviewSession();
  const { caseData, loading } = useCase(postmortemCaseId ?? undefined);
  const [subPhase, setSubPhase] = useState<'writing' | 'rubric'>('writing');
  const [text, setText] = useState('');
  const [rubric, setRubric] = useState<boolean[]>(Array(RUBRIC_ITEM_COUNT).fill(false));

  if (loading || !caseData) return null;

  const categorySuffix = categorySuffixForCaseNumber(caseData.number) ?? 'advanced';
  const charsLeft = Math.max(0, POSTMORTEM_MIN_CHARS - text.trim().length);

  function toggleRubric(index: number) {
    setRubric((prev) => prev.map((val, i) => (i === index ? !val : val)));
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-mono text-amber-500/70 uppercase tracking-widest">
            {t('interview.postmortem.worstCase')}
          </p>
          <h1 className="font-display text-3xl text-white tracking-wide mt-1">
            {String(caseData.number).padStart(2, '0')} — {caseData.title}
          </h1>

          {subPhase === 'writing' ? (
            <>
              <p className="text-sm text-white/70 mt-4 leading-relaxed">{t('interview.postmortem.prompt')}</p>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={t('interview.postmortem.placeholder')}
                rows={10}
                className="mt-4 w-full bg-noir-800/60 border border-noir-600/40 rounded-xl p-4 text-sm text-white/85 placeholder:text-white/30 focus:outline-none focus:border-amber-500/40 resize-y"
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs font-mono text-white/45">
                  {charsLeft > 0
                    ? `${charsLeft} ${t('interview.postmortem.charsRemaining')} (${POSTMORTEM_MIN_CHARS} ${t('interview.postmortem.charsMin')})`
                    : `${text.trim().length} / ${POSTMORTEM_MIN_CHARS}+`}
                </span>
                <Button onClick={() => setSubPhase('rubric')} disabled={charsLeft > 0}>
                  {t('interview.postmortem.submit')}
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="mt-4 bg-noir-800/60 border border-noir-600/40 rounded-xl p-4">
                <p className="text-xs font-mono text-amber-500/60 uppercase tracking-widest mb-1">
                  {t('interview.debrief.yourPostmortem')}
                </p>
                <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">{text}</p>
              </div>

              <div className="mt-6">
                <h2 className="text-base font-medium text-white/90">{t('interview.postmortem.rubricTitle')}</h2>
                <p className="text-sm text-white/70 mt-1">{t('interview.postmortem.rubricSubtitle')}</p>

                <div className="mt-4 space-y-3">
                  {Array.from({ length: RUBRIC_ITEM_COUNT }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => toggleRubric(i)}
                      className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                        rubric[i]
                          ? 'border-status-healthy/40 bg-status-healthy/8 text-white'
                          : 'border-noir-600/40 text-white/60 hover:border-noir-500/50 hover:text-white/80'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <span
                          className={`mt-0.5 w-4 h-4 rounded shrink-0 border flex items-center justify-center text-[10px] ${
                            rubric[i] ? 'border-status-healthy bg-status-healthy/20 text-status-healthy' : 'border-noir-500'
                          }`}
                        >
                          {rubric[i] ? '✓' : ''}
                        </span>
                        <span>
                          <p className="text-sm font-medium">{t(`interview.rubric.q${i + 1}`)}</p>
                          <p className="text-xs text-white/45 mt-1 leading-relaxed">
                            {t(`interview.rubric.${categorySuffix}.${i + 1}`)}
                          </p>
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex justify-end mt-5">
                  <Button onClick={() => submitPostmortem(text, rubric)}>{t('interview.postmortem.finish')}</Button>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
