'use client';

import { useState } from 'react';
import {
  ShoppingBag,
  Heart,
  Share2,
  Truck,
  Banknote,
  RotateCcw,
  Shield,
  Check,
  Plus,
  Minus,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { type Product, audienceLabel } from '@/lib/products';
import { useCartStore } from '@/lib/cart-store';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { ProductVariants } from './ProductVariants';
import { Toast } from '@/components/ui/Toast';
import { formatSAR } from '@/lib/utils';

type ProductInfoProps = {
  product: Product;
};

const trustItems = [
  { icon: Truck, text: 'شحن خلال 2-5 أيام' },
  { icon: Banknote, text: 'دفع عند الاستلام' },
  { icon: RotateCcw, text: 'إرجاع خلال 14 يوم' },
  { icon: Shield, text: 'ضمان استبدال' },
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
        iconName: product.icon.displayName ?? 'Package',
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
          {audienceLabel[product.audience]}
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

      {/* Rating summary (compact) */}
      <div className="flex items-center gap-2 text-sm">
        <div className="flex items-center gap-0.5 text-wood-500">
          {Array.from({ length: 5 }).map((_, i) => (
            <svg
              key={i}
              viewBox="0 0 24 24"
              fill={i < 4 ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="1.5"
              className="h-3.5 w-3.5"
              opacity={i === 4 ? 0.4 : 1}
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          ))}
        </div>
        <span className="font-mono text-ink-900">4.8</span>
        <span className="text-ink-500">· 128 تقييم</span>
        <span className="text-ink-300">|</span>
        <span className="text-ink-500">+2,300 مبيعات</span>
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

      {/* Variants */}
      <ProductVariants product={product} />

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

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-sage-500/20 bg-linen-50 px-4 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:bg-sage-50"
        >
          <Heart className="h-4 w-4" strokeWidth={1.5} />
          مفضلة
        </button>
        <button
          type="button"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-sage-500/20 bg-linen-50 px-4 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:bg-sage-50"
        >
          <Share2 className="h-4 w-4" strokeWidth={1.5} />
          مشاركة
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
