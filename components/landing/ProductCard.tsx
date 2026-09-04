'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Package as PackageIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { type Product } from '@/lib/products';
import type { PublicProduct } from '@/lib/public-products';
import { getIcon } from '@/lib/icon-map';
import { useCartStore } from '@/lib/cart-store';
import { getProductImages } from '@/lib/product-images';
import { Toast } from '@/components/ui/Toast';
import { useI18n } from '@/lib/i18n';
import { formatSAR, cn } from '@/lib/utils';

type ProductCardProps = {
  product: (Product & { requiresVariant?: boolean }) | (Omit<PublicProduct, 'icon'> & { icon?: any });
  index?: number;
};

const audienceGradients: Record<Product['audience'], string> = {
  women: 'from-sage-100 via-linen-100 to-wood-400/10',
  men: 'from-sage-200 via-linen-100 to-ink-900/5',
  shared: 'from-wood-400/15 via-linen-100 to-sage-100',
};
const categoryLabel: Record<Product['audience'], string> = {
  women: 'ترتيب وأناقة',
  men: 'تقنية واستعداد',
  shared: 'العناية اليومية',
};

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const router = useRouter();
  const { t } = useI18n();
  // Resolve icon: prefer explicit component (static products), else use iconName lookup (DB products)
  const Icon = (product as any).icon ?? getIcon((product as any).iconName);
  const addItem = useCartStore((s) => s.addItem);
  const [toast, setToast] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  // Use explicit imageUrl from DB if present, else fall back to static lookup
  const explicit = (product as any).imageUrl as string | null | undefined;
  const dbImages = (product as any).imageUrls as string[] | undefined;
  const images = dbImages?.length ? dbImages : explicit ? [explicit] : getProductImages(product.id);
  const primaryImage = images[0];
  const secondaryImage = images[1];
  const deliveryMin = (product as any).deliveryMinDays as number | null | undefined;
  const deliveryMax = (product as any).deliveryMaxDays as number | null | undefined;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if ((product as PublicProduct).requiresVariant) { router.push(`/products/${product.slug}`); return; }
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      shortName: product.shortName,
      price: product.price,
      audience: product.audience,
      imageUrl: primaryImage,
      iconName: (product as any).iconName ?? (product as any).icon?.displayName ?? 'Package',
    });
    setToast(`تمت إضافة "${product.shortName}" للسلة`);
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

      {/* Image / visual area */}
      <div className={`relative aspect-[4/3] overflow-hidden bg-gradient-to-br ${audienceGradients[product.audience]}`}>
        {!imageError && primaryImage ? (
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className={cn('object-cover transition-all duration-500 group-hover:scale-105', secondaryImage && 'group-hover:opacity-0')}
            onError={() => setImageError(true)}
            priority={index === 0}
            loading={index === 0 ? undefined : 'lazy'}
          />
        ) : (
          <>
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage: `radial-gradient(circle at 30% 30%, rgb(107 122 90 / 0.1) 0%, transparent 50%),
                                  radial-gradient(circle at 70% 80%, rgb(184 149 106 / 0.15) 0%, transparent 60%)`,
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-sage-500/10 text-sage-700 backdrop-blur-sm">
                <Icon className="h-10 w-10" strokeWidth={1.25} />
              </div>
            </div>
          </>
        )}

        {!imageError && secondaryImage && (
          <Image
            src={secondaryImage}
            alt={`${product.name} أثناء الاستخدام`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover opacity-0 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100"
            loading="lazy"
          />
        )}

        {/* Overlay gradient on hover */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink-900/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        {/* Badges */}
        {product.badge && (
          <div className="absolute end-3 top-3">
            <span className="inline-flex items-center rounded-full bg-linen-50/90 px-2.5 py-1 text-[10px] font-medium text-ink-900 backdrop-blur-sm">
              {product.badge}
            </span>
          </div>
        )}

        {/* Audience tag */}
        <div className="absolute start-3 top-3">
          <span className="inline-flex items-center rounded-full bg-ink-900/65 px-2.5 py-1 text-[10px] font-medium text-linen-50 backdrop-blur-sm">
            {categoryLabel[product.audience]}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-sm font-medium text-ink-900 line-clamp-2">
          {product.name}
        </h3>
        <p className="mt-1.5 text-xs leading-relaxed text-ink-500 line-clamp-2">
          {product.tagline}
        </p>

        {deliveryMax ? (
          <p className="mt-3 text-[11px] font-medium text-sage-700">
            التوصيل المتوقع {deliveryMin && deliveryMin !== deliveryMax ? `${deliveryMin}–${deliveryMax}` : deliveryMax} يوم عمل
          </p>
        ) : (
          <p className="mt-3 text-[11px] text-ink-500">تُحدّث مدة التوصيل عند تجهيز الطلب</p>
        )}

        <div className="mt-4 flex items-end justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-lg font-semibold text-ink-900">
              {product.requiresVariant && <span className="me-1 font-sans text-xs font-normal">من</span>}
              {formatSAR(product.price)}
            </span>
            {product.oldPrice && (
              <span className="text-xs text-ink-300 line-through">
                {formatSAR(product.oldPrice)}
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            onClick={handleAdd}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-sage-500 px-3 py-2 text-xs font-medium text-linen-50 transition-colors hover:bg-sage-600"
            aria-label={product.requiresVariant ? 'اختر الخيارات' : t('products.add')}
          >
            <ShoppingBag className="h-3.5 w-3.5" strokeWidth={2} />
            <span>{product.requiresVariant ? 'اختر الخيارات' : t('products.add')}</span>
          </button>
          <a
            href={`/products/${product.slug}`}
            className="rounded-full border border-sage-500/20 bg-linen-50 px-3 py-2 text-xs font-medium text-ink-700 transition-colors hover:bg-sage-50"
          >
            {t('products.details')}
          </a>
        </div>
      </div>
    </motion.article>
  );
}
