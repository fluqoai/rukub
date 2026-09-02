// Orders API
// GET /api/orders - list orders (admin)
// POST /api/orders - create new order (also fires notifications)

import { NextRequest, NextResponse } from 'next/server';
import { listOrders, createOrder, getOrder, type CreateOrderInput } from '@/lib/db/orders';
import { sendOrderNotification } from '@/lib/notifications-service';
import type { Order, OrderStatus, PaymentMethod } from '@/lib/orders-store';
import type { CartItem } from '@/lib/cart-store';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const orders = await listOrders({
      limit: sp.get('limit') ? Number(sp.get('limit')) : undefined,
      status: sp.get('status') ?? undefined,
      search: sp.get('q') ?? undefined,
    });
    return NextResponse.json({ success: true, orders });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}

// Map a DB order row to the local Order shape used by the notification service.
function toLocalOrder(
  row: Awaited<ReturnType<typeof getOrder>>,
  input: CreateOrderInput
): Order {
  const items: CartItem[] = (row?.items ?? []).map((it: any) => ({
    productId: it.product_id,
    slug: it.product_id,
    name: it.product_name,
    shortName: it.product_short_name ?? it.product_name,
    price: Number(it.price),
    quantity: it.quantity,
    audience: 'shared',
    iconName: 'Package',
  }));
  const status: OrderStatus =
    row?.status === 'pending'
      ? 'pending_cj_sync'
      : row?.status === 'confirmed'
      ? 'confirmed'
      : row?.status === 'cancelled'
      ? 'cancelled'
      : 'manual_followup';
  const payment: PaymentMethod = (input.paymentMethod as PaymentMethod) ?? 'cod';
  return {
    id: row?.id ?? input.id,
    cjOrderId: row?.cj_order_id ?? undefined,
    trackingNumber: row?.tracking_number ?? undefined,
    status,
    items,
    shipping: {
      fullName: row?.shipping_full_name ?? input.shipping.fullName,
      phone: row?.shipping_phone ?? input.shipping.phone,
      email: row?.shipping_email ?? input.shipping.email ?? '',
      city: row?.shipping_city ?? input.shipping.city,
      district: row?.shipping_district ?? input.shipping.district,
      notes: row?.shipping_notes ?? input.shipping.notes ?? '',
    },
    payment,
    subtotal: Number(row?.subtotal ?? input.subtotal),
    shippingCost: Number(row?.shipping_cost ?? input.shippingCost),
    total: Number(row?.total ?? input.total),
    createdAt: row?.placed_at ?? new Date().toISOString(),
    cjError: row?.cj_error ?? undefined,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateOrderInput;
    const row = await createOrder(body);

    // Fire-and-forget notification dispatch (email + WhatsApp).
    // Failure here must NOT break order creation, so we don't await.
    if (row) {
      const localOrder = toLocalOrder({ ...row, items: [] }, body);
      // Re-fetch with items so the template can list them
      void (async () => {
        try {
          const full = await getOrder(row.id);
          const order = toLocalOrder(full, body);
          await sendOrderNotification({ order, trigger: 'order_created' });
        } catch (e) {
          console.error('[notifications] post-create dispatch failed:', e);
        }
      })();
    }

    return NextResponse.json({ success: true, order: row });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
