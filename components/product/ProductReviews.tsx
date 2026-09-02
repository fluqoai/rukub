'use client';

import { useState } from 'react';
import { Star, ThumbsUp, CheckCircle2, Camera, ChevronDown } from 'lucide-react';
import { type Product } from '@/lib/products';
import {
  getReviewsForProduct,
  getAverageRating,
  type Review,
} from '@/lib/product-meta';
import { cn } from '@/lib/utils';

type ProductReviewsProps = {
  product: Product;
};

const sortOptions: Array<{ key: 'recent' | 'helpful' | 'highest' | 'lowest'; label: string }> = [
  { key: 'recent', label: 'الأحدث' },
  { key: 'helpful', label: 'الأكثر فائدة' },
  { key: 'highest', label: 'الأعلى تقييماً' },
  { key: 'lowest', label: 'الأقل تقييماً' },
];

export function ProductReviews({ product }: ProductReviewsProps) {
  const allReviews = getReviewsForProduct(product);
  const [sort, setSort] = useState<typeof sortOptions[number]['key']>('recent');
  const [showCount, setShowCount] = useState(3);

  const { average, distribution } = getAverageRating(allReviews);

  const sorted = [...allReviews].sort((a, b) => {
    switch (sort) {
      case 'helpful':
        return b.helpful - a.helpful;
      case 'highest':
        return b.rating - a.rating;
      case 'lowest':
        return a.rating - b.rating;
      default:
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
  });

  const visible = sorted.slice(0, showCount);
  const hasMore = allReviews.length > showCount;

  return (
    <section className="mt-16">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <span className="eyebrow">آراء العملاء</span>
          <h2 className="mt-3 text-2xl font-semibold text-ink-900">
            ماذا يقول مشترو هذا المنتج
          </h2>
        </div>
        <div className="hidden sm:block">
          <SortDropdown value={sort} onChange={setSort} />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Summary card */}
        <div className="lg:col-span-1">
          <div className="rounded-3xl border border-sage-500/10 bg-linen-50 p-6">
            <div className="text-center">
              <div className="font-mono text-5xl font-semibold tabular-nums text-ink-900">
                {average.toFixed(1)}
              </div>
              <div className="mt-2 flex items-center justify-center gap-0.5 text-wood-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'h-4 w-4',
                      i < Math.round(average) ? 'fill-current' : 'fill-none opacity-30'
                    )}
                  />
                ))}
              </div>
              <p className="mt-2 text-xs text-ink-500">
                بناءً على {allReviews.length} تقييم
              </p>
            </div>

            <div className="mt-6 space-y-2">
              {([5, 4, 3, 2, 1] as const).map((stars) => {
                const count = distribution[stars as 1 | 2 | 3 | 4 | 5];
                const pct = allReviews.length === 0 ? 0 : (count / allReviews.length) * 100;
                return (
                  <div key={stars} className="flex items-center gap-2 text-xs">
                    <div className="flex w-12 items-center gap-0.5 text-ink-500">
                      <span className="font-mono">{stars}</span>
                      <Star className="h-3 w-3 fill-current" />
                    </div>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-linen-100">
                      <div
                        className="h-full rounded-full bg-wood-500 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-8 text-end font-mono text-ink-500">{count}</span>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              className="mt-6 w-full rounded-full border border-sage-500/30 bg-linen-50 px-4 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:bg-sage-50"
            >
              اكتب تقييماً
            </button>
          </div>
        </div>

        {/* Reviews list */}
        <div className="space-y-4 lg:col-span-2">
          <div className="sm:hidden">
            <SortDropdown value={sort} onChange={setSort} />
          </div>

          {visible.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}

          {hasMore && (
            <button
              type="button"
              onClick={() => setShowCount((c) => c + 3)}
              className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-sage-500/15 bg-linen-50 px-4 py-3 text-sm font-medium text-ink-700 transition-colors hover:bg-sage-50"
            >
              عرض المزيد من التقييمات ({allReviews.length - showCount} متبقي)
              <ChevronDown className="h-4 w-4" strokeWidth={1.5} />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

type SortDropdownProps = {
  value: typeof sortOptions[number]['key'];
  onChange: (v: typeof sortOptions[number]['key']) => void;
};

function SortDropdown({ value, onChange }: SortDropdownProps) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-sage-500/20 bg-linen-50 px-3 py-1.5 text-xs">
      <span className="text-ink-500">ترتيب:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as typeof sortOptions[number]['key'])}
        className="cursor-pointer border-none bg-transparent text-xs font-medium text-ink-700 outline-none"
      >
        {sortOptions.map((o) => (
          <option key={o.key} value={o.key}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const [helpful, setHelpful] = useState(review.helpful);
  const [voted, setVoted] = useState(false);

  const date = new Date(review.date);
  const formatted = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;

  return (
    <article className="rounded-2xl border border-sage-500/10 bg-linen-50 p-5">
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-sage-100 font-mono text-sm font-semibold text-sage-700">
            {review.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-medium text-ink-900">{review.name}</p>
              {review.verified && (
                <span title="مشتري موثّق" className="inline-flex items-center text-sage-600">
                  <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2} />
                </span>
              )}
            </div>
            <p className="text-[10px] text-ink-500">
              {review.city} · {formatted}
              {review.variant && ` · ${review.variant}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-0.5 text-wood-500">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                'h-3.5 w-3.5',
                i < review.rating ? 'fill-current' : 'fill-none opacity-30'
              )}
            />
          ))}
        </div>
      </header>

      <p className="mt-3 text-sm leading-relaxed text-ink-700">{review.text}</p>

      {/* Photos placeholder */}
      {review.photos && review.photos > 0 && (
        <div className="mt-3 flex gap-2">
          {Array.from({ length: review.photos }).map((_, i) => (
            <div
              key={i}
              className="relative h-14 w-14 overflow-hidden rounded-lg bg-gradient-to-br from-sage-100 to-wood-400/20"
            >
              <Camera className="absolute inset-0 m-auto h-4 w-4 text-ink-500" strokeWidth={1.5} />
            </div>
          ))}
        </div>
      )}

      <footer className="mt-4 flex items-center gap-3 border-t border-sage-500/10 pt-3 text-xs text-ink-500">
        <button
          type="button"
          onClick={() => {
            if (!voted) {
              setHelpful((h) => h + 1);
              setVoted(true);
            }
          }}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 transition-colors',
            voted
              ? 'bg-sage-100 text-sage-700'
              : 'hover:bg-sage-50 hover:text-ink-700'
          )}
        >
          <ThumbsUp className="h-3 w-3" strokeWidth={1.5} />
          مفيد ({helpful})
        </button>
        <button
          type="button"
          className="rounded-full px-2.5 py-1 hover:bg-sage-50 hover:text-ink-700"
        >
          رد
        </button>
        <button
          type="button"
          className="rounded-full px-2.5 py-1 hover:bg-sage-50 hover:text-ink-700"
        >
          إبلاغ
        </button>
      </footer>
    </article>
  );
}
