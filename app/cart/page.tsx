'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight, ShoppingBag } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { CartItem } from '@/components/cart/CartItem';
import { CartSummary } from '@/components/cart/CartSummary';
import { useCartStore, selectTotalItems, selectGrandTotal } from '@/lib/cart-store';
import { useI18n } from '@/lib/i18n';
import { formatSAR } from '@/lib/utils';

export default function CartPage() {
  const { locale } = useI18n();
  const Arrow = locale === 'ar' ? ArrowLeft : ArrowRight;
  const items = useCartStore((s) => s.items);
  const totalItems = useCartStore(selectTotalItems);
  const grandTotal = useCartStore(selectGrandTotal);
  const hydrated = useCartStore((s) => s.hydrated);

  // Avoid hydration mismatch
  if (!hydrated) {
    return (
      <main className="py-20">
        <Container>
          <div className="h-64 animate-pulse rounded-3xl bg-linen-100" />
        </Container>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="py-20">
        <Container>
          <div className="mx-auto max-w-md rounded-3xl border border-sage-500/10 bg-linen-50 px-8 py-16 text-center">
            <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-sage-50 text-sage-500">
              <ShoppingBag className="h-8 w-8" strokeWidth={1.25} />
            </div>
            <h1 className="mt-5 text-2xl font-semibold text-ink-900">سلتك فارغة</h1>
            <p className="mt-2 text-sm text-ink-500">
              ابدأ التسوّق وأضف منتجاتك المفضلة لتظهر هنا.
            </p>
            <Link
              href="/#products"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-sage-500 px-5 py-3 text-sm font-medium text-linen-50 transition-colors hover:bg-sage-600"
            >
              تسوّق الآن
              <Arrow className="h-4 w-4" strokeWidth={2} />
            </Link>
          </div>
        </Container>
      </main>
    );
  }

  return (
    <main className="py-12 md:py-16">
      <Container>
        {/* Header */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <span className="eyebrow">سلة التسوق</span>
            <h1 className="mt-3 text-3xl font-semibold text-ink-900">
              {totalItems} {totalItems === 1 ? 'منتج' : 'منتجات'}
              <span className="ms-2 font-mono text-base font-normal text-ink-500">
                · {formatSAR(grandTotal)}
              </span>
            </h1>
          </div>
          <Link
            href="/#products"
            className="hidden items-center gap-1 text-sm text-ink-500 transition-colors hover:text-sage-600 sm:inline-flex"
          >
            متابعة التسوق
            <Arrow className="h-4 w-4" />
          </Link>
        </div>

        {/* Grid: items + summary */}
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-3 lg:col-span-2">
            {items.map((item) => (
              <CartItem key={item.productId} item={item} />
            ))}

            <Link
              href="/#products"
              className="mt-4 inline-flex items-center gap-1.5 text-sm text-ink-500 transition-colors hover:text-sage-600"
            >
              إضافة منتج آخر
              <Arrow className="h-4 w-4" />
            </Link>
          </div>

          <div className="lg:col-span-1">
            <CartSummary />
          </div>
        </div>
      </Container>
    </main>
  );
}
