'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, CheckCircle2, Clock, MapPin, Package, Search, Truck } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { useOrdersStore } from '@/lib/orders-store';
import { cn, formatSAR } from '@/lib/utils';

type SafeOrder = { id: string; status: string; payment_method: string; payment_status?: string; tracking_number?: string | null; subtotal: number; shipping_cost: number; total: number; shipping_full_name: string; shipping_city: string; shipping_district: string; placed_at: string; items?: Array<{ id?: string; product_name: string; product_short_name?: string; quantity: number; price: number; subtotal: number; variant?: string | null }> };
const states: Record<string, { label: string; desc: string; Icon: typeof Clock; style: string }> = {
  pending: { label: 'قيد المراجعة', desc: 'استلمنا طلبك ويجري التحقق من تفاصيله.', Icon: Clock, style: 'bg-wood-400/15 text-wood-700' },
  confirmed: { label: 'تم التأكيد', desc: 'تم تأكيد الطلب وسيبدأ التجهيز.', Icon: CheckCircle2, style: 'bg-sage-100 text-sage-700' },
  processing: { label: 'قيد التجهيز', desc: 'يتم تجهيز منتجات طلبك.', Icon: Package, style: 'bg-sage-100 text-sage-700' },
  shipped: { label: 'تم الشحن', desc: 'طلبك في الطريق إليك.', Icon: Truck, style: 'bg-sage-100 text-sage-700' },
  delivered: { label: 'تم التسليم', desc: 'اكتمل تسليم الطلب.', Icon: CheckCircle2, style: 'bg-sage-100 text-sage-700' },
  cancelled: { label: 'ملغي', desc: 'تم إلغاء الطلب.', Icon: AlertCircle, style: 'bg-red-50 text-red-700' },
};

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const id = params.id.toUpperCase();
  const local = useOrdersStore((state) => state.orders.find((order) => order.id === id));
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState<SafeOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const localView = useMemo<SafeOrder | null>(() => local ? { id: local.id, status: local.status === 'pending_cj_sync' ? 'pending' : local.status, payment_method: local.payment, subtotal: local.subtotal, shipping_cost: local.shippingCost, total: local.total, shipping_full_name: local.shipping.fullName, shipping_city: local.shipping.city, shipping_district: local.shipping.district, placed_at: local.createdAt, tracking_number: local.trackingNumber, items: local.items.map((item) => ({ product_name: item.name, product_short_name: item.shortName, quantity: item.quantity, price: item.price, subtotal: item.price * item.quantity, variant: item.variantLabel })) } : null, [local]);

  const verify = async (candidate: string) => {
    setLoading(true); setError('');
    try {
      const response = await fetch('/api/orders/lookup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId: id, phone: candidate }) });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'تعذر عرض الطلب');
      setOrder(data.order);
      sessionStorage.setItem(`rukub-order-phone:${id}`, candidate);
    } catch (err) { setError(err instanceof Error ? err.message : 'تعذر عرض الطلب'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    const saved = sessionStorage.getItem(`rukub-order-phone:${id}`) || local?.shipping.phone;
    if (saved) { setPhone(saved); void verify(saved); }
    // The order id identifies this page; local is only used to prefill the protected lookup.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const shown = order ?? localView;
  if (!shown) return <main className="py-20"><Container><div className="mx-auto max-w-md rounded-4xl border border-sage-500/10 bg-linen-50 p-8 text-center"><Search className="mx-auto h-8 w-8 text-sage-500" /><h1 className="mt-4 text-2xl font-semibold text-ink-900">تحقق من طلبك</h1><p className="mt-2 text-sm text-ink-500">أدخل رقم الجوال المستخدم في الطلب لحماية بياناتك.</p><form onSubmit={(e) => { e.preventDefault(); void verify(phone); }} className="mt-6 space-y-3"><input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="رقم الجوال" inputMode="tel" dir="ltr" className="h-12 w-full rounded-2xl border border-sage-500/20 bg-white px-4 text-sm outline-none focus:border-sage-500" /><button disabled={loading} className="h-12 w-full rounded-full bg-sage-500 text-sm font-medium text-white disabled:opacity-60">{loading ? 'جارٍ التحقق...' : 'عرض الطلب'}</button></form>{error && <p className="mt-3 text-xs text-red-600">{error}</p>}<Link href="/orders" className="mt-5 inline-block text-xs text-sage-600">العودة لمتابعة الطلبات</Link></div></Container></main>;

  const state = states[shown.status] ?? states.pending;
  const StatusIcon = state.Icon;
  return <main className="py-12 md:py-16"><Container><div className="mx-auto max-w-2xl"><div className="flex flex-wrap items-end justify-between gap-4"><div><span className="eyebrow">تفاصيل الطلب</span><h1 className="mt-2 font-mono text-2xl font-semibold text-ink-900">{shown.id}</h1><p className="mt-1 text-xs text-ink-500">{new Date(shown.placed_at).toLocaleDateString('ar-SA')}</p></div><Link href="/orders" className="inline-flex items-center gap-2 text-sm text-sage-600">متابعة طلب آخر <ArrowLeft className="h-4 w-4" /></Link></div>
    <section className="mt-7 rounded-4xl border border-sage-500/10 bg-linen-50 p-6 md:p-8"><div className="flex items-center gap-4"><div className={cn('flex h-14 w-14 items-center justify-center rounded-2xl', state.style)}><StatusIcon className="h-7 w-7" /></div><div><p className="text-xs text-ink-500">حالة الطلب</p><h2 className="mt-1 text-xl font-semibold text-ink-900">{state.label}</h2><p className="mt-1 text-xs text-ink-500">{state.desc}</p></div></div>{shown.tracking_number && <div className="mt-5 rounded-2xl bg-sage-50 p-4"><p className="text-xs text-ink-500">رقم التتبع</p><p className="mt-1 font-mono font-semibold text-ink-900">{shown.tracking_number}</p></div>}
    <div className="mt-6 border-t border-sage-500/10 pt-5"><h3 className="text-sm font-semibold text-ink-900">المنتجات</h3><ul className="mt-3 space-y-3">{shown.items?.map((item, index) => <li key={item.id || index} className="flex justify-between gap-4 text-sm"><span className="text-ink-700">{item.quantity}× {item.product_short_name || item.product_name}{item.variant && <small className="mt-1 block text-sage-700">{item.variant}</small>}</span><span className="font-mono text-ink-500">{formatSAR(item.subtotal)}</span></li>)}</ul></div>
    <div className="mt-6 grid gap-4 border-t border-sage-500/10 pt-5 sm:grid-cols-2"><div><p className="text-xs text-ink-500">المستلم</p><p className="mt-1 text-sm font-medium text-ink-900">{shown.shipping_full_name}</p></div><div><p className="flex items-center gap-1 text-xs text-ink-500"><MapPin className="h-3 w-3" />عنوان التوصيل</p><p className="mt-1 text-sm font-medium text-ink-900">{shown.shipping_district}، {shown.shipping_city}</p></div></div>
    <div className="mt-6 space-y-2 border-t border-sage-500/10 pt-5 text-sm"><div className="flex justify-between text-ink-500"><span>المنتجات</span><span>{formatSAR(shown.subtotal)}</span></div><div className="flex justify-between text-ink-500"><span>الشحن</span><span>{shown.shipping_cost ? formatSAR(shown.shipping_cost) : 'مجاني'}</span></div><div className="flex justify-between border-t border-sage-500/10 pt-3 text-base font-semibold text-ink-900"><span>الإجمالي</span><span>{formatSAR(shown.total)}</span></div><p className="pt-1 text-xs text-ink-500">طريقة الدفع: الدفع عند الاستلام</p></div></section>
    {error && <p className="mt-3 text-center text-xs text-red-600">تعذر تحديث الحالة الآن؛ نعرض النسخة المحفوظة على جهازك.</p>}</div></Container></main>;
}
