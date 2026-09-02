'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { type Product } from '@/lib/products';
import { getVariantsForProduct, type Variant } from '@/lib/product-meta';
import { cn } from '@/lib/utils';

type ProductVariantsProps = {
  product: Product;
  onChange?: (variant: Variant) => void;
};

export function ProductVariants({ product, onChange }: ProductVariantsProps) {
  const variants = getVariantsForProduct(product);
  const [selected, setSelected] = useState<Variant>(
    variants.find((v) => v.selected) ?? variants[0]
  );

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-ink-500">
          اللون
        </span>
        <span className="text-xs text-ink-700">{selected.name}</span>
      </div>

      <div className="flex flex-wrap gap-2.5">
        {variants.map((v) => {
          const active = v.id === selected.id;
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => {
                setSelected(v);
                onChange?.(v);
              }}
              className={cn(
                'group relative flex h-11 w-11 items-center justify-center rounded-full border-2 transition-all',
                active
                  ? 'border-sage-500 ring-2 ring-sage-500/20 ring-offset-2 ring-offset-linen-50'
                  : 'border-sage-500/15 hover:border-sage-500/40'
              )}
              aria-label={v.name}
              title={v.name}
            >
              <span
                className="block h-7 w-7 rounded-full"
                style={{ backgroundColor: v.swatch }}
              />
              {active && (
                <span className="absolute -bottom-0.5 -end-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-sage-500 text-linen-50">
                  <Check className="h-2.5 w-2.5" strokeWidth={3} />
                </span>
              )}
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-[10px] text-ink-500">
        4 ألوان متوفرة — اختر اللون المفضل قبل الإضافة للسلة
      </p>
    </div>
  );
}
