-- FEATURE-04: Accounts, cross-device sync, and daily-drill leaderboard
--
-- Run this in the Supabase SQL editor (or `supabase db push` if you use the CLI)
-- against a fresh Supabase free-tier project. See .env.example and the "Cloud
-- Sync & Leaderboard Setup" section of README.md for the full activation steps.
--
-- Design notes (see docs/backlog/FEATURE-04-accounts-leaderboard.md for the
-- full spec this file implements):
--   * localStorage remains the source of truth for gameplay; these tables are
--     a mirror used for cross-device sync and the opt-in daily leaderboard.
--   * RLS is the actual security boundary — the anon key shipped to the client
--     is public by design. Never put a service-role key in client code.
--   * Client-computed drill scores are trusted (no anti-cheat). Fine for a
--     friendly leaderboard; not fine for anything with stakes.

-- ── profiles ────────────────────────────────────────────────────────────
-- One row per authenticated user. `handle` is the public display name shown
-- on the leaderboard; nothing else here is public.
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  handle text unique not null check (char_length(handle) between 3 and 20),
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "profiles are publicly readable"
  on profiles for select
  using (true);

create policy "users insert their own profile"
  on profiles for insert
  with check (auth.uid() = id);

create policy "users update their own profile"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ── progress_sync ───────────────────────────────────────────────────────
-- Mirror of the client's localStorage blobs. One row per user; overwritten
-- wholesale on every sync push (last-write-wins, documented in
-- src/hooks/useCloudSync.ts).
create table if not exists progress_sync (
  user_id uuid primary key references profiles(id) on delete cascade,
  game_state jsonb not null,          -- the whole sdpd-game-state blob
  drill_state jsonb,                  -- sdpd-drill-state blob (FEATURE-02)
  schema_version int not null,
  updated_at timestamptz not null default now()
);

alter table progress_sync enable row level security;

create policy "users read only their own progress"
  on progress_sync for select
  using (auth.uid() = user_id);

create policy "users insert only their own progress"
  on progress_sync for insert
  with check (auth.uid() = user_id);

create policy "users update only their own progress"
  on progress_sync for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── drill_results ───────────────────────────────────────────────────────
-- One row per user per daily-drill day (FEATURE-02). The primary key
-- enforces "one attempt per day" server-side, independent of the client.
create table if not exists drill_results (
  user_id uuid references profiles(id) on delete cascade,
  drill_day int not null,             -- dayIndex from FEATURE-02
  case_id text not null,
  stars int not null check (stars between 0 and 6),
  seconds int not null check (seconds between 1 and 86400),
  created_at timestamptz not null default now(),
  primary key (user_id, drill_day)
);

alter table drill_results enable row level security;

-- No direct select policy: results are only ever read through the
-- daily_leaderboard view below, which hides user ids. Only inserting your
-- own row is allowed; there is intentionally no update/delete policy.
create policy "users insert only their own drill result"
  on drill_results for insert
  with check (auth.uid() = user_id);

-- ── daily_leaderboard view ─────────────────────────────────────────────
-- Public, read-only, de-identified leaderboard. Joins in the handle and
-- drops user_id entirely so RLS on drill_results never needs to grant
-- cross-user select access.
create view daily_leaderboard as
select p.handle, d.drill_day, d.stars, d.seconds
from drill_results d
join profiles p on p.id = d.user_id;

-- Views created via the SQL editor are owned by a privileged role and run
-- with that owner's rights against the underlying tables (Postgres' normal
-- view behavior, not security_invoker) — this is what lets the view read
-- every user's drill_results row despite drill_results having no select
-- policy. `authenticated` still needs an explicit grant on the view itself:
grant select on daily_leaderboard to authenticated;

-- Example query (client-side, see src/lib/leaderboard.ts):
--   select * from daily_leaderboard
--   where drill_day = $1
--   order by stars desc, seconds asc
--   limit 100;
