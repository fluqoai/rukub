'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  CheckCircle2,
  Package,
  ArrowLeft,
  ArrowRight,
  MessageCircle,
  Home,
  MapPin,
  Truck,
  AlertCircle,
  Clock,
  ShoppingBag,
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { useOrdersStore, type Order } from '@/lib/orders-store';
import { useI18n } from '@/lib/i18n';

const paymentLabel: Record<string, string> = {
  cod: 'الدفع عند الاستلام',
  tap: 'بطاقة / Apple Pay',
  tabby: 'تقسيط Tabby',
};

const statusLabel: Record<Order['status'], { text: string; color: string; icon: typeof Clock }> = {
  confirmed: { text: 'مؤكد', color: 'bg-sage-50 text-sage-700', icon: CheckCircle2 },
  pending_cj_sync: { text: 'بانتظار المزامنة', color: 'bg-wood-400/15 text-wood-700', icon: Clock },
  manual_followup: { text: 'يحتاج متابعة يدوية', color: 'bg-orange-50 text-orange-700', icon: AlertCircle },
  cancelled: { text: 'ملغي', color: 'bg-red-50 text-red-700', icon: AlertCircle },
};

export default function SuccessPage() {
  return (
    <Suspense fallback={<SuccessFallback />}>
      <SuccessContent />
    </Suspense>
  );
}

