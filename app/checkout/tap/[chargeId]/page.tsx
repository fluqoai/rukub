'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CreditCard,
  Lock,
  Shield,
  Loader2,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { useOrdersStore } from '@/lib/orders-store';
import { useI18n } from '@/lib/i18n';
import { formatSAR, cn } from '@/lib/utils';

export default function TapMockPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <TapMockContent />
    </Suspense>
  );
}

function LoadingState() {
  return (
    <main className="flex min-h-[80vh] items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-sage-500" />
    </main>
  );
}

function TapMockContent() {
  const params = useParams<{ chargeId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { locale } = useI18n();
  const Arrow = locale === 'ar' ? ArrowLeft : ArrowRight;

  const orderId = searchParams.get('order') ?? '';
  const amount = Number(searchParams.get('amount') ?? '0');
  const order = useOrdersStore((s) => s.orders.find((o) => o.id === orderId));
  const updateOrder = useOrdersStore((s) => s.updateOrder);

  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [processing, setProcessing] = useState(false);

  const formatCardNumber = (val: string) => {
    return val
      .replace(/\D/g, '')
      .slice(0, 16)
      .replace(/(.{4})/g, '$1 ')
      .trim();
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    // Simulate Tap processing time
    setTimeout(() => {
      // Mark order as confirmed via Tap payment
      if (order) {
        updateOrder(order.id, {
          status: 'confirmed',
          payment: 'tap',
        });
      }
      // Redirect to callback
      router.push(
        `/checkout/tap-callback?order=${orderId}&charge=${params.chargeId}&status=CAPTURED&method=tap`
      );
    }, 1800);
  };

  const handleCancel = () => {
    router.push(`/checkout/tap-callback?order=${orderId}&status=CANCELLED&method=tap`);
  };

  if (!order) {
    return (
      <main className="py-20">
        <Container>
          <div className="mx-auto max-w-md rounded-3xl border border-sage-500/10 bg-linen-50 p-8 text-center">
            <p className="text-ink-700">الطلب غير موجود.</p>
            <Link href="/" className="mt-4 inline-block text-sage-600 hover:text-sage-700">
              العودة للرئيسية
            </Link>
          </div>
        </Container>
      </main>
    );
  }

  return (
    <main className="bg-linen-100/50 py-12 md:py-20">
      <Container>
        <div className="mx-auto max-w-md">
          {/* Tap header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink-900 text-linen-50">
                <span className="font-mono text-xs font-bold">tap</span>
              </div>
              <span className="text-sm font-semibold text-ink-900">Tap Payments</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-ink-500">
              <Lock className="h-3 w-3" />
              <span>مشفّر 256-bit</span>
            </div>
          </div>

          {/* Order summary */}
          <div className="mb-6 rounded-2xl border border-sage-500/10 bg-linen-50 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-ink-500">المبلغ المستحق</p>
                <p className="font-mono text-3xl font-semibold tabular-nums text-ink-900">
                  {formatSAR(amount || order.total)}
                </p>
              </div>
              <div className="text-end">
                <p className="text-xs text-ink-500">رقم الطلب</p>
                <p className="font-mono text-sm font-semibold text-ink-900">{order.id}</p>
              </div>
            </div>
          </div>

          {/* Mock notice */}
          <div className="mb-6 rounded-2xl border border-wood-500/20 bg-wood-400/5 p-3 text-xs text-wood-700">
            <p className="font-medium">وضع تجريبي — Tap Sandbox</p>
            <p className="mt-1 text-wood-700/80">
              أدخل أي بيانات وهمية للدفع. هذا محاكاة لـ Tap. في الإنتاج، ستنتقل لصفحة Tap الحقيقية.
            </p>
          </div>

          {/* Payment form */}
          <form onSubmit={handlePay} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-700">
                اسم حامل البطاقة
              </label>
              <input
                type="text"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder="MOHAMED ALOTAIBI"
                className="w-full rounded-xl border border-sage-500/20 bg-linen-50 px-4 py-3 text-sm focus:border-sage-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-700">
                رقم البطاقة
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  placeholder="4242 4242 4242 4242"
                  dir="ltr"
                  className="w-full rounded-xl border border-sage-500/20 bg-linen-50 px-4 py-3 pl-12 font-mono text-sm focus:border-sage-500 focus:outline-none"
                  maxLength={19}
                  required
                />
                <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-700">
                  تاريخ الانتهاء
                </label>
                <input
                  type="text"
                  value={expiry}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setExpiry(v.length > 2 ? `${v.slice(0, 2)}/${v.slice(2)}` : v);
                  }}
                  placeholder="MM/YY"
                  dir="ltr"
                  className="w-full rounded-xl border border-sage-500/20 bg-linen-50 px-4 py-3 font-mono text-sm focus:border-sage-500 focus:outline-none"
                  maxLength={5}
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-700">
                  CVV
                </label>
                <input
                  type="text"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                  placeholder="123"
                  dir="ltr"
                  className="w-full rounded-xl border border-sage-500/20 bg-linen-50 px-4 py-3 font-mono text-sm focus:border-sage-500 focus:outline-none"
                  maxLength={3}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={processing}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-ink-900 px-5 py-3.5 text-sm font-medium text-linen-50 transition-colors hover:bg-ink-700 disabled:opacity-60"
            >
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  جارٍ معالجة الدفع...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  ادفع {formatSAR(amount || order.total)}
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleCancel}
              disabled={processing}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-sage-500/20 bg-linen-50 px-5 py-3 text-sm font-medium text-ink-700 transition-colors hover:bg-sage-50 disabled:opacity-60"
            >
              <XCircle className="h-4 w-4" />
              إلغاء والعودة
            </button>
          </form>

          <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-ink-500">
            <Shield className="h-3 w-3" />
            <span>جميع المعاملات محمية بتشفير SSL</span>
          </div>
        </div>
      </Container>
    </main>
  );
}
