-- Oreste Utensils — contact-form messages.
create table if not exists public.ou_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  phone      text,
  message    text not null,
  status     text not null default 'new' check (status in ('new','read','replied')),
  created_at timestamptz not null default now()
);

create index if not exists ou_messages_status_idx on public.ou_messages (status);
create index if not exists ou_messages_created_idx on public.ou_messages (created_at desc);

alter table public.ou_messages enable row level security;

-- Inserts happen server-side with the service-role key; no public read.
create policy "admins read messages" on public.ou_messages
  for select to authenticated using (true);
create policy "admins update messages" on public.ou_messages
  for update to authenticated using (true) with check (true);
create policy "admins delete messages" on public.ou_messages
  for delete to authenticated using (true);
