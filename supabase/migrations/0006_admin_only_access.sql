-- ─────────────────────────────────────────────────────────────
-- 0006 · Only the shop's admin account may change data or read
--        customer records.
--
-- Until now every admin policy said `to authenticated using (true)`: ANY
-- signed-in user. Supabase sign-ups are open on this project, so anyone who
-- registered and confirmed their own email could edit the catalogue and read
-- orders, trade enquiries and messages through the public API.
--
-- After running this, also switch sign-ups off:
--   Dashboard → Authentication → Sign In / Providers →
--   "Allow new users to sign up" → off.
--
-- The app enforces the same list in src/lib/supabase/admins.ts. To add an
-- admin later: add the email here AND to ADMIN_EMAILS in Vercel, then re-run
-- the `create or replace function` statement.
--
-- Safe to re-run. Paste the whole file into the SQL editor and press Run.
-- ─────────────────────────────────────────────────────────────

begin;

create or replace function public.ou_is_admin()
returns boolean
language sql
stable
set search_path = ''
as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) = any (array[
    'oresteutensils@gmail.com'
  ]);
$$;

-- Catalogue, settings, reviews: public read stays; writes are admin-only.
drop policy if exists "admins manage categories" on public.ou_categories;
create policy "admins manage categories" on public.ou_categories
  for all to authenticated using (public.ou_is_admin()) with check (public.ou_is_admin());

drop policy if exists "admins manage products" on public.ou_products;
create policy "admins manage products" on public.ou_products
  for all to authenticated using (public.ou_is_admin()) with check (public.ou_is_admin());

drop policy if exists "admins manage settings" on public.ou_settings;
create policy "admins manage settings" on public.ou_settings
  for all to authenticated using (public.ou_is_admin()) with check (public.ou_is_admin());

drop policy if exists "admins manage testimonials" on public.ou_testimonials;
create policy "admins manage testimonials" on public.ou_testimonials
  for all to authenticated using (public.ou_is_admin()) with check (public.ou_is_admin());

-- Customer data: admin-only read/update/delete (inserts stay server-side).
drop policy if exists "admins read orders" on public.ou_orders;
create policy "admins read orders" on public.ou_orders
  for select to authenticated using (public.ou_is_admin());
drop policy if exists "admins update orders" on public.ou_orders;
create policy "admins update orders" on public.ou_orders
  for update to authenticated using (public.ou_is_admin()) with check (public.ou_is_admin());
drop policy if exists "admins delete orders" on public.ou_orders;
create policy "admins delete orders" on public.ou_orders
  for delete to authenticated using (public.ou_is_admin());

drop policy if exists "admins read leads" on public.ou_leads;
create policy "admins read leads" on public.ou_leads
  for select to authenticated using (public.ou_is_admin());
drop policy if exists "admins update leads" on public.ou_leads;
create policy "admins update leads" on public.ou_leads
  for update to authenticated using (public.ou_is_admin()) with check (public.ou_is_admin());
drop policy if exists "admins delete leads" on public.ou_leads;
create policy "admins delete leads" on public.ou_leads
  for delete to authenticated using (public.ou_is_admin());

drop policy if exists "admins read messages" on public.ou_messages;
create policy "admins read messages" on public.ou_messages
  for select to authenticated using (public.ou_is_admin());
drop policy if exists "admins update messages" on public.ou_messages;
create policy "admins update messages" on public.ou_messages
  for update to authenticated using (public.ou_is_admin()) with check (public.ou_is_admin());
drop policy if exists "admins delete messages" on public.ou_messages;
create policy "admins delete messages" on public.ou_messages
  for delete to authenticated using (public.ou_is_admin());

-- Product photos: anyone can view; only the admin can upload/replace/remove.
drop policy if exists "admins upload product images" on storage.objects;
create policy "admins upload product images" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'product-images' and public.ou_is_admin());
drop policy if exists "admins update product images" on storage.objects;
create policy "admins update product images" on storage.objects
  for update to authenticated
  using (bucket_id = 'product-images' and public.ou_is_admin());
drop policy if exists "admins delete product images" on storage.objects;
create policy "admins delete product images" on storage.objects
  for delete to authenticated
  using (bucket_id = 'product-images' and public.ou_is_admin());

commit;

-- Check: should list every policy above with ou_is_admin() in it.
select tablename, policyname, cmd
from pg_policies
where policyname like 'admins %'
order by tablename, policyname;
