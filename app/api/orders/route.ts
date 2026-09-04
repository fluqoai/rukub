// Orders API
// GET /api/orders - list orders (admin)
// POST /api/orders - create new order (also fires notifications)

import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'node:crypto';
import { listOrders, createOrder, getOrder, type CreateOrderInput } from '@/lib/db/orders';
import { sendOrderNotification } from '@/lib/notifications-service';
import { getCurrentAdmin } from '@/lib/admin-auth-server';
import { getPublicProduct } from '@/lib/public-products';
import { FREE_SHIPPING_THRESHOLD, SHIPPING_COST } from '@/lib/cart-store';
import type { Order, OrderStatus, PaymentMethod } from '@/lib/orders-store';
import type { CartItem } from '@/lib/cart-store';

export const dynamic = 'force-dynamic';

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
    const body = (await req.json()) as {
      items?: Array<{ productId?: string; quantity?: number }>;
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

    const items = await Promise.all(body.items.map(async (item) => {
      const product = item.productId ? await getPublicProduct(item.productId) : undefined;
      const quantity = Number(item.quantity);
      if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
        throw new Error('INVALID_CART');
      }
      return {
        productId: product.id,
        productName: product.name,
        productShortName: product.shortName,
        quantity,
        price: product.price,
      };
    }));
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

    // Fire-and-forget email notification dispatch.
    // Failure here must NOT break order creation, so we don't await.
    if (row) {
      // Re-fetch with items so the template can list them
      void (async () => {
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
