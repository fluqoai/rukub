import { NextRequest, NextResponse } from 'next/server';
import { clearSessionCookie, destroySession, ADMIN_COOKIE_NAME } from '@/lib/admin-auth-server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
    if (token) {
      await destroySession(token);
    }
    clearSessionCookie();
    return NextResponse.json({ success: true });
  } catch (err) {
    // Even on error, clear the cookie client-side
    clearSessionCookie();
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Unknown' },
      { status: 500 }
    );
  }
}
