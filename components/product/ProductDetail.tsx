'use client';

import Link from 'next/link';
import { ChevronLeft, Home } from 'lucide-react';
import type { PublicProduct } from '@/lib/public-products';
import { Container } from '@/components/ui/Container';
import { ProductGallery } from './ProductGallery';
import { ProductInfo } from './ProductInfo';
import { ProductTabs } from './ProductTabs';
import { RelatedProducts } from './RelatedProducts';

const categoryLabel = { women: 'الراحة والتنظيم', men: 'التقنية والأمان', shared: 'الأساسيات اليومية' };

export function ProductDetail({ product }: { product: PublicProduct }) {
  return (
    <main><Container className="pt-8">
      <nav className="flex items-center gap-1.5 text-xs text-ink-500" aria-label="مسار الصفحة"><Link href="/" className="inline-flex items-center gap-1 hover:text-sage-600"><Home className="h-3 w-3" />الرئيسية</Link><ChevronLeft className="h-3 w-3" /><Link href="/discover" className="hover:text-sage-600">المتجر</Link><ChevronLeft className="h-3 w-3" /><span className="text-ink-700">{categoryLabel[product.audience]}</span><ChevronLeft className="h-3 w-3" /><span className="line-clamp-1 text-ink-900">{product.shortName}</span></nav>
      <div className="mt-8 grid gap-8 md:gap-12 lg:grid-cols-2"><ProductGallery product={product} /><ProductInfo product={product as any} /></div>
      <ProductTabs product={product as any} />
      <RelatedProducts product={product as any} />
    </Container></main>
  );
}
