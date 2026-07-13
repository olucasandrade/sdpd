import { Handle, Position } from '@xyflow/react';
import { useTranslation } from '../../i18n';
import type { ComponentKind } from '../../types/builder';

export interface BuilderNodeData {
  kind: ComponentKind;
  onDelete: (instanceId: string) => void;
  [key: string]: unknown;
}

function ComponentIcon({ kind }: { kind: ComponentKind }) {
  const common = { width: 18, height: 18, viewBox: '0 0 20 20', fill: 'none' as const, className: 'shrink-0 text-amber-400/80' };

  switch (kind) {
    case 'client':
      return (
        <svg {...common}>
          <circle cx="10" cy="7" r="4" className="stroke-current" strokeWidth="1.5" fill="none" />
          <path d="M2 19c0-4.4 3.6-8 8-8s8 3.6 8 8" className="stroke-current" strokeWidth="1.5" fill="none" />
        </svg>
      );
    case 'cdn':
      return (
        <svg {...common}>
          <circle cx="10" cy="10" r="8" className="stroke-current" strokeWidth="1.5" fill="none" />
          <ellipse cx="10" cy="10" rx="3.5" ry="8" className="stroke-current" strokeWidth="1" fill="none" opacity="0.6" />
          <path d="M2 10h16M3.5 5.5h13M3.5 14.5h13" className="stroke-current" strokeWidth="1" opacity="0.6" />
        </svg>
      );
    case 'loadBalancer':
      return (
        <svg {...common}>
          <path d="M3 10h4l3-6 3 12 3-6h4" className="stroke-current" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
        </svg>
      );
    case 'api':
      return (
        <svg {...common}>
          <rect x="2" y="2" width="16" height="16" rx="2" className="stroke-current" strokeWidth="1.5" fill="none" />
          <circle cx="10" cy="10" r="3" className="stroke-current" strokeWidth="1.5" fill="none" />
          <path d="M10 7v6M7 10h6" className="stroke-current" strokeWidth="0.75" opacity="0.5" />
        </svg>
      );
    case 'cache':
      return (
        <svg {...common}>
          <path d="M11 2 4 12h5l-1 6 7-10h-5l1-6z" className="stroke-current" strokeWidth="1.3" fill="none" strokeLinejoin="round" />
        </svg>
      );
    case 'database':
      return (
        <svg {...common} viewBox="0 0 20 24">
          <ellipse cx="10" cy="5" rx="9" ry="4" className="stroke-current" strokeWidth="1.5" fill="none" />
          <path d="M1 5v14c0 2.2 4 4 9 4s9-1.8 9-4V5" className="stroke-current" strokeWidth="1.5" fill="none" />
        </svg>
      );
    case 'blobStorage':
      return (
        <svg {...common}>
          <path d="M10 2 18 6v8l-8 4-8-4V6z" className="stroke-current" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
          <path d="M2 6l8 4 8-4M10 10v8" className="stroke-current" strokeWidth="1" opacity="0.6" />
        </svg>
      );
    case 'queue':
      return (
        <svg {...common}>
          <rect x="2" y="4" width="16" height="3.5" rx="1" className="stroke-current" strokeWidth="1.3" fill="none" />
          <rect x="2" y="9.25" width="16" height="3.5" rx="1" className="stroke-current" strokeWidth="1.3" fill="none" />
          <rect x="2" y="14.5" width="16" height="3.5" rx="1" className="stroke-current" strokeWidth="1.3" fill="none" />
        </svg>
      );
    case 'worker':
      return (
        <svg {...common}>
          <circle cx="10" cy="10" r="3" className="stroke-current" strokeWidth="1.5" fill="none" />
          <path
            d="M10 3v2M10 15v2M17 10h-2M5 10H3M14.9 5.1l-1.4 1.4M6.5 13.5l-1.4 1.4M14.9 14.9l-1.4-1.4M6.5 6.5L5.1 5.1"
            className="stroke-current"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      );
  }
}

export function BuilderNode({ id, data, selected }: { id: string; data: BuilderNodeData; selected?: boolean }) {
  const { t } = useTranslation();
  const label = t(`builder.component.${data.kind}`);

  return (
    <div className="relative group">
      <Handle type="target" position={Position.Top} className="!bg-amber-500 !w-1.5 !h-1.5 !border-0" />
      <div
        className={`rounded-lg border bg-noir-800/90 backdrop-blur-sm p-3 min-w-[130px] transition-shadow ${
          selected ? 'border-amber-500/70 node-glow-degraded' : 'border-noir-500/50'
        }`}
      >
        <div className="flex items-center gap-2">
          <ComponentIcon kind={data.kind} />
          <span className="text-xs font-mono font-bold text-white/90">{label}</span>
        </div>
      </div>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          data.onDelete(id);
        }}
        aria-label={t('builder.deleteComponent')}
        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-noir-900 border border-noir-500/60 text-white/60 hover:text-status-failed hover:border-status-failed/60 flex items-center justify-center text-xs leading-none opacity-70 group-hover:opacity-100 transition-opacity"
      >
        &times;
      </button>
      <Handle type="source" position={Position.Bottom} className="!bg-amber-500 !w-1.5 !h-1.5 !border-0" />
    </div>
  );
}
