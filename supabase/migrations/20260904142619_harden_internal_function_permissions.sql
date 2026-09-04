-- Internal server/trigger functions do not need public RPC access.
-- Existing bodies qualify application tables with public and use pg_catalog built-ins.
do $migration$
begin
  alter function public.delete_expired_admin_sessions() set search_path = '';
  alter function public.set_updated_at() set search_path = '';
  alter function public.upsert_customer_from_order() set search_path = '';
  revoke execute on function public.delete_expired_admin_sessions() from public, anon, authenticated;
  revoke execute on function public.set_updated_at() from public, anon, authenticated;
  revoke execute on function public.upsert_customer_from_order() from public, anon, authenticated;
  grant execute on function public.delete_expired_admin_sessions() to service_role;
  grant execute on function public.set_updated_at() to service_role;
  grant execute on function public.upsert_customer_from_order() to service_role;
end
$migration$;
