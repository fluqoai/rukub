// JSON-LD structured data for SEO.
// Schema.org types: Product, Organization, WebSite, BreadcrumbList

import { type Product } from '@/lib/products';
import { formatSAR } from '@/lib/utils';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://rukub.shop';

type OrganizationProps = {};

export function OrganizationJsonLd({}: OrganizationProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ركوب',
    alternateName: 'Rukub',
    url: SITE_URL,
    logo: `${SITE_URL}/icon.svg`,
    description: 'إكسسوارات سيارة عملية مختارة للسوق السعودي، مع الدفع عند الاستلام وتجربة شراء عربية واضحة.',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'SA',
      addressLocality: 'الرياض',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      areaServed: 'SA',
      availableLanguage: ['ar'],
    },
    sameAs: [
      // Add social media URLs in production
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

type WebSiteProps = {};

export function WebSiteJsonLd({}: WebSiteProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'ركوب',
    alternateName: 'Rukub',
    url: SITE_URL,
    description: 'إكسسوارات سيارات مختارة للسوق السعودي',
    inLanguage: 'ar',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/discover?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

type ProductJsonLdProps = {
  product: Product & { image?: string };
};

export function ProductJsonLd({ product }: ProductJsonLdProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.tagline,
    image: product.image ?? `${SITE_URL}/brand/rukub-hero.png`,
    sku: product.id.toUpperCase(),
    brand: { '@type': 'Brand', name: 'Rukub' },
    category: product.audience === 'women' ? 'إكسسوارات سيارات للنساء' : product.audience === 'men' ? 'إكسسوارات سيارات للرجال' : 'إكسسوارات سيارات',
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/products/${product.slug}`,
      priceCurrency: 'SAR',
      price: product.price,
      priceValidUntil: '2027-12-31',
      availability: 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: 'ركوب' },
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

type BreadcrumbJsonLdProps = {
  items: Array<{ name: string; url: string }>;
};

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: item.url,
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
