'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { PublicProduct } from '@/lib/public-products';
import { getIcon } from '@/lib/icon-map';

export function ProductGallery({ product }: { product: PublicProduct }) {
  const [imageError, setImageError] = useState(false);
  const Icon = getIcon(product.iconName);
  const hasImage = Boolean(product.imageUrl) && !imageError;
  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-4xl border border-sage-500/10 bg-gradient-to-br from-sage-100 via-linen-50 to-wood-400/15">
        {hasImage ? <Image src={product.imageUrl!} alt={product.name} fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-contain p-6" onError={() => setImageError(true)} /> : <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center"><div className="flex h-32 w-32 items-center justify-center rounded-[2.25rem] border border-white/60 bg-white/45 text-sage-700 shadow-sm backdrop-blur"><Icon className="h-16 w-16" strokeWidth={1.05} /></div><p className="mt-6 text-xs text-ink-500">عرض تعريفي للمنتج</p></div>}
        {product.badge && <span className="absolute end-5 top-5 rounded-full bg-ink-900 px-3 py-1.5 text-xs text-linen-50">{product.badge}</span>}
      </div>
    </div>
  );
}
