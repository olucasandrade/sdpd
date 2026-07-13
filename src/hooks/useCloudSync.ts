import { useEffect, useRef, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { useGameState } from './useGameState';
import type { GameState, CaseProgress, Rank } from '../types/game';
import { RANKS } from '../types/game';
import { SYNC_SCHEMA_VERSION } from '../types/account';
import type { SyncStatus } from '../types/account';

const DRILL_STORAGE_KEY = 'sdpd-drill-state';
const PUSH_DEBOUNCE_MS = 5000;

function extractGameState(state: GameState): GameState {
  // Explicit allow-list — the zustand store also carries action functions,
  // which must never be serialized to the server.
  return {
    currentCaseId: state.currentCaseId,
    progress: state.progress,
    rank: state.rank,
    completedCases: state.completedCases,
    guideOpen: state.guideOpen,
    locale: state.locale,
    pendingRankUp: state.pendingRankUp,
    tutorialSeen: state.tutorialSeen,
  };
}

function readLocalDrillState(): unknown | null {
  try {
    const raw = localStorage.getItem(DRILL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function deriveRank(completedCases: number): Rank {
  return [...RANKS].reverse().find((r) => completedCases >= r.requiredCases) ?? RANKS[0];
}

/** completed beats not-completed, then higher attempt count wins (per FEATURE-04 spec). */
function pickBetterProgress(a: CaseProgress, b: CaseProgress): CaseProgress {
  if (a.completed !== b.completed) return a.completed ? a : b;
  const aAttempts = a.rootCauseAttempts + a.fixAttempts;
  const bAttempts = b.rootCauseAttempts + b.fixAttempts;
  return aAttempts >= bAttempts ? a : b;
}

/** Union of two progress maps, keeping the more-advanced entry per case. */
function mergeProgress(
  local: Record<string, CaseProgress>,
  remote: Record<string, CaseProgress>,
): Record<string, CaseProgress> {
  const merged: Record<string, CaseProgress> = { ...remote };
  for (const [caseId, localEntry] of Object.entries(local)) {
    const remoteEntry = merged[caseId];
    merged[caseId] = remoteEntry ? pickBetterProgress(localEntry, remoteEntry) : localEntry;
  }
  return merged;
}

/**
 * Sync engine for FEATURE-04. localStorage stays the source of truth for
 * gameplay (per the doc's non-negotiable principle #2) — this hook only
 * mirrors it to Supabase when a user is signed in, merges on first sign-in,
 * and silently degrades to local-only on any failure.
 *
 * Conflict policy: last-write-wins per blob after the initial merge. Fine
 * for a single-player game — there's no field-level reconciliation beyond
 * the one-time progress union performed right after sign-in.
 */
export function useCloudSync(session: Session | null, hasProfile: boolean): { status: SyncStatus } {
  const [status, setStatus] = useState<SyncStatus>(supabase ? 'signed-out' : 'disabled');
  const mergedForUser = useRef<string | null>(null);
  const pushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const staleRef = useRef(false);

  // Initial merge on sign-in (once per session/user). Waits for a claimed
  // handle: progress_sync.user_id has a FK to profiles(id), so syncing
  // before the handle-picker dialog completes would violate it.
  useEffect(() => {
    if (!supabase) {
      setStatus('disabled');
      return;
    }
    if (!session) {
      setStatus('signed-out');
      mergedForUser.current = null;
      staleRef.current = false;
      return;
    }
    if (!hasProfile) {
      setStatus('needs-handle');
      return;
    }
    if (mergedForUser.current === session.user.id) return;

    let cancelled = false;
    setStatus('syncing');

    (async () => {
      const { data, error } = await supabase!
        .from('progress_sync')
        .select('user_id, game_state, drill_state, schema_version, updated_at')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        setStatus('offline');
        console.info('[sdpd] cloud sync unavailable, staying local-only:', error.message);
        return;
      }

      if (data && data.schema_version > SYNC_SCHEMA_VERSION) {
        staleRef.current = true;
        setStatus('stale');
        return;
      }

      const localState = extractGameState(useGameState.getState());

      if (!data) {
        // First sync ever for this account: push local state as-is.
        const { error: upsertError } = await supabase!.from('progress_sync').upsert({
          user_id: session.user.id,
          game_state: localState,
          drill_state: readLocalDrillState(),
          schema_version: SYNC_SCHEMA_VERSION,
          updated_at: new Date().toISOString(),
        });
        if (cancelled) return;
        setStatus(upsertError ? 'offline' : 'synced');
        mergedForUser.current = session.user.id;
        return;
      }

      // Merge, don't overwrite: union of progress maps, recompute derived fields.
      const mergedProgress = mergeProgress(localState.progress, data.game_state.progress ?? {});
      const completedCases = Object.values(mergedProgress).filter((p) => p.completed).length;
      const merged: GameState = {
        ...localState,
        progress: mergedProgress,
        completedCases,
        rank: deriveRank(completedCases),
      };

      useGameState.setState(merged);
      try {
        localStorage.setItem('sdpd-game-state', JSON.stringify(merged));
      } catch {
        // localStorage full or unavailable — merged state still lives in memory.
      }

      const { error: upsertError } = await supabase!.from('progress_sync').upsert({
        user_id: session.user.id,
        game_state: merged,
        drill_state: data.drill_state ?? readLocalDrillState(),
        schema_version: SYNC_SCHEMA_VERSION,
        updated_at: new Date().toISOString(),
      });
      if (cancelled) return;
      setStatus(upsertError ? 'offline' : 'synced');
      mergedForUser.current = session.user.id;
    })();

    return () => {
      cancelled = true;
    };
  }, [session, hasProfile]);

  // Debounced push whenever the store changes while signed in.
  useEffect(() => {
    if (!supabase || !session || !hasProfile) return;

    const push = async () => {
      if (staleRef.current) return; // older client must not clobber a newer blob
      const localState = extractGameState(useGameState.getState());
      const { error } = await supabase!.from('progress_sync').upsert({
        user_id: session.user.id,
        game_state: localState,
        drill_state: readLocalDrillState(),
        schema_version: SYNC_SCHEMA_VERSION,
        updated_at: new Date().toISOString(),
      });
      setStatus(error ? 'offline' : 'synced');
    };

    const unsubscribe = useGameState.subscribe(() => {
      if (pushTimer.current) clearTimeout(pushTimer.current);
      pushTimer.current = setTimeout(push, PUSH_DEBOUNCE_MS);
    });

    return () => {
      unsubscribe();
      if (pushTimer.current) clearTimeout(pushTimer.current);
    };
  }, [session, hasProfile]);

  return { status };
}
