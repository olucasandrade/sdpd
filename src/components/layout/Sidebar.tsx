import { motion } from 'framer-motion';
import { useAllCases } from '../../hooks/useCase';
import { useGameState } from '../../hooks/useGameState';
import { useTranslation } from '../../i18n';
import { CaseList } from './CaseList';

export function Sidebar() {
  const cases = useAllCases();
  const { completedCases } = useGameState();
  const { t } = useTranslation();

  const pct = cases.length > 0 ? (completedCases / cases.length) * 100 : 0;

  return (
    <aside className="w-60 bg-noir-800/50 border-r border-noir-600/50 flex flex-col shrink-0 max-md:hidden">
      {/* Progress header */}
      <div className="p-4 border-b border-noir-600/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono text-noir-500 uppercase tracking-widest">{t('sidebar.clearance')}</span>
          <span className="text-xs font-mono text-amber-500">{completedCases}/{cases.length}</span>
        </div>
        <div className="w-full bg-noir-700 rounded-full h-1 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-400"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>

      <CaseList />
    </aside>
  );
}
