import { Handle, Position } from '@xyflow/react';
import type { NodeStatus } from '../../types/case';

interface DatabaseNodeData {
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

export function DatabaseNode({ data }: { data: DatabaseNodeData }) {
  return (
    <div
      onClick={data.onInspect}
      className={`${data.inspectable ? 'node-inspectable cursor-pointer' : ''}`}
    >
      <Handle type="target" position={Position.Top} className="!bg-amber-500 !w-1.5 !h-1.5 !border-0" />
      <div className={`rounded-lg border ${statusBorder[data.status]} ${statusGlow[data.status]} bg-noir-800/90 backdrop-blur-sm p-3 min-w-[140px]`}>
        <div className="flex items-center gap-2 mb-1.5">
          <svg width="18" height="22" viewBox="0 0 20 24" fill="none" className={`shrink-0 ${statusText[data.status]}`}>
            <ellipse cx="10" cy="5" rx="9" ry="4" className="stroke-current" strokeWidth="1.5" fill="none" />
            <path d="M1 5v14c0 2.2 4 4 9 4s9-1.8 9-4V5" className="stroke-current" strokeWidth="1.5" fill="none" />
          </svg>
          <span className="text-[11px] font-mono font-bold text-white/90">{data.label}</span>
        </div>
        <div className={`text-[9px] font-mono uppercase tracking-wider flex items-center gap-1.5 ${statusText[data.status]}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${data.status === 'healthy' ? 'bg-status-healthy' : data.status === 'degraded' ? 'bg-status-degraded' : 'bg-status-failed'} ${data.status === 'healthy' ? 'animate-pulse' : ''}`} />
          {data.status === 'failed' ? 'OFFLINE' : data.status === 'degraded' ? 'DEGRADED' : 'ONLINE'}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-amber-500 !w-1.5 !h-1.5 !border-0" />
    </div>
  );
}
