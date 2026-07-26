-- Oreste Utensils — B2B / wholesale trade enquiries.
-- Run after 0001_init.sql.

create table if not exists public.ou_leads (
  id            uuid primary key default gen_random_uuid(),
  business_name text not null,
  contact_name  text not null,
  phone         text not null,
  business_type text not null,
  message       text,
  status        text not null default 'new'
                  check (status in ('new','contacted','quoted','won','lost')),
  created_at    timestamptz not null default now()
);

create index if not exists ou_leads_status_idx on public.ou_leads (status);
create index if not exists ou_leads_created_idx on public.ou_leads (created_at desc);

alter table public.ou_leads enable row level security;

-- Inserts happen server-side with the service-role key (bypasses RLS), so no
-- public policy is granted — the anon role can never read trade enquiries.
create policy "admins read leads" on public.ou_leads
  for select to authenticated using (true);
create policy "admins update leads" on public.ou_leads
  for update to authenticated using (true) with check (true);
create policy "admins delete leads" on public.ou_leads
  for delete to authenticated using (true);
