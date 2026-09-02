// High-level service that wraps CJ client with:
// - Pricing rules (markup + cost estimation)
// - Arabic translations
// - Audience inference
// - Caching
//
// All Saudi prices. 1 USD ≈ 3.75 SAR (configurable).

import 'server-only';
import type { CJProduct, CJCategory, StoreProduct } from './cj-types';
import { listProducts, listCategories, getProductDetails, isCJConfigured } from './cj-client';
import { mockCJProducts, mockCJCategories } from './cj-mock-data';

const USD_TO_SAR = 3.75;

// Pricing rules — markup % by category
const MARKUP: Record<number, number> = {
  101: 3.0,  // Interior Accessories — 3x markup (high margin)
  102: 1.6,  // Electronics — 1.6x
  103: 4.5,  // Fragrance — 4.5x (very high margin)
  104: 2.5,  // Lighting — 2.5x
  105: 1.5,  // Safety — 1.5x (low margin but high volume)
  106: 2.5,  // Sun Protection
  107: 1.7,  // Tools
  108: 2.0,  // Family & Kids
  109: 2.0,  // Storage
  110: 2.0,  // Comfort
  111: 1.8,  // Cleaning
  112: 3.5,  // Decoration — high margin
  113: 3.0,  // Accessories
  114: 2.0,  // (extra)
  115: 3.0,
  116: 2.5,
  117: 1.7,
  118: 2.0,
  119: 2.0,
  120: 1.5,
  121: 1.8,
  122: 2.0,
  123: 3.0,
  124: 2.0,
};
const DEFAULT_MARKUP = 2.5;

// Audience inference from category
const AUDIENCE_BY_CATEGORY: Record<number, StoreProduct['audience']> = {
  103: 'shared',  // Fragrance → shared
  105: 'men',     // Safety → men
  107: 'men',     // Tools → men
  108: 'women',   // Family & Kids → women
  110: 'women',   // Comfort → women
  112: 'women',   // Decoration → women
  113: 'shared',  // Accessories
  114: 'women',   // (lumbar cushion)
  115: 'women',   // (pendants)
  116: 'shared',  // (storage)
  117: 'shared',  // (mirror)
  118: 'women',   // (aroma diffuser)
  119: 'women',   // (bento)
  120: 'men',     // (smart mirror)
  121: 'men',
  122: 'shared',  // (trash)
  123: 'shared',  // (key chain)
  124: 'shared',  // (sun cover)
};

// Arabic translations for known products.
// In production, this would come from a translation API or be hand-curated.
const ARABIC_NAMES: Record<string, string> = {
  'CJ-1001': 'حامل جوال السيارة لفتحة التكييف',
  'CJ-1002': 'شاحن لاسلكي مغناطيسي 15W للسيارة',
  'CJ-1003': 'معطر سيارة فاخر برائحة العود',
  'CJ-1004': 'منظم فراغ المقعد الجانبي',
  'CJ-1005': 'كاميرا داش 4K بميزة الرؤية الليلية',
  'CJ-1006': 'منظم المقعد الخلفي للأطفال',
  'CJ-1007': 'منفاخ إطارات محمول 12V',
  'CJ-1008': 'شاحن سيارة USB-C مزدوج 65W',
  'CJ-1009': 'إضاءة LED داخلية RGB للسيارة',
  'CJ-1010': 'واقي شمس قلاب 5-طبقات',
  'CJ-1011': 'كشاف LED 60W للأعمال',
  'CJ-1012': 'مكنسة سيارة لاسلكية محمولة 15000Pa',
  'CJ-1013': 'غطاء مقود جلد طبيعي',
  'CJ-1014': 'وسادة ظهر ميموري فوم',
  'CJ-1015': 'تعليقة مرآة بخط عربي',
  'CJ-1016': 'منظم شنطة السيارة القابل للطي',
  'CJ-1017': 'مرآة رؤية خلفية مضادة للوهج',
  'CJ-1018': 'ناشر عطور بالموجات فوق الصوتية 200ml',
  'CJ-1019': 'صينية أكواب للسائق (Bento)',
  'CJ-1020': 'مرآة الرؤية الخلفية الذكية 10.88"',
  'CJ-1021': 'مقبض دوار لمقود السيارة',
  'CJ-1022': 'حاوية قمامة سيارة قابلة للطي',
  'CJ-1023': 'سلسلة مفاتيح جلد طبيعي',
  'CJ-1024': 'غطاء زجاج أمامي XL للوقاية من الشمس',
};

