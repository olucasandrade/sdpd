import { motion } from 'framer-motion';
import { useTranslation } from '../../i18n';
import type { GradingResult, ConceptResult } from '../../types/builder';

const statusBorder = {
  pass: 'border-status-healthy/40 bg-status-healthy/5',
  partial: 'border-status-degraded/40 bg-status-degraded/5',
  fail: 'border-status-failed/40 bg-status-failed/5',
};

const statusDot = {
  pass: 'bg-status-healthy',
  partial: 'bg-status-degraded',
  fail: 'bg-status-failed',
};

const statusText = {
  pass: 'text-status-healthy',
  partial: 'text-status-degraded',
  fail: 'text-status-failed',
};

interface BuilderReportCardProps {
  result: GradingResult;
}

function useConceptReasons(concept: ConceptResult): string[] {
  const { t } = useTranslation();
  const reasons: string[] = [];

  if (concept.missingRequiredAll.length > 0) {
    const names = concept.missingRequiredAll.map((k) => t(`builder.component.${k}`)).join(', ');
    reasons.push(`${t('builder.reasonMissingRequired')} ${names}`);
  }
  if (concept.missingRequiredAnyOf.length > 0) {
    const names = concept.missingRequiredAnyOf.map((k) => t(`builder.component.${k}`)).join(' / ');
    reasons.push(`${t('builder.reasonMissingAnyOf')} ${names}`);
  }
  if (concept.discouragedPresent.length > 0) {
    const names = concept.discouragedPresent.map((k) => t(`builder.component.${k}`)).join(', ');
    reasons.push(`${t('builder.reasonDiscouraged')} ${names}`);
  }
  if (concept.missingConnections.length > 0) {
    const names = concept.missingConnections
      .map((c) => `${t(`builder.component.${c.from}`)} → ${t(`builder.component.${c.to}`)}`)
      .join(', ');
    reasons.push(`${t('builder.reasonMissingConnection')} ${names}`);
  }

  return reasons;
}

function ConceptRow({ concept }: { concept: ConceptResult }) {
  const { t } = useTranslation();
  const reasons = useConceptReasons(concept);

  return (
    <div className={`rounded-lg border p-3 ${statusBorder[concept.status]}`}>
      <div className="flex items-center gap-2 mb-1">
        <div className={`w-2 h-2 rounded-full shrink-0 ${statusDot[concept.status]}`} />
        <p className={`text-sm font-medium ${statusText[concept.status]}`}>{concept.title}</p>
        <span className={`ml-auto text-xs font-mono uppercase tracking-wider ${statusText[concept.status]}`}>
          {t(`builder.status.${concept.status}`)}
        </span>
      </div>
      <p className="text-sm text-white/70 leading-relaxed">{concept.description}</p>
      {reasons.length > 0 && (
        <ul className="mt-2 space-y-1">
          {reasons.map((reason, i) => (
            <li key={i} className="text-xs text-white/45 flex items-start gap-1.5">
              <span className="text-white/30 mt-0.5">&gt;</span>
              {reason}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function BuilderReportCard({ result }: BuilderReportCardProps) {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-noir-800/60 border border-noir-600/40 rounded-xl p-5 backdrop-blur-sm space-y-3"
    >
      <div
        className={`rounded-lg p-3 border ${
          result.passed ? 'border-status-healthy/40 bg-status-healthy/10 node-glow-healthy' : 'border-noir-600/40 bg-noir-900/40'
        }`}
      >
        <p className={`text-sm font-display tracking-wide ${result.passed ? 'text-status-healthy' : 'text-white/70'}`}>
          {result.passed ? t('builder.reportPassed') : t('builder.reportNotYet')}
        </p>
      </div>

      {result.orphanComponentIds.length > 0 && (
        <p className="text-xs font-mono text-status-degraded/80">{t('builder.orphanWarning')}</p>
      )}

      <div className="space-y-2">
        {result.concepts.map((concept) => (
          <ConceptRow key={concept.conceptId} concept={concept} />
        ))}
      </div>
    </motion.div>
  );
}
