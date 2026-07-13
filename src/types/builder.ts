export type ComponentKind =
  | 'client'
  | 'cdn'
  | 'loadBalancer'
  | 'api'
  | 'cache'
  | 'database'
  | 'blobStorage'
  | 'queue'
  | 'worker';

export const COMPONENT_KINDS: ComponentKind[] = [
  'client',
  'cdn',
  'loadBalancer',
  'api',
  'cache',
  'database',
  'blobStorage',
  'queue',
  'worker',
];

export interface BuilderConnectionRule {
  from: ComponentKind;
  to: ComponentKind;
}

export interface BuilderConcept {
  id: string;
  title: string;
  description: string;
  requiredAll?: ComponentKind[];
  requiredAnyOf?: ComponentKind[];
  discouragedComponents?: ComponentKind[];
  preferredConnections?: BuilderConnectionRule[];
}

export interface BuilderChallenge {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  objective: string;
  constraints: string[];
  availableComponents: ComponentKind[];
  concepts: BuilderConcept[];
}

export interface PlacedComponent {
  instanceId: string;
  kind: ComponentKind;
  position: { x: number; y: number };
}

export interface PlacedConnection {
  id: string;
  from: string; // instanceId
  to: string; // instanceId
}

export type ConceptStatus = 'pass' | 'partial' | 'fail';

export interface ConceptResult {
  conceptId: string;
  title: string;
  description: string;
  status: ConceptStatus;
  missingRequiredAll: ComponentKind[];
  missingRequiredAnyOf: ComponentKind[];
  missingConnections: BuilderConnectionRule[];
  discouragedPresent: ComponentKind[];
}

export interface GradingResult {
  passed: boolean;
  concepts: ConceptResult[];
  orphanComponentIds: string[];
}

export interface BuilderChallengeState {
  components: PlacedComponent[];
  connections: PlacedConnection[];
  completed: boolean;
  attempts: number;
}

export interface BuilderProgressState {
  schemaVersion: number;
  challenges: Record<string, BuilderChallengeState>;
}
