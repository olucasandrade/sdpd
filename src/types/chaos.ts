import type { DiagramEdge, DiagramNode } from './case';

export interface ChaosMetrics {
  availability: number;
  latency: number;
  errorRate: number;
  throughput: number;
}

export interface ChaosFault {
  id: string;
  nameKey: string;
  descriptionKey: string;
  targets?: {
    nodes?: string[];
    edges?: string[];
  };
  effects: Partial<ChaosMetrics>;
  severity: 'low' | 'medium' | 'high';
  logTemplates: string[];
}

export interface ChaosFix {
  id: string;
  nameKey: string;
  descriptionKey: string;
  counters: string[];
  effects: Partial<ChaosMetrics>;
  logTemplates: string[];
}

export interface ChaosObjective {
  minAvailability: number;
  maxLatency: number;
  minActiveFaults: number;
}

export interface ChaosPreset {
  id: string;
  nameKey: string;
  descriptionKey: string;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  baseMetrics: ChaosMetrics;
  faults: ChaosFault[];
  fixes: ChaosFix[];
  objective: ChaosObjective;
}

export interface ChaosState {
  presetId: string;
  activeFaults: string[];
  activeFixes: string[];
}

export interface ChaosLogEvent {
  id: string;
  timestamp: string;
  message: string;
  type: 'fault' | 'fix' | 'info';
}
