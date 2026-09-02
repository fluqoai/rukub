import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhook, mapStatus } from '@/lib/tap-client';
import { updateMockChargeStatus } from '@/lib/tap-mock-store';

export const dynamic = 'force-dynamic';

/**
 * Tap webhook handler.
 * Tap sends POST requests here when charge status changes.
 * Configure this URL in your Tap merchant dashboard.
 *
 * In production, MUST verify the signature in the header.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('hashstring'); // Tap's signature header

    let event;
    try {
      event = verifyWebhook(body, signature);
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const { id, status, reference, amount, currency } = event;

    if (!id || !status) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Update mock store
    updateMockChargeStatus(id, status);

    // Map to our order status
    const orderStatus = mapStatus(status);

    // In production, you'd update the order in your DB here.
    // For now, we just log and return success.
    console.log('[Tap webhook]', {
      chargeId: id,
      orderId: reference?.order,
      status,
      mapped: orderStatus,
      amount,
      currency,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
