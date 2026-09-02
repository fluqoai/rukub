'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  Truck,
  Eye,
  Loader2,
  RefreshCw,
  Package,
} from 'lucide-react';
import { useDbOrders, type Order, type OrderStatus } from '@/lib/hooks/useDbOrders';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { formatSAR, cn } from '@/lib/utils';

type StatusFilter = 'all' | OrderStatus;

const statusInfo: Record<OrderStatus, { text: string; color: string; Icon: typeof Clock }> = {
  pending: { text: 'بانتظار', color: 'bg-wood-400/15 text-wood-700', Icon: Clock },
  confirmed: { text: 'مؤكد', color: 'bg-sage-100 text-sage-700', Icon: CheckCircle2 },
  processing: { text: 'قيد التجهيز', color: 'bg-ink-900/8 text-ink-700', Icon: Package },
  shipped: { text: 'تم الشحن', color: 'bg-sage-100 text-sage-700', Icon: Truck },
  delivered: { text: 'تم التوصيل', color: 'bg-sage-100 text-sage-700', Icon: CheckCircle2 },
  cancelled: { text: 'ملغي', color: 'bg-red-100 text-red-700', Icon: AlertCircle },
  refunded: { text: 'مسترد', color: 'bg-ink-900/8 text-ink-700', Icon: RefreshCw },
};

