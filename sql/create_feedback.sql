-- Run this in your Supabase SQL editor at:
-- https://supabase.com/dashboard/project/hcpmdkkavtadgugrqohl/sql

-- ─── If the table already exists, just run the ALTER below ───
-- alter table public.feedback add column if not exists user_name text;
-- ─────────────────────────────────────────────────────────────

create table public.feedback (
  id            uuid        default gen_random_uuid() primary key,
  created_at    timestamptz default now() not null,
  user_name     text,
  user_email    text,
  current_pillar text,
  q1_rating     text,    -- "Yes" | "Partially" | "No"
  q1_comment    text,
  q2_rating     text,    -- "Yes" | "Partially" | "No"
  q2_comment    text,
  q3_missing    text,
  q4_incorrect  text,
  q5_useful_for text,
  other_comments text
);

alter table public.feedback enable row level security;

-- Anyone (including unauthenticated) can submit feedback
create policy "Anyone can submit feedback"
  on public.feedback
  for insert
  with check (true);

-- Only authenticated users can read feedback (you + team)
create policy "Authenticated can read feedback"
  on public.feedback
  for select
  using (auth.role() = 'authenticated');
