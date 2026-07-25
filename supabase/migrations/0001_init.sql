-- Oreste Utensils — initial schema, RLS policies and storage.
-- Apply in the Supabase SQL editor (or via the Supabase CLI).
-- Tables are prefixed `ou_` to stay isolated in a shared project.

-- ─────────────────────────────────────────────────────────────
-- Extensions
-- ─────────────────────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────
-- Categories
-- ─────────────────────────────────────────────────────────────
create table if not exists public.ou_categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  description text not null default '',
  intro       text not null default '',
  image       text not null default '',
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- Products
-- ─────────────────────────────────────────────────────────────
create table if not exists public.ou_products (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  slug              text not null unique,
  category_slug     text not null references public.ou_categories (slug) on update cascade,
  price_rwf         integer not null check (price_rwf >= 0),
  short_description text not null default '',
  description       text not null default '',
  specs             jsonb not null default '{}'::jsonb,
  images            text[] not null default '{}',
  featured          boolean not null default false,
  in_stock          boolean not null default true,
  created_at        timestamptz not null default now()
);

create index if not exists ou_products_category_idx on public.ou_products (category_slug);
create index if not exists ou_products_featured_idx on public.ou_products (featured) where featured;

-- ─────────────────────────────────────────────────────────────
-- Orders
-- ─────────────────────────────────────────────────────────────
create table if not exists public.ou_orders (
  id            uuid primary key default gen_random_uuid(),
  customer_name text not null,
  phone         text not null,
  fulfillment   text not null check (fulfillment in ('delivery', 'pickup')),
  delivery_area text,
  note          text,
  items         jsonb not null,
  subtotal_rwf  integer not null check (subtotal_rwf >= 0),
  delivery_free boolean not null default false,
  total_rwf     integer not null check (total_rwf >= 0),
  status        text not null default 'new'
                  check (status in ('new','confirmed','out_for_delivery','delivered','cancelled')),
  created_at    timestamptz not null default now()
);

create index if not exists ou_orders_status_idx on public.ou_orders (status);
create index if not exists ou_orders_created_idx on public.ou_orders (created_at desc);

-- ─────────────────────────────────────────────────────────────
-- Settings (admin-editable business rules)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.ou_settings (
  key   text primary key,
  value text not null
);

insert into public.ou_settings (key, value)
values ('free_delivery_threshold_rwf', '500000')
on conflict (key) do nothing;

-- ─────────────────────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────────────────────
alter table public.ou_categories enable row level security;
alter table public.ou_products   enable row level security;
alter table public.ou_orders      enable row level security;
alter table public.ou_settings    enable row level security;

-- Public (anon) can read the catalog and settings.
create policy "categories are public" on public.ou_categories
  for select using (true);
create policy "products are public" on public.ou_products
  for select using (true);
create policy "settings are public" on public.ou_settings
  for select using (true);

-- Authenticated admins have full control over the catalog and settings.
create policy "admins manage categories" on public.ou_categories
  for all to authenticated using (true) with check (true);
create policy "admins manage products" on public.ou_products
  for all to authenticated using (true) with check (true);
create policy "admins manage settings" on public.ou_settings
  for all to authenticated using (true) with check (true);

-- Orders: only authenticated admins can read/update. Inserts are made by the
-- server with the service-role key (which bypasses RLS), so no public insert
-- policy is granted here — the anon role can never read customer data.
create policy "admins read orders" on public.ou_orders
  for select to authenticated using (true);
create policy "admins update orders" on public.ou_orders
  for update to authenticated using (true) with check (true);
create policy "admins delete orders" on public.ou_orders
  for delete to authenticated using (true);

-- ─────────────────────────────────────────────────────────────
-- Storage: product image bucket
-- ─────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "product images are public" on storage.objects
  for select using (bucket_id = 'product-images');

create policy "admins upload product images" on storage.objects
  for insert to authenticated with check (bucket_id = 'product-images');

create policy "admins update product images" on storage.objects
  for update to authenticated using (bucket_id = 'product-images');

create policy "admins delete product images" on storage.objects
  for delete to authenticated using (bucket_id = 'product-images');
