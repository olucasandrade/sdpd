import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAllCases } from '../../hooks/useCase';
import { useGameState } from '../../hooks/useGameState';
import { useTranslation } from '../../i18n';

export function Sidebar() {
  const cases = useAllCases();
  const { progress, isCaseUnlocked, completedCases } = useGameState();
  const navigate = useNavigate();
  const { caseId } = useParams();
  const { t } = useTranslation();

  const pct = cases.length > 0 ? (completedCases / cases.length) * 100 : 0;

  return (
    <aside className="w-60 bg-noir-800/50 border-r border-noir-600/50 flex flex-col shrink-0 max-md:hidden">
      {/* Progress header */}
      <div className="p-4 border-b border-noir-600/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono text-noir-500 uppercase tracking-widest">{t('sidebar.clearance')}</span>
          <span className="text-[10px] font-mono text-amber-500">{completedCases}/{cases.length}</span>
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

      {/* Case list */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {cases.map((c) => {
          const unlocked = isCaseUnlocked(c.number);
          const done = progress[c.id]?.completed;
          const active = caseId === c.id;

          return (
            <button
              key={c.id}
              onClick={() => unlocked && navigate(`/case/${c.id}`)}
              disabled={!unlocked}
              className={`group w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 relative ${
                active
                  ? 'bg-amber-500/8 border border-amber-500/20'
                  : unlocked
                  ? 'hover:bg-noir-700/60 border border-transparent'
                  : 'opacity-30 cursor-not-allowed border border-transparent'
              }`}
            >
              {/* Active indicator line */}
              {active && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-2 bottom-2 w-0.5 bg-amber-500 rounded-full"
                />
              )}

              <div className="flex items-center gap-2.5">
                {/* Status dot */}
                <div className={`w-2 h-2 rounded-full shrink-0 ${
                  done ? 'bg-status-healthy' : active ? 'bg-amber-500' : unlocked ? 'bg-noir-500' : 'bg-noir-600'
                }`} />

                <div className="min-w-0">
                  <p className="text-[10px] font-mono text-noir-500 leading-none">
                    {String(c.number).padStart(2, '0')}
                  </p>
                  <p className={`text-xs font-medium truncate leading-tight mt-0.5 ${
                    active ? 'text-amber-400' : done ? 'text-status-healthy/80' : 'text-white/70'
                  }`}>
                    {c.title}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
