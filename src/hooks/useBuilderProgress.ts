import { create } from 'zustand';
import type { BuilderChallengeState, BuilderProgressState, PlacedComponent, PlacedConnection } from '../types/builder';
import { BUILDER_SCHEMA_VERSION, loadBuilderState, saveBuilderState } from '../utils/localBuilderStore';

const defaultState: BuilderProgressState = {
  schemaVersion: BUILDER_SCHEMA_VERSION,
  challenges: {},
};

const emptyChallengeState: BuilderChallengeState = {
  components: [],
  connections: [],
  completed: false,
  attempts: 0,
};

interface BuilderProgressStore extends BuilderProgressState {
  getChallengeState: (challengeId: string) => BuilderChallengeState;
  saveDesign: (challengeId: string, components: PlacedComponent[], connections: PlacedConnection[]) => void;
  submitDesign: (
    challengeId: string,
    components: PlacedComponent[],
    connections: PlacedConnection[],
    passed: boolean,
  ) => void;
  resetDesign: (challengeId: string) => void;
  completedCount: () => number;
}

const persisted = loadBuilderState(defaultState);

export const useBuilderProgress = create<BuilderProgressStore>((set, get) => ({
  ...defaultState,
  ...persisted,

  getChallengeState: (challengeId) => get().challenges[challengeId] ?? emptyChallengeState,

  saveDesign: (challengeId, components, connections) => {
    const current = get().challenges[challengeId] ?? emptyChallengeState;
    const challenges = {
      ...get().challenges,
      [challengeId]: { ...current, components, connections },
    };
    set({ challenges });
    saveBuilderState({ schemaVersion: BUILDER_SCHEMA_VERSION, challenges });
  },

  submitDesign: (challengeId, components, connections, passed) => {
    const current = get().challenges[challengeId] ?? emptyChallengeState;
    const challenges = {
      ...get().challenges,
      [challengeId]: {
        components,
        connections,
        completed: current.completed || passed,
        attempts: current.attempts + 1,
      },
    };
    set({ challenges });
    saveBuilderState({ schemaVersion: BUILDER_SCHEMA_VERSION, challenges });
  },

  resetDesign: (challengeId) => {
    const challenges = { ...get().challenges };
    delete challenges[challengeId];
    set({ challenges });
    saveBuilderState({ schemaVersion: BUILDER_SCHEMA_VERSION, challenges });
  },

  completedCount: () => Object.values(get().challenges).filter((c) => c.completed).length,
}));
