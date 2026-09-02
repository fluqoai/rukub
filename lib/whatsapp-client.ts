// WhatsApp Business client — server-side only.
// In production, use Meta's Cloud API or Twilio's WhatsApp Business API.
// In mock mode, logs the message to console.

import 'server-only';
import type { WhatsAppMessage, WhatsAppSendResult, WhatsAppStatus } from './whatsapp-types';
import type { OrderEmailContext } from './email-types';
import { renderWhatsApp, type WhatsAppTemplate } from './whatsapp-templates';
// Re-export for backwards compatibility
export { renderWhatsApp, type WhatsAppTemplate };

const WHATSAPP_TOKEN = process.env.WHATSAPP_API_KEY;
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID;
const META_API_URL = 'https://graph.facebook.com/v18.0';

export const isWhatsAppConfigured = (): boolean =>
  !!WHATSAPP_TOKEN && !!WHATSAPP_PHONE_ID;

function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/\s/g, '').replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+')) return cleaned.replace('+', '');
  if (cleaned.startsWith('966')) return cleaned;
  if (cleaned.startsWith('0')) return '966' + cleaned.slice(1);
  return '966' + cleaned;
}

export async function sendWhatsApp(msg: WhatsAppMessage): Promise<WhatsAppSendResult> {
  if (!isWhatsAppConfigured()) {
    console.log('[WHATSAPP MOCK]', {
      to: normalizePhone(msg.to),
      bodyPreview: msg.body.slice(0, 100),
    });
    return {
      id: `mock_wa_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      status: 'sent',
      provider: 'mock',
      to: normalizePhone(msg.to),
    };
  }

  try {
    const res = await fetch(
      `${META_API_URL}/${WHATSAPP_PHONE_ID}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: normalizePhone(msg.to),
          type: 'text',
          text: { body: msg.body },
        }),
        cache: 'no-store',
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      return {
        id: '',
        status: 'failed',
        provider: 'meta',
        to: normalizePhone(msg.to),
        error: errText,
      };
    }

    const data = await res.json();
    return {
      id: data.messages?.[0]?.id ?? '',
      status: 'sent',
      provider: 'meta',
      to: normalizePhone(msg.to),
    };
  } catch (err) {
    return {
      id: '',
      status: 'failed',
      provider: 'meta',
      to: normalizePhone(msg.to),
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

/**
 * Render and send an order-related WhatsApp message.
 * Accepts the same context as sendOrderEmail (OrderEmailContext + to).
 */
export async function sendOrderWhatsApp(
  template: WhatsAppTemplate,
  ctx: OrderEmailContext & { to: string }
): Promise<WhatsAppSendResult> {
  const { to, ...templateCtx } = ctx;
  const body = renderWhatsApp(template, templateCtx as any);
  return sendWhatsApp({ to, body });
}
