'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, Package, Search, ShoppingBag, X } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { SearchInput } from '@/components/search/SearchInput';
import { useCartStore, selectTotalItems } from '@/lib/cart-store';
import { cn } from '@/lib/utils';

const links = [
  { label: 'المتجر', href: '/discover' },
  { label: 'ترتيب وأناقة', href: '/shop/women' },
  { label: 'تقنية واستعداد', href: '/shop/men' },
  { label: 'العناية اليومية', href: '/shop/shared' },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const totalItems = useCartStore(selectTotalItems);
  const hydrated = useCartStore((s) => s.hydrated);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <div className="bg-ink-900 px-4 py-2 text-center text-[11px] text-linen-100">شحن مجاني للطلبات بقيمة 199 ر.س فأكثر · الدفع عند الاستلام متاح</div>
      <header className={cn('sticky top-0 z-50 border-b transition', scrolled ? 'border-sage-500/10 bg-linen-50/95 shadow-sm backdrop-blur' : 'border-transparent bg-linen-50')}>
        <Container className="flex h-16 items-center gap-5">
          <Link href="/" className="flex flex-none items-center gap-2" aria-label="ركوب - الرئيسية"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sage-500 text-base font-bold text-linen-50">ر</span><span className="text-lg font-semibold tracking-tight text-ink-900">ركوب</span></Link>
          <nav className="hidden items-center gap-6 lg:flex" aria-label="التنقل الرئيسي">{links.map((link) => <Link key={link.href} href={link.href} className="text-sm text-ink-700 transition hover:text-sage-600">{link.label}</Link>)}</nav>
          <div className="ms-auto hidden w-full max-w-xs lg:block"><SearchInput className="h-10" /></div>
          <div className="ms-auto flex items-center gap-2 lg:ms-0">
            <button onClick={() => setSearchOpen((v) => !v)} className="icon-button lg:hidden" aria-label="فتح البحث"><Search className="h-4 w-4" /></button>
            <Link href="/orders" className="icon-button hidden sm:inline-flex" aria-label="طلباتي"><Package className="h-4 w-4" /></Link>
            <Link href="/cart" className="icon-button relative" aria-label="سلة التسوق"><ShoppingBag className="h-4 w-4" />{hydrated && totalItems > 0 && <span className="absolute -end-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-wood-500 px-1 text-[9px] text-white">{totalItems}</span>}</Link>
            <button onClick={() => setMenuOpen((v) => !v)} className="icon-button lg:hidden" aria-label="فتح القائمة">{menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}</button>
          </div>
        </Container>
        {searchOpen && <div className="border-t border-sage-500/10 bg-linen-50 p-3 lg:hidden"><Container><SearchInput autoFocus className="h-11" /></Container></div>}
        {menuOpen && <nav className="border-t border-sage-500/10 bg-linen-50 p-3 lg:hidden" aria-label="قائمة الجوال"><Container className="grid gap-1">{links.map((link) => <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className="rounded-xl px-4 py-3 text-sm text-ink-700 hover:bg-sage-50">{link.label}</Link>)}<Link href="/orders" onClick={() => setMenuOpen(false)} className="rounded-xl px-4 py-3 text-sm text-ink-700 hover:bg-sage-50">متابعة الطلب</Link></Container></nav>}
      </header>
    </>
  );
}
