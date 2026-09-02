// Admin password change endpoint.
// PATCH /api/admin/password
// Body: { currentPassword: string, newPassword: string }
//
// Verifies the current password, then updates the admin_users.password_hash
// with a fresh scrypt hash. The current admin session is required.

import { NextRequest, NextResponse } from 'next/server';
import {
  getCurrentAdmin,
  hashPassword,
  verifyPassword,
} from '@/lib/admin-auth-server';
import { createAdminSupabase } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;

type PatchBody = {
  currentPassword?: unknown;
  newPassword?: unknown;
};

export async function PATCH(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'الجلسة منتهية، يرجى تسجيل الدخول' },
        { status: 401 }
      );
    }

    const body = (await req.json()) as PatchBody;
    const currentPassword = typeof body.currentPassword === 'string' ? body.currentPassword : '';
    const newPassword = typeof body.newPassword === 'string' ? body.newPassword : '';

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'يرجى إدخال كلمة المرور الحالية والجديدة' },
        { status: 400 }
      );
    }

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        { success: false, error: `كلمة المرور الجديدة يجب أن تكون ${MIN_PASSWORD_LENGTH} أحرف على الأقل` },
        { status: 400 }
      );
    }

    if (newPassword.length > MAX_PASSWORD_LENGTH) {
      return NextResponse.json(
        { success: false, error: 'كلمة المرور طويلة جداً' },
        { status: 400 }
      );
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        { success: false, error: 'كلمة المرور الجديدة يجب أن تكون مختلفة عن الحالية' },
        { status: 400 }
      );
    }

    // Fetch the current password hash to verify.
    const supabase = createAdminSupabase();
    type AdminRow = { id: string; password_hash: string | null };
    const { data: row, error: fetchError } = await (supabase
      .from('admin_users') as any)
      .select('id, password_hash')
      .eq('id', admin.id)
      .single() as { data: AdminRow | null; error: { message: string } | null };

    if (fetchError || !row) {
      return NextResponse.json(
        { success: false, error: 'تعذر الوصول إلى الحساب' },
        { status: 500 }
      );
    }

    if (!row.password_hash) {
      return NextResponse.json(
        { success: false, error: 'لا توجد كلمة مرور مسجلة على هذا الحساب' },
        { status: 400 }
      );
    }

    if (!verifyPassword(currentPassword, row.password_hash)) {
      return NextResponse.json(
        { success: false, error: 'كلمة المرور الحالية غير صحيحة' },
        { status: 401 }
      );
    }

    // Update with the new hash.
    const newHash = hashPassword(newPassword);
    const { error: updateError } = await (supabase
      .from('admin_users') as any)
      .update({ password_hash: newHash, updated_at: new Date().toISOString() })
      .eq('id', admin.id);

    if (updateError) {
      return NextResponse.json(
        { success: false, error: `فشل تحديث كلمة المرور: ${updateError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'تم تحديث كلمة المرور بنجاح',
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Unknown' },
      { status: 500 }
    );
  }
}
