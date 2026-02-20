import { motion } from 'framer-motion';
import type { Case } from '../../types/case';
import { useTranslation } from '../../i18n';

interface CaseBriefProps {
  caseData: Case;
}

export function CaseBrief({ caseData }: CaseBriefProps) {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-noir-800/60 border border-noir-600/40 rounded-xl p-5 backdrop-blur-sm"
    >
      <div className="flex items-start gap-3 mb-4">
        <div className="w-8 h-8 rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
          <span className="font-display text-amber-400 text-sm">{String(caseData.number).padStart(2, '0')}</span>
        </div>
        <div>
          <p className="text-[10px] font-mono text-amber-500/80 uppercase tracking-widest">{t('caseBrief.caseFile')}</p>
          <h2 className="font-display text-xl text-white tracking-wide leading-tight">{caseData.title}</h2>
          <p className="text-xs text-white/40 mt-0.5">{caseData.subtitle}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-[10px] font-mono text-amber-500/60 uppercase tracking-widest mb-1.5">{t('caseBrief.briefing')}</p>
          <p className="text-sm text-white/60 leading-relaxed">{caseData.brief.narrative}</p>
        </div>

        <div>
          <p className="text-[10px] font-mono text-amber-500/60 uppercase tracking-widest mb-2">{t('caseBrief.symptoms')}</p>
          <ul className="space-y-1.5">
            {caseData.brief.symptoms.map((s, i) => (
              <li key={i} className="text-sm text-white/60 flex items-start gap-2">
                <span className="text-amber-500/50 font-mono text-xs mt-0.5">&gt;</span>
                {s}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-amber-500/5 border border-amber-500/15 rounded-lg p-3">
          <p className="text-[10px] font-mono text-amber-400/80 uppercase tracking-widest mb-1">{t('caseBrief.objective')}</p>
          <p className="text-sm text-amber-200/80 leading-relaxed">{caseData.brief.objective}</p>
        </div>
      </div>
    </motion.div>
  );
}
