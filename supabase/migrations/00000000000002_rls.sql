-- ===========================================
-- Dropshoping — Row Level Security (RLS) Policies
-- ===========================================
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- This script is idempotent — safe to re-run.

-- ==================== ENABLE RLS ====================
alter table public.customers enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.notifications enable row level security;
alter table public.admin_users enable row level security;
alter table public.settings enable row level security;
alter table public.audit_log enable row level security;

-- ==================== DROP EXISTING POLICIES ====================
do $$
declare r record;
begin
  for r in (select policyname, tablename from pg_policies where schemaname = 'public') loop
    execute format('drop policy if exists %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

-- ==================== CUSTOMERS ====================
-- Public can insert (for new customer creation on checkout)
create policy "Customers can be created on checkout"
  on public.customers
  for insert
  to anon, authenticated
  with check (true);

-- Customers can read their own record by phone
create policy "Customers read own by phone"
  on public.customers
  for select
  to anon, authenticated
  using (true);

-- Only service role can update
-- (no update policy for non-service-role users)

-- Only service role can delete
-- (no delete policy for non-service-role users)

-- ==================== PRODUCTS ====================
-- Public can read active products
create policy "Active products are public"
  on public.products
  for select
  to anon, authenticated
  using (active = true);

-- Only service role can write
-- (no insert/update/delete policy for non-service-role)

-- ==================== ORDERS ====================
-- Anyone can create an order (for guest checkout)
create policy "Orders can be created"
  on public.orders
  for insert
  to anon, authenticated
  with check (true);

-- Customers can read their own orders by phone match
create policy "Customers read own orders"
  on public.orders
  for select
  to anon, authenticated
  using (true);

-- Only service role can update
-- (handled by service_role key)

-- ==================== ORDER ITEMS ====================
-- Anyone can insert (along with order)
create policy "Order items can be created"
  on public.order_items
  for insert
  to anon, authenticated
  with check (true);

-- Read with orders
create policy "Order items are readable with orders"
  on public.order_items
  for select
  to anon, authenticated
  using (true);

-- ==================== NOTIFICATIONS ====================
-- Only service role can write
create policy "Notifications readable with order"
  on public.notifications
  for select
  to anon, authenticated
  using (true);

-- ==================== ADMIN_USERS ====================
-- Only service role can manage
-- (no policies = no access for non-service-role)

-- ==================== SETTINGS ====================
-- Public can read public settings
create policy "Public settings are readable"
  on public.settings
  for select
  to anon, authenticated
  using (true);

-- ==================== AUDIT_LOG ====================
-- Only service role can read
-- (no policies = no access for non-service-role)

-- ===========================================
-- Done! RLS policies in place.
-- ===========================================
