'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Loader2,
  Shield,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  CreditCard,
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { useOrdersStore } from '@/lib/orders-store';
import { formatSAR } from '@/lib/utils';

export default function TabbyMockPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <TabbyMockContent />
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

function TabbyMockContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('order') ?? '';
  const order = useOrdersStore((s) => s.orders.find((o) => o.id === orderId));
  const updateOrder = useOrdersStore((s) => s.updateOrder);
  const [processing, setProcessing] = useState(false);

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

  const installment = order.total / 4;

  const handleApprove = () => {
    setProcessing(true);
    setTimeout(() => {
      updateOrder(order.id, {
        status: 'confirmed',
        payment: 'tabby',
      });
      router.push(
        `/checkout/tap-callback?order=${orderId}&status=CAPTURED&method=tabby`
      );
    }, 1500);
  };

  const handleDecline = () => {
    router.push(`/checkout/tap-callback?order=${orderId}&status=CANCELLED&method=tabby`);
  };

  const today = new Date();
  const installments = [
    new Date(today.getTime()),
    new Date(today.getTime() + 30 * 86400000),
    new Date(today.getTime() + 60 * 86400000),
    new Date(today.getTime() + 90 * 86400000),
  ];

  return (
    <main className="bg-linen-100/50 py-12 md:py-20">
      <Container>
        <div className="mx-auto max-w-md">
          {/* Tabby header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 items-center justify-center rounded-lg bg-ink-900 px-2 text-linen-50">
                <span className="font-mono text-xs font-bold">tabby</span>
              </div>
              <span className="text-sm font-semibold text-ink-900">Tabby Installments</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-ink-500">
              <Shield className="h-3 w-3" />
              <span>بدون فوائد</span>
            </div>
          </div>

          {/* Mock notice */}
          <div className="mb-6 rounded-2xl border border-wood-500/20 bg-wood-400/5 p-3 text-xs text-wood-700">
            <p className="font-medium">وضع تجريبي — Tabby Simulation</p>
            <p className="mt-1 text-wood-700/80">
              محاكاة لصفحة Tabby. اضغط "موافق" لإتمام الطلب أو "رفض" لإلغائه.
            </p>
          </div>

          {/* Order summary */}
          <div className="mb-6 rounded-2xl border border-sage-500/10 bg-linen-50 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-ink-500">المبلغ الإجمالي</p>
                <p className="font-mono text-3xl font-semibold tabular-nums text-ink-900">
                  {formatSAR(order.total)}
                </p>
              </div>
              <div className="text-end">
                <p className="text-xs text-ink-500">رقم الطلب</p>
                <p className="font-mono text-sm font-semibold text-ink-900">{order.id}</p>
              </div>
            </div>
          </div>

          {/* Installments breakdown */}
          <div className="mb-6 rounded-2xl border border-sage-500/10 bg-linen-50 p-5">
            <h3 className="text-sm font-semibold text-ink-900">خطة التقسيط — 4 دفعات</h3>
            <ul className="mt-4 space-y-3">
              {installments.map((date, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between border-b border-sage-500/5 pb-3 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sage-50 text-sage-600">
                      {i === 0 ? <CreditCard className="h-4 w-4" /> : <Calendar className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ink-900">
                        الدفعة {i + 1} {i === 0 && <span className="text-xs text-sage-600">(الآن)</span>}
                      </p>
                      <p className="text-[10px] text-ink-500">
                        {date.toLocaleDateString('ar-SA', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <p className="font-mono text-sm font-semibold tabular-nums text-ink-900">
                    {formatSAR(installment)}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleApprove}
              disabled={processing}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-ink-900 px-5 py-3.5 text-sm font-medium text-linen-50 transition-colors hover:bg-ink-700 disabled:opacity-60"
            >
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  جارٍ الموافقة...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  موافق على خطة التقسيط
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleDecline}
              disabled={processing}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-sage-500/20 bg-linen-50 px-5 py-3 text-sm font-medium text-ink-700 transition-colors hover:bg-sage-50 disabled:opacity-60"
            >
              <XCircle className="h-4 w-4" />
              رفض
            </button>
          </div>

          <p className="mt-6 text-center text-[10px] text-ink-500">
            بضغط "موافق" فإنك توافق على شروط وأحكام Tabby
          </p>
        </div>
      </Container>
    </main>
  );
}
