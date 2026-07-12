# ISSUE-03: Game-state persistence flaws (stale ranks, reset wipes language, no schema versioning)

**Severity:** Medium
**Type:** Bug / Data integrity
**Effort:** ~2–3 hours
**Files touched:** `src/hooks/useGameState.ts`, `src/utils/storage.ts`, `src/types/game.ts`

## Background

Global game state is a Zustand store (`src/hooks/useGameState.ts`) persisted to `localStorage` under the key `sdpd-game-state` via `src/utils/storage.ts` (`loadState` / `saveState`). The whole `GameState` object is serialized: `currentCaseId`, `progress`, `rank`, `completedCases`, `guideOpen`, `locale`.

## Problems

### 3a. The `rank` object is persisted, so rank definitions can go stale

`rank` is stored as a full `Rank` object (`{ id, title, requiredCases }`) and rehydrated verbatim (`...persisted` at line ~30 of `useGameState.ts`). If `RANKS` in `src/types/game.ts` is ever renamed, rebalanced, or extended, returning players keep the old object until they next complete a case. The rank is *derived data* — it should never be trusted from storage.

**Fix:** Compute rank from `completedCases` at load time (and compute `completedCases` from `progress`, since it's also derived):

```ts
function deriveRank(completedCases: number): Rank {
  return [...RANKS].reverse().find((r) => completedCases >= r.requiredCases) ?? RANKS[0];
}

function deriveCompleted(progress: Record<string, CaseProgress>): number {
  return Object.values(progress).filter((p) => p.completed).length;
}

const persisted = loadState<GameState>(defaultState);
const completedCases = deriveCompleted(persisted.progress ?? {});
const hydrated: GameState = {
  ...defaultState,
  ...persisted,
  completedCases,
  rank: deriveRank(completedCases),
};
```

Then spread `hydrated` in `create(...)` instead of `...defaultState, ...persisted`.

### 3b. `resetProgress()` wipes the user's language and UI preferences

`resetProgress` (line ~95) sets the store back to `defaultState`, which includes `locale: 'en'` and `guideOpen: false`. A pt-BR user who resets progress is silently switched to English.

**Fix:**

```ts
resetProgress: () => {
  const { locale, guideOpen } = get();
  const next = { ...defaultState, locale, guideOpen };
  set(next);
  saveState(next);
},
```

Note: nothing currently calls `resetProgress` from the UI (verify: `grep -rn "resetProgress" src/`). Either expose it (a "Reset progress" control — see `UX-03-game-flow.md`) or delete it. Recommended: expose it; players want replayability.

### 3c. No schema version on the persisted blob

`loadState` blindly `JSON.parse`s whatever is under `sdpd-game-state` and returns it raw (it does not even merge over defaults, so newly added fields hydrate as `undefined` for returning players). Any future change to the `GameState` shape risks runtime errors with no migration path. Contrast with `src/utils/localCaseStore.ts`, which already does this correctly (`SCHEMA_VERSION` constant, a type-guard validator, versioned keys).

**Fix** in `src/utils/storage.ts`:

```ts
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
    const { schemaVersion: _ignored, ...state } = parsed;
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
```

### 3d. Unlock logic is coupled to the case-id string format

`isCaseUnlocked` (line ~78) reconstructs the previous case's id with `` `case-${String(caseNumber - 1).padStart(2, '0')}` ``. `CaseSuccess.tsx` (line 25) duplicates the same construction for "next case". This exact pattern already caused a shipped bug (commit `4d6dd88 "Fix: correct case-ids for questions with two digits"`). Centralize it:

```ts
// src/utils/caseIds.ts
export function caseIdForNumber(n: number): string {
  return `case-${String(n).padStart(2, '0')}`;
}
```

Use it in both `useGameState.ts` and `CaseSuccess.tsx`.

### 3e. `currentCaseId` / `setCurrentCase` are dead

`setCurrentCase` is defined in the store but never called anywhere in `src/` (verify: `grep -rn "setCurrentCase" src/`), and `currentCaseId` is never read. Either delete both, or (better — pairs with `UX-03-game-flow.md`) call `setCurrentCase(caseId)` from a `useEffect` in `CasePage.tsx` and add a "Continue where you left off" button on the home hero that navigates to `currentCaseId`.

## Testing

There are currently **zero tests** in the repo; this module is the natural first target. Add Vitest (`npm i -D vitest`), create `src/hooks/useGameState.test.ts` + `src/utils/storage.test.ts` covering:

- rank derivation at each threshold (0, 1, 5, 10, 17, 25, 33 → rookie…chief),
- `resetProgress` preserves locale,
- `loadState` returns defaults on corrupt JSON and on unknown `schemaVersion`,
- `isCaseUnlocked` for case 1 (always true), case N with/without N−1 completed, and the two-digit boundary (case-09 → case-10).

Add `"test": "vitest run"` to `package.json` scripts and a `npm test` step to `.github/workflows/ci-cd.yml` (after ISSUE-01 makes CI run at all). Vitest needs `environment: 'jsdom'` (or `happy-dom`) for localStorage tests; alternatively stub `localStorage` manually in setup.

## Acceptance criteria

- [ ] Rank is derived from progress on every load, never trusted from storage.
- [ ] `resetProgress` preserves `locale` and `guideOpen`.
- [ ] Persisted blob carries `schemaVersion`; unknown versions fall back safely; hydration merges over defaults.
- [ ] Case-id construction exists in exactly one utility function used by both call sites.
- [ ] `currentCaseId` is either removed or actually used.
- [ ] Vitest wired up, tests above passing, running in CI.
