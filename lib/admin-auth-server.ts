// Server-side admin auth.
// Uses scrypt (Node built-in) for password hashing + DB-backed sessions.

import 'server-only';
import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { createAdminSupabase } from '@/lib/supabase/client';

const COOKIE_NAME = 'rukub_admin_session';
const SESSION_TTL_DAYS = 14;

export type AdminUser = {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
};

export type AdminAuthError =
  | { kind: 'invalid_credentials'; message: string }
  | { kind: 'inactive'; message: string }
  | { kind: 'no_password'; message: string }
  | { kind: 'rate_limited'; message: string };

// =============== PASSWORD HASHING (scrypt) ===============

export function hashPassword(plain: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(plain, salt, 64);
  return `${salt.toString('hex')}:${hash.toString('hex')}`;
}

export function verifyPassword(plain: string, stored: string): boolean {
  try {
    const [saltHex, hashHex] = stored.split(':');
    if (!saltHex || !hashHex) return false;
    const salt = Buffer.from(saltHex, 'hex');
    const expected = Buffer.from(hashHex, 'hex');
    const actual = scryptSync(plain, salt, expected.length);
    if (expected.length !== actual.length) return false;
    return timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

// =============== SESSIONS ===============

function generateToken(): string {
  // 32 random bytes → 64 hex chars. We also store a sha256 hash in DB so
  // a DB leak doesn't directly expose session tokens.
  return randomBytes(32).toString('hex');
}

function tokenHash(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export async function verifyCredentials(
  email: string,
  password: string
): Promise<{ ok: true; admin: AdminUser } | { ok: false; error: AdminAuthError }> {
  const supabase = createAdminSupabase();
  // The admin_users table isn't in the generated Supabase types, so we cast.
  type AdminRow = {
    id: string;
    email: string;
    full_name: string | null;
    role: string;
    active: boolean;
    password_hash: string | null;
  };
  const { data: row, error } = await supabase
    .from('admin_users')
    .select('id, email, full_name, role, active, password_hash')
    .eq('email', email.toLowerCase().trim())
    .single();
  const adminRow = row as unknown as AdminRow | null;

  if (error || !adminRow) {
    return { ok: false, error: { kind: 'invalid_credentials', message: 'بيانات الدخول غير صحيحة' } };
  }
  if (!adminRow.active) {
    return { ok: false, error: { kind: 'inactive', message: 'الحساب موقوف' } };
  }
  if (!adminRow.password_hash) {
    return { ok: false, error: { kind: 'no_password', message: 'لم يتم تعيين كلمة مرور. تواصل مع الدعم.' } };
  }
  if (!verifyPassword(password, adminRow.password_hash)) {
    return { ok: false, error: { kind: 'invalid_credentials', message: 'بيانات الدخول غير صحيحة' } };
  }
  return {
    ok: true,
    admin: {
      id: adminRow.id,
      email: adminRow.email,
      full_name: adminRow.full_name,
      role: adminRow.role,
    },
  };
}

export async function createSession(adminId: string, request?: Request): Promise<string> {
  const supabase = createAdminSupabase();
  const token = generateToken();
  const expires = new Date(Date.now() + SESSION_TTL_DAYS * 86400_000);

  const userAgent = request?.headers.get('user-agent') ?? null;
  const ip =
    request?.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request?.headers.get('x-real-ip') ??
    null;

  const { error } = await (supabase.from('admin_sessions') as any).insert({
    admin_id: adminId,
    token: tokenHash(token), // store hash, not raw token
    user_agent: userAgent,
    ip_address: ip,
    expires_at: expires.toISOString(),
  });
  if (error) throw new Error(`Failed to create session: ${error.message}`);

  // Update last_login_at (best-effort)
  await (supabase.from('admin_users') as any)
    .update({ last_login_at: new Date().toISOString() })
    .eq('id', adminId);

  return token;
}

export async function destroySession(token: string): Promise<void> {
  const supabase = createAdminSupabase();
  await (supabase.from('admin_sessions') as any).delete().eq('token', tokenHash(token));
}

export async function getCurrentAdmin(): Promise<AdminUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const supabase = createAdminSupabase();
  // First clean up expired sessions (best effort)
  try {
    await (supabase as any).rpc('delete_expired_admin_sessions');
  } catch {
    // ignore — function may not exist
  }

  const { data: session } = await (supabase.from('admin_sessions') as any)
    .select('admin_id, expires_at')
    .eq('token', tokenHash(token))
    .single() as { data: { admin_id: string; expires_at: string } | null };
  if (!session) return null;
  if (new Date(session.expires_at) < new Date()) {
    // expired → clean up
    await (supabase.from('admin_sessions') as any).delete().eq('token', tokenHash(token));
    return null;
  }

  type AdminUserRow = { id: string; email: string; full_name: string | null; role: string; active: boolean };
  const { data: row } = await (supabase.from('admin_users') as any)
    .select('id, email, full_name, role, active')
    .eq('id', session.admin_id)
    .eq('active', true)
    .single() as { data: AdminUserRow | null };
  if (!row) return null;

  return {
    id: row.id,
    email: row.email,
    full_name: row.full_name,
    role: row.role,
  };
}

// =============== COOKIES ===============

export function setSessionCookie(token: string) {
  // Use Next.js cookies() so it works in both Server Actions and Route Handlers.
  // We mutate via the globalThis-scoped helper that middleware can also read.
  // Note: cookies() is async in Next 15; in 14 it's sync.
  const cookieStore = cookies() as any;
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_DAYS * 86400,
  });
}

export function clearSessionCookie() {
  const cookieStore = cookies() as any;
  cookieStore.set(COOKIE_NAME, '', { path: '/', maxAge: 0 });
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
