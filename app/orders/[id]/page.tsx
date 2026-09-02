'use client';

import Link from 'next/link';
import {
  Package,
  ArrowLeft,
  ArrowRight,
  Home,
  MapPin,
  Truck,
  AlertCircle,
  CheckCircle2,
  Clock,
  ShoppingBag,
  MessageCircle,
  Loader2,
  Search,
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { useDbOrder } from '@/lib/hooks/useDbOrders';
import { useI18n } from '@/lib/i18n';
import { cn, formatSAR } from '@/lib/utils';

const statusInfo: Record<string, { text: string; color: string; icon: typeof Clock; description: string }> = {
  pending:           { text: 'بانتظار التأكيد',   color: 'bg-wood-400/15 text-wood-700',   icon: Clock,        description: 'طلبك قيد المراجعة' },
  confirmed:         { text: 'مؤكد',               color: 'bg-sage-50 text-sage-700',        icon: CheckCircle2, description: 'تم تأكيد طلبك بنجاح' },
  processing:        { text: 'قيد التجهيز',        color: 'bg-ink-900/8 text-ink-700',       icon: Package,      description: 'يتم تجهيز طلبك' },
  shipped:           { text: 'تم الشحن',           color: 'bg-sage-100 text-sage-700',       icon: Truck,        description: 'طلبك في الطريق إليك' },
  delivered:         { text: 'مسلّم',              color: 'bg-sage-100 text-sage-700',       icon: CheckCircle2, description: 'تم التوصيل بنجاح' },
  cancelled:         { text: 'ملغي',               color: 'bg-red-50 text-red-700',          icon: AlertCircle,  description: 'تم إلغاء الطلب' },
  pending_cj_sync:   { text: 'بانتظار المزامنة',   color: 'bg-wood-400/15 text-wood-700',   icon: Clock,        description: 'بانتظار المزامنة مع المورّد' },
  manual_followup:   { text: 'يحتاج متابعة',       color: 'bg-orange-50 text-orange-700',    icon: AlertCircle,  description: 'سنتواصل معك لإتمام الطلب' },
  refunded:          { text: 'مسترد',              color: 'bg-ink-900/8 text-ink-700',       icon: CheckCircle2, description: 'تم استرداد المبلغ' },
};

const paymentLabel: Record<string, string> = {
  cod: 'الدفع عند الاستلام',
  tap: 'بطاقة / Apple Pay (Tap)',
  tabby: 'تقسيط Tabby (4 دفعات)',
};

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const id = params.id;
  const { locale } = useI18n();
  const Arrow = locale === 'ar' ? ArrowLeft : ArrowRight;
  const { order, loading, error, refetch } = useDbOrder(id);

  if (loading) {
    return (
      <main className="py-20">
        <Container>
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-7 w-7 animate-spin text-sage-500" />
            <p className="mt-3 text-sm text-ink-500">جاري تحميل الطلب...</p>
          </div>
        </Container>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="py-20">
        <Container>
          <div className="mx-auto max-w-xl">
            <div className="rounded-3xl border border-sage-500/10 bg-linen-50 p-8 text-center">
              <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-sage-50 text-sage-500">
                <Search className="h-7 w-7" strokeWidth={1.5} />
              </div>
              <h1 className="mt-4 text-xl font-semibold text-ink-900">لم يتم العثور على الطلب</h1>
              <p className="mt-2 text-sm text-ink-500">
                تأكد من رقم الطلب وحاول مرة أخرى. أو ابحث في صفحة طلباتي.
              </p>
              <p className="mt-4 font-mono text-xs text-ink-300" dir="ltr">{id}</p>
              <div className="mt-6 flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
                <Link
                  href="/orders"
                  className="inline-flex items-center gap-2 rounded-full bg-sage-500 px-5 py-2.5 text-sm font-medium text-linen-50 transition-colors hover:bg-sage-600"
                >
                  صفحة طلباتي
                  <Arrow className="h-4 w-4" />
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-full border border-sage-500/20 bg-linen-50 px-5 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:bg-sage-50"
                >
                  العودة للرئيسية
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </main>
    );
  }

  const info = statusInfo[order.status] ?? statusInfo.pending;
  const Icon = info.icon;
  const date = new Date(order.placed_at);
  const dateStr = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
  const timeStr = date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });

  return (
    <main className="py-10 md:py-14">
      <Container>
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <span className="eyebrow">تفاصيل الطلب</span>
              <h1 className="mt-2 font-mono text-2xl font-semibold text-ink-900 md:text-3xl">
                {order.id}
              </h1>
              <p className="mt-1 text-xs text-ink-500">
                {dateStr} · {timeStr}
              </p>
            </div>
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center gap-1.5 rounded-full border border-sage-500/20 bg-linen-50 px-3 py-1.5 text-xs font-medium text-ink-700 transition-colors hover:bg-sage-50"
            >
              <Loader2 className="h-3 w-3" />
              تحديث
            </button>
          </div>

          {/* Status card */}
          <div className="rounded-3xl border border-sage-500/15 bg-linen-50 p-6">
            <div className="flex items-center gap-3">
              <div className={cn('flex h-12 w-12 items-center justify-center rounded-2xl', info.color)}>
                <Icon className="h-6 w-6" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-xs text-ink-500">حالة الطلب</p>
                <p className="mt-0.5 text-base font-semibold text-ink-900">{info.text}</p>
                <p className="mt-0.5 text-xs text-ink-500">{info.description}</p>
              </div>
            </div>

            {/* Tracking */}
            {(order.cj_order_id || order.tracking_number) && (
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {order.cj_order_id && (
                  <div className="rounded-2xl bg-linen-100/50 p-3">
                    <p className="text-[10px] uppercase tracking-wider text-ink-500">رقم الطلب عند المورّد</p>
                    <p className="mt-1 font-mono text-sm font-semibold text-ink-900">{order.cj_order_id}</p>
                  </div>
                )}
                {order.tracking_number && (
                  <div className="rounded-2xl bg-linen-100/50 p-3">
                    <p className="text-[10px] uppercase tracking-wider text-ink-500">رقم التتبع</p>
                    <p className="mt-1 font-mono text-sm font-semibold text-ink-900">{order.tracking_number}</p>
                  </div>
                )}
              </div>
            )}

            {/* Items */}
            <div className="mt-5 border-t border-sage-500/10 pt-4">
              <div className="mb-2 flex items-center gap-2 text-xs text-ink-500">
                <Package className="h-3.5 w-3.5" />
                <span>المنتجات ({order.items?.length ?? 0})</span>
              </div>
              <ul className="space-y-1.5 text-sm">
                {(order.items ?? []).map((it) => (
                  <li key={it.id} className="flex items-center justify-between gap-3">
                    <span className="text-ink-700">
                      {it.quantity}× {it.product_short_name || it.product_name}
                    </span>
                    <span className="font-mono text-xs text-ink-500 tabular-nums">
                      {formatSAR(it.subtotal)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Shipping */}
            <div className="mt-5 space-y-3 border-t border-sage-500/10 pt-4 text-sm">
              <div className="flex items-start gap-3">
                <Home className="mt-0.5 h-4 w-4 text-ink-500" strokeWidth={1.5} />
                <div>
                  <p className="text-xs text-ink-500">المستلم</p>
                  <p className="font-medium text-ink-900">{order.shipping_full_name}</p>
                  <p className="text-xs text-ink-500" dir="ltr">{order.shipping_phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 text-ink-500" strokeWidth={1.5} />
                <div>
                  <p className="text-xs text-ink-500">عنوان التوصيل</p>
                  <p className="font-medium text-ink-900">
                    {order.shipping_district}، {order.shipping_city}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ShoppingBag className="mt-0.5 h-4 w-4 text-ink-500" strokeWidth={1.5} />
                <div>
                  <p className="text-xs text-ink-500">طريقة الدفع</p>
                  <p className="font-medium text-ink-900">
                    {paymentLabel[order.payment_method] ?? order.payment_method}
                  </p>
                </div>
              </div>
            </div>

            {/* Totals */}
            <div className="mt-5 space-y-2 border-t border-sage-500/10 pt-4 text-sm">
              <div className="flex items-center justify-between text-ink-500">
                <span>المجموع الفرعي</span>
                <span className="font-mono tabular-nums">{formatSAR(order.subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-ink-500">
                <span>الشحن</span>
                <span className="font-mono tabular-nums">
                  {order.shipping_cost === 0 ? 'مجاني' : formatSAR(order.shipping_cost)}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-sage-500/10 pt-2 text-base font-semibold">
                <span className="text-ink-900">الإجمالي</span>
                <span className="font-mono tabular-nums text-ink-900">{formatSAR(order.total)}</span>
              </div>
              <p className="pt-1 text-[10px] text-ink-300">* شامل ضريبة القيمة المضافة 15%</p>
            </div>
          </div>

          {/* Timeline */}
          <div className="mt-6 rounded-3xl bg-linen-100/50 p-6">
            <p className="mb-4 text-xs font-medium uppercase tracking-wider text-ink-500">
              ماذا يحدث الآن؟
            </p>
            <ol className="space-y-3 text-sm">
              <Step n={1} active={['pending', 'pending_cj_sync', 'manual_followup', 'confirmed', 'processing', 'shipped', 'delivered'].includes(order.status)}>
                تأكيد الطلب من فريقنا خلال 1-2 ساعة
              </Step>
              <Step n={2} active={['confirmed', 'processing', 'shipped', 'delivered'].includes(order.status)}>
                تجهيز الطلب وشحنه من المستودع
              </Step>
              <Step n={3} active={['shipped', 'delivered'].includes(order.status)}>
                التوصيل خلال 2-5 أيام عمل
              </Step>
              <Step n={4} active={order.status === 'delivered'}>
                {order.payment_method === 'cod' ? 'استلام + دفع نقداً' : 'استلام الطلب'}
              </Step>
            </ol>
          </div>

          {/* Help */}
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <a
              href="https://wa.me/966500000000"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-sage-500/20 bg-linen-50 px-5 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:bg-sage-50"
            >
              <MessageCircle className="h-4 w-4" strokeWidth={1.5} />
              تواصل عبر واتساب
            </a>
            <Link
              href="/orders"
              className="inline-flex items-center gap-2 rounded-full border border-sage-500/20 bg-linen-50 px-5 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:bg-sage-50"
            >
              <Arrow className="h-4 w-4" />
              كل طلباتي
            </Link>
          </div>
        </div>
      </Container>
    </main>
  );
}

function Step({ n, children, active }: { n: number; children: React.ReactNode; active?: boolean }) {
  return (
    <li className="flex items-start gap-3">
      <div
        className={cn(
          'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full font-mono text-xs',
          active ? 'bg-sage-500 text-linen-50' : 'bg-linen-100 text-ink-500'
        )}
      >
        {active ? '✓' : n}
      </div>
      <span className={active ? 'font-medium text-ink-900' : 'text-ink-700'}>{children}</span>
    </li>
  );
}
