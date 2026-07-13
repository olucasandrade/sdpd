/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Supabase project URL. Optional — omit to run fully offline (FEATURE-04). */
  readonly VITE_SUPABASE_URL?: string;
  /** Supabase anon (public) key. Optional — omit to run fully offline (FEATURE-04). */
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
