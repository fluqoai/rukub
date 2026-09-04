import { getPublicProduct } from '@/lib/public-products';
import { products as staticProducts } from '@/lib/products';
import { ProductDetail } from '@/components/product/ProductDetail';
import { ProductJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://rukub.shop';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await getPublicProduct(params.slug);
  if (!product) return { title: 'منتج غير موجود' };
  const url = `${SITE_URL}/products/${product.slug}`;
  const imageUrl = product.imageUrl ?? '/brand/rukub-hero.png';
  return {
    title: product.name,
    description: product.tagline,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      type: 'website',
      url,
      title: `${product.name} · ركوب`,
      description: product.tagline,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: product.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} · ركوب`,
      description: product.tagline,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getPublicProduct(params.slug);
  if (!product) notFound();

  return (
    <>
      <ProductJsonLd product={{ ...product, image: product.imageUrl ?? `${SITE_URL}/brand/rukub-hero.png` } as any} />
      <BreadcrumbJsonLd
        items={[
          { name: 'الرئيسية', url: SITE_URL },
          { name: 'المتجر', url: `${SITE_URL}/discover` },
          { name: product.name, url: `${SITE_URL}/products/${product.slug}` },
        ]}
      />
      <ProductDetail product={product} />
    </>
  );
}
