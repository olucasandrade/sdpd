import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Case } from '../types/case';
import type {
  ContradictionItem,
  EvidenceItem,
  EvidenceTemplate,
  EventConfidence,
  InvestigationBoardState,
  InvestigationSaveReason,
  InvestigationSaveStatus,
  TimelineEvent,
} from '../types/investigation';
import { loadCaseBoardState, saveCaseBoardState } from '../utils/localCaseStore';

const SAVE_DEBOUNCE_MS = 900;

function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function buildEvidenceTemplates(caseData: Case): EvidenceTemplate[] {
  const objective: EvidenceTemplate = {
    id: 'objective',
    title: 'Case Objective',
    detail: caseData.brief.objective,
    sourceType: 'objective',
    sourceRef: caseData.id,
  };

  const symptoms = caseData.brief.symptoms.map((symptom, index) => ({
    id: `symptom-${index}`,
    title: `Symptom ${index + 1}`,
    detail: symptom,
    sourceType: 'symptom' as const,
    sourceRef: caseData.id,
  }));

  const nodeClues = caseData.diagram.nodes
    .filter((node) => node.inspectable && node.inspectData)
    .map((node) => {
      const summaryParts: string[] = [];
      if (node.inspectData?.status) summaryParts.push(node.inspectData.status);
      if (node.inspectData?.logs?.[0]) summaryParts.push(node.inspectData.logs[0]);
      const detail = summaryParts.join(' | ') || node.label;
      return {
        id: `node-${node.id}`,
        title: node.inspectData?.title || node.label,
        detail,
        sourceType: 'node' as const,
        sourceRef: node.id,
      };
    });

  return [objective, ...symptoms, ...nodeClues];
}

function computeUnlock(state: Pick<InvestigationBoardState, 'evidence' | 'timelineEvents' | 'contradictions'>) {
  const linksCount = state.timelineEvents.reduce((sum, event) => sum + event.evidenceIds.length, 0);
  const resolvedContradictions = state.contradictions.filter((item) => item.resolved).length;
  const pendingConditions: string[] = [];

  if (state.evidence.length < 3) {
    pendingConditions.push('investigation.condition.collectEvidence');
  }
  if (state.timelineEvents.length < 2) {
    pendingConditions.push('investigation.condition.createEvents');
  }
  if (linksCount < 2) {
    pendingConditions.push('investigation.condition.linkEvidence');
  }
  if (resolvedContradictions < 1) {
    pendingConditions.push('investigation.condition.resolveContradiction');
  }

  return {
    unlockedFix: pendingConditions.length === 0,
    pendingConditions,
  };
}

function createDefaultState(caseData: Case): InvestigationBoardState {
  return {
    schemaVersion: 1,
    caseId: caseData.id,
    updatedAt: new Date().toISOString(),
    version: 1,
    evidence: [],
    timelineEvents: [],
    contradictions: [],
    unlock: {
      unlockedFix: false,
      pendingConditions: [
        'investigation.condition.collectEvidence',
        'investigation.condition.createEvents',
        'investigation.condition.linkEvidence',
        'investigation.condition.resolveContradiction',
      ],
    },
  };
}

function stampState(state: InvestigationBoardState): InvestigationBoardState {
  return {
    ...state,
    version: state.version + 1,
    updatedAt: new Date().toISOString(),
    unlock: computeUnlock(state),
  };
}

