// Email templates — HTML + plain text versions
// All templates use the brand palette (sage/linen/wood)

import { type OrderEmailContext, type EmailTemplate } from './email-types';
import { formatSAR } from './utils';

const BRAND = {
  primary: '#6B7A5A',     // sage-500
  ink: '#2C2A26',        // ink-900
  linen: '#F5F1EA',      // linen-100
  text: '#4A4742',       // ink-700
  muted: '#7A766E',      // ink-500
  accent: '#B8956A',     // wood-500
};

const wrap = (content: string, title: string) => `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.linen};font-family:'IBM Plex Sans Arabic',Tahoma,Arial,sans-serif;color:${BRAND.text};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.linen};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 4px 16px rgba(44,42,38,0.08);">
          <tr>
            <td style="background-color:${BRAND.primary};padding:24px;text-align:center;">
              <div style="display:inline-block;width:48px;height:48px;background-color:rgba(255,255,255,0.15);border-radius:12px;text-align:center;line-height:48px;color:${BRAND.linen};font-weight:700;font-size:24px;">ر</div>
              <h1 style="margin:16px 0 0 0;color:${BRAND.linen};font-size:22px;font-weight:600;">ركوب</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 32px 16px 32px;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px 32px 32px;text-align:center;color:${BRAND.muted};font-size:12px;">
              <p style="margin:0;">ركوب · إكسسوارات سيارات مختارة للسوق السعودي</p>
              <p style="margin:8px 0 0 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'https://rukub.shop'}" style="color:${BRAND.primary};text-decoration:none;">الموقع</a> ·
                <a href="https://wa.me/966500000000" style="color:${BRAND.primary};text-decoration:none;">واتساب</a> ·
                <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'https://rukub.shop'}/orders" style="color:${BRAND.primary};text-decoration:none;">طلباتي</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const header = (icon: string, title: string) => `
<div style="text-align:center;margin-bottom:24px;">
  <div style="display:inline-block;width:64px;height:64px;background-color:${BRAND.primary}15;border-radius:50%;line-height:64px;font-size:32px;">${icon}</div>
  <h2 style="margin:16px 0 0 0;color:${BRAND.ink};font-size:24px;font-weight:600;">${title}</h2>
</div>
`;

const summaryCard = (ctx: OrderEmailContext) => {
  const items = ctx.items
    .map(
      (it) => `
<tr>
  <td style="padding:6px 0;color:${BRAND.text};font-size:13px;text-align:right;">${it.quantity}× ${it.name}</td>
  <td style="padding:6px 0;color:${BRAND.muted};font-size:12px;font-family:monospace;text-align:left;">${formatSAR(it.price * it.quantity)}</td>
</tr>`
    )
    .join('');
  const shippingLabel = ctx.shippingCost === 0 ? 'مجاني' : formatSAR(ctx.shippingCost);
  return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F1EA;border-radius:16px;margin:24px 0;">
  <tr>
    <td style="padding:20px;">
      <p style="margin:0 0 4px 0;color:${BRAND.muted};font-size:11px;text-align:right;text-transform:uppercase;letter-spacing:0.05em;">رقم الطلب</p>
      <p style="margin:0 0 16px 0;color:${BRAND.ink};font-size:18px;font-weight:600;font-family:monospace;text-align:right;">${ctx.orderId}</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #E5EBDB;padding-top:12px;">
        ${items}
      </table>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;border-top:1px solid #E5EBDB;padding-top:12px;">
        <tr>
          <td style="padding:2px 0;color:${BRAND.muted};font-size:12px;text-align:right;">المجموع الفرعي</td>
          <td style="padding:2px 0;color:${BRAND.text};font-size:12px;font-family:monospace;text-align:left;">${formatSAR(ctx.subtotal)}</td>
        </tr>
        <tr>
          <td style="padding:2px 0;color:${BRAND.muted};font-size:12px;text-align:right;">الشحن</td>
          <td style="padding:2px 0;color:${BRAND.text};font-size:12px;font-family:monospace;text-align:left;">${shippingLabel}</td>
        </tr>
        <tr>
          <td style="padding:8px 0 0 0;color:${BRAND.ink};font-size:14px;font-weight:600;text-align:right;">الإجمالي</td>
          <td style="padding:8px 0 0 0;color:${BRAND.ink};font-size:16px;font-weight:600;font-family:monospace;text-align:left;">${formatSAR(ctx.total)}</td>
        </tr>
      </table>
      <p style="margin:12px 0 0 0;color:${BRAND.muted};font-size:10px;text-align:right;">* شامل ضريبة القيمة المضافة 15%</p>
    </td>
  </tr>
</table>`;
};

const cta = (href: string, text: string) => `
<div style="text-align:center;margin:32px 0;">
  <a href="${href}" style="display:inline-block;background-color:${BRAND.primary};color:${BRAND.linen};padding:14px 32px;border-radius:32px;text-decoration:none;font-weight:600;font-size:14px;">${text}</a>
</div>
`;

