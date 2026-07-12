import { useEffect, useMemo, useState } from 'react';
import { chaosPresets } from '../data/chaos/presets';
import { useChaosSimulator } from '../hooks/useChaosSimulator';
import { useTranslation } from '../i18n';
import { ChaosDiagram } from '../components/chaos/ChaosDiagram';
import { Button } from '../components/common/Button';
import type { ChaosState } from '../types/chaos';
import { loadChaosState, saveChaosState } from '../utils/localChaosStore';

function formatMetric(value: number, unit: string, decimals = 0): string {
  return `${value.toFixed(decimals)}${unit}`;
}

export function ChaosPage() {
  const { t } = useTranslation();
  const defaultState: ChaosState = {
    presetId: chaosPresets[0]?.id ?? 'api-db-cache',
    activeFaults: [],
    activeFixes: [],
  };
  const [state, setState] = useState<ChaosState>(() => loadChaosState(defaultState));

  const preset = useMemo(
    () => chaosPresets.find((p) => p.id === state.presetId) ?? chaosPresets[0],
    [state.presetId],
  );

  useEffect(() => {
    if (!preset) return;
    if (state.presetId !== preset.id) {
      setState((current) => ({ ...current, presetId: preset.id }));
    }
  }, [preset, state.presetId]);

  useEffect(() => {
    saveChaosState(state);
  }, [state]);

  const { metrics, nodes, edges, logs, objectiveMet } = useChaosSimulator(
    preset,
    state.activeFaults,
    state.activeFixes,
  );

  const toggleFault = (faultId: string) => {
    setState((current) => ({
      ...current,
      activeFaults: current.activeFaults.includes(faultId)
        ? current.activeFaults.filter((id) => id !== faultId)
        : [...current.activeFaults, faultId],
    }));
  };

  const toggleFix = (fixId: string) => {
    setState((current) => ({
      ...current,
      activeFixes: current.activeFixes.includes(fixId)
        ? current.activeFixes.filter((id) => id !== fixId)
        : [...current.activeFixes, fixId],
    }));
  };

  const resetPreset = () => {
    if (!preset) return;
    setState({
      presetId: preset.id,
      activeFaults: [],
      activeFixes: [],
    });
  };

  if (!preset) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <p>{t('chaos.notFound')}</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col lg:flex-row">
      <div className="flex-1 min-h-[360px]">
        <ChaosDiagram nodes={nodes} edges={edges} />
      </div>

      <div className="lg:w-[420px] border-l border-navy-700 overflow-y-auto p-4 space-y-4 bg-navy-900/50">
        <div className="bg-noir-800/60 border border-noir-600/40 rounded-xl p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div>
              <p className="text-xs font-mono text-white/45 uppercase tracking-widest">
                {t('chaos.sectionLabel')}
              </p>
              <h2 className="text-lg font-display text-white/90">{t('chaos.title')}</h2>
              <p className="text-sm text-white/70 mt-1">{t('chaos.subtitle')}</p>
            </div>
            <Button variant="secondary" onClick={resetPreset} className="text-xs">
              {t('chaos.reset')}
            </Button>
          </div>

          <div className="mt-4">
            <p className="text-xs font-mono text-white/45 uppercase tracking-widest mb-2">
              {t('chaos.presets')}
            </p>
            <div className="grid grid-cols-1 gap-2">
              {chaosPresets.map((p) => {
                const active = p.id === preset.id;
                return (
                  <button
                    key={p.id}
                    onClick={() =>
                      setState({
                        presetId: p.id,
                        activeFaults: [],
                        activeFixes: [],
                      })
                    }
                    className={`text-left p-3 rounded-lg border transition-all duration-200 ${
                      active
                        ? 'border-amber-500/40 bg-amber-500/8 text-white'
                        : 'border-noir-600/40 text-white/50 hover:border-noir-500/50 hover:text-white/70 hover:bg-noir-700/30'
                    }`}
                  >
                    <p className="text-sm font-medium">{t(p.nameKey)}</p>
                    <p className="text-xs text-white/60 mt-1">{t(p.descriptionKey)}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-noir-800/60 border border-noir-600/40 rounded-xl p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-mono text-white/45 uppercase tracking-widest">
              {t('chaos.faults')}
            </p>
            <span className="text-xs font-mono text-amber-400/70">
              {state.activeFaults.length} {t('chaos.active')}
            </span>
          </div>
          <div className="space-y-2">
            {preset.faults.map((fault) => {
              const active = state.activeFaults.includes(fault.id);
              return (
                <button
                  key={fault.id}
                  onClick={() => toggleFault(fault.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                    active
                      ? 'border-status-failed/40 bg-status-failed/10 text-white node-glow-failed'
                      : 'border-noir-600/40 text-white/50 hover:border-noir-500/50 hover:text-white/70 hover:bg-noir-700/30'
                  }`}
                >
                  <p className="text-sm font-medium">{t(fault.nameKey)}</p>
                  <p className="text-xs text-white/60 mt-1">{t(fault.descriptionKey)}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-noir-800/60 border border-noir-600/40 rounded-xl p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-mono text-white/45 uppercase tracking-widest">
              {t('chaos.fixes')}
            </p>
            <span className="text-xs font-mono text-cyan-400/70">
              {state.activeFixes.length} {t('chaos.active')}
            </span>
          </div>
          <div className="space-y-2">
            {preset.fixes.map((fix) => {
              const active = state.activeFixes.includes(fix.id);
              return (
                <button
                  key={fix.id}
                  onClick={() => toggleFix(fix.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                    active
                      ? 'border-cyan-500/40 bg-cyan-500/10 text-white neon-border-cyan'
                      : 'border-noir-600/40 text-white/50 hover:border-noir-500/50 hover:text-white/70 hover:bg-noir-700/30'
                  }`}
                >
                  <p className="text-sm font-medium">{t(fix.nameKey)}</p>
                  <p className="text-xs text-white/60 mt-1">{t(fix.descriptionKey)}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div
          className={`rounded-xl p-4 border transition-colors ${
            objectiveMet
              ? 'border-status-healthy/40 bg-status-healthy/10 node-glow-healthy'
              : 'border-noir-600/40 bg-noir-800/60'
          }`}
        >
          <p className="text-xs font-mono text-white/45 uppercase tracking-widest mb-1">
            {t('chaos.objective')}
          </p>
          <p className={`text-sm ${objectiveMet ? 'text-status-healthy' : 'text-white/70'}`}>
            {t('chaos.objectiveAvailability')} {preset.objective.minAvailability}% · {t('chaos.objectiveLatency')} {preset.objective.maxLatency}ms · {t('chaos.objectiveWith')} {preset.objective.minActiveFaults} {t('chaos.objectiveFaultsActive')}
          </p>
          {objectiveMet && (
            <p className="text-xs font-mono text-status-healthy mt-1">{t('chaos.objectiveMet')}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-noir-800/60 border border-noir-600/40 rounded-xl p-4">
            <p className="text-xs font-mono text-white/45 uppercase tracking-widest">
              {t('chaos.kpi.availability')}
            </p>
            <p className="text-xl font-display text-status-healthy">
              {formatMetric(metrics.availability, '%', 1)}
            </p>
          </div>
          <div className="bg-noir-800/60 border border-noir-600/40 rounded-xl p-4">
            <p className="text-xs font-mono text-white/45 uppercase tracking-widest">
              {t('chaos.kpi.latency')}
            </p>
            <p className="text-xl font-display text-amber-400">
              {formatMetric(metrics.latency, 'ms', 0)}
            </p>
          </div>
          <div className="bg-noir-800/60 border border-noir-600/40 rounded-xl p-4">
            <p className="text-xs font-mono text-white/45 uppercase tracking-widest">
              {t('chaos.kpi.errorRate')}
            </p>
            <p className="text-xl font-display text-status-failed">
              {formatMetric(metrics.errorRate, '%', 1)}
            </p>
          </div>
          <div className="bg-noir-800/60 border border-noir-600/40 rounded-xl p-4">
            <p className="text-xs font-mono text-white/45 uppercase tracking-widest">
              {t('chaos.kpi.throughput')}
            </p>
            <p className="text-xl font-display text-cyan-400">
              {formatMetric(metrics.throughput, ' rps', 0)}
            </p>
          </div>
        </div>

        <div className="bg-noir-800/60 border border-noir-600/40 rounded-xl p-5 backdrop-blur-sm">
          <p className="text-xs font-mono text-white/45 uppercase tracking-widest mb-2">
            {t('chaos.logs')}
          </p>
          <div className="h-44 overflow-y-auto space-y-1 text-xs font-mono text-white/60">
            {logs.length === 0 ? (
              <p className="text-white/45">{t('chaos.logsEmpty')}</p>
            ) : (
              logs.map((log) => (
                <p key={log.id} className={log.type === 'fault' ? 'text-status-failed/70' : 'text-cyan-400/70'}>
                  {log.message}
                </p>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
