// Email client — server-side only.
// In production, use Resend (https://resend.com) or any SMTP provider.
// In mock mode (no RESEND_API_KEY), logs to console + saves to notifications store.

import 'server-only';
import type { EmailMessage, EmailSendResult, EmailTemplate } from './email-types';
import { renderEmail } from './email-templates';
import { type OrderEmailContext } from './email-types';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL ?? 'orders@rukub.shop';
const REPLY_TO = process.env.REPLY_TO ?? 'support@rukub.shop';

export const isEmailConfigured = (): boolean => !!RESEND_API_KEY;

export async function sendEmail(msg: EmailMessage): Promise<EmailSendResult> {
  if (!RESEND_API_KEY) {
    // Mock mode — log to console
    console.log('[EMAIL MOCK]', {
      to: msg.to,
      subject: msg.subject,
      preview: msg.text.slice(0, 100),
    });
    return {
      id: `mock_email_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      status: 'sent',
      provider: 'mock',
      to: msg.to,
    };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: msg.from ?? FROM_EMAIL,
        to: msg.to,
        subject: msg.subject,
        html: msg.html,
        text: msg.text,
        reply_to: msg.replyTo ?? REPLY_TO,
      }),
      cache: 'no-store',
    });

    if (!res.ok) {
      const errText = await res.text();
      return {
        id: '',
        status: 'failed',
        provider: 'resend',
        to: msg.to,
        error: errText,
      };
    }

    const data = await res.json();
    return {
      id: data.id,
      status: 'sent',
      provider: 'resend',
      to: msg.to,
    };
  } catch (err) {
    return {
      id: '',
      status: 'failed',
      provider: 'resend',
      to: msg.to,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

/**
 * Render and send an order-related email.
 */
export async function sendOrderEmail(
  template: EmailTemplate,
  ctx: OrderEmailContext & { to: string }
): Promise<EmailSendResult> {
  const { to, ...templateCtx } = ctx;
  const { subject, html, text } = renderEmail(template, templateCtx);
  return sendEmail({ to, subject, html, text });
}
