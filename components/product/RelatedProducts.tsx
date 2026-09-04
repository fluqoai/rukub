'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { products, type Product } from '@/lib/products';
import { ProductCard } from '@/components/landing/ProductCard';

export function RelatedProducts({ product }: { product: Product }) {
  const related = products.filter((p) => p.audience === product.audience && p.id !== product.id).slice(0, 4);
  if (!related.length) return null;
  return <section className="mb-20 mt-20"><div className="mb-8 flex items-end justify-between"><div><span className="eyebrow">قد يناسبك أيضاً</span><h2 className="mt-3 text-2xl font-semibold text-ink-900">منتجات من نفس الاستخدام</h2></div><Link href="/discover" className="hidden items-center gap-1 text-sm font-medium text-sage-600 hover:text-sage-700 sm:inline-flex">عرض الكل <ChevronLeft className="h-4 w-4" /></Link></div><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{related.map((item, index) => <ProductCard key={item.id} product={item} index={index} />)}</div></section>;
}
