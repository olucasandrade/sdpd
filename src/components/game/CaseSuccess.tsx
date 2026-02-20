import { motion } from 'framer-motion';
import type { Case } from '../../types/case';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { useNavigate } from 'react-router-dom';
import { useGameState } from '../../hooks/useGameState';
import { useAllCases } from '../../hooks/useCase';
import { useConcepts } from '../../hooks/useCase';
import { useTranslation } from '../../i18n';

interface CaseSuccessProps {
  caseData: Case;
}

export function CaseSuccess({ caseData }: CaseSuccessProps) {
  const navigate = useNavigate();
  const { progress } = useGameState();
  const { t } = useTranslation();
  const allCases = useAllCases();
  const concepts = useConcepts();
  const caseProgress = progress[caseData.id];
  const concept = concepts.find((c) => c.id === caseData.conceptId);

  const hasNext = caseData.number < allCases.length;
  const nextCaseId = hasNext ? `case-${String(caseData.number + 1).padStart(2, '0')}` : null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-noir-800/60 border border-amber-500/20 rounded-xl p-6 text-center backdrop-blur-sm neon-border"
    >
      {/* Particles */}
      <div className="relative h-0">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 0, x: 0 }}
            animate={{
              opacity: [0, 1, 0],
              y: [0, -80 - Math.random() * 40],
              x: [(Math.random() - 0.5) * 160],
            }}
            transition={{ duration: 2, delay: i * 0.08 }}
            className="absolute left-1/2 top-0 w-1 h-1 rounded-full"
            style={{ backgroundColor: ['#fbbf24', '#34d399', '#22d3ee', '#f87171', '#fbbf24'][i % 5] }}
          />
        ))}
      </div>

      <div className="mb-4 mt-2">
        <Badge icon={caseData.badge.icon} name={caseData.badge.name} size="lg" />
      </div>

      <h2 className="font-display text-3xl text-amber-400 tracking-wider mb-1">{t('success.caseSolved')}</h2>
      <p className="text-white/40 text-xs font-mono">
        {t('success.badgeEarned')} <span className="text-amber-300">{caseData.badge.name}</span>
      </p>

      {caseProgress && (
        <div className="flex justify-center gap-6 my-4 text-[11px] font-mono text-white/30">
          <div>
            {t('success.diagnosis')} <span className="text-white/60">{caseProgress.rootCauseAttempts} {caseProgress.rootCauseAttempts !== 1 ? t('success.attempts') : t('success.attempt')}</span>
          </div>
          <div>
            {t('success.fix')} <span className="text-white/60">{caseProgress.fixAttempts} {caseProgress.fixAttempts !== 1 ? t('success.attempts') : t('success.attempt')}</span>
          </div>
        </div>
      )}

      {concept && (
        <div className="bg-noir-950/80 rounded-lg p-4 text-left mb-5 border border-noir-700/30">
          <p className="text-[10px] font-mono text-cyan-400/60 uppercase tracking-widest mb-1">{t('success.conceptUnlocked')}</p>
          <p className="text-sm font-medium text-white/80 mb-0.5">{concept.title}</p>
          <p className="text-xs text-white/30">{concept.summary}</p>
        </div>
      )}

      <div className="flex justify-center gap-3">
        {hasNext && nextCaseId && (
          <Button onClick={() => navigate(`/case/${nextCaseId}`)}>
            {t('success.nextCase')}
          </Button>
        )}
        <Button variant="secondary" onClick={() => navigate('/')}>
          {t('success.caseBoard')}
        </Button>
      </div>
    </motion.div>
  );
}