// Simulated ratings/sales (deterministic per product)
function getSimulatedStats(productId: string): {
  rating: number;
  reviewCount: number;
  salesCount: number;
  badge?: StoreProduct['badge'];
} {
  // Use id char codes for stable randomness
  const seed = productId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const rating = 3.8 + (seed % 12) / 10; // 3.8-5.0
  const reviewCount = 5 + (seed % 200);
  const salesCount = 50 + ((seed * 7) % 5000);
  const badges: StoreProduct['badge'][] = ['الأكثر مبيعاً', 'جديد', 'شحن سريع', 'لمسة شخصية'];
  const badge = seed % 4 === 0 ? badges[seed % 4] : undefined;
  return { rating: Math.round(rating * 10) / 10, reviewCount, salesCount, badge };
}

// Pricing: USD cost * markup * USD_TO_SAR → SAR, rounded
function applyPricing(usdPrice: number, categoryId: number): {
  costPriceSAR: number;
  retailPriceSAR: number;
  margin: number;
} {
  const markup = MARKUP[categoryId] ?? DEFAULT_MARKUP;
  const costPriceSAR = usdPrice * USD_TO_SAR;
  // Add shipping estimate (15 SAR if not in SA warehouse, 5 if in SA)
  const shippingEstimate = 5;
  const totalCost = costPriceSAR + shippingEstimate;
  const retailPriceSAR = Math.ceil(totalCost * markup);
  const margin = (retailPriceSAR - totalCost) / retailPriceSAR;
  return {
    costPriceSAR: Math.round(totalCost * 100) / 100,
    retailPriceSAR,
    margin: Math.round(margin * 100) / 100,
  };
}

// Transform CJ product to StoreProduct (with Arabic + pricing)
export function toStoreProduct(cj: CJProduct): StoreProduct {
  const pricing = applyPricing(cj.basePrice, cj.categoryId);
  const stats = getSimulatedStats(cj.id);
  const audience = AUDIENCE_BY_CATEGORY[cj.categoryId] ?? 'shared';

  return {
    ...cj,
    ...pricing,
    audience,
    audienceLabel: audience === 'women' ? 'للنساء' : audience === 'men' ? 'للرجال' : 'مشترك',
    arabicName: ARABIC_NAMES[cj.id] ?? cj.name,
    arabicDescription: cj.description,
    ...stats,
    freeShipping: cj.isFreeShipping || pricing.retailPriceSAR >= 199,
    estimatedDeliveryDays: cj.shippingDaysToSA ?? (cj.inSaudiWarehouse ? 3 : 7),
    cjProductId: cj.id,
  };
}

// ---- Public API for the storefront ----

export async function getFeaturedProducts(): Promise<StoreProduct[]> {
  const res = await listProducts({ pageSize: 24 });
  return res.data.map(toStoreProduct);
}

export async function getDiscoverProducts(opts: {
  page?: number;
  query?: string;
  categoryId?: number;
  inSaudiOnly?: boolean;
  audience?: 'women' | 'men' | 'shared';
  sort?: 'price-asc' | 'price-desc' | 'popular';
} = {}): Promise<{ products: StoreProduct[]; total: number; page: number; pageSize: number }> {
  const pageSize = 24;
  const res = await listProducts({
    pageNum: opts.page ?? 1,
    pageSize,
    categoryId: opts.categoryId,
    query: opts.query,
    inSaudiWarehouse: opts.inSaudiOnly,
  });
  let products = res.data.map(toStoreProduct);
  if (opts.audience && opts.audience !== ('all' as any)) {
    products = products.filter((p) => p.audience === opts.audience);
  }
  if (opts.sort) {
    products = [...products].sort((a, b) => {
      if (opts.sort === 'price-asc') return a.retailPriceSAR - b.retailPriceSAR;
      if (opts.sort === 'price-desc') return b.retailPriceSAR - a.retailPriceSAR;
      return b.salesCount - a.salesCount;
    });
  }
  return {
    products,
    total: res.total,
    page: res.pageNum,
    pageSize: res.pageSize,
  };
}

export async function getDiscoverProductById(id: string): Promise<StoreProduct | null> {
  const p = await getProductDetails(id);
  return p ? toStoreProduct(p) : null;
}

export async function getAllCategories(): Promise<CJCategory[]> {
  return listCategories();
}

export function getCJStatus(): { configured: boolean; mode: 'live' | 'mock' } {
  return {
    configured: isCJConfigured(),
    mode: isCJConfigured() ? 'live' : 'mock',
  };
}
