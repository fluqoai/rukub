'use client';

import { BarChart3, TrendingUp } from 'lucide-react';
import { useMemo } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { useAdminOrdersView } from '@/lib/hooks/useAdminOrdersView';
import { formatSAR, cn } from '@/lib/utils';

export default function AdminAnalyticsPage() {
  const { orders, loading, error, refetch } = useAdminOrdersView();

  const last7Days = useMemo(() => {
    const days: Array<{ date: string; label: string; revenue: number; orders: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const dateStr = d.toISOString().split('T')[0];
      const dayOrders = orders.filter(
        (o) => o.createdAt.split('T')[0] === dateStr && o.status === 'delivered'
      );
      const revenue = dayOrders.reduce((acc, o) => acc + o.total, 0);
      days.push({
        date: dateStr,
        label: d.toLocaleDateString('ar-SA', { weekday: 'short' }),
        revenue,
        orders: dayOrders.length,
      });
    }
    return days;
  }, [orders]);

  const maxRevenue = Math.max(...last7Days.map((d) => d.revenue), 100);
  const totalRevenue = last7Days.reduce((acc, d) => acc + d.revenue, 0);

  return (
    <>
      <AdminHeader title="التحليلات" subtitle="آخر 7 أيام حسب تاريخ الطلب · أحدث 1000 طلب من الخادم" onRefresh={refetch} />

      <div className="p-6">
        {loading && <p role="status">جارٍ تحميل التحليلات…</p>}
        {error && <p role="alert" className="mb-4 text-red-700">{error}</p>}
        <div className="rounded-3xl border border-sage-500/10 bg-linen-50 p-6">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <span className="eyebrow">قيمة الطلبات المسلّمة — ليست إثبات تحصيل</span>
              <h2 className="mt-2 text-2xl font-semibold text-ink-900">
                {formatSAR(totalRevenue)}
              </h2>
              <p className="text-xs text-ink-500">آخر 7 أيام</p>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-sage-50 px-3 py-1.5 text-xs font-medium text-sage-700">
              <TrendingUp className="h-3.5 w-3.5" />
              بيانات فعلية
            </div>
          </div>

          {/* Bar chart */}
          <div className="flex h-48 items-end gap-3 border-b border-sage-500/10 pb-2">
            {last7Days.map((d, i) => {
              const height = (d.revenue / maxRevenue) * 100;
              const isToday = i === last7Days.length - 1;
              return (
                <div key={d.date} title={`${d.label}: ${formatSAR(d.revenue)}`} className="flex h-full flex-1 flex-col items-center gap-1">
                  <div className="relative w-full flex-1">
                    <div
                      className={cn(
                        'absolute bottom-0 w-full rounded-t-lg transition-all',
                        isToday ? 'bg-sage-500' : 'bg-sage-200'
                      )}
                      style={{ height: `${Math.max(height, 2)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-ink-500">{d.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard label="عدد الطلبات" value={String(orders.length)} sub="أحدث الطلبات المحملة" trend="up" />
          <MetricCard label="طلبات الدفع عند الاستلام" value={String(orders.filter(o => o.payment_method === 'cod').length)} sub="عدد فعلي" trend="up" />
          <MetricCard label="الطلبات الملغاة أو المستردة" value={String(orders.filter(o => ['cancelled','refunded'].includes(o.status)).length)} sub="عدد فعلي" trend="down" />
        </div>

        {orders.length === 0 && (
          <div className="mt-6 rounded-3xl border border-sage-500/10 bg-linen-50 p-12 text-center">
            <BarChart3 className="mx-auto h-10 w-10 text-ink-300" strokeWidth={1.25} />
            <p className="mt-3 text-sm text-ink-700">لا توجد بيانات كافية بعد</p>
            <p className="mt-1 text-xs text-ink-500">ستظهر تحليلات تفصيلية بعد أول 10 طلبات</p>
          </div>
        )}
      </div>
    </>
  );
}

function MetricCard({ label, value, sub, trend }: { label: string; value: string; sub: string; trend: 'up' | 'down' }) {
  return (
    <div className="rounded-2xl border border-sage-500/10 bg-linen-50 p-5">
      <p className="text-xs text-ink-500">{label}</p>
      <div className="mt-2 flex items-baseline gap-2">
        <p className="font-mono text-2xl font-semibold tabular-nums text-ink-900">{value}</p>
        <span className={cn('text-[10px] font-medium', trend === 'up' ? 'text-sage-600' : 'text-orange-600')}>
          {trend === 'up' ? '↑' : '↓'} {sub}
        </span>
      </div>
    </div>
  );
}
