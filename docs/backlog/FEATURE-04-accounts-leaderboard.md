# FEATURE-04: Accounts, cross-device sync, and drill leaderboard (Supabase free tier)

**Audience fit:** Interview preppers study across laptop + phone; localStorage-only progress dies with the browser. Percentile comparison ("faster than 78% of detectives today") is strong motivation for a competitive audience.
**Effort:** ~1–2 weeks
**Infra:** Supabase free tier (Postgres + Auth + RLS). The one backlog item requiring a backend — owner approved light free-tier infra.
**Order dependency:** leaderboard needs FEATURE-02 (drill results) and ISSUE-02 (legitimate scores). Sync alone can ship first.

## Non-negotiable design principles

1. **Anonymous-first:** the game stays fully playable with zero account. Sign-in is an upsell for sync + leaderboard, never a wall.
2. **localStorage remains the source of truth** for gameplay; the backend is a mirror. Offline/signed-out behavior is exactly today's behavior.
3. **Minimal PII:** GitHub OAuth (natural for this audience — recommended default) or magic-link email. Store only the auth identity + a chosen display handle.

## Backend schema (SQL migration, run in Supabase)

```sql
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  handle text unique not null check (char_length(handle) between 3 and 20),
  created_at timestamptz not null default now()
);

create table progress_sync (
  user_id uuid primary key references profiles(id) on delete cascade,
  game_state jsonb not null,          -- the whole sdpd-game-state blob
  drill_state jsonb,                  -- sdpd-drill-state blob (FEATURE-02)
  schema_version int not null,
  updated_at timestamptz not null default now()
);

create table drill_results (
  user_id uuid references profiles(id) on delete cascade,
  drill_day int not null,             -- dayIndex from FEATURE-02
  case_id text not null,
  stars int not null check (stars between 0 and 6),
  seconds int not null check (seconds between 1 and 86400),
  created_at timestamptz not null default now(),
  primary key (user_id, drill_day)    -- one result per user per day, enforced server-side
);
```

**Enable RLS on all three tables.** Policies:
- `profiles`: users insert/update only their own row; `handle` readable by all (leaderboard display).
- `progress_sync`: select/insert/update only where `auth.uid() = user_id`. No public read.
- `drill_results`: insert only own rows (PK enforces once/day); select allowed to authenticated users **via a view** that hides user ids:

```sql
create view daily_leaderboard as
select p.handle, d.drill_day, d.stars, d.seconds
from drill_results d join profiles p on p.id = d.user_id;
-- query: where drill_day = $1 order by stars desc, seconds asc limit 100
```

## Client implementation

1. `npm i @supabase/supabase-js`. Create `src/lib/supabase.ts` reading `import.meta.env.VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`; add `.env.example`. The anon key is public by design — RLS is the security boundary. **Never put service-role keys in the client.**
2. **Auth UI:** "Sign in" item in the header settings popover (UX-03 §5) → `supabase.auth.signInWithOAuth({ provider: 'github' })`; handle-picker dialog on first sign-in (insert into `profiles`).
3. **Sync engine** — `src/hooks/useCloudSync.ts`:
   - On sign-in: fetch `progress_sync`; **merge, don't overwrite** — union of the `progress` maps; per case keep the entry with more progress (completed beats not, then higher attempts); recompute derived fields (rank — ISSUE-03 already makes the client derive it). Write the merged result to both localStorage and the server.
   - Thereafter: debounce-push (~5s) whenever state changes while signed in. Simplest wiring: a Zustand `subscribe` on the store rather than touching every action.
   - Conflict policy after initial merge: last-write-wins per blob — acceptable for a single-player game; document in code.
4. **Leaderboard UI:** on the FEATURE-02 post-play screen, a "Today's precinct ranking" panel: top 100 (handle, stars, time) + your row and percentile (`count(better) / count(all)` — one extra query). Signed-out players see the panel with their local score and a sign-in CTA.
5. **Drill submission:** on completion while signed in, insert into `drill_results`. Client-computed scores are fine for a friendly leaderboard; note in code that anti-cheat is explicitly out of scope.

## Failure modes to handle

- Supabase unreachable → silent degrade to local-only (console log + tiny "sync offline" note in settings).
- Sign-out → keep local state, stop syncing.
- `schema_version` mismatch between devices → an older client must not clobber newer blobs: if server version > local, skip pushes and surface "update to sync".

## Verification

1. Two browsers: complete a case on A → appears on B after sign-in; complete different cases on both offline → union after both sync.
2. RLS: with user B's JWT, selecting A's `progress_sync` row returns nothing.
3. Leaderboard orders stars-desc/seconds-asc; percentile correct on a 3-account fixture.
4. Network killed → game fully playable; nothing crashes.

## Acceptance criteria

- [ ] Game unchanged when signed out; zero network calls until sign-in.
- [ ] GitHub OAuth + handle selection working end-to-end.
- [ ] Two-device merge verified with no progress loss.
- [ ] RLS verified: no cross-user sync reads; one drill result per user/day via PK.
- [ ] Daily leaderboard with percentile; signed-out CTA state.
- [ ] `.env.example` committed; no secrets in the repo.
