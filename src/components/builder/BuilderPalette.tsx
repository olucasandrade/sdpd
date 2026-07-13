import { useTranslation } from '../../i18n';
import type { ComponentKind } from '../../types/builder';

interface BuilderPaletteProps {
  availableComponents: ComponentKind[];
  onAdd: (kind: ComponentKind) => void;
}

export function BuilderPalette({ availableComponents, onAdd }: BuilderPaletteProps) {
  const { t } = useTranslation();

  return (
    <div className="bg-noir-800/60 border border-noir-600/40 rounded-xl p-4 backdrop-blur-sm">
      <p className="text-xs font-mono text-white/45 uppercase tracking-widest mb-2">{t('builder.palette')}</p>
      <p className="text-xs text-white/45 mb-3">{t('builder.paletteHint')}</p>
      <div className="grid grid-cols-2 gap-2">
        {availableComponents.map((kind) => (
          <button
            key={kind}
            onClick={() => onAdd(kind)}
            className="text-left px-3 py-2 rounded-lg border border-noir-600/40 text-white/70 text-xs font-mono hover:border-amber-500/40 hover:bg-noir-700/40 hover:text-white/90 transition-colors min-h-11"
          >
            + {t(`builder.component.${kind}`)}
          </button>
        ))}
      </div>
    </div>
  );
}
