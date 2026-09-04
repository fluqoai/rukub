// High-level service that orchestrates notifications.
// Reads preferences and sends order updates by email.

import 'server-only';
import { sendOrderEmail } from './email-client';
import type { Order } from './orders-store';
import { defaultPreferences, type NotificationTrigger } from './notifications-types';

const TRIGGER_MAP: Record<string, NotificationTrigger> = {
  confirmed: 'order_confirmed',
  pending_cj_sync: 'order_created',
  manual_followup: 'order_cancelled',
  cancelled: 'order_cancelled',
};

const TRIGGER_TO_STATUS: Record<NotificationTrigger, Order['status']> = {
  order_created: 'pending_cj_sync',
  order_confirmed: 'confirmed',
  order_shipped: 'confirmed', // tracking added
  order_delivered: 'confirmed',
  order_cancelled: 'cancelled',
};

export type SendNotificationParams = {
  order: Order;
  trigger: NotificationTrigger;
  customPreferences?: { email?: boolean };
};

export type NotificationResult = {
  email: { sent: boolean; id?: string; error?: string } | null;
};

export async function sendOrderNotification(
  params: SendNotificationParams
): Promise<NotificationResult> {
  const { order, trigger, customPreferences } = params;

  const emailEnabled = customPreferences?.email ?? defaultPreferences.email[trigger];

  const result: NotificationResult = { email: null };

  const itemsForTemplate = order.items.map((it) => ({
    name: it.shortName,
    quantity: it.quantity,
    price: it.price,
  }));

  const commonCtx = {
    orderId: order.id,
    customerName: order.shipping.fullName,
    items: itemsForTemplate,
    subtotal: order.subtotal,
    shippingCost: order.shippingCost,
    total: order.total,
    shipping: {
      city: order.shipping.city,
      district: order.shipping.district,
      phone: order.shipping.phone,
    },
    paymentMethod: order.payment,
    trackingNumber: order.trackingNumber,
    cjOrderId: order.cjOrderId,
  };

  // Email
  if (emailEnabled && order.shipping.email) {
    const emailResult = await sendOrderEmail(trigger, {
      ...commonCtx,
      to: order.shipping.email,
    });
    result.email = {
      sent: emailResult.status === 'sent',
      id: emailResult.id,
      error: emailResult.error,
    };
  }

  return result;
}

export { TRIGGER_MAP, TRIGGER_TO_STATUS };
