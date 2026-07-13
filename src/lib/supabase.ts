import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Accounts, cross-device sync, and the daily-drill leaderboard are entirely
 * opt-in (FEATURE-04). The game must stay fully playable offline/anonymous
 * with zero network calls when these env vars are absent — see
 * docs/backlog/FEATURE-04-accounts-leaderboard.md, principle 1.
 *
 * The anon key is public by design; Supabase Row Level Security is the real
 * security boundary. Never add a service-role key here.
 */
export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null =
  url && anonKey
    ? createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      })
    : null;

if (!isSupabaseConfigured && import.meta.env.DEV) {
  console.info(
    '[sdpd] Supabase env vars not set — cloud sync and the leaderboard are disabled. The game runs fully offline. See .env.example.',
  );
}
