'use client';

import { useMemo } from 'react';
import { Users, Phone, Mail, ShoppingBag } from 'lucide-react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { useOrdersStore } from '@/lib/orders-store';
import { formatSAR } from '@/lib/utils';

type Customer = {
  phone: string;
  name: string;
  email: string;
  orderCount: number;
  totalSpent: number;
  city: string;
  lastOrder: string;
};

export default function AdminCustomersPage() {
  const orders = useOrdersStore((s) => s.orders);

  const customers = useMemo<Customer[]>(() => {
    const map = new Map<string, Customer>();
    orders.forEach((o) => {
      const existing = map.get(o.shipping.phone);
      if (existing) {
        existing.orderCount += 1;
        existing.totalSpent += o.total;
        if (new Date(o.createdAt) > new Date(existing.lastOrder)) {
          existing.lastOrder = o.createdAt;
          existing.name = o.shipping.fullName;
          existing.email = o.shipping.email;
        }
      } else {
        map.set(o.shipping.phone, {
          phone: o.shipping.phone,
          name: o.shipping.fullName,
          email: o.shipping.email,
          orderCount: 1,
          totalSpent: o.total,
          city: o.shipping.city,
          lastOrder: o.createdAt,
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [orders]);

  return (
    <>
      <AdminHeader title="العملاء" subtitle={`${customers.length} عميل فريد`} />

      <div className="p-6">
        {customers.length === 0 ? (
          <div className="rounded-3xl border border-sage-500/10 bg-linen-50 p-12 text-center">
            <Users className="mx-auto h-10 w-10 text-ink-300" strokeWidth={1.25} />
            <p className="mt-3 text-sm text-ink-700">لا يوجد عملاء بعد</p>
            <p className="mt-1 text-xs text-ink-500">ستظهر بيانات العملاء مع أول طلب</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-sage-500/10 bg-linen-50">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-sage-500/10 bg-linen-100/40 text-xs uppercase tracking-wider text-ink-500">
                    <th className="px-4 py-3 text-start font-medium">العميل</th>
                    <th className="px-4 py-3 text-start font-medium">الجوال</th>
                    <th className="px-4 py-3 text-start font-medium">المدينة</th>
                    <th className="px-4 py-3 text-start font-medium">الطلبات</th>
                    <th className="px-4 py-3 text-start font-medium">إجمالي الإنفاق</th>
                    <th className="px-4 py-3 text-start font-medium">آخر طلب</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => {
                    const date = new Date(c.lastOrder);
                    return (
                      <tr key={c.phone} className="border-b border-sage-500/5 hover:bg-sage-50/40">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sage-100 text-xs font-semibold text-sage-700">
                              {c.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-ink-900">{c.name}</p>
                              {c.email && <p className="font-mono text-[10px] text-ink-500" dir="ltr">{c.email}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs" dir="ltr">{c.phone}</td>
                        <td className="px-4 py-3 text-ink-700">{c.city}</td>
                        <td className="px-4 py-3 text-center font-mono text-sm font-semibold tabular-nums text-ink-900">
                          {c.orderCount}
                        </td>
                        <td className="px-4 py-3 font-mono text-sm font-semibold tabular-nums text-sage-700">
                          {formatSAR(c.totalSpent)}
                        </td>
                        <td className="px-4 py-3 text-[10px] text-ink-500">
                          {date.toLocaleDateString('ar-SA')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
