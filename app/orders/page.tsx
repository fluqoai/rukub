'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, Package, Search, ShoppingBag } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { useOrdersStore } from '@/lib/orders-store';
import { formatSAR } from '@/lib/utils';

export default function OrdersPage() {
  const router = useRouter();
  const orders = useOrdersStore((state) => state.orders);
  const hydrated = useOrdersStore((state) => state.hydrated);
  const [orderId, setOrderId] = useState('');
  const [phone, setPhone] = useState('');

  const lookup = (event: React.FormEvent) => {
    event.preventDefault();
    const id = orderId.trim().toUpperCase();
    if (!id || !phone.trim()) return;
    sessionStorage.setItem(`rukub-order-phone:${id}`, phone.trim());
    router.push(`/orders/${encodeURIComponent(id)}`);
  };

  return (
    <main className="py-12 md:py-16"><Container>
      <div className="mx-auto max-w-4xl">
        <div className="grid gap-6 md:grid-cols-2">
          <section className="rounded-4xl bg-ink-900 p-7 text-linen-50 md:p-9"><Search className="h-7 w-7 text-wood-400" /><h1 className="mt-5 text-3xl font-semibold">متابعة الطلب</h1><p className="mt-3 text-sm leading-7 text-linen-100/65">أدخل رقم الطلب ورقم الجوال المستخدم عند الشراء. نطلب المعلومتين لحماية تفاصيل طلبك.</p><form onSubmit={lookup} className="mt-7 space-y-3"><input value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder="رقم الطلب: RKB-XXXXXXXX" dir="ltr" className="h-12 w-full rounded-2xl border border-white/15 bg-white/10 px-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-wood-400" /><input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="رقم الجوال" inputMode="tel" dir="ltr" className="h-12 w-full rounded-2xl border border-white/15 bg-white/10 px-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-wood-400" /><button className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-linen-50 text-sm font-semibold text-ink-900">عرض حالة الطلب <ArrowLeft className="h-4 w-4" /></button></form></section>
          <section className="rounded-4xl border border-sage-500/10 bg-linen-50 p-7 md:p-9"><Clock className="h-7 w-7 text-sage-600" /><h2 className="mt-5 text-2xl font-semibold text-ink-900">طلبات هذا الجهاز</h2><p className="mt-2 text-sm leading-6 text-ink-500">تظهر هنا الطلبات التي أنشأتها من هذا المتصفح فقط.</p>{hydrated && orders.length > 0 ? <div className="mt-6 space-y-3">{orders.slice(0, 5).map((order) => <Link key={order.id} href={`/orders/${order.id}`} className="flex items-center justify-between rounded-2xl border border-sage-500/10 p-4 hover:bg-sage-50"><div><p className="font-mono text-sm font-semibold text-ink-900">{order.id}</p><p className="mt-1 text-xs text-ink-500">{order.items.length} منتج</p></div><span className="font-mono text-sm text-ink-900">{formatSAR(order.total)}</span></Link>)}</div> : <div className="mt-7 rounded-2xl bg-linen-100 p-6 text-center"><Package className="mx-auto h-7 w-7 text-sage-500" /><p className="mt-3 text-sm text-ink-500">لا توجد طلبات محفوظة على هذا الجهاز.</p></div>}</section>
        </div>
        <div className="mt-8 text-center"><Link href="/discover" className="inline-flex items-center gap-2 text-sm font-medium text-sage-600"><ShoppingBag className="h-4 w-4" />العودة إلى التسوق</Link></div>
      </div>
    </Container></main>
  );
}
