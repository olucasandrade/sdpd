import { motion, AnimatePresence } from 'framer-motion';
import type { DiagramNode } from '../../types/case';
import { useTranslation } from '../../i18n';

interface NodeInspectorProps {
  node: DiagramNode | null;
  onClose: () => void;
}

const statusColor = {
  healthy: 'text-status-healthy',
  degraded: 'text-status-degraded',
  failed: 'text-status-failed',
};

export function NodeInspector({ node, onClose }: NodeInspectorProps) {
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {node?.inspectData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-noir-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="bg-noir-800 border border-noir-600/50 rounded-xl max-w-lg w-full max-h-[80vh] overflow-y-auto neon-border-cyan"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-noir-600/30">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <h3 className="font-display text-cyan-400 text-lg tracking-wide">{node.inspectData.title}</h3>
              </div>
              <button onClick={onClose} className="text-white/20 hover:text-white/60 transition-colors text-lg w-6 h-6 flex items-center justify-center">
                &times;
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Status */}
              <div>
                <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-1">{t('inspector.status')}</p>
                <p className={`text-xs font-mono ${statusColor[node.status]}`}>
                  {node.inspectData.status}
                </p>
              </div>

              {/* Logs */}
              {node.inspectData.logs && (
                <div>
                  <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-1.5">{t('inspector.systemLogs')}</p>
                  <div className="bg-noir-950 rounded-lg p-3 space-y-0.5 max-h-48 overflow-y-auto border border-noir-700/50">
                    {node.inspectData.logs.map((log, i) => (
                      <p
                        key={i}
                        className={`text-[11px] font-mono leading-relaxed ${
                          log.includes('ERROR') || log.includes('FATAL')
                            ? 'text-status-failed'
                            : log.includes('WARN')
                            ? 'text-status-degraded'
                            : 'text-white/30'
                        }`}
                      >
                        {log}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Data */}
              {node.inspectData.data && (
                <div>
                  <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-1.5">{t('inspector.nodeData')}</p>
                  <div className="bg-noir-950 rounded-lg p-3 space-y-1.5 border border-noir-700/50">
                    {Object.entries(node.inspectData.data).map(([key, val]) => (
                      <div key={key} className="flex justify-between text-[11px] font-mono gap-4">
                        <span className="text-white/20 shrink-0">{key}</span>
                        <span className="text-cyan-300/80 text-right">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
