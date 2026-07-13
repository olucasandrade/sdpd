import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from '../i18n';
import { useBuilderChallengeList } from '../hooks/useBuilderChallenges';
import { useBuilderProgress } from '../hooks/useBuilderProgress';
import { Button } from '../components/common/Button';

export function BuilderListPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { challenges, loading } = useBuilderChallengeList();
  const { challenges: progress, completedCount } = useBuilderProgress();

  const total = challenges.length;
  const done = completedCount();

  return (
    <div className="h-full overflow-y-auto">
      <div className="relative py-10 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(251,191,36,0.04)_0%,transparent_70%)]" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative">
          <p className="text-xs font-mono text-amber-500/70 uppercase tracking-widest">{t('builder.sectionLabel')}</p>
          <h1 className="font-display text-4xl text-white tracking-[0.08em] mt-2">{t('builder.title')}</h1>
          <p className="text-white/70 text-sm max-w-lg mx-auto mt-3 leading-relaxed">{t('builder.subtitle')}</p>
          <p className="text-xs font-mono text-white/45 mt-4">
            {done}/{total || 23} {t('builder.designsApproved')}
          </p>
        </motion.div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pb-12">
        {loading ? (
          <p className="text-center text-white/45 text-sm font-mono">{t('builder.loading')}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {challenges.map((c) => {
              const state = progress[c.id];
              const isDone = state?.completed;

              return (
                <motion.div
                  key={c.id}
                  whileHover={{ x: 4, transition: { duration: 0.15 } }}
                  className={`group relative flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                    isDone
                      ? 'border-status-healthy/15 bg-status-healthy/3 hover:bg-status-healthy/5'
                      : 'border-noir-600/30 bg-noir-800/30 hover:border-amber-500/20 hover:bg-noir-700/30'
                  }`}
                  onClick={() => navigate(`/builder/${c.id}`)}
                >
                  <div
                    className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${
                      isDone ? 'bg-status-healthy/10 text-status-healthy' : 'bg-amber-500/8 text-amber-500/80'
                    }`}
                  >
                    <span className="font-display text-sm">{String(c.number).padStart(2, '0')}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${isDone ? 'text-status-healthy/70' : 'text-white/70'}`}>
                      {c.title}
                    </p>
                    <p className="text-xs text-white/50 truncate">{c.subtitle}</p>
                    {state && state.attempts > 0 && (
                      <p className="text-[10px] font-mono text-white/45 mt-1">
                        {state.attempts} {state.attempts === 1 ? t('builder.attempt') : t('builder.attempts')}
                      </p>
                    )}
                  </div>

                  <div className="shrink-0">
                    {isDone ? (
                      <span className="text-xs font-mono text-status-healthy/60">{t('builder.card.approved')}</span>
                    ) : (
                      <Button onClick={() => navigate(`/builder/${c.id}`)} className="text-xs py-1 px-3">
                        {t('builder.card.open')}
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
