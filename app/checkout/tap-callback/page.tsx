'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Home,
  ArrowLeft,
  ArrowRight,
  Receipt,
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { useOrdersStore } from '@/lib/orders-store';
import { useI18n } from '@/lib/i18n';
import { formatSAR, cn } from '@/lib/utils';

export default function TapCallbackPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <TapCallbackContent />
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

function TapCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { locale } = useI18n();
  const Arrow = locale === 'ar' ? ArrowLeft : ArrowRight;

  const orderId = searchParams.get('order') ?? '';
  const status = searchParams.get('status') ?? 'CAPTURED';
  const method = searchParams.get('method') ?? 'tap';
  const charge = searchParams.get('charge') ?? '';

  const order = useOrdersStore((s) => s.orders.find((o) => o.id === orderId));
  const updateOrder = useOrdersStore((s) => s.updateOrder);
  const hydrated = useOrdersStore((s) => s.hydrated);

  // Auto-redirect after 3 seconds on success
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (order && status === 'CAPTURED' && order.status !== 'confirmed') {
      // Update order status
      updateOrder(order.id, {
        status: 'confirmed',
        payment: method as any,
        cjOrderId: order.cjOrderId ?? charge,
      });
    }
  }, [order, status, method, charge, updateOrder]);

  useEffect(() => {
    if (status === 'CAPTURED') {
      const interval = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            clearInterval(interval);
            router.push(`/checkout/success?order=${orderId}`);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [status, orderId, router]);

  if (!hydrated) return <LoadingState />;

  const isSuccess = status === 'CAPTURED';

  return (
    <main className="py-12 md:py-20">
      <Container>
        <div className="mx-auto max-w-md text-center">
          {/* Icon */}
          <div
            className={cn(
              'mx-auto inline-flex h-20 w-20 items-center justify-center rounded-full',
              isSuccess ? 'bg-sage-100 text-sage-600' : 'bg-red-100 text-red-600'
            )}
          >
            {isSuccess ? (
              <CheckCircle2 className="h-10 w-10" strokeWidth={1.5} />
            ) : (
              <XCircle className="h-10 w-10" strokeWidth={1.5} />
            )}
          </div>

          {/* Title */}
          <h1 className="mt-6 text-3xl font-semibold text-ink-900">
            {isSuccess
              ? method === 'tabby'
                ? 'تم تفعيل التقسيط!'
                : 'تم الدفع بنجاح!'
              : 'تم إلغاء الدفع'}
          </h1>
          <p className="mt-3 text-base text-ink-500">
            {isSuccess
              ? method === 'tabby'
                ? 'خطة التقسيط مفعّلة. سيتم خصم 4 دفعات بدون فوائد.'
                : 'تم استلام الدفع من Tap. جارٍ معالجة طلبك.'
              : 'لم يتم إكمال الدفع. الطلب محفوظ في حسابك.'}
          </p>

          {/* Order info */}
          {order && (
            <div className="mt-8 rounded-2xl border border-sage-500/15 bg-linen-50 p-5 text-start">
              <div className="flex items-center justify-between border-b border-sage-500/10 pb-3">
                <span className="text-xs text-ink-500">رقم الطلب</span>
                <span className="font-mono text-sm font-semibold text-ink-900">{order.id}</span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-ink-500">المبلغ</span>
                <span className="font-mono text-base font-semibold tabular-nums text-ink-900">
                  {formatSAR(order.total)}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-ink-500">طريقة الدفع</span>
                <span className="text-sm font-medium text-ink-900">
                  {method === 'tabby' ? 'Tabby (4 دفعات)' : method === 'tap' ? 'Tap Payments' : method}
                </span>
              </div>
              {charge && (
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-ink-500">رقم العملية</span>
                  <span className="font-mono text-[10px] text-ink-700">{charge.slice(0, 16)}...</span>
                </div>
              )}
            </div>
          )}

          {/* Action */}
          {isSuccess ? (
            <>
              <p className="mt-6 text-xs text-ink-500">
                جارٍ تحويلك خلال {countdown} ثانية...
              </p>
              <Link
                href={`/checkout/success?order=${orderId}`}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-sage-500 px-6 py-3 text-sm font-medium text-linen-50 transition-colors hover:bg-sage-600"
              >
                <Receipt className="h-4 w-4" strokeWidth={1.5} />
                عرض تفاصيل الطلب
                <Arrow className="h-4 w-4" strokeWidth={2} />
              </Link>
            </>
          ) : (
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/cart"
                className="inline-flex items-center gap-2 rounded-full bg-sage-500 px-5 py-2.5 text-sm font-medium text-linen-50 transition-colors hover:bg-sage-600"
              >
                العودة للسلة
                <Arrow className="h-4 w-4" strokeWidth={2} />
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full border border-sage-500/20 bg-linen-50 px-5 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:bg-sage-50"
              >
                <Home className="h-4 w-4" strokeWidth={1.5} />
                الرئيسية
              </Link>
            </div>
          )}
        </div>
      </Container>
    </main>
  );
}
