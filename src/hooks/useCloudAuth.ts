import { useCallback, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Profile } from '../types/account';

interface CloudAuthState {
  /** False when no Supabase env vars are set — account UI must hide entirely. */
  enabled: boolean;
  session: Session | null;
  profile: Profile | null;
  /** Signed in, but no `profiles` row yet — show the handle picker. */
  needsHandle: boolean;
  loading: boolean;
  error: string | null;
}

/**
 * Session + profile bookkeeping for FEATURE-04. Kept separate from
 * useCloudSync (the game-state merge/push engine) so auth state can be
 * consumed by UI (sign-in button, handle picker) without pulling in the
 * sync machinery.
 */
export function useCloudAuth() {
  const [state, setState] = useState<CloudAuthState>({
    enabled: isSupabaseConfigured,
    session: null,
    profile: null,
    needsHandle: false,
    loading: isSupabaseConfigured,
    error: null,
  });

  const fetchProfile = useCallback(async (userId: string) => {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('profiles')
      .select('id, handle, created_at')
      .eq('id', userId)
      .maybeSingle();
    if (error) {
      setState((s) => ({ ...s, error: error.message }));
      return null;
    }
    if (!data) return null;
    return { id: data.id, handle: data.handle, createdAt: data.created_at } satisfies Profile;
  }, []);

  useEffect(() => {
    if (!supabase) {
      setState((s) => ({ ...s, loading: false }));
      return;
    }

    let cancelled = false;

    supabase.auth.getSession().then(async ({ data }) => {
      if (cancelled) return;
      const session = data.session;
      const profile = session ? await fetchProfile(session.user.id) : null;
      if (cancelled) return;
      setState((s) => ({
        ...s,
        session,
        profile,
        needsHandle: Boolean(session) && !profile,
        loading: false,
      }));
    });

    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const profile = session ? await fetchProfile(session.user.id) : null;
      if (cancelled) return;
      setState((s) => ({
        ...s,
        session,
        profile,
        needsHandle: Boolean(session) && !profile,
        loading: false,
      }));
    });

    return () => {
      cancelled = true;
      subscription.subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signInWithGithub = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: window.location.origin },
    });
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setState((s) => ({ ...s, session: null, profile: null, needsHandle: false }));
  }, []);

  const claimHandle = useCallback(
    async (handle: string): Promise<{ error: string | null }> => {
      if (!supabase || !state.session) return { error: 'not-signed-in' };
      const { data, error } = await supabase
        .from('profiles')
        .insert({ id: state.session.user.id, handle })
        .select('id, handle, created_at')
        .single();
      if (error) {
        return { error: error.message };
      }
      setState((s) => ({
        ...s,
        profile: { id: data.id, handle: data.handle, createdAt: data.created_at },
        needsHandle: false,
      }));
      return { error: null };
    },
    [state.session],
  );

  return { ...state, signInWithGithub, signOut, claimHandle };
}
