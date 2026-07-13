import type { GameState } from './game';

/** Row shape of the `profiles` table (see supabase/migrations). */
export interface Profile {
  id: string;
  handle: string;
  createdAt: string;
}

/**
 * Version of the *sync payload shape* pushed to `progress_sync.schema_version`.
 * Bump only when the fields synced here change incompatibly. This is
 * intentionally independent from any future localStorage schema-version
 * field on GameState itself (ISSUE-03) — it versions the wire format between
 * client and server, not the local persistence format.
 */
export const SYNC_SCHEMA_VERSION = 1;

/** Row shape of the `progress_sync` table. */
export interface ProgressSyncRow {
  user_id: string;
  game_state: GameState;
  drill_state: unknown | null;
  schema_version: number;
  updated_at: string;
}

/** A single daily-drill result, ready to insert into `drill_results`. */
export interface DrillResultInput {
  drillDay: number;
  caseId: string;
  stars: number;
  seconds: number;
}

/** One row of the public, de-identified `daily_leaderboard` view. */
export interface LeaderboardEntry {
  handle: string;
  drill_day: number;
  stars: number;
  seconds: number;
}

export type SyncStatus =
  | 'disabled' // no Supabase env vars — feature hidden
  | 'signed-out'
  | 'needs-handle' // signed in, no profile row yet
  | 'syncing'
  | 'synced'
  | 'offline' // Supabase configured but unreachable — silent degrade to local-only
  | 'stale'; // server schema_version is newer than this client understands
