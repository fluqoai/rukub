'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Heart,
  Truck,
  Banknote,
  RotateCcw,
  Warehouse,
  Check,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Star,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import { type StoreProduct } from '@/lib/cj-types';
import { useCartStore } from '@/lib/cart-store';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { Toast } from '@/components/ui/Toast';
import { Container } from '@/components/ui/Container';
import { useI18n } from '@/lib/i18n';
import { formatSAR, cn } from '@/lib/utils';

type CJProductDetailProps = {
  product: StoreProduct;
};

export function CJProductDetail({ product }: CJProductDetailProps) {
  const { locale } = useI18n();
  const Arrow = locale === 'ar' ? ArrowLeft : ArrowRight;
  const router = useRouter();
  const [variant, setVariant] = useState(product.variants[0]);
  const [qty, setQty] = useState(1);
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [toast, setToast] = useState<string | null>(null);

  const addItem = useCartStore((s) => s.addItem);
  const slides = product.images.map((src, i) => ({ src, alt: `${product.arabicName} ${i + 1}` }));

  const handleAdd = () => {
    addItem(
      {
        productId: product.id,
        slug: product.id,
        name: product.arabicName,
        shortName: product.arabicName,
        price: product.retailPriceSAR,
        audience: product.audience,
        iconName: 'Package',
      },
      qty
    );
    setToast(`تمت إضافة "${product.arabicName}" للسلة`);
  };

  const handleBuyNow = () => {
    addItem(
      {
        productId: product.id,
        slug: product.id,
        name: product.arabicName,
        shortName: product.arabicName,
        price: product.retailPriceSAR,
        audience: product.audience,
        iconName: 'Package',
      },
      qty
    );
    router.push('/cart');
  };

  return (
    <div>
      <Toast message={toast} onDone={() => setToast(null)} />

      <Container className="mt-8 grid gap-8 md:gap-12 lg:grid-cols-2">
        {/* Gallery */}
        <div className="flex flex-col gap-4">
          <div className="group relative aspect-square w-full overflow-hidden rounded-3xl bg-sage-50">
            {!imageErrors.has(active) ? (
              <Image
                src={product.images[active]}
                alt={`${product.arabicName} ${active + 1}`}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                onError={() =>
                  setImageErrors((prev) => new Set(prev).add(active))
                }
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sage-100 to-wood-400/15 text-ink-500">
                صورة غير متوفرة
              </div>
            )}

            {product.inSaudiWarehouse && (
              <div className="absolute start-4 top-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-sage-500/95 px-3 py-1.5 text-xs font-medium text-linen-50 backdrop-blur-sm">
                  <Warehouse className="h-3 w-3" />
                  في مستودع السعودية
                </span>
              </div>
            )}

            <div className="absolute bottom-4 start-4 rounded-full bg-ink-900/65 px-3 py-1 font-mono text-xs text-linen-50 backdrop-blur-sm">
              {String(active + 1).padStart(2, '0')} / {String(product.images.length).padStart(2, '0')}
            </div>

            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              className="absolute bottom-4 end-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-linen-50/95 text-ink-700 backdrop-blur-sm transition-colors hover:bg-linen-100"
              aria-label="عرض بالحجم الكامل"
            >
              <Maximize2 className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {product.images.slice(0, 4).map((src, idx) => (
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
                >
                  {!imageErrors.has(idx) ? (
                    <Image
                      src={src}
                      alt={`${product.arabicName} ${idx + 1}`}
                      fill
                      sizes="(max-width: 1024px) 25vw, 12vw"
                      className="object-cover"
                      onError={() =>
                        setImageErrors((prev) => new Set(prev).add(idx))
                      }
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-linen-100 text-[8px] text-ink-500">
                      {idx + 1}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-5">
          {/* Audience + brand */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-sage-50 px-2.5 py-1 font-medium text-sage-700">
              {product.audienceLabel}
            </span>
            <span className="rounded-full bg-wood-400/15 px-2.5 py-1 font-medium text-wood-700">
              {product.categoryName}
            </span>
            {product.brand && (
              <span className="text-ink-500">· {product.brand}</span>
            )}
          </div>

          {/* Title + rating */}
          <div>
            <h1 className="text-3xl font-semibold leading-tight text-ink-900 md:text-4xl">
              {product.arabicName}
            </h1>
            <div className="mt-3 flex items-center gap-3 text-sm">
              <div className="flex items-center gap-0.5 text-wood-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'h-3.5 w-3.5',
                      i < Math.round(product.rating)
                        ? 'fill-current'
                        : 'fill-none opacity-30'
                    )}
                  />
                ))}
              </div>
              <span className="font-mono text-ink-900">{product.rating.toFixed(1)}</span>
              <span className="text-ink-500">· {product.reviewCount} تقييم</span>
              <span className="text-ink-300">|</span>
              <span className="text-ink-500">+{product.salesCount.toLocaleString('ar-SA')} مبيعات</span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-end gap-3 border-y border-sage-500/10 py-5">
            <span className="font-mono text-4xl font-semibold tabular-nums text-ink-900">
              {formatSAR(product.retailPriceSAR)}
            </span>
            <div className="flex flex-col">
              <span className="text-xs text-ink-500">
                شامل الضريبة
              </span>
              {product.freeShipping && (
                <span className="text-xs text-sage-600">شحن مجاني</span>
              )}
            </div>
          </div>

          {/* Variant selector */}
          {product.variants.length > 1 && (
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-ink-500">
                المواصفات
              </p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.vid}
                    type="button"
                    onClick={() => setVariant(v)}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                      variant.vid === v.vid
                        ? 'border-sage-500 bg-sage-500 text-linen-50'
                        : 'border-sage-500/20 bg-linen-50 text-ink-700 hover:bg-sage-50'
                    )}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <p className="text-base leading-relaxed text-ink-700">
            {product.arabicDescription}
          </p>

          {/* Trust grid */}
          <div className="grid grid-cols-2 gap-3 rounded-2xl border border-sage-500/10 bg-linen-50/60 p-4">
            {[
              { icon: Warehouse, text: product.inSaudiWarehouse ? 'في مستودع السعودية' : `شحن ${product.estimatedDeliveryDays} أيام` },
              { icon: Banknote, text: 'دفع عند الاستلام' },
              { icon: RotateCcw, text: 'إرجاع 14 يوم' },
              { icon: Truck, text: 'تتبع الشحنة' },
            ].map((t, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sage-500/10 text-sage-600">
                  <t.icon className="h-4 w-4" strokeWidth={1.5} />
                </div>
                <span className="text-xs text-ink-700">{t.text}</span>
              </div>
            ))}
          </div>

          {/* Quantity + Add to cart */}
          <div className="flex items-center gap-3">
            <QuantityStepper value={qty} onChange={setQty} />
            <button
              type="button"
              onClick={handleAdd}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-sage-500 px-5 py-3 text-sm font-medium text-linen-50 transition-colors hover:bg-sage-600"
            >
              <ShoppingBag className="h-4 w-4" strokeWidth={1.5} />
              أضف للسلة — {formatSAR(product.retailPriceSAR * qty)}
            </button>
          </div>

          <button
            type="button"
            onClick={handleBuyNow}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-ink-900 px-5 py-3 text-sm font-medium text-linen-50 transition-colors hover:bg-ink-700"
          >
            اشترِ الآن
            <Arrow className="h-4 w-4" />
          </button>
        </div>
      </Container>

      {/* Lightbox */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={slides}
        index={active}
        styles={{ container: { backgroundColor: 'rgba(44, 42, 38, 0.96)' } }}
      />
    </div>
  );
}
