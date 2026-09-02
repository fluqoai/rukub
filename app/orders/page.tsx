'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, ArrowRight, Package, Truck, Clock, AlertCircle, CheckCircle2, ShoppingBag, ChevronLeft, Loader2 } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { useOrdersStore, type Order } from '@/lib/orders-store';
import { useDbOrders, type Order as DbOrder } from '@/lib/hooks/useDbOrders';
import { useI18n } from '@/lib/i18n';
import { cn, formatSAR } from '@/lib/utils';

type StatusFilter = 'all' | 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

const statusInfo: Record<string, { text: string; color: string; Icon: typeof Clock }> = {
  pending: { text: 'بانتظار', color: 'bg-wood-400/15 text-wood-700', Icon: Clock },
  confirmed: { text: 'مؤكد', color: 'bg-sage-50 text-sage-700', Icon: CheckCircle2 },
  processing: { text: 'قيد التجهيز', color: 'bg-ink-900/8 text-ink-700', Icon: Package },
  shipped: { text: 'تم الشحن', color: 'bg-sage-100 text-sage-700', Icon: Truck },
  delivered: { text: 'مسلّم', color: 'bg-sage-100 text-sage-700', Icon: CheckCircle2 },
  cancelled: { text: 'ملغي', color: 'bg-red-50 text-red-700', Icon: AlertCircle },
  manual_followup: { text: 'يحتاج متابعة', color: 'bg-orange-50 text-orange-700', Icon: AlertCircle },
};

const paymentLabel: Record<string, string> = {
  cod: 'الدفع عند الاستلام',
  tap: 'بطاقة / Apple Pay',
  tabby: 'Tabby',
};

type CombinedOrder = DbOrder & { items?: any[]; createdAt?: string };

export default function OrdersPage() {
  const { locale } = useI18n();
  const Arrow = locale === 'ar' ? ArrowLeft : ArrowRight;
  const { orders: dbOrders, loading, error } = useDbOrders();
  const localOrders = useOrdersStore((s) => s.orders);
  const hydrated = useOrdersStore((s) => s.hydrated);
  const [filter, setFilter] = useState<StatusFilter>('all');

  // Combine DB orders + local orders (for backwards compat — only DB orders have orderId)
  const orders: CombinedOrder[] = [
    ...dbOrders.map((o) => ({
      ...o,
      createdAt: o.placed_at,
    })),
    ...(hydrated
      ? localOrders
          .filter((lo) => !dbOrders.find((d) => d.id === lo.id))
          .map((lo) => ({
            id: lo.id,
            status: lo.status as any,
            payment_method: lo.payment,
            shipping_full_name: lo.shipping.fullName,
            shipping_phone: lo.shipping.phone,
            shipping_city: lo.shipping.city,
            shipping_district: lo.shipping.district,
            subtotal: lo.subtotal,
            shipping_cost: lo.shippingCost,
            total: lo.total,
            cj_order_id: lo.cjOrderId ?? null,
            tracking_number: lo.trackingNumber ?? null,
            placed_at: lo.createdAt,
            createdAt: lo.createdAt,
            items: lo.items.map((i) => ({
              product_id: i.productId,
              product_short_name: i.shortName,
              quantity: i.quantity,
            })),
          }))
      : []),
  ];

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  if (loading && orders.length === 0) {
    return (
      <main className="py-20">
        <Container>
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-sage-500" />
          </div>
        </Container>
      </main>
    );
  }

  return (
    <main className="py-10 md:py-14">
      <Container>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="eyebrow">حسابي</span>
            <h1 className="mt-3 text-3xl font-semibold text-ink-900 md:text-4xl">
              طلباتي
            </h1>
            <p className="mt-2 text-sm text-ink-500">
              {orders.length > 0 ? `لديك ${orders.length} طلب` : 'لم تقم بأي طلب بعد'}
            </p>
          </div>

          {orders.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all' as const, label: 'الكل' },
                { key: 'confirmed' as const, label: 'مؤكدة' },
                { key: 'shipped' as const, label: 'تم الشحن' },
                { key: 'delivered' as const, label: 'مسلّمة' },
                { key: 'cancelled' as const, label: 'ملغية' },
              ].map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilter(f.key)}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                    filter === f.key
                      ? 'border-sage-500 bg-sage-500 text-linen-50'
                      : 'border-sage-500/20 bg-linen-50 text-ink-700 hover:bg-sage-50'
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {orders.length === 0 && (
          <div className="mx-auto max-w-md rounded-3xl border border-sage-500/10 bg-linen-50 px-8 py-16 text-center">
            <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-sage-50 text-sage-500">
              <Package className="h-8 w-8" strokeWidth={1.25} />
            </div>
            <h2 className="mt-5 text-xl font-semibold text-ink-900">لا توجد طلبات بعد</h2>
            <p className="mt-2 text-sm text-ink-500">ابدأ التسوّق وستظهر طلباتك هنا لتتبعها.</p>
            <Link
              href="/#products"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-sage-500 px-5 py-3 text-sm font-medium text-linen-50 transition-colors hover:bg-sage-600"
            >
              تسوّق الآن
              <Arrow className="h-4 w-4" strokeWidth={2} />
            </Link>
          </div>
        )}

        {filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((order) => {
              const info = statusInfo[order.status] || statusInfo.pending;
              const Icon = info.Icon;
              const date = new Date(order.placed_at || order.createdAt || new Date().toISOString());
              const formatted = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;

              return (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="group flex items-center gap-4 rounded-2xl border border-sage-500/10 bg-linen-50 p-5 transition-colors hover:border-sage-500/30 hover:bg-sage-50/40"
                >
                  <div className={cn('flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl', info.color)}>
                    <Icon className="h-6 w-6" strokeWidth={1.5} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <p className="font-mono text-sm font-semibold text-ink-900">{order.id}</p>
                      <span className="text-xs text-ink-500">· {formatted}</span>
                    </div>
                    <p className="mt-1 text-xs text-ink-500">
                      {order.items?.length ?? 0} منتج · {paymentLabel[order.payment_method] ?? order.payment_method}
                      {order.shipping_full_name && ` · ${order.shipping_full_name}`}
                    </p>
                    {order.items && order.items.length > 0 && (
                      <p className="mt-0.5 text-xs text-ink-300 line-clamp-1">
                        {order.items.slice(0, 3).map((i: any) => i.product_short_name).join('، ')}
                        {order.items.length > 3 && ` +${order.items.length - 3}`}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-shrink-0 items-center gap-3">
                    <div className="text-end">
                      <p className="font-mono text-sm font-semibold tabular-nums text-ink-900">
                        {formatSAR(order.total)}
                      </p>
                      <p className="mt-0.5 text-[10px] text-ink-500">{info.text}</p>
                    </div>
                    <ChevronLeft className={cn('h-4 w-4 text-ink-500 transition-transform group-hover:-translate-x-0.5 rtl:group-hover:translate-x-0.5', locale === 'ar' && 'rotate-180')} />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </Container>
    </main>
  );
}
