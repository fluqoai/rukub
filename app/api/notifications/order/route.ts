// Manual notification trigger.
// Admin can call this from the order detail page to (re-)send an email
// to the customer for a specific trigger (e.g. "order_shipped" after adding tracking).
//
// Requires admin session. Fetches the order from Supabase, then dispatches via
// notifications-service.

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/admin-auth-server';
import { getOrder } from '@/lib/db/orders';
import { sendOrderNotification } from '@/lib/notifications-service';
import type { Order, OrderStatus, PaymentMethod } from '@/lib/orders-store';
import type { CartItem } from '@/lib/cart-store';
import type { NotificationTrigger } from '@/lib/notifications-types';

export const dynamic = 'force-dynamic';

type Body = {
  orderId: string;
  trigger: NotificationTrigger;
  channels?: { email?: boolean };
};

function toLocalOrder(row: NonNullable<Awaited<ReturnType<typeof getOrder>>>): Order {
  const items: CartItem[] = (row.items ?? []).map((it: any) => ({
    productId: it.product_id,
    variantId: it.metadata?.variant_id,
    variantLabel: it.variant,
    slug: it.product_id,
    name: it.product_name,
    shortName: it.product_short_name ?? it.product_name,
    price: Number(it.price),
    quantity: it.quantity,
    audience: 'shared',
    iconName: 'Package',
  }));
  const status: OrderStatus =
    row.status === 'confirmed'
      ? 'confirmed'
      : row.status === 'cancelled'
      ? 'cancelled'
      : 'manual_followup';
  const payment = ((row as any).payment_method ?? 'cod') as PaymentMethod;
  return {
    id: row.id,
    cjOrderId: row.cj_order_id ?? undefined,
    trackingNumber: row.tracking_number ?? undefined,
    status,
    items,
    shipping: {
      fullName: row.shipping_full_name ?? '',
      phone: row.shipping_phone ?? '',
      email: row.shipping_email ?? '',
      city: row.shipping_city ?? '',
      district: row.shipping_district ?? '',
      notes: row.shipping_notes ?? '',
    },
    payment,
    subtotal: Number(row.subtotal),
    shippingCost: Number(row.shipping_cost),
    total: Number(row.total),
    createdAt: row.placed_at,
    cjError: row.cj_error ?? undefined,
  };
}

export async function POST(req: NextRequest) {
  try {
    // 1) Admin gate
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // 2) Validate body
    const body = (await req.json()) as Body;
    if (!body.orderId || !body.trigger) {
      return NextResponse.json({ success: false, error: 'بيانات ناقصة' }, { status: 400 });
    }
    const validTriggers: NotificationTrigger[] = [
      'order_created', 'order_confirmed', 'order_shipped', 'order_delivered', 'order_cancelled',
    ];
    if (!validTriggers.includes(body.trigger)) {
      return NextResponse.json({ success: false, error: 'نوع الإشعار غير صحيح' }, { status: 400 });
    }

    // 3) Fetch order
    const row = await getOrder(body.orderId);
    if (!row) {
      return NextResponse.json({ success: false, error: 'الطلب غير موجود' }, { status: 404 });
    }
    if (!row.shipping_email) {
      return NextResponse.json(
        { success: false, error: 'لا يوجد بريد إلكتروني للعميل' },
        { status: 400 }
      );
    }
    const permitted: Record<string,string[]> = {order_created:['pending'],order_confirmed:['confirmed','processing'],order_shipped:['shipped'],order_delivered:['delivered'],order_cancelled:['cancelled']};
    if (!permitted[body.trigger].includes(row.status)) return NextResponse.json({success:false,error:'نوع الإشعار لا يطابق حالة الطلب الحالية.'},{status:409});

    // 4) Dispatch
    const localOrder = toLocalOrder(row);
    const result = await sendOrderNotification({
      order: localOrder,
      trigger: body.trigger,
      customPreferences: body.channels,
    });

    return NextResponse.json({
      success: true,
      sentBy: admin.email,
      sentAt: new Date().toISOString(),
      email: result.email,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Unknown' },
      { status: 500 }
    );
  }
}
