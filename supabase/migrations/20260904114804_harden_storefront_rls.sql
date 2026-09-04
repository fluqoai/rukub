-- Public traffic uses the application's route handlers. The service-role client
-- performs checkout and order lookup server-side, so customer/order tables do
-- not need direct anon or authenticated access through the Data API.

alter table public.customers enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.notifications enable row level security;
alter table public.admin_users enable row level security;
alter table public.admin_sessions enable row level security;
alter table public.settings enable row level security;
alter table public.audit_log enable row level security;

do $$
declare policy_record record;
begin
  for policy_record in
    select policyname, tablename
    from pg_policies
    where schemaname = 'public'
      and tablename in (
        'customers', 'orders', 'order_items', 'notifications',
        'admin_users', 'admin_sessions', 'settings', 'audit_log', 'products'
      )
  loop
    execute format('drop policy if exists %I on public.%I', policy_record.policyname, policy_record.tablename);
  end loop;
end $$;

revoke all on table public.customers from anon, authenticated;
revoke all on table public.orders from anon, authenticated;
revoke all on table public.order_items from anon, authenticated;
revoke all on table public.notifications from anon, authenticated;
revoke all on table public.admin_users from anon, authenticated;
revoke all on table public.admin_sessions from anon, authenticated;
revoke all on table public.settings from anon, authenticated;
revoke all on table public.audit_log from anon, authenticated;
revoke all on table public.order_summary from anon, authenticated;
revoke all on table public.top_products from anon, authenticated;

grant select on table public.products to anon, authenticated;

create policy "Active products are public"
  on public.products
  for select
  to anon, authenticated
  using (active = true);
