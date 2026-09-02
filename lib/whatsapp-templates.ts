// WhatsApp message templates (client-safe, no server-only)
// These are pure functions that return message strings.

import type { OrderWhatsAppContext } from './whatsapp-types';
import { formatSAR } from './utils';

export type WhatsAppTemplate =
  | 'order_created'
  | 'order_confirmed'
  | 'order_shipped'
  | 'order_delivered'
  | 'order_cancelled';

export function renderWhatsApp(
  template: WhatsAppTemplate,
  ctx: OrderWhatsAppContext
): string {
  const itemsList = ctx.items
    .slice(0, 3)
    .map((i) => `  • ${i.quantity}× ${i.name}`)
    .join('\n');
  const moreItems = ctx.items.length > 3 ? `\n  + ${ctx.items.length - 3} منتج آخر` : '';

  switch (template) {
    case 'order_created':
      return `🚗 *ركوب* · تم استلام طلبك!

رقم الطلب: *${ctx.orderId}*
المبلغ: ${formatSAR(ctx.total)} ريال

المنتجات:
${itemsList}${moreItems}

سيتم التواصل معك خلال ساعات لتأكيد التوصيل.

تتبع: rukub.shop/orders/${ctx.orderId}`;

    case 'order_confirmed':
      return `✅ *ركوب* · تم تأكيد طلبك

رقم الطلب: *${ctx.orderId}*
${ctx.cjOrderId ? `رقم CJ: ${ctx.cjOrderId}\n` : ''}
جاري تجهيز طلبك من المستودع.

سيتم شحنه خلال 1-2 يوم عمل.

تتبع: rukub.shop/orders/${ctx.orderId}`;

    case 'order_shipped':
      return `🚚 *ركوب* · تم شحن طلبك!

رقم الطلب: *${ctx.orderId}*
${ctx.trackingNumber ? `رقم التتبع: *${ctx.trackingNumber}*\n` : ''}
طلبك في الطريق إليك. التوصيل المتوقع: 2-5 أيام عمل.

تتبع: rukub.shop/orders/${ctx.orderId}`;

    case 'order_delivered':
      return `🎉 *ركوب* · تم التوصيل بنجاح!

رقم الطلب: *${ctx.orderId}*

شكراً لاختيارك ركوب. رأيك يهمنا — قيّم المنتج وساعد عملاء آخرين.

تصفح المزيد: rukub.shop/discover`;

    case 'order_cancelled':
      return `✕ *ركوب* · تم إلغاء طلبك

رقم الطلب: *${ctx.orderId}*

إذا كان عن طريق الخطأ، يمكنك إعادة الطلب من:
rukub.shop/discover`;

    default:
      return `تحديث على طلبك *${ctx.orderId}*: ${ctx.newStatus ?? ''}`;
  }
}
