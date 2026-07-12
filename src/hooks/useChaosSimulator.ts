import { useEffect, useMemo, useState } from 'react';
import type { ChaosFault, ChaosLogEvent, ChaosMetrics, ChaosPreset } from '../types/chaos';
import type { DiagramEdge, DiagramNode } from '../types/case';

const MAX_LOGS = 200;

const FAILURE_FAULTS = new Set(['node-crash', 'db-primary-fail']);
const DEGRADED_FAULTS = new Set(['replica-lag', 'cache-miss-storm', 'queue-backlog', 'latency-spike', 'packet-loss']);

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function sumMetrics(base: ChaosMetrics, deltas: Partial<ChaosMetrics>[]): ChaosMetrics {
  const total = { ...base };
  for (const delta of deltas) {
    if (delta.availability !== undefined) total.availability += delta.availability;
    if (delta.latency !== undefined) total.latency += delta.latency;
    if (delta.errorRate !== undefined) total.errorRate += delta.errorRate;
    if (delta.throughput !== undefined) total.throughput += delta.throughput;
  }

  return {
    availability: clamp(total.availability, 0, 100),
    latency: clamp(total.latency, 20, 5000),
    errorRate: clamp(total.errorRate, 0, 100),
    throughput: clamp(total.throughput, 0, 100000),
  };
}

function formatTimestamp(date: Date): string {
  return date.toISOString().slice(11, 19);
}

function pickTemplate(templates: string[]): string {
  if (templates.length === 0) return 'INFO: event recorded';
  const idx = Math.floor(Math.random() * templates.length);
  return templates[idx] ?? templates[0];
}

function buildLogEvent(type: ChaosLogEvent['type'], message: string): ChaosLogEvent {
  const timestamp = formatTimestamp(new Date());
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    timestamp,
    message: `[${timestamp}] ${message}`,
    type,
  };
}

function computeNodes(baseNodes: DiagramNode[], activeFaults: ChaosFault[]): DiagramNode[] {
  return baseNodes.map((node) => {
    const faultsForNode = activeFaults.filter((fault) => fault.targets?.nodes?.includes(node.id));
    if (faultsForNode.some((fault) => FAILURE_FAULTS.has(fault.id))) {
      return { ...node, status: 'failed' };
    }
    if (faultsForNode.some((fault) => DEGRADED_FAULTS.has(fault.id))) {
      return { ...node, status: 'degraded' };
    }
    return { ...node, status: 'healthy' };
  });
}

function computeEdges(baseEdges: DiagramEdge[], activeFaults: ChaosFault[]): DiagramEdge[] {
  return baseEdges.map((edge) => {
    const faultsForEdge = activeFaults.filter((fault) => fault.targets?.edges?.includes(edge.id));
    const hasPacketLoss = faultsForEdge.some((fault) => fault.id === 'packet-loss');
    const hasLatency = faultsForEdge.some((fault) => fault.id === 'latency-spike');
    if (hasPacketLoss) return { ...edge, style: 'broken', animated: true };
    if (hasLatency) return { ...edge, style: 'slow', animated: true };
    return { ...edge, style: edge.style ?? 'normal', animated: edge.animated };
  });
}

export function useChaosSimulator(
  preset: ChaosPreset,
  activeFaultIds: string[],
  activeFixIds: string[],
) {
  const [logs, setLogs] = useState<ChaosLogEvent[]>([]);

  const activeFaults = useMemo(
    () => preset.faults.filter((fault) => activeFaultIds.includes(fault.id)),
    [preset, activeFaultIds],
  );

  const activeFixes = useMemo(
    () => preset.fixes.filter((fix) => activeFixIds.includes(fix.id)),
    [preset, activeFixIds],
  );

  const metrics = useMemo(() => {
    const faultDeltas = activeFaults.map((fault) => fault.effects);
    const fixDeltas = activeFixes
      .filter((fix) => fix.counters.some((counter) => activeFaultIds.includes(counter)))
      .map((fix) => fix.effects);
    return sumMetrics(preset.baseMetrics, [...faultDeltas, ...fixDeltas]);
  }, [preset, activeFaults, activeFixes, activeFaultIds]);

  const nodes = useMemo(
    () => computeNodes(preset.nodes, activeFaults),
    [preset.nodes, activeFaults],
  );

  const edges = useMemo(
    () => computeEdges(preset.edges, activeFaults),
    [preset.edges, activeFaults],
  );

  useEffect(() => {
    setLogs([]);
  }, [preset.id]);

  const activeFaultKey = activeFaultIds.join(',');
  const activeFixKey = activeFixIds.join(',');

  useEffect(() => {
    if (activeFaults.length === 0 && activeFixes.length === 0) return;

    const faultLogs = activeFaults.map((fault) =>
      buildLogEvent('fault', pickTemplate(fault.logTemplates)),
    );

    const fixLogs = activeFixes
      .filter((fix) => fix.counters.some((counter) => activeFaultIds.includes(counter)))
      .map((fix) => buildLogEvent('fix', pickTemplate(fix.logTemplates)));

    if (faultLogs.length === 0 && fixLogs.length === 0) return;

    setLogs((current) => {
      const next = [...current, ...faultLogs, ...fixLogs];
      return next.slice(-MAX_LOGS);
    });
    // Log only when the active fault/fix set actually changes, not on a timer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFaultKey, activeFixKey]);

  const objectiveMet = preset.objective
    ? metrics.availability >= preset.objective.minAvailability &&
      metrics.latency <= preset.objective.maxLatency &&
      activeFaults.length >= preset.objective.minActiveFaults
    : false;

  return { metrics, nodes, edges, logs, objectiveMet };
}
