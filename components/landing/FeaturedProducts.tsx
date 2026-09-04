'use client';

import { useState, useMemo } from 'react';
import { Container } from '@/components/ui/Container';
import { FadeIn } from '@/components/motion/FadeIn';
import { ProductCard } from './ProductCard';
import { products, type Audience } from '@/lib/products';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

type Filter = 'all' | Audience;

const filters: { key: Filter; label: string }[] = [
  { key: 'all', label: 'مختاراتنا' },
  { key: 'women', label: 'الراحة والتنظيم' },
  { key: 'men', label: 'التقنية والأمان' },
  { key: 'shared', label: 'أساسيات يومية' },
];

export function FeaturedProducts() {
  useI18n();
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = useMemo(
    () => (filter === 'all' ? products.filter((p) => p.isHero).slice(0, 8) : products.filter((p) => p.audience === filter).slice(0, 8)),
    [filter]
  );

  return (
    <section id="products" className="bg-linen-50/50 py-20 md:py-28">
      <Container>
        <FadeIn className="text-center">
          <span className="eyebrow">الأكثر تميزاً</span>
          <h2 className="mt-4 text-display-lg font-semibold text-ink-900 text-balance">
            اختيارات تبدأ بها
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-ink-500">
            منتجات عملية بأسعار واضحة، اخترناها لتضيف فائدة حقيقية إلى سيارتك.
          </p>
        </FadeIn>

        <FadeIn delay={0.1} className="mt-10 flex flex-wrap items-center justify-center gap-2">
          {filters.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={cn(
                'rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                filter === f.key
                  ? 'border-sage-500 bg-sage-500 text-linen-50'
                  : 'border-sage-500/20 bg-linen-50 text-ink-700 hover:bg-sage-50'
              )}
            >
              {f.label}
            </button>
          ))}
        </FadeIn>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
        <div className="mt-10 text-center"><Link href="/discover" className="inline-flex items-center gap-2 rounded-full border border-sage-500/25 px-6 py-3 text-sm font-medium text-ink-700 hover:bg-sage-50">عرض كل المنتجات <ArrowLeft className="h-4 w-4" /></Link></div>
      </Container>
    </section>
  );
}
