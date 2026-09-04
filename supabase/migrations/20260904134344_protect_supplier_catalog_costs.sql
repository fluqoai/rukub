-- Supplier costs, raw CJ IDs and draft metadata are private. Public storefront
-- reads are served by Next.js through a safe projection using the service role.
begin;
alter table public.products enable row level security;
drop policy if exists "Active products are public" on public.products;
revoke all privileges on table public.products from anon, authenticated;
commit;
