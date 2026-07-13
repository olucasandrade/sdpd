import type { KeyboardEvent } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeStatus } from '../../types/case';
import { useTranslation } from '../../i18n';

interface ClientNodeData {
  label: string;
  status: NodeStatus;
  inspectable: boolean;
  onInspect?: () => void;
}

const statusBorder = {
  healthy: 'border-status-healthy/60',
  degraded: 'border-status-degraded/60',
  failed: 'border-status-failed/60',
};

const statusGlow = {
  healthy: 'node-glow-healthy',
  degraded: 'node-glow-degraded',
  failed: 'node-glow-failed',
};

const statusText = {
  healthy: 'text-status-healthy',
  degraded: 'text-status-degraded',
  failed: 'text-status-failed',
};

export function ClientNode({ data }: { data: ClientNodeData }) {
  const { t } = useTranslation();
  const statusLabel = data.status === 'failed' ? 'NO CONN' : data.status === 'degraded' ? 'STALE' : 'ONLINE';

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      data.onInspect?.();
    }
  };

  return (
    <div
      onClick={data.onInspect}
      onKeyDown={data.inspectable ? handleKeyDown : undefined}
      role={data.inspectable ? 'button' : undefined}
      tabIndex={data.inspectable ? 0 : undefined}
      aria-label={data.inspectable ? `${t('a11y.diagram.inspect')} ${data.label} (${statusLabel})` : undefined}
      className={`${data.inspectable ? 'node-inspectable cursor-pointer rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60' : ''}`}
    >
      <Handle type="target" position={Position.Top} className="!bg-amber-500 !w-1.5 !h-1.5 !border-0" />
      <div className={`rounded-lg border ${statusBorder[data.status]} ${statusGlow[data.status]} bg-noir-800/90 backdrop-blur-sm p-3 min-w-[130px]`}>
        <div className="flex items-center gap-2 mb-1.5">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className={`shrink-0 ${statusText[data.status]}`}>
            <circle cx="10" cy="7" r="4" className="stroke-current" strokeWidth="1.5" fill="none" />
            <path d="M2 19c0-4.4 3.6-8 8-8s8 3.6 8 8" className="stroke-current" strokeWidth="1.5" fill="none" />
          </svg>
          <span className="text-xs font-mono font-bold text-white/90">{data.label}</span>
        </div>
        <div className={`text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 ${statusText[data.status]}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${data.status === 'healthy' ? 'bg-status-healthy' : data.status === 'degraded' ? 'bg-status-degraded' : 'bg-status-failed'} ${data.status === 'healthy' ? 'animate-pulse' : ''}`} />
          {statusLabel}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-amber-500 !w-1.5 !h-1.5 !border-0" />
    </div>
  );
}
