export type NodeStatus = 'healthy' | 'degraded' | 'failed';

export interface DiagramNode {
  id: string;
  type: 'database' | 'server' | 'client';
  label: string;
  status: NodeStatus;
  position: { x: number; y: number };
  inspectable: boolean;
  inspectData?: {
    title: string;
    logs?: string[];
    data?: Record<string, string>;
    status: string;
  };
}

export interface DiagramEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  animated?: boolean;
  style?: 'normal' | 'broken' | 'slow';
}

export interface DiagnosisOption {
  id: string;
  text: string;
  correct: boolean;
  feedback: string;
}

export interface Case {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  brief: {
    narrative: string;
    symptoms: string[];
    objective: string;
  };
  diagram: {
    nodes: DiagramNode[];
    edges: DiagramEdge[];
  };
  diagnosis: {
    rootCause: {
      question: string;
      options: DiagnosisOption[];
    };
    fix: {
      question: string;
      options: DiagnosisOption[];
    };
  };
  conceptId: string;
  badge: {
    name: string;
    icon: string;
  };
}
