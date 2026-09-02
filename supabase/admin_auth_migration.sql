-- ===========================================
-- Admin Auth: password_hash + sessions
-- Run this in Supabase SQL Editor
-- Safe to re-run (idempotent)
-- ===========================================

-- 1) Add password_hash column to admin_users
alter table public.admin_users
  add column if not exists password_hash text;

-- 2) Admin sessions table (server-issued tokens, httpOnly cookie points here)
create table if not exists public.admin_sessions (
  id uuid primary key default uuid_generate_v4(),
  admin_id uuid not null references public.admin_users(id) on delete cascade,
  token text unique not null,
  user_agent text,
  ip_address text,
  expires_at timestamptz not null,
  created_at timestamptz default now()
);
create index if not exists idx_admin_sessions_token on public.admin_sessions(token);
create index if not exists idx_admin_sessions_admin on public.admin_sessions(admin_id);
create index if not exists idx_admin_sessions_expires on public.admin_sessions(expires_at);

-- 3) Cleanup helper (called by API on each request)
create or replace function public.delete_expired_admin_sessions()
returns void as $$
begin
  delete from public.admin_sessions where expires_at < now();
end;
$$ language plpgsql;

-- 4) RLS for admin_sessions
alter table public.admin_sessions enable row level security;

-- Only service role accesses this table (no public policies).
-- The API routes use the service role client to read/write sessions.

-- 5) Ensure no public RLS for admin_users (only service role can read)
-- Drop any existing public policy just in case
do $$
declare r record;
begin
  for r in (select policyname from pg_policies where schemaname = 'public' and tablename = 'admin_users') loop
    execute format('drop policy if exists %I on public.admin_users', r.policyname);
  end loop;
end $$;

-- 6) Cleanup old demo admin user if present (so we can recreate fresh)
delete from public.admin_users where email = 'admin@rukub.shop';

-- 7) Insert a default admin (password: 'admin123' - CHANGE IMMEDIATELY AFTER FIRST LOGIN)
-- Hash format: scrypt(salt_hex:hash_hex)
-- The hash below corresponds to password 'admin123'
insert into public.admin_users (email, full_name, role, active, password_hash)
values (
  'admin@rukub.shop',
  'مدير المتجر',
  'admin',
  true,
  'b6e3fc34adddbda36031cf01f3ad850f:44c6ad7125b9144f6b0a29ee6a4d639d39b6d369eb3e666de408f848a0342fe52cb899b80168df0ff94ead88b8e60f5aa5f52d65afec2edc3503f0ca631c1969'
);

-- 8) Audit log: extend if needed
-- (audit_log already exists from 00000000000001_init.sql)

-- 9) Verify
select email, full_name, role, active, length(password_hash) as hash_len
from public.admin_users;
