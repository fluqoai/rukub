-- Public traffic uses the application's route handlers. The service-role client
-- performs checkout and order lookup server-side, so customer/order tables do
-- not need direct anon or authenticated access through the Data API.

do $migration$
declare
  table_name text;
  policy_record record;
begin
  foreach table_name in array array[
    'customers', 'orders', 'order_items', 'notifications',
    'admin_users', 'admin_sessions', 'settings', 'audit_log', 'products'
  ]
  loop
    if to_regclass(format('public.%I', table_name)) is not null then
      execute format('alter table public.%I enable row level security', table_name);
    end if;
  end loop;

  for policy_record in
    select policyname, tablename
    from pg_policies
    where schemaname = 'public'
      and tablename in (
        'customers', 'orders', 'order_items', 'notifications',
        'admin_users', 'admin_sessions', 'settings', 'audit_log', 'products'
      )
  loop
    execute format(
      'drop policy if exists %I on public.%I',
      policy_record.policyname,
      policy_record.tablename
    );
  end loop;

  foreach table_name in array array[
    'customers', 'orders', 'order_items', 'notifications',
    'admin_users', 'admin_sessions', 'settings', 'audit_log',
    'order_summary', 'top_products'
  ]
  loop
    if to_regclass(format('public.%I', table_name)) is not null then
      execute format(
        'revoke all on table public.%I from anon, authenticated',
        table_name
      );
    end if;
  end loop;

  if to_regclass('public.products') is not null then
    execute 'grant select on table public.products to anon, authenticated';
    execute $policy$
      create policy "Active products are public"
        on public.products
        for select
        to anon, authenticated
        using (active = true)
    $policy$;
  end if;
end
$migration$;
