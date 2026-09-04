import type { Metadata } from 'next';
import { Search } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { ProductCard } from '@/components/landing/ProductCard';
import { getPublicProducts } from '@/lib/public-products';

export const metadata: Metadata = { title: 'كل المنتجات', description: 'تصفح إكسسوارات السيارة المختارة للترتيب والعناية والتقنية والاستعداد.' };

export default async function DiscoverPage({ searchParams }: { searchParams: { q?: string } }) {
  const query = searchParams.q?.trim() || '';
  const products = await getPublicProducts({ search: query || undefined });
  return (
    <main className="py-12 md:py-16"><Container>
      <div className="rounded-4xl bg-gradient-to-br from-sage-100 via-linen-50 to-wood-400/15 px-6 py-10 md:px-10"><span className="eyebrow">متجر ركوب</span><h1 className="mt-4 text-3xl font-semibold text-ink-900 md:text-5xl">منتجات تجعل رحلتك أفضل</h1><p className="mt-3 max-w-2xl text-sm leading-7 text-ink-500">اختيارات عملية للترتيب والراحة والعناية والتقنية. الأسعار المعروضة بالريال السعودي، والدفع عند الاستلام متاح حالياً.</p><form action="/discover" className="relative mt-7 max-w-xl"><Search className="absolute end-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" /><input name="q" defaultValue={query} type="search" placeholder="ابحث باسم المنتج أو الاستخدام" className="h-12 w-full rounded-full border border-sage-500/15 bg-white/80 px-5 pe-11 text-sm text-ink-900 outline-none focus:border-sage-500" /></form></div>
      <div className="mt-10 flex items-end justify-between gap-4"><div><h2 className="text-xl font-semibold text-ink-900">{query ? `نتائج البحث عن «${query}»` : 'كل المنتجات'}</h2><p className="mt-1 text-sm text-ink-500">{products.length} منتج</p></div>{query && <a href="/discover" className="text-sm text-sage-600 hover:text-sage-700">مسح البحث</a>}</div>
      {products.length ? <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{products.map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}</div> : <div className="mt-6 rounded-3xl border border-sage-500/10 bg-linen-50 p-12 text-center"><p className="text-ink-700">لم نجد منتجاً مطابقاً. جرّب عبارة أقصر.</p></div>}
    </Container></main>
  );
}
