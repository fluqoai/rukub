'use client';

import { Trash2 } from 'lucide-react';
import Link from 'next/link';
import * as Icons from 'lucide-react';
import { useCartStore, type CartItem as CartItemType } from '@/lib/cart-store';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { formatSAR } from '@/lib/utils';

type CartItemProps = {
  item: CartItemType;
};

const audienceGradients: Record<CartItemType['audience'], string> = {
  women: 'from-sage-100 to-wood-400/10',
  men: 'from-sage-200 to-ink-900/5',
  shared: 'from-wood-400/15 to-sage-100',
};

export function CartItem({ item }: CartItemProps) {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  // Resolve icon dynamically (or fallback)
  const Icon =
    (Icons as unknown as Record<string, React.FC<{ className?: string; strokeWidth?: number }>>)[
      item.iconName
    ] ?? Icons.Package;

  return (
    <div className="flex gap-4 rounded-2xl border border-sage-500/10 bg-linen-50 p-4">
      {/* Image / icon */}
      <Link
        href={`/products/${item.slug}`}
        className={`relative flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br ${audienceGradients[item.audience]}`}
      >
        <Icon className="h-9 w-9 text-sage-600" strokeWidth={1.25} />
      </Link>

      {/* Info */}
      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              href={`/products/${item.slug}`}
              className="text-sm font-medium text-ink-900 hover:text-sage-600"
            >
              {item.name}
            </Link>
            <p className="mt-0.5 text-[10px] uppercase tracking-wider text-ink-300">
              {{ women: 'ترتيب وأناقة', men: 'تقنية واستعداد', shared: 'العناية اليومية' }[item.audience]}
            </p>
          </div>
          <button
            type="button"
            onClick={() => removeItem(item.productId)}
            className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-ink-300 transition-colors hover:bg-ink-900/5 hover:text-ink-700"
            aria-label="حذف من السلة"
          >
            <Trash2 className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>

        <div className="mt-auto flex items-center justify-between pt-3">
          <QuantityStepper
            value={item.quantity}
            onChange={(qty) => updateQuantity(item.productId, qty)}
            size="sm"
          />
          <span className="font-mono text-sm font-semibold tabular-nums text-ink-900">
            {formatSAR(item.price * item.quantity)}
          </span>
        </div>
      </div>
    </div>
  );
}
