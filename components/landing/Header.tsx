'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Menu, X, Search as SearchIcon, Package } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { SearchInput } from '@/components/search/SearchInput';
import { useI18n } from '@/lib/i18n';
import { useCartStore, selectTotalItems } from '@/lib/cart-store';
import { cn } from '@/lib/utils';

const navKeys = [
  { key: 'nav.home', href: '/' },
  { key: 'nav.women', href: '/shop/women' },
  { key: 'nav.men', href: '/shop/men' },
  { key: 'nav.shared', href: '/shop/shared' },
  { key: 'discover', href: '/discover' },
];

export function Header() {
  const { t } = useI18n();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const totalItems = useCartStore(selectTotalItems);
  const hydrated = useCartStore((s) => s.hydrated);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b border-transparent transition-all duration-300',
        scrolled
          ? 'border-sage-500/10 bg-linen-50/85 backdrop-blur-md'
          : 'bg-transparent'
      )}
    >
      <Container className="flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex flex-shrink-0 items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sage-500 text-linen-50">
            <span className="font-mono text-sm font-bold">ر</span>
          </div>
          <span className="text-base font-semibold text-ink-900">ركوب</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 lg:flex">
          {navKeys.slice(0, 4).map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="text-sm text-ink-700 transition-colors hover:text-sage-600"
            >
              {t(item.key)}
            </Link>
          ))}
          <Link
            href="/discover"
            className="text-sm text-sage-600 transition-colors hover:text-sage-700"
          >
            اكتشف الكل
          </Link>
        </nav>

        {/* Desktop search */}
        <div className="hidden flex-1 max-w-xs lg:block">
          <SearchInput className="h-9" />
        </div>

        {/* Right side */}
        <div className="flex flex-shrink-0 items-center gap-2">
          <LanguageToggle className="hidden sm:inline-flex" />

          {/* Mobile search trigger */}
          <button
            type="button"
            onClick={() => setMobileSearchOpen(true)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-sage-500/20 bg-linen-50 text-ink-700 transition-colors hover:bg-sage-50 lg:hidden"
            aria-label="بحث"
          >
            <SearchIcon className="h-4 w-4" strokeWidth={1.5} />
          </button>

          <Link
            href="/orders"
            className="hidden h-9 w-9 items-center justify-center rounded-full border border-sage-500/20 bg-linen-50 text-ink-700 transition-colors hover:bg-sage-50 sm:inline-flex"
            aria-label="طلباتي"
          >
            <Package className="h-4 w-4" strokeWidth={1.5} />
          </Link>

          <Link
            href="/cart"
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-sage-500/20 bg-linen-50 text-ink-700 transition-colors hover:bg-sage-50"
            aria-label={t('nav.cart')}
          >
            <ShoppingBag className="h-4 w-4" strokeWidth={1.5} />
            {hydrated && totalItems > 0 && (
              <span className="absolute -top-0.5 -end-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-wood-500 px-1 text-[10px] font-medium tabular-nums text-linen-50">
                {totalItems}
              </span>
            )}
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-sage-500/20 bg-linen-50 text-ink-700 lg:hidden"
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </Container>

      {/* Mobile search dropdown */}
      {mobileSearchOpen && (
        <div className="border-t border-sage-500/10 bg-linen-50/95 backdrop-blur lg:hidden">
          <Container className="py-3">
            <SearchInput autoFocus className="h-10" />
          </Container>
        </div>
      )}

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-sage-500/10 bg-linen-50/95 backdrop-blur lg:hidden">
          <Container className="flex flex-col gap-1 py-4">
            {navKeys.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-2 text-sm text-ink-700 hover:bg-sage-50"
              >
                {t(item.key)}
              </Link>
            ))}
            <div className="mt-2 px-3">
              <LanguageToggle />
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}
