const STORAGE_KEY = 'sdpd-game-state';

export function loadState<T>(defaultValue: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch {
    return defaultValue;
  }
}

export function saveState<T>(state: T): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage full or unavailable
  }
}
