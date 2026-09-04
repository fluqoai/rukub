'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { PublicProduct } from '@/lib/public-products';
import { getIcon } from '@/lib/icon-map';
import { cn } from '@/lib/utils';

export function ProductGallery({ product }: { product: PublicProduct }) {
  const images = product.imageUrls?.length ? product.imageUrls : product.imageUrl ? [product.imageUrl] : [];
  const [activeIndex, setActiveIndex] = useState(0);
  const [failed, setFailed] = useState<Set<number>>(new Set());
  const Icon = getIcon(product.iconName);

  const activeImage = images[activeIndex];
  const hasImage = Boolean(activeImage) && !failed.has(activeIndex);

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-4xl border border-sage-500/10 bg-white">
        {hasImage ? (
          <Image
            src={activeImage}
            alt={`${product.name} — صورة ${activeIndex + 1}`}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-contain p-4 md:p-7"
            onError={() => setFailed((previous) => new Set(previous).add(activeIndex))}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-sage-100 via-linen-50 to-wood-400/15 p-8 text-center">
            <div className="flex h-32 w-32 items-center justify-center rounded-[2.25rem] border border-white/60 bg-white/45 text-sage-700 shadow-sm backdrop-blur">
              <Icon className="h-16 w-16" strokeWidth={1.05} />
            </div>
            <p className="mt-6 text-xs text-ink-500">ستُضاف صور المنتج بعد التحقق منها</p>
          </div>
        )}
        {product.badge && <span className="absolute end-5 top-5 rounded-full bg-ink-900 px-3 py-1.5 text-xs text-linen-50">{product.badge}</span>}
      </div>

      {images.length > 1 && (
        <div className="mt-4 grid grid-cols-5 gap-2" aria-label="صور المنتج">
          {images.slice(0, 10).map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                'relative aspect-square overflow-hidden rounded-2xl border bg-white transition-colors',
                activeIndex === index ? 'border-sage-500 ring-2 ring-sage-500/15' : 'border-sage-500/10 hover:border-sage-500/35'
              )}
              aria-label={`عرض الصورة ${index + 1}`}
              aria-current={activeIndex === index ? 'true' : undefined}
            >
              <Image src={image} alt="" fill sizes="96px" className="object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
