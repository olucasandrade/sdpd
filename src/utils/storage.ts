const STORAGE_KEY = 'sdpd-game-state';
const SCHEMA_VERSION = 2;

export function loadState<T>(defaultValue: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultValue;
    const parsed = JSON.parse(raw);
    // v1 blobs have no schemaVersion — they are shape-compatible today, accept them
    if (parsed.schemaVersion !== undefined && parsed.schemaVersion !== SCHEMA_VERSION) {
      return defaultValue; // replace with real migrations when v3 exists
    }
    const state = { ...parsed };
    delete state.schemaVersion;
    return { ...defaultValue, ...state } as T;
  } catch {
    return defaultValue;
  }
}

export function saveState<T>(state: T): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, schemaVersion: SCHEMA_VERSION }));
  } catch {
    // localStorage full or unavailable
  }
}
