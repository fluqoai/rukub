// Tap Payments webhook handler.
// Tap sends POST requests here when charge status changes.
// Configure this URL in your Tap merchant dashboard.
//
// In production, the HMAC SHA256 signature in the `hashstring` header
// MUST be verified. The dev environment doesn't enforce this.

import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhook } from '@/lib/tap-client';
import { updateMockChargeStatus } from '@/lib/tap-mock-store';
import { updateOrderStatus } from '@/lib/db/orders';
import { isCJConfigured, createOrder as cjCreateOrder } from '@/lib/cj-client';
import { createAdminSupabase } from '@/lib/supabase/client';
import { sendOrderNotification } from '@/lib/notifications-service';
import type { CartItem } from '@/lib/cart-store';
import type { Order, PaymentMethod } from '@/lib/orders-store';

export const dynamic = 'force-dynamic';

// Verify HMAC SHA256 in production. We pull Tap's webhook secret from
// env and compare the hashstring header against our own signature.
function verifyTapHmac(body: string, signature: string | null, secret: string): boolean {
  if (!signature) return false;
  try {
    const crypto = require('node:crypto') as typeof import('node:crypto');
    const hmac = crypto.createHmac('sha256', secret).update(body).digest('hex');
    const a = Buffer.from(hmac, 'hex');
    const b = Buffer.from(signature, 'hex');
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

function mapTapToOrderStatus(tapStatus: string): 'confirmed' | 'cancelled' {
  switch (tapStatus) {
    case 'CAPTURED':
    case 'AUTHORIZED':
    case 'PARTIAL_REFUNDED':
    case 'REFUNDED':
      return 'confirmed';
    case 'FAILED':
    case 'DECLINED':
    case 'CANCELLED':
    case 'VOIDED':
    case 'EXPIRED':
      return 'cancelled';
    default:
      return 'cancelled';
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('hashstring');

    // Live mode → verify HMAC signature.
    const tapWebhookSecret = process.env.TAP_WEBHOOK_SECRET;
    if (tapWebhookSecret) {
      if (!verifyTapHmac(body, signature, tapWebhookSecret)) {
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        );
      }
    }

    let event;
    try {
      event = verifyWebhook(body, signature);
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid payload' },
        { status: 400 }
      );
    }

    const { id, status, reference, amount, currency } = event;

    if (!id || !status) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Update mock store (no-op in live mode)
    updateMockChargeStatus(id, status);

    // Map to our order status
    const orderStatus = mapTapToOrderStatus(status);
    const orderId = reference?.order;

    if (!orderId) {
      // No order reference — just log
      console.log('[Tap webhook] no order reference', { id, status });
      return NextResponse.json({ success: true });
    }

    // Update the order in DB
    const paymentStatus = orderStatus === 'confirmed' ? 'paid' : 'failed';
    const updated = await updateOrderStatus(orderId, orderStatus, { paymentStatus });

    console.log('[Tap webhook]', {
      chargeId: id,
      orderId,
      status,
      mapped: orderStatus,
      paymentStatus,
      amount,
      currency,
    });

    // If payment is confirmed, fire-and-forget CJ order creation + customer email.
    if (orderStatus === 'confirmed') {
      void (async () => {
        try {
          await fulfillConfirmedOrder(updated?.id ?? orderId);
        } catch (e) {
          console.error('[Tap webhook] post-confirm fulfillment failed:', e);
        }
      })();
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * After a Tap payment is confirmed, create the order in CJ for fulfillment
 * and send the customer a "your order is confirmed" email.
 */
async function fulfillConfirmedOrder(orderId: string): Promise<void> {
  const supabase = createAdminSupabase();
  type OrderRow = {
    id: string;
    status: string;
    payment_method: string;
    payment_status: string;
    subtotal: number;
    shipping_cost: number;
    total: number;
    cj_order_id: string | null;
    tracking_number: string | null;
    shipping_full_name: string | null;
    shipping_phone: string | null;
    shipping_email: string | null;
    shipping_city: string | null;
    shipping_district: string | null;
    shipping_notes: string | null;
  };
  const { data: row } = await (supabase
    .from('orders') as any)
    .select('*')
    .eq('id', orderId)
    .single() as { data: OrderRow | null };

  if (!row) {
    console.error('[fulfillment] order not found:', orderId);
    return;
  }

  // Skip if already fulfilled
  if (row.cj_order_id) {
    console.log('[fulfillment] already fulfilled:', orderId, row.cj_order_id);
    return;
  }

  const { data: items } = await (supabase
    .from('order_items') as any)
    .select('*')
    .eq('order_id', orderId);

  const orderItems: CartItem[] = (items ?? []).map((it: any) => ({
    productId: it.product_id,
    slug: it.product_id,
    name: it.product_name,
    shortName: it.product_short_name ?? it.product_name,
    price: Number(it.price),
    quantity: it.quantity,
    audience: 'shared',
    iconName: 'Package',
  }));

  const localOrder: Order = {
    id: row.id,
    cjOrderId: row.cj_order_id ?? undefined,
    trackingNumber: row.tracking_number ?? undefined,
    status: 'confirmed',
    items: orderItems,
    shipping: {
      fullName: row.shipping_full_name ?? '',
      phone: row.shipping_phone ?? '',
      email: row.shipping_email ?? '',
      city: row.shipping_city ?? '',
      district: row.shipping_district ?? '',
      notes: row.shipping_notes ?? '',
    },
    payment: ((row.payment_method as PaymentMethod) ?? 'tap') as PaymentMethod,
    subtotal: Number(row.subtotal ?? 0),
    shippingCost: Number(row.shipping_cost ?? 0),
    total: Number(row.total ?? 0),
    createdAt: new Date().toISOString(),
  };

  // 1. Try to create the order in CJ for actual fulfillment.
  if (isCJConfigured() && orderItems.length > 0) {
    try {
      const cjResult = await cjCreateOrder({
        products: orderItems.map((it) => ({
          cjProductId: it.productId,
          quantity: it.quantity,
        })),
        shipping: {
          name: row.shipping_full_name ?? 'Customer',
          phone: row.shipping_phone ?? '',
          country: 'SA',
          province: row.shipping_city ?? '',
          city: row.shipping_city ?? '',
          address: `${row.shipping_district ?? ''}${row.shipping_notes ? ' · ' + row.shipping_notes : ''}`,
        },
      });
      if (cjResult.orderId) {
        await updateOrderStatus(orderId, 'processing', {
          cjOrderId: cjResult.orderId,
          trackingNumber: cjResult.trackingNumber,
        });
        localOrder.cjOrderId = cjResult.orderId;
        localOrder.trackingNumber = cjResult.trackingNumber;
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'CJ order failed';
      console.error('[fulfillment] CJ createOrder failed:', msg);
      await updateOrderStatus(orderId, 'confirmed', { cjError: msg });
    }
  }

  // 2. Send confirmation email
  try {
    await sendOrderNotification({ order: localOrder, trigger: 'order_confirmed' });
  } catch (e) {
    console.error('[fulfillment] notification failed:', e);
  }
}
