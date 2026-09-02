import type { MetadataRoute } from 'next';
import { getPublicProducts } from '@/lib/public-products';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://rukub.shop';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Static pages (storefront + legal)
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/shop/women`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/shop/men`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/shop/shared`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/discover`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/cart`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/search`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    // Legal / policy
    {
      url: `${SITE_URL}/privacy`,
      lastModified: new Date('2026-09-02'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: new Date('2026-09-02'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/refund`,
      lastModified: new Date('2026-09-02'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // Product pages — pull from DB (so admin-added products are indexed)
  let productPages: MetadataRoute.Sitemap = [];
  try {
    const allProducts = await getPublicProducts();
    productPages = allProducts.map((p) => ({
      url: `${SITE_URL}/products/${p.slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));
  } catch {
    // Fallback: empty list if DB fails
  }

  return [...staticPages, ...productPages];
}
