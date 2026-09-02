'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { products, type Product } from '@/lib/products';
import { getProductImages } from '@/lib/product-images';
import { useI18n } from '@/lib/i18n';
import { formatSAR } from '@/lib/utils';
import { useState } from 'react';

type RelatedProductsProps = {
  product: Product;
};

export function RelatedProducts({ product }: RelatedProductsProps) {
  const { locale } = useI18n();
  const Chevron = locale === 'ar' ? ChevronLeft : ChevronRight;

  // related = same audience, exclude current, take 4
  const related = products
    .filter((p) => p.audience === product.audience && p.id !== product.id)
    .slice(0, 4);

  return (
    <section className="mt-20">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <span className="eyebrow">منتجات قد تعجبك</span>
          <h2 className="mt-3 text-2xl font-semibold text-ink-900">
            من نفس الفئة
          </h2>
        </div>
        <Link
          href="/#products"
          className="hidden items-center gap-1 text-sm font-medium text-sage-600 hover:text-sage-700 sm:inline-flex"
        >
          عرض الكل
          <Chevron className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {related.map((p) => (
          <RelatedCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}

function RelatedCard({ product: p }: { product: Product }) {
  const [errored, setErrored] = useState(false);
  const image = getProductImages(p.id)[0];

  return (
    <Link
      href={`/products/${p.slug}`}
      className="group flex flex-col overflow-hidden rounded-3xl border border-sage-500/10 bg-linen-50 transition-shadow hover:shadow-card"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-sage-50">
        {!errored ? (
          <Image
            src={image}
            alt={p.name}
            fill
            sizes="(max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setErrored(true)}
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sage-100 to-wood-400/15">
            <div className="font-mono text-xs text-ink-500">صورة</div>
          </div>
        )}
        {p.badge && (
          <div className="absolute end-3 top-3">
            <span className="inline-flex items-center rounded-full bg-linen-50/90 px-2.5 py-1 text-[10px] font-medium text-ink-900 backdrop-blur-sm">
              {p.badge}
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-sm font-medium text-ink-900 line-clamp-2">
          {p.name}
        </h3>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-mono text-sm font-semibold text-ink-900">
            {formatSAR(p.price)}
          </span>
          {p.oldPrice && (
            <span className="text-xs text-ink-300 line-through">
              {formatSAR(p.oldPrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
