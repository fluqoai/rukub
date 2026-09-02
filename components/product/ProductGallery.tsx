'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Maximize2, ChevronLeft, ChevronRight } from 'lucide-react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import { type Product } from '@/lib/products';
import { getProductImages } from '@/lib/product-images';
import { cn } from '@/lib/utils';

type ProductGalleryProps = {
  product: Product;
};

export function ProductGallery({ product }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [errorIndices, setErrorIndices] = useState<Set<number>>(new Set());
  const images = getProductImages(product.id);

  const handleError = (idx: number) => {
    setErrorIndices((prev) => new Set(prev).add(idx));
  };

  const slides = images.map((src, i) => ({ src, alt: `${product.name} ${i + 1}` }));

  const currentErrored = errorIndices.has(active);

  return (
    <div className="flex flex-col gap-4">
      {/* Main image */}
      <div className="group relative aspect-square w-full overflow-hidden rounded-3xl bg-sage-50">
        {!currentErrored ? (
          <Image
            src={images[active]}
            alt={`${product.name} ${active + 1}`}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
            onError={() => handleError(active)}
            priority
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sage-100 via-linen-50 to-wood-400/15">
            <div className="font-mono text-sm text-ink-500">صورة غير متوفرة</div>
          </div>
        )}

        {product.badge && (
          <div className="absolute end-4 top-4">
            <span className="inline-flex items-center rounded-full bg-linen-50/95 px-3 py-1.5 text-xs font-medium text-ink-900 backdrop-blur-sm">
              {product.badge}
            </span>
          </div>
        )}

        {/* Counter */}
        <div className="absolute bottom-4 start-4 rounded-full bg-ink-900/65 px-3 py-1 font-mono text-xs text-linen-50 backdrop-blur-sm">
          {String(active + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
        </div>

        {/* Open lightbox button */}
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="absolute bottom-4 end-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-linen-50/95 text-ink-700 backdrop-blur-sm transition-colors hover:bg-linen-100"
          aria-label="عرض بالحجم الكامل"
        >
          <Maximize2 className="h-4 w-4" strokeWidth={1.5} />
        </button>

        {/* Prev / Next arrows */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => setActive((a) => (a === 0 ? images.length - 1 : a - 1))}
              className="absolute start-4 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-linen-50/95 text-ink-700 opacity-0 backdrop-blur-sm transition-all hover:bg-linen-100 group-hover:opacity-100"
              aria-label="السابق"
            >
              <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              onClick={() => setActive((a) => (a + 1) % images.length)}
              className="absolute end-4 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-linen-50/95 text-ink-700 opacity-0 backdrop-blur-sm transition-all hover:bg-linen-100 group-hover:opacity-100"
              aria-label="التالي"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      <div className="grid grid-cols-4 gap-3">
        {images.slice(0, 4).map((src, idx) => {
          const errored = errorIndices.has(idx);
          return (
            <button
              key={idx}
              type="button"
              onClick={() => setActive(idx)}
              className={cn(
                'relative aspect-square overflow-hidden rounded-2xl border-2 transition-all',
                active === idx
                  ? 'border-sage-500 opacity-100'
                  : 'border-transparent opacity-70 hover:opacity-100'
              )}
              aria-label={`صورة ${idx + 1}`}
            >
              {!errored ? (
                <Image
                  src={src}
                  alt={`${product.name} ${idx + 1}`}
                  fill
                  sizes="(max-width: 1024px) 25vw, 12vw"
                  className="object-cover"
                  onError={() => handleError(idx)}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-linen-100 text-[8px] text-ink-500">
                  {idx + 1}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Lightbox */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={slides}
        index={active}
        styles={{
          container: { backgroundColor: 'rgba(44, 42, 38, 0.96)' },
        }}
        carousel={{ finite: true }}
        controller={{ closeOnBackdropClick: true }}
      />
    </div>
  );
}
