'use client';

import { useState, useMemo } from 'react';
import { Container } from '@/components/ui/Container';
import { FadeIn } from '@/components/motion/FadeIn';
import { ProductCard } from './ProductCard';
import { products, type Audience } from '@/lib/products';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';

type Filter = 'all' | Audience;

const filters: { key: Filter; labelKey: string }[] = [
  { key: 'all', labelKey: 'products.filter.all' },
  { key: 'women', labelKey: 'products.filter.women' },
  { key: 'men', labelKey: 'products.filter.men' },
  { key: 'shared', labelKey: 'products.filter.shared' },
];

export function FeaturedProducts() {
  const { t } = useI18n();
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = useMemo(
    () => (filter === 'all' ? products : products.filter((p) => p.audience === filter)),
    [filter]
  );

  return (
    <section id="products" className="bg-linen-50/50 py-20 md:py-28">
      <Container>
        <FadeIn className="text-center">
          <span className="eyebrow">{t('products.eyebrow')}</span>
          <h2 className="mt-4 text-display-lg font-semibold text-ink-900 text-balance">
            {t('products.title')}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-ink-500">
            {t('products.subtitle')}
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
              {t(f.labelKey)}
            </button>
          ))}
        </FadeIn>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </Container>
    </section>
  );
}
