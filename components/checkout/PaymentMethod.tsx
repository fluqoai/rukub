'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Banknote, CreditCard, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useCartStore, selectGrandTotal, selectTotalItems } from '@/lib/cart-store';
import { formatSAR } from '@/lib/utils';
import { cn } from '@/lib/utils';

export type PaymentOption = 'cod' | 'tap';

type PaymentMethodProps = {
  onBack: () => void;
  onPlaceOrder: (method: PaymentOption) => void;
};

const methods: Array<{
  key: PaymentOption;
  title: string;
  desc: string;
  badge?: string;
  Icon: typeof Banknote;
}> = [
  {
    key: 'cod',
    title: 'الدفع عند الاستلام',
    desc: 'ادفع نقداً للمندوب عند استلام طلبك',
    badge: 'الأكثر استخداماً',
    Icon: Banknote,
  },
  {
    key: 'tap',
    title: 'بطاقة / Apple Pay',
    desc: 'ادفع بـ Visa / Mastercard / مدى / Apple Pay — مشفّر وآمن',
    Icon: CreditCard,
  },
];

export function PaymentMethod({ onBack, onPlaceOrder }: PaymentMethodProps) {
  const { locale } = useI18n();
  const Arrow = locale === 'ar' ? ArrowLeft : ArrowRight;
  const totalItems = useCartStore(selectTotalItems);
  const grandTotal = useCartStore(selectGrandTotal);

  // Default: COD (safer for first launch in Saudi)
  const [selected, setSelected] = useState<PaymentOption>('cod');
  const [agreed, setAgreed] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) return;
    onPlaceOrder(selected);
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-ink-900">طريقة الدفع</h2>
        <p className="mt-1 text-sm text-ink-500">اختر طريقة الدفع المناسبة لك</p>
      </div>

      <div className="space-y-3">
        {methods.map((m) => {
          const active = selected === m.key;
          return (
            <label
              key={m.key}
              className={cn(
                'group relative flex cursor-pointer items-start gap-3 rounded-2xl border bg-linen-50 p-4 transition-colors',
                active
                  ? 'border-sage-500 bg-sage-50/40 ring-1 ring-sage-500/30'
                  : 'border-sage-500/15 hover:border-sage-500/30'
              )}
            >
              <input
                type="radio"
                name="payment"
                value={m.key}
                checked={active}
                onChange={() => setSelected(m.key)}
                className="sr-only"
              />
              <div
                className={cn(
                  'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl',
                  active ? 'bg-sage-500 text-linen-50' : 'bg-sage-100 text-sage-600'
                )}
              >
                <m.Icon className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-ink-900">
                    {m.title}
                  </span>
                  {m.badge && (
                    <span className="rounded-full bg-wood-400/15 px-2 py-0.5 text-[10px] font-medium text-wood-700">
                      {m.badge}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-ink-500">{m.desc}</p>
              </div>
              <div
                className={cn(
                  'flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2',
                  active ? 'border-sage-500 bg-sage-500' : 'border-ink-300/40'
                )}
              >
                {active && <Check className="h-3 w-3 text-linen-50" strokeWidth={3} />}
              </div>
            </label>
          );
        })}
      </div>

      <div className="flex items-center justify-between border-t border-sage-500/10 pt-5">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm text-ink-500 transition-colors hover:bg-sage-50"
        >
          <Arrow className="h-4 w-4 rotate-180 rtl:rotate-0" strokeWidth={2} />
          تعديل المعلومات
        </button>
        <button
          type="submit"
          disabled={!agreed}
          className="inline-flex items-center gap-2 rounded-full bg-ink-900 px-6 py-3 text-sm font-medium text-linen-50 transition-colors hover:bg-ink-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span>تأكيد الطلب · {formatSAR(grandTotal)}</span>
          <Arrow className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>

      {/* Terms agreement — required to submit */}
      <label className="flex cursor-pointer items-start gap-2 rounded-2xl border border-sage-500/10 bg-linen-50 p-3 text-xs text-ink-500 transition-colors hover:bg-sage-50/40">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border-sage-500/30 text-sage-500 focus:ring-sage-500/30"
        />
        <span>
          أوافق على{' '}
          <Link href="/terms" target="_blank" className="text-sage-600 underline-offset-2 hover:underline">
            شروط الاستخدام
          </Link>
          {' و'}
          <Link href="/privacy" target="_blank" className="text-sage-600 underline-offset-2 hover:underline">
            سياسة الخصوصية
          </Link>
          {'، وأقرّ بأنني اطّلعت على '}
          <Link href="/refund" target="_blank" className="text-sage-600 underline-offset-2 hover:underline">
            سياسة الإرجاع
          </Link>
          .
        </span>
      </label>
    </form>
  );
}
