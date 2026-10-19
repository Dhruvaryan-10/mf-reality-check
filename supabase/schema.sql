-- Run this once in Supabase: SQL Editor -> New query -> paste -> Run.
-- It creates the three tables the member features use. Row Level Security
-- makes sure every user can only ever see and change their own rows.

-- Funds a user has starred
create table if not exists public.watchlist (
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  fund_slug  text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, fund_slug)
);

-- SIP simulations a user saved
create table if not exists public.sip_plans (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  fund_slug  text not null,
  plan       text not null check (plan in ('direct', 'regular')),
  monthly    integer not null check (monthly between 100 and 10000000),
  start_year integer not null check (start_year between 2000 and 2100),
  created_at timestamptz not null default now()
);

-- Funds a user actually holds, for the portfolio cost check
create table if not exists public.holdings (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  fund_slug   text not null,
  plan        text not null check (plan in ('direct', 'regular')),
  amount      numeric not null check (amount > 0),
  invested_on date not null,
  created_at  timestamptz not null default now()
);

alter table public.watchlist enable row level security;
alter table public.sip_plans enable row level security;
alter table public.holdings  enable row level security;

-- One policy per table: you can read, add, change and delete only your own rows
drop policy if exists "own rows" on public.watchlist;
create policy "own rows" on public.watchlist
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own rows" on public.sip_plans;
create policy "own rows" on public.sip_plans
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own rows" on public.holdings;
create policy "own rows" on public.holdings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
