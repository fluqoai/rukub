// System status endpoint (admin only).
// Returns the live/mock state of each external service so the admin UI
// can show accurate labels without exposing secrets.

import { NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/admin-auth-server';
import { isCJConfigured } from '@/lib/cj-client';

export const dynamic = 'force-dynamic';

function getTapMode(): 'mock' | 'test' | 'live' {
  const key = process.env.TAP_SECRET_KEY;
  if (!key) return 'mock';
  if (key.startsWith('sk_live_')) return 'live';
  if (key.startsWith('sk_test_')) return 'test';
  // Treat any other real-looking key as live so we don't lie to admins.
  return 'live';
}

function getResendMode(): 'mock' | 'live' {
  return !!process.env.RESEND_API_KEY ? 'live' : 'mock';
}

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ success: false }, { status: 401 });
  }
  return NextResponse.json({
    success: true,
    status: {
      tapMode: getTapMode(),
      cjMode: isCJConfigured() ? 'live' : 'mock',
      resendMode: getResendMode(),
    },
  });
}
