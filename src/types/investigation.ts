export type EvidenceSourceType = 'objective' | 'symptom' | 'node';

export interface EvidenceTemplate {
  id: string;
  title: string;
  detail: string;
  sourceType: EvidenceSourceType;
  sourceRef: string;
}

export interface EvidenceItem {
  id: string;
  templateId: string;
  title: string;
  detail: string;
  sourceType: EvidenceSourceType;
  sourceRef: string;
  discoveredAt: string;
  note: string;
}

export type EventConfidence = 'low' | 'medium' | 'high';

export interface TimelineEvent {
  id: string;
  title: string;
  timeLabel: string;
  confidence: EventConfidence;
  note: string;
  evidenceIds: string[];
}

export interface ContradictionItem {
  id: string;
  text: string;
  evidenceIds: string[];
  resolved: boolean;
  createdAt: string;
}

export interface InvestigationUnlockState {
  unlockedFix: boolean;
  pendingConditions: string[];
}

export interface InvestigationBoardState {
  schemaVersion: 1;
  caseId: string;
  updatedAt: string;
  version: number;
  evidence: EvidenceItem[];
  timelineEvents: TimelineEvent[];
  contradictions: ContradictionItem[];
  unlock: InvestigationUnlockState;
}

export type InvestigationSaveReason = 'quota' | 'unknown';
export type InvestigationSaveStatus = 'idle' | 'saving' | 'saved' | 'error';
