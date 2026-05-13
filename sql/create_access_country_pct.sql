create table if not exists public.access_country_pct (
  country_code   text primary key,
  country_name   text not null,
  national_pop   bigint,         -- col P: total national population tracked
  total_at_risk  bigint,         -- D+E+F+G: all 4 risk groups, both sexes
  pct_at_risk    numeric(8,6),   -- (D+E) / national_pop = col Q (HIGH RISK only)
  female_at_risk bigint,         -- H+I+J+K: all 4 risk groups, female
  male_at_risk   bigint,         -- L+M+N+O: all 4 risk groups, male
  year           integer default 2024
);

alter table public.access_country_pct enable row level security;
create policy "Allow anon reads" on public.access_country_pct for select using (true);
