// Single order API
// GET /api/orders/[id] - get order
// PATCH /api/orders/[id] - update status/tracking
// DELETE /api/orders/[id] - cancel order

import { NextRequest, NextResponse } from 'next/server';
import { getOrder, updateOrderStatus } from '@/lib/db/orders';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const order = await getOrder(params.id);
    if (!order) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, order });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { status, trackingNumber, cjOrderId, cjError, paymentStatus } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, error: 'status is required' },
        { status: 400 }
      );
    }

    const order = await updateOrderStatus(params.id, status, {
      trackingNumber,
      cjOrderId,
      cjError,
      paymentStatus,
    });

    return NextResponse.json({ success: true, order });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