export function useInvestigationBoard(caseData: Case) {
  const templates = useMemo(() => buildEvidenceTemplates(caseData), [caseData]);
  const [state, setState] = useState<InvestigationBoardState>(() => {
    const loaded = loadCaseBoardState(caseData.id);
    return loaded ?? createDefaultState(caseData);
  });
  const [saveStatus, setSaveStatus] = useState<InvestigationSaveStatus>('idle');
  const [saveErrorReason, setSaveErrorReason] = useState<InvestigationSaveReason | null>(null);
  const saveTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const loaded = loadCaseBoardState(caseData.id);
    setState(loaded ?? createDefaultState(caseData));
    setSaveStatus('idle');
    setSaveErrorReason(null);
  }, [caseData.id]);

  const persist = useCallback((nextState: InvestigationBoardState) => {
    const result = saveCaseBoardState(nextState);
    if (result.ok) {
      setSaveStatus('saved');
      setSaveErrorReason(null);
    } else {
      setSaveStatus('error');
      setSaveErrorReason(result.reason);
    }
  }, []);

  useEffect(() => {
    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
    }
    setSaveStatus('saving');
    saveTimerRef.current = window.setTimeout(() => {
      persist(state);
    }, SAVE_DEBOUNCE_MS);

    return () => {
      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current);
      }
    };
  }, [state, persist]);

  const updateState = useCallback((updater: (current: InvestigationBoardState) => InvestigationBoardState) => {
    setState((current) => stampState(updater(current)));
  }, []);

  const collectEvidence = useCallback((templateId: string) => {
    const template = templates.find((item) => item.id === templateId);
    if (!template) return;

    updateState((current) => {
      if (current.evidence.some((item) => item.templateId === template.id)) {
        return current;
      }

      const evidence: EvidenceItem = {
        id: createId('evidence'),
        templateId: template.id,
        title: template.title,
        detail: template.detail,
        sourceType: template.sourceType,
        sourceRef: template.sourceRef,
        discoveredAt: new Date().toISOString(),
        note: '',
      };

      return {
        ...current,
        evidence: [...current.evidence, evidence],
      };
    });
  }, [templates, updateState]);

  const updateEvidenceNote = useCallback((evidenceId: string, note: string) => {
    updateState((current) => ({
      ...current,
      evidence: current.evidence.map((item) => (item.id === evidenceId ? { ...item, note } : item)),
    }));
  }, [updateState]);

  const createTimelineEvent = useCallback((title: string, timeLabel: string, confidence: EventConfidence) => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    updateState((current) => {
      const event: TimelineEvent = {
        id: createId('event'),
        title: trimmedTitle,
        timeLabel: timeLabel.trim(),
        confidence,
        note: '',
        evidenceIds: [],
      };
      return {
        ...current,
        timelineEvents: [...current.timelineEvents, event],
      };
    });
  }, [updateState]);

  const updateTimelineEvent = useCallback((
    eventId: string,
    updates: Partial<Pick<TimelineEvent, 'title' | 'timeLabel' | 'confidence' | 'note'>>,
  ) => {
    updateState((current) => ({
      ...current,
      timelineEvents: current.timelineEvents.map((event) =>
        event.id === eventId ? { ...event, ...updates } : event,
      ),
    }));
  }, [updateState]);

  const removeTimelineEvent = useCallback((eventId: string) => {
    updateState((current) => ({
      ...current,
      timelineEvents: current.timelineEvents.filter((event) => event.id !== eventId),
    }));
  }, [updateState]);

  const assignEvidenceToEvent = useCallback((evidenceId: string, eventId: string | null) => {
    updateState((current) => {
      const cleared = current.timelineEvents.map((event) => ({
        ...event,
        evidenceIds: event.evidenceIds.filter((id) => id !== evidenceId),
      }));

      if (!eventId) {
        return { ...current, timelineEvents: cleared };
      }

      return {
        ...current,
        timelineEvents: cleared.map((event) =>
          event.id === eventId ? { ...event, evidenceIds: [...event.evidenceIds, evidenceId] } : event,
        ),
      };
    });
  }, [updateState]);

  const createContradiction = useCallback((text: string, evidenceId?: string) => {
    const trimmedText = text.trim();
    if (!trimmedText) return;

    updateState((current) => {
      const contradiction: ContradictionItem = {
        id: createId('contradiction'),
        text: trimmedText,
        evidenceIds: evidenceId ? [evidenceId] : [],
        resolved: false,
        createdAt: new Date().toISOString(),
      };
      return {
        ...current,
        contradictions: [contradiction, ...current.contradictions],
      };
    });
  }, [updateState]);

  const toggleContradictionResolved = useCallback((contradictionId: string) => {
    updateState((current) => ({
      ...current,
      contradictions: current.contradictions.map((item) =>
        item.id === contradictionId ? { ...item, resolved: !item.resolved } : item,
      ),
    }));
  }, [updateState]);

  const removeContradiction = useCallback((contradictionId: string) => {
    updateState((current) => ({
      ...current,
      contradictions: current.contradictions.filter((item) => item.id !== contradictionId),
    }));
  }, [updateState]);

  const collectedTemplateIds = useMemo(
    () => new Set(state.evidence.map((item) => item.templateId)),
    [state.evidence],
  );

  const availableTemplates = useMemo(
    () => templates.filter((item) => !collectedTemplateIds.has(item.id)),
    [templates, collectedTemplateIds],
  );

  return {
    state,
    templates,
    availableTemplates,
    saveStatus,
    saveErrorReason,
    collectEvidence,
    updateEvidenceNote,
    createTimelineEvent,
    updateTimelineEvent,
    removeTimelineEvent,
    assignEvidenceToEvent,
    createContradiction,
    toggleContradictionResolved,
    removeContradiction,
  };
}
