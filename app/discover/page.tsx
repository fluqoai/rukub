'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, SlidersHorizontal, X, Sparkles, Loader2, Warehouse } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { CJProductCard } from '@/components/cj/CJProductCard';
import type { StoreProduct } from '@/lib/cj-types';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';

type SortOption = 'popular' | 'price-asc' | 'price-desc';

type Category = { categoryId: number; categoryName: string };

type ProductsResponse = {
  products: StoreProduct[];
  total: number;
  page: number;
  pageSize: number;
  status: { configured: boolean; mode: 'live' | 'mock' };
};

const PAGE_SIZE = 24;

export default function DiscoverPage() {
  return (
    <Suspense fallback={
      <main className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-sage-500" />
      </main>
    }>
      <DiscoverContent />
    </Suspense>
  );
}

function DiscoverContent() {
  const { locale } = useI18n();
  const Arrow = locale === 'ar' ? ArrowLeft : ArrowRight;
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') ?? '';

  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [cjMode, setCjMode] = useState<'live' | 'mock' | null>(null);

  const [query, setQuery] = useState(initialQuery);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [saOnly, setSaOnly] = useState(true);
  const [audience, setAudience] = useState<'all' | 'women' | 'men' | 'shared'>('all');
  const [sort, setSort] = useState<SortOption>('popular');
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Fetch products
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      ...(query && { q: query }),
      ...(categoryId && { category: String(categoryId) }),
      ...(saOnly && { sa: '1' }),
      ...(audience !== 'all' && { audience }),
      sort,
    });
    fetch(`/api/cj/products?${params}`)
      .then((r) => r.json())
      .then((res: ProductsResponse) => {
        if (cancelled) return;
        setProducts(res.products);
        setTotal(res.total);
        setCjMode(res.status.mode);
      })
      .catch((e) => {
        console.error('Failed to fetch CJ products:', e);
        if (!cancelled) {
          setProducts([]);
          setTotal(0);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, query, categoryId, saOnly, audience, sort]);

  // Fetch categories once
  useEffect(() => {
    fetch('/api/cj/categories')
      .then((r) => r.json())
      .then((res) => setCategories(res.categories ?? []))
      .catch(() => {});
  }, []);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasActiveFilters = categoryId || saOnly || audience !== 'all';

  const clearAll = () => {
    setCategoryId(null);
    setSaOnly(true);
    setAudience('all');
    setQuery('');
  };

  return (
    <main className="py-10 md:py-14">
      <Container>
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="eyebrow flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} />
              مكتشف المنتجات
            </span>
            <h1 className="mt-3 text-3xl font-semibold text-ink-900 md:text-4xl">
              تصفح آلاف المنتجات
            </h1>
            <p className="mt-2 max-w-xl text-sm text-ink-500">
              منتجات مختارة من CJdropshipping بهامش ربح {Math.round(50 * 100)}%+ — توصيل مباشر من المستودع.
            </p>
          </div>

          {/* Status badge */}
          {cjMode && (
            <div
              className={cn(
                'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs',
                cjMode === 'live'
                  ? 'border-sage-500/20 bg-sage-50 text-sage-700'
                  : 'border-wood-500/20 bg-wood-400/10 text-wood-700'
              )}
            >
              <span
                className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  cjMode === 'live' ? 'bg-sage-500' : 'bg-wood-500'
                )}
              />
              {cjMode === 'live' ? 'متصل بـ CJdropshipping' : 'وضع تجريبي — Mock Data'}
            </div>
          )}
        </div>

        {/* Search bar */}
        <div className="mb-6">
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="ابحث في CJ..."
            className="w-full rounded-2xl border border-sage-500/20 bg-linen-50 px-5 py-3 text-sm text-ink-900 placeholder:text-ink-500/70 focus:border-sage-500 focus:outline-none"
            dir="auto"
          />
        </div>

        {/* Filter chips */}
        <div className="mb-8 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSaOnly((v) => !v)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
              saOnly
                ? 'border-sage-500 bg-sage-500 text-linen-50'
                : 'border-sage-500/20 bg-linen-50 text-ink-700 hover:bg-sage-50'
            )}
          >
            <Warehouse className="h-3.5 w-3.5" strokeWidth={1.5} />
            توصيل سريع (السعودية)
          </button>

          <select
            value={audience}
            onChange={(e) => {
              setAudience(e.target.value as any);
              setPage(1);
            }}
            className="rounded-full border border-sage-500/20 bg-linen-50 px-3 py-1.5 text-xs font-medium text-ink-700"
          >
            <option value="all">كل الفئات</option>
            <option value="women">للنساء</option>
            <option value="men">للرجال</option>
            <option value="shared">مشترك</option>
          </select>

          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value as SortOption);
              setPage(1);
            }}
            className="rounded-full border border-sage-500/20 bg-linen-50 px-3 py-1.5 text-xs font-medium text-ink-700"
          >
            <option value="popular">الأكثر مبيعاً</option>
            <option value="price-asc">السعر: الأقل</option>
            <option value="price-desc">السعر: الأعلى</option>
          </select>

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
            الفئات
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAll}
              className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-ink-500 transition-colors hover:bg-sage-50"
            >
              <X className="h-3 w-3" />
              مسح
            </button>
          )}
        </div>

        {/* Category chips (collapsible) */}
        {filtersOpen && (
          <div className="mb-8 flex flex-wrap gap-2 rounded-2xl border border-sage-500/10 bg-linen-50/60 p-3">
            <button
              type="button"
              onClick={() => {
                setCategoryId(null);
                setPage(1);
              }}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                !categoryId
                  ? 'bg-sage-500 text-linen-50'
                  : 'bg-linen-100 text-ink-700 hover:bg-sage-50'
              )}
            >
              الكل
            </button>
            {categories.map((c) => (
              <button
                key={c.categoryId}
                type="button"
                onClick={() => {
                  setCategoryId(c.categoryId);
                  setPage(1);
                }}
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                  categoryId === c.categoryId
                    ? 'bg-sage-500 text-linen-50'
                    : 'bg-linen-100 text-ink-700 hover:bg-sage-50'
                )}
              >
                {c.categoryName}
              </button>
            ))}
          </div>
        )}

        {/* Results count */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-ink-700">
            <span className="font-mono font-semibold text-ink-900">{total}</span> منتج
          </p>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-sage-500" />
          </div>
        ) : products.length === 0 ? (
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
            {products.map((p, i) => (
              <CJProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-sage-500/20 bg-linen-50 text-ink-700 transition-colors hover:bg-sage-50 disabled:opacity-40"
            >
              <Arrow className="h-4 w-4" />
            </button>
            <span className="text-sm text-ink-700">
              صفحة <span className="font-mono font-semibold">{page}</span> من {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-sage-500/20 bg-linen-50 text-ink-700 transition-colors hover:bg-sage-50 disabled:opacity-40"
            >
              <Arrow className="h-4 w-4 rotate-180 rtl:rotate-0" />
            </button>
          </div>
        )}
      </Container>
    </main>
  );
}
