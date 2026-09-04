'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Sparkles, Warehouse, Loader2 } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { FadeIn } from '@/components/motion/FadeIn';
import { CJProductCard } from '@/components/cj/CJProductCard';
import type { StoreProduct } from '@/lib/cj-types';
import { useI18n } from '@/lib/i18n';

type ProductsResponse = {
  products: StoreProduct[];
  status: { configured: boolean; mode: 'live' | 'mock' };
};

export function CJShowcase() {
  const { locale } = useI18n();
  const Arrow = locale === 'ar' ? ArrowLeft : ArrowRight;
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [mode, setMode] = useState<'live' | 'mock' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/cj/products?page=1&sa=1&sort=popular&pageSize=8')
      .then((r) => r.json())
      .then((res: ProductsResponse) => {
        if (cancelled) return;
        setProducts(res.products ?? []);
        setMode(res.status?.mode ?? null);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <section className="bg-ink-900 py-20 md:py-28">
        <Container>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-sage-500" />
          </div>
        </Container>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="bg-ink-900 py-20 text-linen-50 md:py-28">
      <Container>
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-wood-400">
              <Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} />
              من CJdropshipping
            </span>
            <h2 className="mt-3 text-display-lg font-semibold text-linen-50 text-balance">
              آلاف المنتجات بهامش ربح عالٍ
            </h2>
            <p className="mt-3 max-w-xl text-sm text-linen-200/70">
              تُراجع تكلفة كل منتج وصوره ومخزونه ومسار شحنه قبل نشره، وتظهر مدة التوصيل الفعلية بدلاً من الوعود العامة.
            </p>
          </div>
          <Link
            href="/discover"
            className="inline-flex items-center gap-2 rounded-full border border-linen-50/20 bg-linen-50/5 px-5 py-2.5 text-sm font-medium text-linen-50 backdrop-blur-sm transition-colors hover:bg-linen-50/10"
          >
            تصفح المكتشف
            <Arrow className="h-4 w-4" />
          </Link>
        </div>

        {/* Status pill */}
        {mode && (
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-linen-50/5 px-3 py-1.5 text-xs text-linen-200/70">
            <Warehouse className="h-3 w-3 text-sage-400" />
            {mode === 'live' ? (
              <span>متصل مباشر بـ CJ — المنتجات الحقيقية</span>
            ) : (
              <span>وضع تجريبي — Mock Data. أضف CJ_API_KEY في .env.local للتشغيل الحقيقي</span>
            )}
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.slice(0, 8).map((p, i) => (
            <FadeIn key={p.id} delay={i * 0.05}>
              <CJProductCard product={p} index={i} />
            </FadeIn>
          ))}
        </div>
      </Container>
    </section>
  );
}
