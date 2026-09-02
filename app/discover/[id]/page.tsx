import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft, ChevronRight, Home, ArrowLeft, ArrowRight } from 'lucide-react';
import { getDiscoverProductById } from '@/lib/cj-service';
import { Container } from '@/components/ui/Container';
import { CJProductDetail } from '@/components/cj/CJProductDetail';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const product = await getDiscoverProductById(params.id);
  if (!product) return { title: 'منتج غير موجود' };
  return {
    title: `${product.arabicName} · ركوب`,
    description: product.arabicDescription,
  };
}

export default async function DiscoverProductPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await getDiscoverProductById(params.id);
  if (!product) notFound();

  return (
    <main>
      <Container className="pt-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-ink-500">
          <Link href="/" className="inline-flex items-center gap-1 hover:text-sage-600">
            <Home className="h-3 w-3" />
            الرئيسية
          </Link>
          <ChevronLeft className="h-3 w-3" />
          <Link href="/discover" className="hover:text-sage-600">
            اكتشف
          </Link>
          <ChevronLeft className="h-3 w-3" />
          <span className="text-ink-700">{product.categoryName}</span>
          <ChevronLeft className="h-3 w-3" />
          <span className="text-ink-900 line-clamp-1">{product.arabicName}</span>
        </nav>
      </Container>

      <CJProductDetail product={product} />
    </main>
  );
}