function SuccessFallback() {
  return (
    <main className="py-20">
      <Container>
        <div className="mx-auto h-96 max-w-xl animate-pulse rounded-3xl bg-linen-100" />
      </Container>
    </main>
  );
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order') ?? '';
  const { locale } = useI18n();
  const Arrow = locale === 'ar' ? ArrowLeft : ArrowRight;

  const order = useOrdersStore((s) => s.orders.find((o) => o.id === orderId));
  const hydrated = useOrdersStore((s) => s.hydrated);

  // Note: notifications (email + WhatsApp) are dispatched server-side
  // from /api/orders when the order is created. This page just confirms
  // to the customer — no network sends happen on the client.

  if (!hydrated) return <SuccessFallback />;
  if (!order) {
    return (
      <main className="py-20">
        <Container>
          <div className="mx-auto max-w-xl rounded-3xl border border-sage-500/10 bg-linen-50 p-8 text-center">
            <p className="text-ink-700">لم يتم العثور على الطلب.</p>
            <Link href="/" className="mt-4 inline-block text-sage-600 hover:text-sage-700">
              العودة للرئيسية
            </Link>
          </div>
        </Container>
      </main>
    );
  }

  const statusInfo = statusLabel[order.status];
  const StatusIcon = statusInfo.icon;

  return (
    <main className="py-12 md:py-20">
      <Container>
        <div className="mx-auto max-w-2xl">
          {/* Success icon */}
          <div className="text-center">
            <div className="mx-auto inline-flex h-20 w-20 items-center justify-center rounded-full bg-sage-100 text-sage-600">
              {order.status === 'confirmed' ? (
                <CheckCircle2 className="h-10 w-10" strokeWidth={1.5} />
              ) : (
                <StatusIcon className="h-10 w-10" strokeWidth={1.5} />
              )}
            </div>
            <h1 className="mt-6 text-3xl font-semibold text-ink-900">
              {order.status === 'confirmed' ? 'تم استلام طلبك!' : 'تم حفظ طلبك'}
            </h1>
            <p className="mt-3 text-base text-ink-500">
              {order.status === 'confirmed'
                ? 'شكراً لثقتك بنا. سنتواصل معك خلال ساعات لتأكيد التوصيل.'
                : order.status === 'manual_followup'
                ? 'تم حفظ طلبك محلياً. سنتواصل معك خلال ساعات لإتمام المعالجة يدوياً.'
                : 'طلبك قيد المعالجة.'}
            </p>
          </div>

          {/* Order card */}
          <div className="mt-10 rounded-3xl border border-sage-500/15 bg-linen-50 p-6 text-start">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-sage-500/10 pb-4">
              <div>
                <p className="text-xs text-ink-500">رقم الطلب</p>
                <p className="font-mono text-lg font-semibold text-ink-900">
                  {order.id}
                </p>
              </div>
              <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${statusInfo.color}`}>
                <StatusIcon className="h-3.5 w-3.5" />
                {statusInfo.text}
              </div>
            </div>

            {/* CJ data */}
            {order.cjOrderId && (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-linen-100/50 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-ink-500">
                    رقم CJ
                  </p>
                  <p className="mt-1 font-mono text-sm font-semibold text-ink-900">
                    {order.cjOrderId}
                  </p>
                </div>
                {order.trackingNumber && (
                  <div className="rounded-2xl bg-linen-100/50 p-3">
                    <p className="text-[10px] uppercase tracking-wider text-ink-500">
                      رقم التتبع
                    </p>
                    <p className="mt-1 font-mono text-sm font-semibold text-ink-900">
                      {order.trackingNumber}
                    </p>
                  </div>
                )}
              </div>
            )}

            {order.cjError && (
              <div className="mt-4 rounded-2xl border border-orange-200 bg-orange-50 p-3 text-xs text-orange-700">
                <p className="font-medium">ملاحظة:</p>
                <p className="mt-1">{order.cjError}</p>
              </div>
            )}

            {/* Shipping */}
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <Home className="mt-0.5 h-4 w-4 text-ink-500" strokeWidth={1.5} />
                <div>
                  <p className="text-ink-500 text-xs">المستلم</p>
                  <p className="font-medium text-ink-900">{order.shipping.fullName}</p>
                  <p className="text-xs text-ink-500" dir="ltr">{order.shipping.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 text-ink-500" strokeWidth={1.5} />
                <div>
                  <p className="text-ink-500 text-xs">عنوان التوصيل</p>
                  <p className="font-medium text-ink-900">
                    {order.shipping.district}، {order.shipping.city}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Package className="mt-0.5 h-4 w-4 text-ink-500" strokeWidth={1.5} />
                <div className="flex-1">
                  <p className="text-ink-500 text-xs">المنتجات ({order.items.length})</p>
                  <ul className="mt-1 space-y-0.5">
                    {order.items.map((it) => (
                      <li key={it.productId} className="text-ink-700">
                        {it.quantity}× {it.shortName}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ShoppingBag className="mt-0.5 h-4 w-4 text-ink-500" strokeWidth={1.5} />
                <div>
                  <p className="text-ink-500 text-xs">طريقة الدفع</p>
                  <p className="font-medium text-ink-900">
                    {paymentLabel[order.payment] ?? order.payment}
                  </p>
                </div>
              </div>
            </div>

            {/* Total */}
            <div className="mt-4 flex items-center justify-between border-t border-sage-500/10 pt-4">
              <span className="text-sm text-ink-500">الإجمالي</span>
              <span className="font-mono text-xl font-semibold tabular-nums text-ink-900">
                {new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR', maximumFractionDigits: 0 }).format(order.total)}
              </span>
            </div>
          </div>

          {/* Timeline */}
          <div className="mt-10 rounded-3xl bg-linen-100/50 p-6">
            <p className="mb-4 text-start text-xs font-medium uppercase tracking-wider text-ink-500">
              ماذا يحدث الآن؟
            </p>
            <ol className="space-y-3 text-start text-sm">
              <Step n={1} active>
                تأكيد الطلب من فريقنا خلال 1-2 ساعة
              </Step>
              <Step n={2}>
                تجهيز الطلب وشحنه من المستودع
              </Step>
              <Step n={3}>
                التوصيل خلال 2-5 أيام عمل
              </Step>
              <Step n={4}>
                استلام + دفع نقداً (إن اخترت COD)
              </Step>
            </ol>
          </div>

          {/* CTAs */}
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href={`/orders/${order.id}`}
              className="inline-flex items-center gap-2 rounded-full bg-sage-500 px-6 py-3 text-sm font-medium text-linen-50 transition-colors hover:bg-sage-600"
            >
              <Truck className="h-4 w-4" strokeWidth={1.5} />
              تتبع الطلب
              <Arrow className="h-4 w-4" strokeWidth={2} />
            </Link>
            <a
              href="https://wa.me/966500000000"
              className="inline-flex items-center gap-2 rounded-full border border-sage-500/20 bg-linen-50 px-6 py-3 text-sm font-medium text-ink-700 transition-colors hover:bg-sage-50"
            >
              <MessageCircle className="h-4 w-4" strokeWidth={1.5} />
              تواصل عبر واتساب
            </a>
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
        className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full font-mono text-xs ${
          active ? 'bg-sage-500 text-linen-50' : 'bg-linen-100 text-ink-500'
        }`}
      >
        {active ? '✓' : n}
      </div>
      <span className={active ? 'font-medium text-ink-900' : 'text-ink-700'}>
        {children}
      </span>
    </li>
  );
}
