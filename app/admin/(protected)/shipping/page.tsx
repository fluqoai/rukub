'use client';

import { Truck, Package, MapPin, Clock, CheckCircle2 } from 'lucide-react';
import { AdminHeader } from '@/components/admin/AdminHeader';

export default function AdminShippingPage() {
  return (
    <>
      <AdminHeader title="الشحن والتسليم" subtitle="إدارة الشحنات النشطة" />

      <div className="p-6">
        <div className="rounded-3xl border border-sage-500/10 bg-linen-50 p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sage-500/10 text-sage-600">
              <Truck className="h-6 w-6" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-ink-900">الشحنات النشطة</h2>
              <p className="text-xs text-ink-500">طلبات في مرحلة الشحن من CJ</p>
            </div>
          </div>

          <div className="rounded-2xl bg-linen-100/40 p-12 text-center">
            <Package className="mx-auto h-12 w-12 text-ink-300" strokeWidth={1.25} />
            <p className="mt-4 text-sm text-ink-700">لا توجد شحنات نشطة حالياً</p>
            <p className="mt-1 text-xs text-ink-500">
              ستظهر هنا الطلبات بعد تأكيدها ودخولها مرحلة الشحن
            </p>
          </div>
        </div>

        {/* Pipeline status */}
        <div className="mt-6 grid gap-4 sm:grid-cols-4">
          {[
            { label: 'في المستودع', value: 0, color: 'bg-sage-500/10 text-sage-700' },
            { label: 'في الطريق', value: 0, color: 'bg-wood-400/15 text-wood-700' },
            { label: 'خرج للتوصيل', value: 0, color: 'bg-ink-900/8 text-ink-700' },
            { label: 'تم التوصيل', value: 0, color: 'bg-sage-100 text-sage-700' },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-sage-500/10 bg-linen-50 p-4">
              <div className={`inline-flex h-8 w-8 items-center justify-center rounded-xl ${s.color}`}>
                <Truck className="h-4 w-4" strokeWidth={1.5} />
              </div>
              <p className="mt-3 text-xs text-ink-500">{s.label}</p>
              <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-ink-900">
                {s.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
