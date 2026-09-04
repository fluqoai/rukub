'use client';

import { useState } from 'react';
import {
  ShoppingBag,
  Truck,
  Banknote,
  RotateCcw,
} from 'lucide-react';
import { type Product } from '@/lib/products';
import { useCartStore } from '@/lib/cart-store';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { Toast } from '@/components/ui/Toast';
import { formatSAR } from '@/lib/utils';

type ProductInfoProps = {
  product: Product;
};

const trustItems = [
  { icon: Truck, text: 'تحديثات واضحة للشحن' },
  { icon: Banknote, text: 'دفع عند الاستلام' },
  { icon: RotateCcw, text: 'سياسة إرجاع واضحة' },
];

export function ProductInfo({ product }: ProductInfoProps) {
  const [qty, setQty] = useState(1);
  const [toast, setToast] = useState<string | null>(null);
  const addItem = useCartStore((s) => s.addItem);

  const handleAdd = () => {
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        shortName: product.shortName,
        price: product.price,
        audience: product.audience,
        iconName: (product as any).iconName ?? (product as any).icon?.displayName ?? 'Package',
      },
      qty
    );
    setToast(`تمت إضافة "${product.shortName}" للسلة`);
  };

  const savings = product.oldPrice ? product.oldPrice - product.price : 0;

  return (
    <div className="flex flex-col gap-6">
      <Toast message={toast} onDone={() => setToast(null)} />

      {/* Audience + breadcrumb */}
      <div className="flex items-center gap-2 text-xs">
        <span className="rounded-full bg-sage-50 px-2.5 py-1 font-medium text-sage-700">
          {{ women: 'الراحة والتنظيم', men: 'التقنية والأمان', shared: 'أساسيات يومية' }[product.audience]}
        </span>
        {product.badge && (
          <span className="rounded-full bg-wood-400/15 px-2.5 py-1 font-medium text-wood-700">
            {product.badge}
          </span>
        )}
        {savings > 0 && (
          <span className="rounded-full bg-ink-900 px-2.5 py-1 font-medium text-wood-400">
            وفّرت {formatSAR(savings)}
          </span>
        )}
      </div>

      {/* Title + tagline */}
      <div>
        <h1 className="text-3xl font-semibold leading-tight text-ink-900 md:text-4xl">
          {product.name}
        </h1>
        <p className="mt-3 text-base leading-relaxed text-ink-500">
          {product.tagline}
        </p>
      </div>

      {/* Price */}
      <div className="flex items-end gap-3 border-y border-sage-500/10 py-5">
        <span className="font-mono text-4xl font-semibold tabular-nums text-ink-900">
          {formatSAR(product.price)}
        </span>
        {product.oldPrice && (
          <div className="flex flex-col">
            <span className="text-sm text-ink-300 line-through">
              {formatSAR(product.oldPrice)}
            </span>
            <span className="text-xs text-wood-600">
              خصم {Math.round((savings / product.oldPrice) * 100)}%
            </span>
          </div>
        )}
      </div>

      {/* Quantity + Add */}
      <div className="flex items-center gap-3">
        <QuantityStepper value={qty} onChange={setQty} />
        <button
          type="button"
          onClick={handleAdd}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-sage-500 px-5 py-3 text-sm font-medium text-linen-50 transition-colors hover:bg-sage-600"
        >
          <ShoppingBag className="h-4 w-4" strokeWidth={1.5} />
          <span>أضف للسلة — {formatSAR(product.price * qty)}</span>
        </button>
      </div>

      {/* Trust grid */}
      <div className="grid grid-cols-2 gap-3 rounded-2xl border border-sage-500/10 bg-linen-50/60 p-4">
        {trustItems.map((t, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sage-500/10 text-sage-600">
              <t.icon className="h-4 w-4" strokeWidth={1.5} />
            </div>
            <span className="text-xs text-ink-700">{t.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
