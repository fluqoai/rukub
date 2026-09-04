// Store-facing CJ helpers. Prices here are previews for administrators only;
// the final catalog cost is calculated from a live freight snapshot on import.

import 'server-only';
import type { CJCategory, CJProduct, StoreProduct } from './cj-types';
import { getProductDetails, isCJConfigured, listCategories, listProducts } from './cj-client';

export const USD_TO_SAR = 3.75;

export function roundPsychologicalPrice(value: number): number {
  if (value <= 0) return 0;
  return Math.max(29, Math.ceil((value + 1) / 10) * 10 - 1);
}

export function calculateCatalogPricing(productUSD: number, freightUSD = 0): {
  landedCostSAR: number;
  retailPriceSAR: number;
  margin: number;
} {
  const landedCostSAR = Math.round((productUSD + freightUSD) * USD_TO_SAR * 100) / 100;
  // A 50% pre-ad contribution target. Gateway, returns and ads remain separate.
  const retailPriceSAR = roundPsychologicalPrice(landedCostSAR / 0.5);
  const margin = retailPriceSAR > 0 ? Math.round(((retailPriceSAR - landedCostSAR) / retailPriceSAR) * 100) / 100 : 0;
  return { landedCostSAR, retailPriceSAR, margin };
}

function inferAudience(product: CJProduct): StoreProduct['audience'] {
  const text = `${product.name} ${product.categoryName}`.toLowerCase();
  if (/safety|emergency|tire|tool|charger|phone holder/.test(text)) return 'men';
  if (/handbag|tissue|organizer|cosmetic|comfort/.test(text)) return 'women';
  return 'shared';
}

export function toStoreProduct(cj: CJProduct): StoreProduct {
  const pricing = calculateCatalogPricing(cj.basePrice);
  const audience = inferAudience(cj);
  const deliveryMax = cj.shippingDaysToSA ?? null;
  return {
    ...cj,
    retailPriceSAR: pricing.retailPriceSAR,
    costPriceSAR: pricing.landedCostSAR,
    margin: pricing.margin,
    audience,
    audienceLabel: audience === 'women' ? 'ترتيب وأناقة' : audience === 'men' ? 'تقنية واستعداد' : 'العناية اليومية',
    arabicName: cj.nameAr ?? cj.name,
    arabicDescription: cj.descriptionAr ?? cj.description,
    badge: cj.inSaudiWarehouse ? 'متوفر محلياً' : undefined,
    rating: 0,
    reviewCount: 0,
    salesCount: 0,
    freeShipping: cj.isFreeShipping,
    estimatedDeliveryDays: deliveryMax ?? 0,
    deliveryMinDays: deliveryMax,
    deliveryMaxDays: deliveryMax,
    cjProductId: cj.id,
  };
}

export async function getFeaturedProducts(): Promise<StoreProduct[]> {
  const response = await listProducts({ pageSize: 24 });
  return response.data.map(toStoreProduct);
}

export async function getDiscoverProducts(opts: {
  page?: number;
  query?: string;
  categoryId?: string | number;
  inSaudiOnly?: boolean;
  audience?: 'women' | 'men' | 'shared';
  sort?: 'price-asc' | 'price-desc' | 'popular';
} = {}): Promise<{ products: StoreProduct[]; total: number; page: number; pageSize: number }> {
  const response = await listProducts({
    pageNum: opts.page ?? 1,
    pageSize: 24,
    categoryId: opts.categoryId,
    query: opts.query,
    inSaudiWarehouse: opts.inSaudiOnly,
  });
  let products = response.data.map(toStoreProduct);
  if (opts.audience) products = products.filter((product) => product.audience === opts.audience);
  if (opts.sort === 'price-asc') products.sort((a, b) => a.retailPriceSAR - b.retailPriceSAR);
  if (opts.sort === 'price-desc') products.sort((a, b) => b.retailPriceSAR - a.retailPriceSAR);
  if (opts.sort === 'popular') products.sort((a, b) => (b.listedNum ?? 0) - (a.listedNum ?? 0));
  return { products, total: response.total, page: response.pageNum, pageSize: response.pageSize };
}

export async function getDiscoverProductById(id: string): Promise<StoreProduct | null> {
  const product = await getProductDetails(id);
  return product ? toStoreProduct(product) : null;
}

export async function getAllCategories(): Promise<CJCategory[]> {
  return listCategories();
}

export function getCJStatus(): { configured: boolean; mode: 'live' | 'mock' } {
  return { configured: isCJConfigured(), mode: isCJConfigured() ? 'live' : 'mock' };
}
