import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAllCases } from '../../hooks/useCase';
import { useGameState } from '../../hooks/useGameState';

interface CaseListProps {
  onNavigate?: () => void;
}

export function CaseList({ onNavigate }: CaseListProps) {
  const cases = useAllCases();
  const { progress, isCaseUnlocked } = useGameState();
  const navigate = useNavigate();
  const { caseId } = useParams();

  return (
    <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
      {cases.map((c) => {
        const unlocked = isCaseUnlocked(c.number);
        const done = progress[c.id]?.completed;
        const active = caseId === c.id;

        return (
          <button
            key={c.id}
            onClick={() => {
              if (!unlocked) return;
              navigate(`/case/${c.id}`);
              onNavigate?.();
            }}
            disabled={!unlocked}
            className={`group w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 relative min-h-11 ${
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
                <p className="text-xs font-mono text-noir-500 leading-none">
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
  );
}
