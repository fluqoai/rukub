'use client';

import { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search as SearchIcon, X } from 'lucide-react';
import { products, audienceLabel, type Audience } from '@/lib/products';
import { ProductCard } from '@/components/landing/ProductCard';
import { Container } from '@/components/ui/Container';
import { SearchInput } from './SearchInput';
import { cn } from '@/lib/utils';

type AudienceFilter = 'all' | Audience;

const audienceFilters: { key: AudienceFilter; label: string }[] = [
  { key: 'all', label: 'الكل' },
  { key: 'women', label: audienceLabel.women },
  { key: 'men', label: audienceLabel.men },
  { key: 'shared', label: audienceLabel.shared },
];

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchFallback />}>
      <SearchContent />
    </Suspense>
  );
}

function SearchFallback() {
  return (
    <main className="py-20">
      <Container>
        <div className="mx-auto h-64 max-w-2xl animate-pulse rounded-3xl bg-linen-100" />
      </Container>
    </main>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const [audience, setAudience] = useState<AudienceFilter>('all');

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const matchesQuery =
        p.name.toLowerCase().includes(q) ||
        p.shortName.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q);
      const matchesAudience = audience === 'all' || p.audience === audience;
      return matchesQuery && matchesAudience;
    });
  }, [query, audience]);

  const hasQuery = query.trim().length > 0;

  return (
    <main className="py-10 md:py-16">
      <Container>
        {/* Search input + filters */}
        <div className="mx-auto max-w-2xl">
          <div className="text-center">
            <span className="eyebrow">البحث</span>
            <h1 className="mt-3 text-3xl font-semibold text-ink-900 md:text-4xl">
              {hasQuery ? (
                <>
                  نتائج البحث عن{' '}
                  <span className="text-sage-600">&ldquo;{query}&rdquo;</span>
                </>
              ) : (
                'ابحث عن منتج'
              )}
            </h1>
          </div>

          <div className="mt-8">
            <SearchInput initialQuery={query} autoFocus className="h-12" />
          </div>
        </div>

        {/* Results */}
        {hasQuery && (
          <div className="mt-10">
            {/* Audience tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-ink-700">
                <span className="font-mono font-semibold text-ink-900">
                  {results.length}
                </span>{' '}
                نتيجة
              </p>
              <div className="flex flex-wrap gap-2">
                {audienceFilters.map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setAudience(f.key)}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                      audience === f.key
                        ? 'border-sage-500 bg-sage-500 text-linen-50'
                        : 'border-sage-500/20 bg-linen-50 text-ink-700 hover:bg-sage-50'
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid or empty */}
            <div className="mt-8">
              {results.length === 0 ? (
                <EmptyState query={query} />
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {results.map((p, i) => (
                    <ProductCard key={p.id} product={p} index={i} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Suggestions when no query */}
        {!hasQuery && (
          <div className="mx-auto mt-12 max-w-2xl text-center">
            <p className="text-sm text-ink-500">جرّب البحث عن:</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {['شاحن', 'معطر', 'منظم', 'كاميرا', 'وسادة', 'إضاءة'].map((term) => (
                <a
                  key={term}
                  href={`/search?q=${encodeURIComponent(term)}`}
                  className="rounded-full border border-sage-500/20 bg-linen-50 px-3 py-1.5 text-xs text-ink-700 transition-colors hover:bg-sage-50"
                >
                  {term}
                </a>
              ))}
            </div>
          </div>
        )}
      </Container>
    </main>
  );
}

function EmptyState({ query }: { query: string }) {
  return (
    <div className="rounded-3xl border border-sage-500/10 bg-linen-50/60 px-6 py-16 text-center">
      <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-sage-50 text-sage-500">
        <SearchIcon className="h-7 w-7" strokeWidth={1.25} />
      </div>
      <h2 className="mt-5 text-lg font-semibold text-ink-900">
        لا توجد نتائج لـ &ldquo;{query}&rdquo;
      </h2>
      <p className="mt-2 text-sm text-ink-500">
        جرّب كلمة أخرى، أو تصفّح الأقسام من الصفحة الرئيسية.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <a
          href="/shop/women"
          className="rounded-full border border-sage-500/20 bg-linen-50 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-sage-50"
        >
          {audienceLabel.women}
        </a>
        <a
          href="/shop/men"
          className="rounded-full border border-sage-500/20 bg-linen-50 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-sage-50"
        >
          {audienceLabel.men}
        </a>
        <a
          href="/shop/shared"
          className="rounded-full border border-sage-500/20 bg-linen-50 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-sage-50"
        >
          {audienceLabel.shared}
        </a>
      </div>
    </div>
  );
}
