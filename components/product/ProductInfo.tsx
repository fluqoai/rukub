'use client';

import { useState } from 'react';
import {
  ShoppingBag,
  Truck,
  Banknote,
  RotateCcw,
} from 'lucide-react';
import type { PublicProduct } from '@/lib/public-products';
import { useCartStore } from '@/lib/cart-store';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { Toast } from '@/components/ui/Toast';
import { formatSAR } from '@/lib/utils';

type ProductInfoProps = {
  product: PublicProduct;
  variantId?: string;
  onVariantChange?: (vid: string) => void;
};

export function ProductInfo({ product, variantId, onVariantChange }: ProductInfoProps) {
  const [qty, setQty] = useState(1);
  const [toast, setToast] = useState<string | null>(null);
  const addItem = useCartStore((s) => s.addItem);

  const handleAdd = () => {
    if (product.requiresVariant && !variantId) return;
    const variant = product.variants?.find(v => v.vid === variantId);
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        shortName: product.shortName,
        price: product.price,
        audience: product.audience,
        variantId: variant?.vid,
        variantLabel: variant?.labelAr,
        imageUrl: product.imageUrl || undefined,
        iconName: (product as any).iconName ?? (product as any).icon?.displayName ?? 'Package',
      },
      qty
    );
    setToast(`تمت إضافة "${product.shortName}" للسلة`);
  };

  const savings = product.oldPrice ? product.oldPrice - product.price : 0;
  const deliveryMin = (product as any).deliveryMinDays as number | null | undefined;
  const deliveryMax = (product as any).deliveryMaxDays as number | null | undefined;
  const trustItems = [
    { icon: Truck, text: deliveryMax ? `توصيل متوقع ${deliveryMin && deliveryMin !== deliveryMax ? `${deliveryMin}–${deliveryMax}` : deliveryMax} يوم عمل` : 'تحديثات واضحة للشحن' },
    { icon: Banknote, text: 'خيارات دفع واضحة عند إتمام الطلب' },
    { icon: RotateCcw, text: 'سياسة إرجاع واضحة' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <Toast message={toast} onDone={() => setToast(null)} />

      {/* Audience + breadcrumb */}
      <div className="flex items-center gap-2 text-xs">
        <span className="rounded-full bg-sage-50 px-2.5 py-1 font-medium text-sage-700">
          {{ women: 'ترتيب وأناقة', men: 'تقنية واستعداد', shared: 'العناية اليومية' }[product.audience]}
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
      {product.requiresVariant && <label className="block text-sm font-medium text-ink-900">اختر اللون / المقاس / النوع
        <select aria-label="اختر النسخة" value={variantId || ''} onChange={e => { setQty(1); onVariantChange?.(e.target.value); }} className="mt-2 w-full rounded-2xl border border-sage-500/25 bg-white p-3 text-sm">
          <option value="">حدد الخيار المطلوب</option>
          {product.variants?.map(v => <option key={v.vid} value={v.vid} disabled={v.stock === 0}>{v.labelAr} — {formatSAR(v.priceSAR)}{v.stock === 0 ? ' — غير متوفر' : ''}</option>)}
        </select><span className="mt-2 block text-xs font-normal text-ink-500">كل خيار يطابق نسخة أصلية محددة. يتغير السعر والصورة حسب اختيارك، ويُعاد التحقق عند الطلب.</span>
      </label>}
      <div className="flex items-center gap-3">
        <QuantityStepper value={qty} onChange={setQty} max={Math.min(10, product.variants?.find(v => v.vid === variantId)?.stock || 10)} />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!!product.requiresVariant && (!variantId || product.variants?.find(v => v.vid === variantId)?.stock === 0)}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-sage-500 px-5 py-3 text-sm font-medium text-linen-50 transition-colors hover:bg-sage-600 disabled:opacity-40"
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
