-- Oreste Utensils — customer testimonials ("What our clients say").
-- Run after 0001_init.sql.

create table if not exists public.ou_testimonials (
  id          uuid primary key default gen_random_uuid(),
  client_name text not null,
  business    text,
  quote       text not null,
  photo       text,
  rating      integer not null default 5 check (rating between 1 and 5),
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists ou_testimonials_sort_idx on public.ou_testimonials (sort_order);

alter table public.ou_testimonials enable row level security;

-- Public can read testimonials; only authenticated admins can change them.
create policy "testimonials are public" on public.ou_testimonials
  for select using (true);
create policy "admins manage testimonials" on public.ou_testimonials
  for all to authenticated using (true) with check (true);
