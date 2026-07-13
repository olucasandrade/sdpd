import { createContext, useContext, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { useCloudAuth } from '../hooks/useCloudAuth';
import { useCloudSync } from '../hooks/useCloudSync';
import type { Profile, SyncStatus } from '../types/account';

interface CloudAccountContextValue {
  enabled: boolean;
  session: Session | null;
  profile: Profile | null;
  needsHandle: boolean;
  loading: boolean;
  error: string | null;
  status: SyncStatus;
  signInWithGithub: () => Promise<void>;
  signOut: () => Promise<void>;
  claimHandle: (handle: string) => Promise<{ error: string | null }>;
}

const CloudAccountContext = createContext<CloudAccountContextValue | null>(null);

/**
 * Mounted once in GameLayout so auth state and the sync engine each run a
 * single subscription for the whole app. When Supabase env vars are absent
 * every value here is inert (`enabled: false`, `status: 'disabled'`) — no
 * network calls happen (FEATURE-04 principle #1).
 */
export function CloudAccountProvider({ children }: { children: ReactNode }) {
  const auth = useCloudAuth();
  const { status } = useCloudSync(auth.session, Boolean(auth.profile));
  const effectiveStatus: SyncStatus = auth.needsHandle ? 'needs-handle' : status;

  return (
    <CloudAccountContext.Provider value={{ ...auth, status: effectiveStatus }}>
      {children}
    </CloudAccountContext.Provider>
  );
}

export function useCloudAccount(): CloudAccountContextValue {
  const ctx = useContext(CloudAccountContext);
  if (!ctx) {
    throw new Error('useCloudAccount must be used within a CloudAccountProvider');
  }
  return ctx;
}
