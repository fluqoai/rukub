// Orders API
// GET /api/orders - list orders (admin)
// POST /api/orders - create new order (also fires notifications)

import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'node:crypto';
import { listOrders, createOrder, getOrder, type CreateOrderInput } from '@/lib/db/orders';
import { sendOrderNotification } from '@/lib/notifications-service';
import { getCurrentAdmin } from '@/lib/admin-auth-server';
import { FREE_SHIPPING_THRESHOLD, SHIPPING_COST } from '@/lib/commerce';
import { allowCheckoutRequest } from '@/lib/checkout-rate-limit';
import type { Order, OrderStatus, PaymentMethod } from '@/lib/orders-store';
import type { CartItem } from '@/lib/cart-store';
import { validateCheckout, type RequestedLine } from '@/lib/checkout-validation';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
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
    variantId: it.metadata?.variant_id ?? undefined,
    variantLabel: it.variant ?? undefined,
    imageUrl: it.metadata?.image ?? undefined,
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
  if (!allowCheckoutRequest(req)) return NextResponse.json({ error: 'طلبات متكررة؛ انتظر دقيقة ثم حاول مجددًا' }, { status: 429, headers: { 'Retry-After': '60' } });
  try {
    const body = (await req.json()) as {
      items?: RequestedLine[];
      shipping?: CreateOrderInput['shipping'];
      paymentMethod?: string;
    };

    if (!body.items?.length || body.items.length > 20 || !body.shipping) {
      return NextResponse.json({ success: false, error: 'بيانات الطلب غير مكتملة' }, { status: 400 });
    }
    if (body.paymentMethod !== 'cod') {
      return NextResponse.json(
        { success: false, error: 'الدفع الإلكتروني سيكون متاحاً قريباً. اختر الدفع عند الاستلام.' },
        { status: 400 }
      );
    }

    const shipping = body.shipping;
    const phone = shipping.phone?.replace(/\s/g, '') ?? '';
    if (
      !shipping.fullName || shipping.fullName.trim().length < 2 ||
      !/^(\+?966|0)?5\d{8}$/.test(phone) ||
      !shipping.city?.trim() ||
      !shipping.district?.trim()
    ) {
      return NextResponse.json({ success: false, error: 'يرجى التحقق من بيانات الشحن' }, { status: 400 });
    }

    let items: CreateOrderInput['items'];
    try { items = await validateCheckout(body.items); }
    catch (e) { return NextResponse.json({ success: false, error: e instanceof Error ? e.message : 'تعذر التحقق من المورد؛ حاول لاحقًا' }, { status: 409 }); }
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
    const input: CreateOrderInput = {
      id: `RKB-${randomBytes(4).toString('hex').toUpperCase()}`,
      items,
      shipping: {
        fullName: shipping.fullName.trim(),
        phone,
        email: shipping.email?.trim() || undefined,
        city: shipping.city.trim(),
        district: shipping.district.trim(),
        notes: shipping.notes?.trim() || undefined,
      },
      paymentMethod: 'cod',
      subtotal,
      shippingCost,
      total: subtotal + shippingCost,
      status: 'pending',
    };

    const row = await createOrder(input);

    // Finish email dispatch before the serverless request ends; failure does not cancel the order.
    if (row) {
      // Re-fetch with items so the template can list them
      await (async () => {
        try {
          const full = await getOrder(row.id);
          const order = toLocalOrder(full, input);
          await sendOrderNotification({ order, trigger: 'order_created' });
        } catch (e) {
          console.error('[notifications] post-create dispatch failed:', e);
        }
      })();
    }

    return NextResponse.json({ success: true, order: row });
  } catch (error) {
    if (error instanceof Error && error.message === 'INVALID_CART') {
      return NextResponse.json({ success: false, error: 'تحتوي السلة على منتج أو كمية غير صالحة' }, { status: 400 });
    }
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
