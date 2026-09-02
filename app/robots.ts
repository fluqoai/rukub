import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://rukub.shop';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Public storefront + legal pages: indexable
        userAgent: '*',
        allow: [
          '/',
          '/shop/*',
          '/products/*',
          '/search',
          '/discover',
          '/privacy',
          '/terms',
          '/refund',
        ],
        disallow: [
          // Auth & user data
          '/admin',
          '/admin/*',
          '/orders',
          '/orders/*',
          '/api',
          '/api/*',
          '/cart',           // empty cart isn't useful in search
          '/checkout',
          '/checkout/*',
          '/_next',
        ],
      },
      // Block known scrapers / SEO spam
      {
        userAgent: ['GPTBot', 'CCBot', 'ClaudeBot', 'PerplexityBot'],
        disallow: '/',
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
