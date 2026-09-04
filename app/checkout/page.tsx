'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Lock, Truck, MessageCircle, Loader2 } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { CustomerInfoForm } from '@/components/checkout/CustomerInfoForm';
import { PaymentMethod, type PaymentOption } from '@/components/checkout/PaymentMethod';
import { OrderSummary } from '@/components/checkout/OrderSummary';
import {
  useCartStore,
  selectTotalPrice,
  selectShipping,
  selectGrandTotal,
} from '@/lib/cart-store';
import { useOrdersStore, type Order, type ShippingInfo } from '@/lib/orders-store';
import { createDbOrder } from '@/lib/hooks/useDbOrders';
import { cn } from '@/lib/utils';

type Step = 'info' | 'payment';

const steps: Array<{
  key: Step;
  num: number;
  label: string;
}> = [
  { key: 'info', num: 1, label: 'معلوماتك' },
  { key: 'payment', num: 2, label: 'الدفع' },
];

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const clear = useCartStore((s) => s.clear);
  const hydrated = useCartStore((s) => s.hydrated);
  const subtotal = useCartStore(selectTotalPrice);
  const shippingCost = useCartStore(selectShipping);
  const total = useCartStore(selectGrandTotal);

  const addOrder = useOrdersStore((s) => s.addOrder);

  const [step, setStep] = useState<Step>('info');
  const [info, setInfo] = useState<ShippingInfo | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [delivery, setDelivery] = useState<Array<{ productId: string; variant?: string; deliveryMin?: number; deliveryMax?: number }>>([]);

  // redirect to cart if empty
  useEffect(() => {
    if (hydrated && items.length === 0 && step === 'info' && !info) router.replace('/cart');
  }, [hydrated, items.length, step, info, router]);

  if (!hydrated) {
    return (
      <main className="py-20">
        <Container>
          <div className="h-96 animate-pulse rounded-3xl bg-linen-100" />
        </Container>
      </main>
    );
  }

  const handleInfoSubmit = async (data: ShippingInfo) => {
    if (checking) return;
    setInfo(data);
    setChecking(true); setSubmitError(null);
    try {
      const r = await fetch('/api/checkout/quote', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: items.map(it => ({ productId: it.productId, variantId: it.variantId, quantity: it.quantity, expectedPrice: it.price })) }) });
      const result = await r.json();
      if (!r.ok) throw new Error(result.error || 'تعذر التحقق من المورد');
      setDelivery(result.items); setStep('payment');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) { setSubmitError(e instanceof Error ? e.message : 'تعذر التحقق من المورد'); }
    finally { setChecking(false); }
  };

  const handlePlaceOrder = async (method: PaymentOption) => {
    if (!info) return;
    if (method !== 'cod') {
      setSubmitError('الدفع الإلكتروني سيكون متاحاً بعد اعتماد بوابة الدفع.');
      return;
    }
    setSubmitting(true);
    setSubmitError(null);

    // Save a server-validated order. Product names, prices and totals are
    // recalculated on the server so they cannot be changed in the browser.
    try {
      const dbOrder = await createDbOrder({
        items: items.map((it) => ({
          productId: it.productId,
          quantity: it.quantity,
          variantId: it.variantId,
          expectedPrice: it.price,
        })),
        shipping: {
          fullName: info.fullName,
          phone: info.phone,
          email: info.email || undefined,
          city: info.city,
          district: info.district,
          notes: info.notes || undefined,
        },
        paymentMethod: 'cod',
      });

      const order: Order = {
        id: dbOrder.id,
        status: 'pending_cj_sync',
        items: [...items],
        shipping: info,
        payment: 'cod',
        subtotal: Number(dbOrder.subtotal),
        shippingCost: Number(dbOrder.shipping_cost),
        total: Number(dbOrder.total),
        createdAt: dbOrder.placed_at,
      };
      addOrder(order);
      sessionStorage.setItem('rukub-last-order', JSON.stringify(order));
      clear();
      router.push(`/orders/${dbOrder.id}?success=1`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'تعذر إنشاء الطلب. حاول مرة أخرى.');
      setSubmitting(false);
    }
  };

  return (
    <main className="py-10 md:py-14">
      <Container>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-ink-900">إتمام الطلب</h1>
          <p className="mt-2 text-sm text-ink-500">
            خطوتان واضحتان لتأكيد بيانات التوصيل وطريقة الدفع
          </p>
        </div>

        {/* Step indicator */}
        <div className="mb-10 flex items-center gap-4">
          {steps.map((s, i) => {
            const isActive = s.key === step;
            const isComplete = s.key === 'info' && step === 'payment';
            return (
              <div key={s.key} className="flex items-center gap-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full font-mono text-sm font-medium transition-colors',
                      isComplete || isActive
                        ? 'bg-sage-500 text-linen-50'
                        : 'bg-linen-100 text-ink-500'
                    )}
                  >
                    {isComplete ? <Check className="h-4 w-4" /> : s.num}
                  </div>
                  <span
                    className={cn(
                      'text-sm font-medium',
                      isActive || isComplete ? 'text-ink-900' : 'text-ink-500'
                    )}
                  >
                    {s.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className="h-px w-8 bg-sage-500/20 sm:w-16" />
                )}
              </div>
            );
          })}
        </div>

        {/* Error banner */}
        {submitError && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {submitError}
          </div>
        )}

        {/* Grid: form + summary */}
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {submitting || checking ? (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-sage-500/10 bg-linen-50 px-6 py-20">
                <Loader2 className="h-8 w-8 animate-spin text-sage-500" />
                <p className="mt-4 text-sm font-medium text-ink-900">
                  {checking ? 'جارٍ التحقق من النسخ والمخزون والشحن...' : 'جارٍ التحقق النهائي وتسجيل طلبك...'}
                </p>
                <p className="mt-1 text-xs text-ink-500">
                  نتحقق من تفاصيل الطلب ونحفظه بأمان
                </p>
              </div>
            ) : step === 'info' ? (
              <CustomerInfoForm onSubmit={handleInfoSubmit} initial={info || undefined} />
            ) : (
              <PaymentMethod
                onBack={() => setStep('info')}
                onPlaceOrder={handlePlaceOrder}
              />
            )}
          </div>

          <div className="lg:col-span-1">
            <OrderSummary />
            {step === 'payment' && delivery.length > 0 && <div className="mt-4 rounded-2xl border border-sage-500/20 bg-sage-50 p-4 text-xs leading-6"><p className="font-semibold">الشحن حسب آخر تحقق من المورد</p>{delivery.map((line, index) => <p key={`${line.productId}:${index}`}>{items.find(it => it.productId === line.productId)?.shortName}{line.variant ? ` — ${line.variant}` : ''}: {line.deliveryMax ? `${line.deliveryMin || line.deliveryMax}–${line.deliveryMax} يوم` : 'تُراجع المدة مع المتجر'}</p>)}<p className="mt-2 text-ink-500">المدة تقديرية وليست ضمانًا. اختيارك محفوظ، ويُعاد التحقق قبل تسجيل الطلب.</p></div>}

            <div className="mt-4 grid grid-cols-2 gap-2 text-[10px] text-ink-500">
              <div className="flex items-center gap-1.5 rounded-lg bg-linen-100/60 px-3 py-2">
                <Lock className="h-3 w-3" strokeWidth={1.5} />
                بياناتك محمية
              </div>
              <div className="flex items-center gap-1.5 rounded-lg bg-linen-100/60 px-3 py-2">
                <Truck className="h-3 w-3" strokeWidth={1.5} />
                تتبع واضح للطلب
              </div>
              <div className="col-span-2 flex items-center gap-1.5 rounded-lg bg-linen-100/60 px-3 py-2">
                <MessageCircle className="h-3 w-3" strokeWidth={1.5} />
                دعم باللغة العربية
              </div>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}
