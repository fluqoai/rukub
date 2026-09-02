'use client';

import { useState } from 'react';
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

  // redirect to cart if empty
  if (hydrated && items.length === 0 && step === 'info' && !info) {
    if (typeof window !== 'undefined') router.replace('/cart');
  }

  if (!hydrated) {
    return (
      <main className="py-20">
        <Container>
          <div className="h-96 animate-pulse rounded-3xl bg-linen-100" />
        </Container>
      </main>
    );
  }

  const handleInfoSubmit = (data: ShippingInfo) => {
    setInfo(data);
    setStep('payment');
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlaceOrder = async (method: PaymentOption) => {
    if (!info) return;
    setSubmitting(true);
    setSubmitError(null);

    const localId = `RKB-${Date.now().toString().slice(-6)}`;

    // Build CJ order payload
    const cjProducts = items.map((it) => ({
      cjProductId: it.productId,
      quantity: it.quantity,
    }));

    const shippingPayload = {
      name: info.fullName,
      phone: info.phone,
      country: 'SA',
      province: info.city,
      city: info.city,
      address: `${info.district}${info.notes ? ' — ' + info.notes : ''}`,
    };

    // For COD: create order at CJ first
    let cjOrderId: string | undefined;
    let trackingNumber: string | undefined;
    let cjError: string | undefined;
    let status: Order['status'] = method === 'cod' ? 'confirmed' : 'pending_cj_sync';

    try {
      const res = await fetch('/api/cj/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          products: cjProducts,
          shipping: shippingPayload,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'فشل إنشاء الطلب');
      }

      cjOrderId = data.orderId;
      trackingNumber = data.trackingNumber;
    } catch (err) {
      cjError = err instanceof Error ? err.message : 'Unknown error';
      status = 'manual_followup';
    }

    // 1. Save to Supabase DB via API
    let dbOrderId: string | undefined;
    try {
      const dbOrder = await createDbOrder({
        id: localId,
        items: items.map((it) => ({
          productId: it.productId,
          productName: it.name,
          productShortName: it.shortName,
          quantity: it.quantity,
          price: it.price,
        })),
        shipping: {
          fullName: info.fullName,
          phone: info.phone,
          email: info.email || undefined,
          city: info.city,
          district: info.district,
          notes: info.notes || undefined,
        },
        paymentMethod: method,
        subtotal,
        shippingCost,
        total,
        cjOrderId,
        trackingNumber,
        status: status === 'confirmed' ? 'confirmed' : 'pending',
      });
      dbOrderId = dbOrder.id;
    } catch (err) {
      console.error('DB save failed:', err);
      // Continue with localStorage fallback
    }

    // 2. Save the order locally as well (for offline/quick access)
    const order: Order = {
      id: localId,
      cjOrderId,
      trackingNumber,
      status,
      items: [...items],
      shipping: info,
      payment: method,
      subtotal,
      shippingCost,
      total,
      createdAt: new Date().toISOString(),
      cjError,
    };
    addOrder(order);
    sessionStorage.setItem('rukub-last-order', JSON.stringify(order));

    // 3. Initial notification (email + WhatsApp) is dispatched server-side
    //    by POST /api/orders. The response from createDbOrder above already
    //    triggered the dispatch — no client-side send needed.

    // Route based on payment method
    if (method === 'cod') {
      clear();
      router.push(`/orders/${localId}?success=1`);
    } else if (method === 'tap') {
      try {
        const tapRes = await fetch('/api/tap/charge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: total,
            currency: 'SAR',
            orderId: localId,
            customer: {
              first_name: info.fullName.split(' ')[0],
              last_name: info.fullName.split(' ').slice(1).join(' ') || undefined,
              email: info.email || undefined,
              phone: info.phone,
            },
            description: `طلب ركوب #${localId}`,
          }),
        });
        const tapData = await tapRes.json();
        if (!tapRes.ok || !tapData.success) {
          throw new Error(tapData.error || 'فشل إنشاء جلسة الدفع');
        }
        router.push(tapData.redirectUrl);
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : 'فشل الدفع');
        setSubmitting(false);
      }
    }
  };

  return (
    <main className="py-10 md:py-14">
      <Container>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-ink-900">إتمام الطلب</h1>
          <p className="mt-2 text-sm text-ink-500">
            خطوة بخطوة — كل شيء مشفّر وآمن
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
            {submitting ? (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-sage-500/10 bg-linen-50 px-6 py-20">
                <Loader2 className="h-8 w-8 animate-spin text-sage-500" />
                <p className="mt-4 text-sm font-medium text-ink-900">
                  جارٍ إنشاء طلبك...
                </p>
                <p className="mt-1 text-xs text-ink-500">
                  نتواصل مع CJdropshipping لمعالجة طلبك
                </p>
              </div>
            ) : step === 'info' ? (
              <CustomerInfoForm onSubmit={handleInfoSubmit} />
            ) : (
              <PaymentMethod
                onBack={() => setStep('info')}
                onPlaceOrder={handlePlaceOrder}
              />
            )}
          </div>

          <div className="lg:col-span-1">
            <OrderSummary />

            <div className="mt-4 grid grid-cols-2 gap-2 text-[10px] text-ink-500">
              <div className="flex items-center gap-1.5 rounded-lg bg-linen-100/60 px-3 py-2">
                <Lock className="h-3 w-3" strokeWidth={1.5} />
                دفع مشفّر
              </div>
              <div className="flex items-center gap-1.5 rounded-lg bg-linen-100/60 px-3 py-2">
                <Truck className="h-3 w-3" strokeWidth={1.5} />
                شحن خلال 2-5 أيام
              </div>
              <div className="col-span-2 flex items-center gap-1.5 rounded-lg bg-linen-100/60 px-3 py-2">
                <MessageCircle className="h-3 w-3" strokeWidth={1.5} />
                دعم بالعربية على واتساب
              </div>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}
