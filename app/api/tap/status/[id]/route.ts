import { NextRequest, NextResponse } from 'next/server';
import { getChargeStatus } from '@/lib/tap-client';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const charge = await getChargeStatus(params.id);
    return NextResponse.json({ success: true, charge });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
