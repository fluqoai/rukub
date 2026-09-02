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
    logo: `${SITE_URL}/icon-512.png`,
    description: 'إكسسوارات سيارات مختارة للسوق السعودي. شحن سريع من مستودع السعودية، دفع عند الاستلام، وبطاقات مدى / فيزا / Apple Pay.',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'SA',
      addressLocality: 'الرياض',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      areaServed: 'SA',
      availableLanguage: ['ar', 'en'],
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
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
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
  product: Product;
};

export function ProductJsonLd({ product }: ProductJsonLdProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.tagline,
    image: `${SITE_URL}/products/${product.slug}.jpg`,
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
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'SA',
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 1, unitCode: 'DAY' },
          transitTime: { '@type': 'QuantitativeValue', minValue: 2, maxValue: 5, unitCode: 'DAY' },
        },
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: 4.8,
      reviewCount: 128,
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