export default function AdminOrdersPage() {
  const { orders, loading, error, refetch } = useDbOrders();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const filtered = useMemo(() => {
    let result = orders;
    if (statusFilter !== 'all') {
      result = result.filter((o) => o.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.shipping_full_name.toLowerCase().includes(q) ||
          o.shipping_phone.toLowerCase().includes(q) ||
          o.cj_order_id?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [orders, search, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: orders.length,
      confirmed: orders.filter((o) => o.status === 'confirmed' || o.status === 'shipped' || o.status === 'delivered').length,
      pending: orders.filter((o) => o.status === 'pending' || o.status === 'processing').length,
      cancelled: orders.filter((o) => o.status === 'cancelled' || o.status === 'refunded').length,
      revenue: orders
        .filter((o) => o.status === 'confirmed' || o.status === 'shipped' || o.status === 'delivered')
        .reduce((acc, o) => acc + o.total, 0),
    };
  }, [orders]);

  return (
    <>
      <AdminHeader
        title="الطلبات"
        subtitle={`${filtered.length} من ${orders.length} طلب`}
        onRefresh={refetch}
      />

      <div className="p-6">
        {error && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            خطأ: {error}
          </div>
        )}

        {loading && orders.length === 0 && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-sage-500" />
          </div>
        )}
        {/* Stats row */}
        <div className="mb-4 grid gap-3 sm:grid-cols-4">
          <StatPill label="إجمالي" value={stats.total} Icon={Filter} />
          <StatPill label="مؤكدة" value={stats.confirmed} Icon={CheckCircle2} color="sage" />
          <StatPill label="بانتظار" value={stats.pending} Icon={Clock} color="wood" />
          <StatPill
            label="إيرادات مؤكدة"
            value={formatSAR(stats.revenue)}
            Icon={Download}
            color="ink"
          />
        </div>

        {/* Filters */}
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-sage-500/10 bg-linen-50 p-3">
          <div className="flex flex-1 items-center gap-2">
            <Search className="h-4 w-4 text-ink-500" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث برقم الطلب، الاسم، الجوال، أو CJ ID..."
              className="w-full border-none bg-transparent text-sm text-ink-900 placeholder:text-ink-500/70 focus:outline-none"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {([
              { key: 'all', label: 'الكل' },
              { key: 'pending', label: 'بانتظار' },
              { key: 'confirmed', label: 'مؤكدة' },
              { key: 'shipped', label: 'تم الشحن' },
              { key: 'delivered', label: 'مسلّمة' },
              { key: 'cancelled', label: 'ملغية' },
            ] as const).map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setStatusFilter(f.key)}
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                  statusFilter === f.key
                    ? 'bg-sage-500 text-linen-50'
                    : 'bg-linen-100 text-ink-700 hover:bg-sage-50'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-3xl border border-sage-500/10 bg-linen-50">
          {filtered.length === 0 && !loading ? (
            <div className="p-12 text-center">
              <p className="text-sm text-ink-500">
                {orders.length === 0
                  ? 'لا توجد طلبات بعد. ستظهر هنا عند أول طلب.'
                  : 'لا توجد طلبات تطابق الفلاتر.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-sage-500/10 bg-linen-100/40 text-xs uppercase tracking-wider text-ink-500">
                    <th className="px-4 py-3 text-start font-medium">رقم الطلب</th>
                    <th className="px-4 py-3 text-start font-medium">العميل</th>
                    <th className="px-4 py-3 text-start font-medium">المنتجات</th>
                    <th className="px-4 py-3 text-start font-medium">المبلغ</th>
                    <th className="px-4 py-3 text-start font-medium">الدفع</th>
                    <th className="px-4 py-3 text-start font-medium">الحالة</th>
                    <th className="px-4 py-3 text-start font-medium">التاريخ</th>
                    <th className="px-4 py-3 text-end font-medium">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((order) => {
                    const info = statusInfo[order.status] || statusInfo.pending;
                    const Icon = info.Icon;
                    const date = new Date(order.placed_at);
                    const dateStr = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
                    const timeStr = date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
                    return (
                      <tr
                        key={order.id}
                        className="border-b border-sage-500/5 transition-colors hover:bg-sage-50/40"
                      >
                        <td className="px-4 py-3">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="font-mono text-xs font-semibold text-sage-700 hover:underline"
                          >
                            {order.id}
                          </Link>
                          {order.cj_order_id && (
                            <p className="font-mono text-[10px] text-ink-500">
                              CJ: {order.cj_order_id.slice(0, 14)}...
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-ink-900">
                            {order.shipping_full_name}
                          </p>
                          <p className="font-mono text-[10px] text-ink-500" dir="ltr">
                            {order.shipping_phone}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs text-ink-700">
                            {order.items?.length ?? 0} منتج
                          </p>
                          <p className="line-clamp-1 text-[10px] text-ink-500">
                            {order.items?.slice(0, 2).map((i) => i.product_short_name).join('، ')}
                            {(order.items?.length ?? 0) > 2 && ` +${(order.items?.length ?? 0) - 2}`}
                          </p>
                        </td>
                        <td className="px-4 py-3 font-mono text-sm font-semibold tabular-nums text-ink-900">
                          {formatSAR(order.total)}
                        </td>
                        <td className="px-4 py-3 text-xs">
                          <span className="rounded-full bg-linen-100 px-2 py-0.5 text-ink-700">
                            {order.payment_method === 'cod'
                              ? 'COD'
                              : order.payment_method === 'tap'
                              ? 'Tap'
                              : 'Tabby'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium',
                              info.color
                            )}
                          >
                            <Icon className="h-2.5 w-2.5" />
                            {info.text}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs">
                          <p className="text-ink-700">{dateStr}</p>
                          <p className="text-[10px] text-ink-500">{timeStr}</p>
                        </td>
                        <td className="px-4 py-3 text-end">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-sage-50 hover:text-sage-700"
                          >
                            <Eye className="h-3.5 w-3.5" strokeWidth={1.5} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

type StatPillProps = {
  label: string;
  value: number | string;
  Icon: typeof Filter;
  color?: 'sage' | 'wood' | 'ink';
};

function StatPill({ label, value, Icon, color = 'sage' }: StatPillProps) {
  const colorMap = {
    sage: 'bg-sage-500/10 text-sage-700',
    wood: 'bg-wood-400/15 text-wood-700',
    ink: 'bg-ink-900/8 text-ink-700',
  };
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-sage-500/10 bg-linen-50 px-4 py-3">
      <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl', colorMap[color])}>
        <Icon className="h-4 w-4" strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-wider text-ink-500">{label}</p>
        <p className="font-mono text-sm font-semibold tabular-nums text-ink-900">{value}</p>
      </div>
    </div>
  );
}
