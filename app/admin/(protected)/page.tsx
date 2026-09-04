'use client';

import Link from 'next/link';
import {
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Users,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  Truck,
} from 'lucide-react';
import { useMemo } from 'react';
import { useAdminOrdersView } from '@/lib/hooks/useAdminOrdersView';
type Order = ReturnType<typeof useAdminOrdersView>['orders'][number];
import { AdminHeader } from '@/components/admin/AdminHeader';
import { formatSAR, cn } from '@/lib/utils';

export default function AdminDashboardPage() {
  const { orders, loading, error, refetch } = useAdminOrdersView();

  const stats = useMemo(() => {
    const total = orders.length;
    const completed = orders.filter(o => o.status === 'delivered');
    const revenue = completed.reduce((acc, o) => acc + o.total, 0);
    const aov = completed.length > 0 ? revenue / completed.length : 0;
    const confirmed = orders.filter((o) => o.status === 'confirmed').length;
    const pending = orders.filter((o) => o.status === 'pending').length;
    const manualFollowup = orders.filter((o) => !!o.cj_error).length;
    const cancelled = orders.filter((o) => o.status === 'cancelled').length;

    // Top products
    const productCount: Record<string, { name: string; count: number; revenue: number }> = {};
    completed.forEach((o) => {
      o.items.forEach((it) => {
        if (!productCount[it.productId]) {
          productCount[it.productId] = { name: it.shortName, count: 0, revenue: 0 };
        }
        productCount[it.productId].count += it.quantity;
        productCount[it.productId].revenue += it.price * it.quantity;
      });
    });
    const topProducts = Object.values(productCount)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Last 7 days revenue
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 86400000;
    const last7Days = orders.filter((o) => new Date(o.createdAt).getTime() > sevenDaysAgo);
    const revenue7d = last7Days.filter(o => o.status === 'delivered').reduce((acc, o) => acc + o.total, 0);

    return {
      total,
      revenue,
      aov,
      confirmed,
      pending,
      manualFollowup,
      cancelled,
      topProducts,
      last7Days: last7Days.length,
      revenue7d,
    };
  }, [orders]);

  return (
    <>
      <AdminHeader
        title="لوحة التحكم"
        subtitle="بيانات الخادم · أحدث 1000 طلب · القيم المالية للطلبات المسلّمة وليست إثبات تحصيل"
        onRefresh={refetch}
      />

      <div className="p-6">
        {loading && <p role="status">جارٍ تحديث البيانات…</p>}
        {error && <p role="alert" className="mb-4 text-red-700">{error}</p>}
        {/* Stat cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="قيمة الطلبات المسلّمة"
            value={formatSAR(stats.revenue)}
            sub={`آخر 7 أيام: ${formatSAR(stats.revenue7d)}`}
            Icon={DollarSign}
            color="sage"
          />
          <StatCard
            label="إجمالي الطلبات"
            value={stats.total.toString()}
            sub={`آخر 7 أيام: ${stats.last7Days} طلب`}
            Icon={ShoppingCart}
            color="ink"
          />
          <StatCard
            label="متوسط الطلب (AOV)"
            value={formatSAR(Math.round(stats.aov))}
            sub="لكل عميل"
            Icon={TrendingUp}
            color="wood"
          />
          <StatCard
            label="عملاء فريدون"
            value={new Set(orders.map((o) => o.shipping.phone)).size.toString()}
            sub="بناءً على رقم الجوال"
            Icon={Users}
            color="sage"
          />
        </div>

        {/* Status breakdown */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatusCard
            label="مؤكدة"
            count={stats.confirmed}
            Icon={CheckCircle2}
            color="bg-sage-100 text-sage-700"
          />
          <StatusCard
            label="بانتظار التأكيد"
            count={stats.pending}
            Icon={Clock}
            color="bg-wood-400/15 text-wood-700"
          />
          <StatusCard
            label="متابعة يدوية"
            count={stats.manualFollowup}
            Icon={AlertCircle}
            color="bg-orange-100 text-orange-700"
          />
          <StatusCard
            label="ملغية"
            count={stats.cancelled}
            Icon={Truck}
            color="bg-red-100 text-red-700"
          />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Recent orders */}
          <div className="lg:col-span-2">
            <div className="rounded-3xl border border-sage-500/10 bg-linen-50 p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold text-ink-900">آخر الطلبات</h2>
                <Link
                  href="/admin/orders"
                  className="inline-flex items-center gap-1 text-xs font-medium text-sage-600 hover:text-sage-700"
                >
                  عرض الكل
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
              {orders.length === 0 ? (
                <p className="rounded-2xl bg-linen-100/50 p-8 text-center text-sm text-ink-500">
                  لا توجد طلبات بعد. ستظهر هنا عند أول طلب.
                </p>
              ) : (
                <div className="space-y-2">
                  {orders.slice(0, 5).map((order) => (
                    <OrderRow key={order.id} order={order} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Top products */}
          <div>
            <div className="rounded-3xl border border-sage-500/10 bg-linen-50 p-6">
              <h2 className="mb-4 text-base font-semibold text-ink-900">أعلى المنتجات</h2>
              {stats.topProducts.length === 0 ? (
                <p className="rounded-2xl bg-linen-100/50 p-6 text-center text-xs text-ink-500">
                  لا توجد بيانات
                </p>
              ) : (
                <ol className="space-y-2">
                  {stats.topProducts.map((p, i) => (
                    <li
                      key={p.name}
                      className="flex items-center justify-between rounded-xl bg-linen-100/30 px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-sage-500/15 font-mono text-[10px] font-semibold text-sage-700">
                          {i + 1}
                        </span>
                        <span className="line-clamp-1 text-xs font-medium text-ink-900">
                          {p.name}
                        </span>
                      </div>
                      <div className="text-end">
                        <p className="font-mono text-xs font-semibold tabular-nums text-ink-900">
                          {formatSAR(p.revenue)}
                        </p>
                        <p className="font-mono text-[10px] text-ink-500">{p.count}×</p>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

type StatCardProps = {
  label: string;
  value: string;
  sub: string;
  Icon: typeof DollarSign;
  trend?: { value: number; up: boolean };
  color: 'sage' | 'ink' | 'wood';
};

function StatCard({ label, value, sub, Icon, trend, color }: StatCardProps) {
  const colorMap = {
    sage: 'bg-sage-500/10 text-sage-600',
    ink: 'bg-ink-900/8 text-ink-700',
    wood: 'bg-wood-400/15 text-wood-700',
  };

  return (
    <div className="rounded-3xl border border-sage-500/10 bg-linen-50 p-5">
      <div className="flex items-start justify-between">
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', colorMap[color])}>
          <Icon className="h-5 w-5" strokeWidth={1.5} />
        </div>
        {trend && (
          <div
            className={cn(
              'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-medium',
              trend.up ? 'bg-sage-100 text-sage-700' : 'bg-red-100 text-red-700'
            )}
          >
            {trend.up ? (
              <ArrowUpRight className="h-2.5 w-2.5" />
            ) : (
              <ArrowDownRight className="h-2.5 w-2.5" />
            )}
            {trend.value}%
          </div>
        )}
      </div>
      <p className="mt-3 text-xs text-ink-500">{label}</p>
      <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-ink-900">{value}</p>
      <p className="mt-1 text-[10px] text-ink-500">{sub}</p>
    </div>
  );
}

type StatusCardProps = {
  label: string;
  count: number;
  Icon: typeof CheckCircle2;
  color: string;
};

function StatusCard({ label, count, Icon, color }: StatusCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-sage-500/10 bg-linen-50 p-4">
      <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', color)}>
        <Icon className="h-5 w-5" strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-xs text-ink-500">{label}</p>
        <p className="font-mono text-lg font-semibold tabular-nums text-ink-900">{count}</p>
      </div>
    </div>
  );
}

function OrderRow({ order }: { order: Order }) {
  const date = new Date(order.createdAt);
  const dateStr = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
  const statusInfo = {
    confirmed: { text: 'مؤكد', color: 'bg-sage-100 text-sage-700' },
    pending: { text: 'بانتظار', color: 'bg-wood-400/15 text-wood-700' },
    processing: { text: 'قيد التجهيز', color: 'bg-sage-100 text-sage-700' },
    shipped: { text: 'تم الشحن', color: 'bg-sage-100 text-sage-700' },
    delivered: { text: 'مسلّم', color: 'bg-sage-100 text-sage-700' },
    refunded: { text: 'مسترد', color: 'bg-red-100 text-red-700' },
    cancelled: { text: 'ملغي', color: 'bg-red-100 text-red-700' },
  }[order.status];

  return (
    <Link
      href={`/admin/orders/${order.id}`}
      className="group flex items-center gap-3 rounded-xl bg-linen-100/40 px-3 py-2.5 transition-colors hover:bg-sage-50"
    >
      <div className="flex-1 min-w-0">
        <p className="font-mono text-xs font-semibold text-ink-900">{order.id}</p>
        <p className="text-[10px] text-ink-500">
          {order.shipping.fullName} · {order.items.length} منتج · {dateStr}
        </p>
      </div>
      <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', statusInfo.color)}>
        {statusInfo.text}
      </span>
      <span className="font-mono text-sm font-semibold tabular-nums text-ink-900">
        {formatSAR(order.total)}
      </span>
    </Link>
  );
}
