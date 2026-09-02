'use client';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft, ChevronRight, Home, Loader2 } from 'lucide-react';
import { audienceLabel } from '@/lib/products';
import { usePublicProduct, type PublicProduct } from '@/lib/hooks/usePublicProducts';
import { useI18n } from '@/lib/i18n';
import { Container } from '@/components/ui/Container';
import { ProductGallery } from './ProductGallery';
import { ProductInfo } from './ProductInfo';
import { ProductTabs } from './ProductTabs';
import { LifestyleScenes } from './LifestyleScenes';
import { ProductReviews } from './ProductReviews';
import { RelatedProducts } from './RelatedProducts';

type ProductDetailProps = {
  slug: string;
};

export function ProductDetail({ slug }: ProductDetailProps) {
  const { locale } = useI18n();
  const Chevron = locale === 'ar' ? ChevronLeft : ChevronRight;
  const { product, loading, error } = usePublicProduct(slug);

  if (loading) {
    return (
      <main className="py-20">
        <Container>
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-sage-500" />
          </div>
        </Container>
      </main>
    );
  }
  if (error || !product) notFound();

  return (
    <main>
      <Container className="pt-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-ink-500">
          <Link href="/" className="inline-flex items-center gap-1 hover:text-sage-600">
            <Home className="h-3 w-3" />
            الرئيسية
          </Link>
          <Chevron className="h-3 w-3" />
          <Link href="/#products" className="hover:text-sage-600">
            المنتجات
          </Link>
          <Chevron className="h-3 w-3" />
          <span className="text-ink-700">{audienceLabel[product.audience]}</span>
          <Chevron className="h-3 w-3" />
          <span className="text-ink-900 line-clamp-1">{product.shortName}</span>
        </nav>

        {/* Hero: Gallery + Info */}
        <div className="mt-8 grid gap-8 md:gap-12 lg:grid-cols-2">
          <ProductGallery product={product as any} />
          <ProductInfo product={product as any} />
        </div>

        {/* Tabs */}
        <ProductTabs product={product as any} />

        {/* Lifestyle scenes */}
        <LifestyleScenes product={product as any} />

        {/* Reviews */}
        <ProductReviews product={product as any} />

        {/* Related */}
        <RelatedProducts product={product as any} />
      </Container>
    </main>
  );
}
