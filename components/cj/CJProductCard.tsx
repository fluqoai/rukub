'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Star, Truck, Warehouse } from 'lucide-react';
import { motion } from 'framer-motion';
import type { StoreProduct } from '@/lib/cj-types';
import { useCartStore } from '@/lib/cart-store';
import { Toast } from '@/components/ui/Toast';
import { formatSAR, cn } from '@/lib/utils';

type CJProductCardProps = {
  product: StoreProduct;
  index?: number;
};

export function CJProductCard({ product, index = 0 }: CJProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [toast, setToast] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  const primaryImage = product.images[0];

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.id,
      slug: product.id,
      name: product.arabicName,
      shortName: product.arabicName,
      price: product.retailPriceSAR,
      audience: product.audience,
      iconName: 'Package',
    });
    setToast(`تمت إضافة "${product.arabicName}" للسلة`);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-sage-500/10 bg-linen-50 transition-shadow hover:shadow-card"
    >
      <Toast message={toast} onDone={() => setToast(null)} />

      <Link href={`/discover/${product.id}`} className="flex flex-1 flex-col">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-sage-50">
          {!imageError && primaryImage ? (
            <Image
              src={primaryImage}
              alt={product.arabicName}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sage-100 to-wood-400/15">
              <span className="text-xs text-ink-500">صورة</span>
            </div>
          )}

          {/* Badges */}
          {product.badge && (
            <div className="absolute end-3 top-3">
              <span className="inline-flex items-center rounded-full bg-linen-50/95 px-2.5 py-1 text-[10px] font-medium text-ink-900 backdrop-blur-sm">
                {product.badge}
              </span>
            </div>
          )}

          {/* SA warehouse badge */}
          {product.inSaudiWarehouse && (
            <div className="absolute start-3 top-3">
              <span className="inline-flex items-center gap-1 rounded-full bg-sage-500/95 px-2.5 py-1 text-[10px] font-medium text-linen-50 backdrop-blur-sm">
                <Warehouse className="h-2.5 w-2.5" />
                توصيل سريع
              </span>
            </div>
          )}

          {/* Rating overlay bottom */}
          <div className="absolute inset-x-0 bottom-0 flex items-center gap-1.5 bg-gradient-to-t from-ink-900/65 to-transparent px-3 py-2 text-xs text-linen-50 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
            <Star className="h-3 w-3 fill-current text-wood-400" />
            <span className="font-mono">{product.rating.toFixed(1)}</span>
            <span className="text-linen-200/70">· {product.reviewCount} تقييم</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-4">
          <h3 className="text-sm font-medium text-ink-900 line-clamp-2 min-h-[2.5rem]">
            {product.arabicName}
          </h3>

          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-ink-500">
            <span>{product.categoryName}</span>
            <span>·</span>
            <span>{product.estimatedDeliveryDays} أيام</span>
          </div>

          <div className="mt-3 flex items-end justify-between">
            <div className="flex flex-col">
              <span className="font-mono text-lg font-semibold text-ink-900">
                {formatSAR(product.retailPriceSAR)}
              </span>
              {product.margin >= 0.5 && (
                <span className="text-[10px] text-sage-600">
                  هامش {Math.round(product.margin * 100)}%
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-full bg-sage-500 px-3 py-2 text-xs font-medium text-linen-50 transition-colors hover:bg-sage-600"
          >
            <ShoppingBag className="h-3.5 w-3.5" strokeWidth={2} />
            أضف للسلة
          </button>
        </div>
      </Link>
    </motion.article>
  );
}
