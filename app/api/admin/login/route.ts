import { NextRequest, NextResponse } from 'next/server';
import { verifyCredentials, createSession, setSessionCookie } from '@/lib/admin-auth-server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { email?: string; password?: string };
    if (!body.email || !body.password) {
      return NextResponse.json(
        { success: false, error: 'يرجى إدخال البريد وكلمة المرور' },
        { status: 400 }
      );
    }

    const result = await verifyCredentials(body.email, body.password);
    if (!result.ok) {
      const status = result.error.kind === 'inactive' ? 403 : 401;
      return NextResponse.json(
        { success: false, error: result.error.message, kind: result.error.kind },
        { status }
      );
    }

    const token = await createSession(result.admin.id, req);
    setSessionCookie(token);

    return NextResponse.json({
      success: true,
      admin: { id: result.admin.id, email: result.admin.email, full_name: result.admin.full_name },
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Unknown' },
      { status: 500 }
    );
  }
}