export function renderEmail(
  template: EmailTemplate,
  ctx: OrderEmailContext
): { subject: string; html: string; text: string } {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://rukub.shop';
  const orderUrl = `${siteUrl}/orders/${ctx.orderId}`;

  switch (template) {
    case 'order_created':
      return {
        subject: `تم استلام طلبك #${ctx.orderId} · ركوب`,
        html: wrap(
          `
            ${header('✓', 'تم استلام طلبك!')}
            <p style="margin:0 0 16px 0;line-height:1.7;text-align:right;">مرحباً ${ctx.customerName}،</p>
            <p style="margin:0 0 16px 0;line-height:1.7;text-align:right;">شكراً لثقتك بنا. تم استلام طلبك بنجاح وسيتم معالجته خلال ساعات.</p>
            ${summaryCard(ctx)}
            <p style="margin:24px 0 0 0;line-height:1.7;text-align:right;">ستصلك رسالة تأكيد منفصلة عند تجهيز الطلب وشحنه.</p>
            ${cta(orderUrl, 'تتبع الطلب')}
          `,
          'تم استلام طلبك'
        ),
        text: `مرحباً ${ctx.customerName}، تم استلام طلبك #${ctx.orderId} بقيمة ${formatSAR(ctx.total)} ريال. تتبع طلبك: ${orderUrl}`,
      };

    case 'order_confirmed':
      return {
        subject: `تم تأكيد طلبك #${ctx.orderId} · ركوب`,
        html: wrap(
          `
            ${header('✓', 'تم تأكيد طلبك!')}
            <p style="margin:0 0 16px 0;line-height:1.7;text-align:right;">مرحباً ${ctx.customerName}،</p>
            <p style="margin:0 0 16px 0;line-height:1.7;text-align:right;">تم تأكيد طلبك وجاري تجهيزه من المستودع. سيتم شحنه خلال 1-2 يوم عمل.</p>
            ${summaryCard(ctx)}
            ${ctx.cjOrderId ? `<p style="margin:16px 0;color:${BRAND.muted};font-size:12px;text-align:right;">رقم الطلب في CJ: <span style="font-family:monospace;">${ctx.cjOrderId}</span></p>` : ''}
            ${cta(orderUrl, 'تتبع الطلب')}
          `,
          'تم تأكيد طلبك'
        ),
        text: `تم تأكيد طلبك #${ctx.orderId}. جاري تجهيزه من المستودع. تتبع: ${orderUrl}`,
      };

    case 'order_shipped':
      return {
        subject: `تم شحن طلبك #${ctx.orderId} · ركوب`,
        html: wrap(
          `
            ${header('🚚', 'تم شحن طلبك!')}
            <p style="margin:0 0 16px 0;line-height:1.7;text-align:right;">مرحباً ${ctx.customerName}،</p>
            <p style="margin:0 0 16px 0;line-height:1.7;text-align:right;">تم شحن طلبك وهو في الطريق إليك. التوصيل المتوقع خلال 2-5 أيام عمل.</p>
            ${ctx.trackingNumber ? `
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F1EA;border-radius:16px;margin:24px 0;">
                <tr>
                  <td style="padding:20px;text-align:right;">
                    <p style="margin:0 0 4px 0;color:${BRAND.muted};font-size:12px;">رقم التتبع</p>
                    <p style="margin:0;color:${BRAND.ink};font-size:16px;font-weight:600;font-family:monospace;">${ctx.trackingNumber}</p>
                  </td>
                </tr>
              </table>
            ` : ''}
            <p style="margin:24px 0;color:${BRAND.muted};font-size:14px;text-align:right;">عنوان التوصيل: ${ctx.shipping.district}، ${ctx.shipping.city}</p>
            ${cta(orderUrl, 'تتبع الشحنة')}
          `,
          'تم شحن طلبك'
        ),
        text: `تم شحن طلبك #${ctx.orderId}. رقم التتبع: ${ctx.trackingNumber ?? '—'}. التوصيل خلال 2-5 أيام. تتبع: ${orderUrl}`,
      };

    case 'order_delivered':
      return {
        subject: `تم التوصيل بنجاح #${ctx.orderId} · ركوب`,
        html: wrap(
          `
            ${header('🎉', 'تم التوصيل بنجاح!')}
            <p style="margin:0 0 16px 0;line-height:1.7;text-align:right;">مرحباً ${ctx.customerName}،</p>
            <p style="margin:0 0 16px 0;line-height:1.7;text-align:right;">تم توصيل طلبك بنجاح. نتمنى أن يعجبك!</p>
            <p style="margin:24px 0;line-height:1.7;text-align:right;">رأيك يهمنا. <a href="${siteUrl}/products/..." style="color:${BRAND.primary};">قيّم المنتج</a> وساعد عملاء آخرين.</p>
            ${cta(`${siteUrl}/discover`, 'تصفح المزيد')}
          `,
          'تم التوصيل بنجاح'
        ),
        text: `تم توصيل طلبك #${ctx.orderId} بنجاح. شكراً لاختيارك ركوب!`,
      };

    case 'order_cancelled':
      return {
        subject: `تم إلغاء طلبك #${ctx.orderId} · ركوب`,
        html: wrap(
          `
            ${header('✕', 'تم إلغاء طلبك')}
            <p style="margin:0 0 16px 0;line-height:1.7;text-align:right;">مرحباً ${ctx.customerName}،</p>
            <p style="margin:0 0 16px 0;line-height:1.7;text-align:right;">تم إلغاء طلبك. إذا كان هذا عن طريق الخطأ، يمكنك إعادة الطلب في أي وقت.</p>
            ${cta(`${siteUrl}/discover`, 'تصفح المنتجات')}
          `,
          'تم إلغاء طلبك'
        ),
        text: `تم إلغاء طلبك #${ctx.orderId}.`,
      };

    default:
      return {
        subject: 'تحديث طلبك',
        html: wrap('<p>تحديث على طلبك</p>', 'تحديث'),
        text: 'تحديث على طلبك',
      };
  }
}
