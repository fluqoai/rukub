'use client';
import Link from 'next/link';
import { useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { useDbOrders } from '@/lib/hooks/useDbOrders';
const labels = { processing: 'قيد التجهيز', shipped: 'تم الشحن', delivered: 'مسلّمة' };
export default function AdminShippingPage() {
  const { orders, loading, error, refetch } = useDbOrders({ limit: 1000 });
  const [filter, setFilter] = useState('all');
  const shipments = orders.filter(o => o.status in labels && (filter === 'all' || o.status === filter));
  return <><AdminHeader title="الشحن والتسليم" subtitle="حالات الطلبات المسجلة في المتجر · أحدث 1000 طلب" onRefresh={refetch} />
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
      <p className="rounded-xl border bg-white p-4 text-sm leading-7 text-ink-500">هذه حالات الطلبات المحفوظة، وليست تتبعًا مباشرًا من شركة الشحن. افتح الطلب لإضافة رقم التتبع وتحديث حالته بعد التحقق من المورد.</p>
      {error && <p role="alert" className="text-red-700">{error}</p>}{loading && <p role="status">جارٍ تحديث الشحنات…</p>}
      <div className="grid grid-cols-3 gap-3">{Object.entries(labels).map(([key,label]) => <button key={key} aria-pressed={filter===key} onClick={()=>setFilter(filter===key?'all':key)} className="rounded-2xl border bg-white p-4 text-start"><span className="text-sm">{label}</span><strong className="mt-2 block text-2xl">{orders.filter(o=>o.status===key).length}</strong></button>)}</div>
      <label className="block text-sm">عرض الشحنات<select value={filter} onChange={e=>setFilter(e.target.value)} className="ms-3 rounded-xl border bg-white p-3"><option value="all">الكل</option>{Object.entries(labels).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></label>
      {!loading && !error && !shipments.length && <p className="rounded-2xl border bg-white p-8 text-center">لا توجد شحنات تطابق هذا الاختيار.</p>}
      <div className="space-y-3">{shipments.map(o=><Link key={o.id} href={`/admin/orders/${encodeURIComponent(o.id)}`} className="flex flex-wrap justify-between gap-3 rounded-2xl border bg-white p-5 hover:border-sage-500"><div><strong>{o.id}</strong><p className="mt-2 text-sm">{o.shipping_full_name} · {o.shipping_city}</p><p className="mt-2 break-all text-xs">التتبع: {o.tracking_number || 'لم يُضف بعد'}</p></div><span className="text-sm text-sage-700">{labels[o.status as keyof typeof labels]} · فتح الطلب ←</span></Link>)}</div>
    </div></>;
}
