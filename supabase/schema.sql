-- Run once in the Supabase SQL Editor.
-- Three tables, one row-per-user (or append-only) each, all locked down with
-- Row Level Security so a user can only ever see/write their own data.

create table public.workspace_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  current_step text,
  answers jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Mentor settings only -- deliberately no api_key column. The BYOK key stays
-- in localStorage on the user's own device and is never sent to Supabase.
create table public.mentor_config (
  user_id uuid primary key references auth.users(id) on delete cascade,
  engine text,
  provider text,
  byok_endpoint text,
  runtime text,
  local_model text,
  updated_at timestamptz not null default now()
);

create table public.scenario_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scenario_id text not null,
  status text not null default 'in_progress',
  score numeric,
  submitted_at timestamptz,
  created_at timestamptz not null default now()
);
create index scenario_attempts_user_idx on public.scenario_attempts(user_id, submitted_at desc);

alter table public.workspace_progress enable row level security;
alter table public.mentor_config enable row level security;
alter table public.scenario_attempts enable row level security;

create policy "own progress" on public.workspace_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own mentor config" on public.mentor_config
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own scenario attempts" on public.scenario_attempts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
