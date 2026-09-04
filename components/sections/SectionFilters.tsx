'use client';

import { ArrowUpDown, X, SlidersHorizontal } from 'lucide-react';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type Product, type Audience } from '@/lib/products';
import type { PublicProduct } from '@/lib/public-products';
import { ProductCard } from '@/components/landing/ProductCard';
import { cn } from '@/lib/utils';

type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'popular';

const sortOptions: { key: SortOption; label: string }[] = [
  { key: 'newest', label: 'الأحدث' },
  { key: 'popular', label: 'الأكثر طلباً' },
  { key: 'price-asc', label: 'السعر: الأقل' },
  { key: 'price-desc', label: 'السعر: الأعلى' },
];

type Badge = NonNullable<Product['badge']>;

const availableBadges: Badge[] = ['مختار لركوب', 'جديد', 'متوفر محلياً'];

type SectionFiltersProps = {
  audience: Audience;
  products: PublicProduct[];
};

const priceRanges: { key: 'all' | 'budget' | 'mid' | 'premium'; label: string; min: number; max: number }[] = [
  { key: 'all', label: 'الكل', min: 0, max: Infinity },
  { key: 'budget', label: 'أقل من 50', min: 0, max: 50 },
  { key: 'mid', label: '50 - 150', min: 50, max: 150 },
  { key: 'premium', label: 'أكثر من 150', min: 150, max: Infinity },
];

export function SectionFilters({ audience, products }: SectionFiltersProps) {
  const [sort, setSort] = useState<SortOption>('newest');
  const [priceRange, setPriceRange] = useState<typeof priceRanges[number]['key']>('all');
  const [activeBadges, setActiveBadges] = useState<Badge[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    let result = products.filter((p) => p.audience === audience);

    // Price filter
    const range = priceRanges.find((r) => r.key === priceRange)!;
    result = result.filter((p) => p.price >= range.min && p.price <= range.max);

    // Badge filter
    if (activeBadges.length > 0) {
      result = result.filter((p) => p.badge && activeBadges.includes(p.badge));
    }

    // Sort
    result = [...result].sort((a, b) => {
      switch (sort) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'popular':
          if (a.isHero && !b.isHero) return -1;
          if (!a.isHero && b.isHero) return 1;
          return a.tier - b.tier;
        default:
          return 0;
      }
    });

    return result;
  }, [audience, products, sort, priceRange, activeBadges]);

  const toggleBadge = (badge: Badge) => {
    setActiveBadges((prev) =>
      prev.includes(badge) ? prev.filter((b) => b !== badge) : [...prev, badge]
    );
  };

  const clearAll = () => {
    setSort('newest');
    setPriceRange('all');
    setActiveBadges([]);
  };

  const hasActiveFilters = priceRange !== 'all' || activeBadges.length > 0;

  return (
    <div>
      {/* Filter bar */}
      <div className="mb-8 rounded-2xl border border-sage-500/10 bg-linen-50/60 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left: results count + sort */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-ink-700">
              <span className="font-mono font-semibold text-ink-900">{filtered.length}</span> منتج
            </span>

            <span className="hidden h-4 w-px bg-sage-500/20 sm:block" />

            <div className="flex items-center gap-1.5">
              <ArrowUpDown className="h-3.5 w-3.5 text-ink-500" strokeWidth={1.5} />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="cursor-pointer rounded-full border-none bg-transparent text-sm font-medium text-ink-700 outline-none hover:text-sage-600"
              >
                {sortOptions.map((o) => (
                  <option key={o.key} value={o.key}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Right: filter toggle + clear */}
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAll}
                className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-ink-500 transition-colors hover:bg-sage-50 hover:text-ink-700"
              >
                <X className="h-3 w-3" />
                مسح الفلاتر
              </button>
            )}
            <button
              type="button"
              onClick={() => setFiltersOpen((v) => !v)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                filtersOpen
                  ? 'border-sage-500 bg-sage-500 text-linen-50'
                  : 'border-sage-500/20 bg-linen-50 text-ink-700 hover:bg-sage-50'
              )}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={1.5} />
              فلاتر
              {hasActiveFilters && (
                <span className="rounded-full bg-wood-500 px-1.5 text-[9px] font-mono text-linen-50">
                  {activeBadges.length + (priceRange !== 'all' ? 1 : 0)}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Expandable filter panel */}
        <AnimatePresence>
          {filtersOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="mt-4 space-y-4 border-t border-sage-500/10 pt-4">
                {/* Price range */}
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-ink-500">
                    نطاق السعر
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {priceRanges.map((r) => (
                      <button
                        key={r.key}
                        type="button"
                        onClick={() => setPriceRange(r.key)}
                        className={cn(
                          'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                          priceRange === r.key
                            ? 'border-sage-500 bg-sage-500 text-linen-50'
                            : 'border-sage-500/20 bg-linen-50 text-ink-700 hover:bg-sage-50'
                        )}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Badges */}
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-ink-500">
                    العلامات
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {availableBadges.map((badge) => {
                      const active = activeBadges.includes(badge);
                      return (
                        <button
                          key={badge}
                          type="button"
                          onClick={() => toggleBadge(badge)}
                          className={cn(
                            'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                            active
                              ? 'border-sage-500 bg-sage-500 text-linen-50'
                              : 'border-sage-500/20 bg-linen-50 text-ink-700 hover:bg-sage-50'
                          )}
                        >
                          {badge}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-sage-500/10 bg-linen-50/60 px-6 py-16 text-center">
          <p className="text-base text-ink-700">لا توجد منتجات بهذه الفلاتر.</p>
          <button
            type="button"
            onClick={clearAll}
            className="mt-3 text-sm text-sage-600 hover:text-sage-700"
          >
            مسح الفلاتر
          </button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
