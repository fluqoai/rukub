'use client';

import * as Icons from 'lucide-react';
import Link from 'next/link';
import { cartLineKey } from '@/lib/catalog-variants';
import {
  useCartStore,
  selectTotalItems,
  selectTotalPrice,
  selectShipping,
  selectGrandTotal,
  FREE_SHIPPING_THRESHOLD,
} from '@/lib/cart-store';
import { formatSAR } from '@/lib/utils';

export function OrderSummary() {
  const items = useCartStore((s) => s.items);
  const totalItems = useCartStore(selectTotalItems);
  const totalPrice = useCartStore(selectTotalPrice);
  const shipping = useCartStore(selectShipping);
  const grandTotal = useCartStore(selectGrandTotal);
  const remaining = FREE_SHIPPING_THRESHOLD - totalPrice;

  return (
    <aside className="sticky top-20 h-fit rounded-3xl border border-sage-500/10 bg-linen-50 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-ink-900">طلبك</h2>
        <Link href="/cart" className="text-xs text-sage-600 hover:text-sage-700">
          تعديل السلة
        </Link>
      </div>

      {/* Items list */}
      <ul className="max-h-64 space-y-2.5 overflow-y-auto pe-1">
        {items.map((item) => {
          const Icon =
            (Icons as unknown as Record<string, React.FC<{ className?: string; strokeWidth?: number }>>)[
              item.iconName
            ] ?? Icons.Package;
          return (
            <li key={cartLineKey(item)} className="flex items-center gap-3">
              <div className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-sage-50">
                <Icon className="h-5 w-5 text-sage-600" strokeWidth={1.25} />
                <span className="absolute -top-1 -end-1 flex h-4 w-4 items-center justify-center rounded-full bg-ink-900 font-mono text-[9px] font-medium text-linen-50">
                  {item.quantity}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-ink-900">
                  {item.shortName}
                </p>
                {item.variantLabel && <p className="text-xs text-sage-700">{item.variantLabel}</p>}
                <p className="font-mono text-[10px] text-ink-500">
                  {formatSAR(item.price)} × {item.quantity}
                </p>
              </div>
              <p className="font-mono text-xs font-semibold tabular-nums text-ink-900">
                {formatSAR(item.price * item.quantity)}
              </p>
            </li>
          );
        })}
      </ul>

      {/* Totals */}
      <dl className="mt-5 space-y-2.5 border-t border-sage-500/10 pt-5 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-ink-500">المجموع الفرعي</dt>
          <dd className="font-mono font-medium text-ink-900">
            {formatSAR(totalPrice)}
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-ink-500">الشحن</dt>
          <dd className="font-mono font-medium text-ink-900">
            {shipping === 0 ? (
              <span className="text-sage-600">مجاني</span>
            ) : (
              formatSAR(shipping)
            )}
          </dd>
        </div>
        {remaining > 0 && (
          <p className="text-[10px] text-ink-500">
            أضف {formatSAR(remaining)} لشحن مجاني
          </p>
        )}
        <div className="border-t border-sage-500/10 pt-3">
          <div className="flex items-baseline justify-between">
            <dt className="text-sm font-semibold text-ink-900">الإجمالي</dt>
            <dd className="font-mono text-2xl font-semibold tabular-nums text-ink-900">
              {formatSAR(grandTotal)}
            </dd>
          </div>
        </div>
      </dl>
    </aside>
  );
}
