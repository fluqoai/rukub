// High-level service that orchestrates notifications.
// Reads preferences, sends via Email/WhatsApp, logs to store.

import 'server-only';
import { sendOrderEmail } from './email-client';
import { sendOrderWhatsApp } from './whatsapp-client';
import type { Order } from './orders-store';
import { defaultPreferences, type NotificationTrigger, type NotificationChannel } from './notifications-types';

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
  customPreferences?: { email?: boolean; whatsapp?: boolean };
};

export type NotificationResult = {
  email: { sent: boolean; id?: string; error?: string } | null;
  whatsapp: { sent: boolean; id?: string; error?: string } | null;
};

export async function sendOrderNotification(
  params: SendNotificationParams
): Promise<NotificationResult> {
  const { order, trigger, customPreferences } = params;

  // Check preferences (default: send email on all, WhatsApp on confirmation+)
  const prefs = customPreferences ?? {
    email: defaultPreferences.email[trigger],
    whatsapp: defaultPreferences.whatsapp[trigger],
  };

  const result: NotificationResult = { email: null, whatsapp: null };

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
  if (prefs.email && order.shipping.email) {
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

  // WhatsApp
  if (prefs.whatsapp && order.shipping.phone) {
    const waResult = await sendOrderWhatsApp(trigger, {
      ...commonCtx,
      to: order.shipping.phone,
    });
    result.whatsapp = {
      sent: waResult.status === 'sent',
      id: waResult.id,
      error: waResult.error,
    };
  }

  return result;
}

export { TRIGGER_MAP, TRIGGER_TO_STATUS };
