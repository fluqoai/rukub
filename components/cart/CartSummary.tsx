'use client';

import Link from 'next/link';
import { ShoppingBag, Truck, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import {
  useCartStore,
  selectTotalPrice,
  selectTotalItems,
  selectShipping,
  selectGrandTotal,
  FREE_SHIPPING_THRESHOLD,
} from '@/lib/cart-store';
import { formatSAR } from '@/lib/utils';

type CartSummaryProps = {
  showCheckoutButton?: boolean;
};

export function CartSummary({ showCheckoutButton = true }: CartSummaryProps) {
  const { t, locale } = useI18n();
  const Arrow = locale === 'ar' ? ArrowLeft : ArrowRight;
  const totalItems = useCartStore(selectTotalItems);
  const totalPrice = useCartStore(selectTotalPrice);
  const shipping = useCartStore(selectShipping);
  const grandTotal = useCartStore(selectGrandTotal);
  const remaining = FREE_SHIPPING_THRESHOLD - totalPrice;

  return (
    <aside className="sticky top-20 h-fit rounded-3xl border border-sage-500/10 bg-linen-50 p-6">
      <h2 className="text-base font-semibold text-ink-900">ملخص الطلب</h2>

      {/* Free shipping progress */}
      {remaining > 0 ? (
        <div className="mt-4 rounded-2xl bg-sage-50 p-3">
          <div className="flex items-center gap-2 text-xs text-sage-700">
            <Truck className="h-3.5 w-3.5" strokeWidth={1.5} />
            <span>
              أضف <strong className="font-mono">{formatSAR(remaining)}</strong> للحصول على شحن مجاني
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-sage-100">
            <div
              className="h-full bg-sage-500 transition-all duration-500"
              style={{
                width: `${Math.min(100, (totalPrice / FREE_SHIPPING_THRESHOLD) * 100)}%`,
              }}
            />
          </div>
        </div>
      ) : (
        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-sage-50 p-3 text-xs text-sage-700">
          <Truck className="h-3.5 w-3.5" strokeWidth={1.5} />
          <span>مبارك! أنت مؤهل لشحن مجاني</span>
        </div>
      )}

      {/* Totals */}
      <dl className="mt-6 space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-ink-500">المنتجات ({totalItems})</dt>
          <dd className="font-mono font-medium text-ink-900">
            {formatSAR(totalPrice)}
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-ink-500">الشحن</dt>
          <dd className="font-mono font-medium text-ink-900">
            {shipping === 0 ? <span className="text-sage-600">مجاني</span> : formatSAR(shipping)}
          </dd>
        </div>
        <div className="border-t border-sage-500/10 pt-3">
          <div className="flex items-baseline justify-between">
            <dt className="text-base font-semibold text-ink-900">الإجمالي</dt>
            <dd className="font-mono text-2xl font-semibold tabular-nums text-ink-900">
              {formatSAR(grandTotal)}
            </dd>
          </div>
          <p className="mt-1 text-end text-[10px] text-ink-500">
            شامل ضريبة القيمة المضافة 15%
          </p>
        </div>
      </dl>

      {showCheckoutButton && (
        <Link
          href="/checkout"
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-sage-500 px-5 py-3.5 text-sm font-medium text-linen-50 transition-colors hover:bg-sage-600"
        >
          المتابعة للدفع
          <Arrow className="h-4 w-4" strokeWidth={2} />
        </Link>
      )}

      <div className="mt-5 flex items-center justify-center gap-1.5 text-[10px] text-ink-500">
        <ShieldCheck className="h-3 w-3" strokeWidth={1.5} />
        دفع آمن · تشفير SSL · 256-bit
      </div>
    </aside>
  );
}
