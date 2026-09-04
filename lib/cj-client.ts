// CJdropshipping API 2.0 client. Server-side only.
// Normalizes CJ's different response shapes before the rest of the app sees them.

import 'server-only';
import type {
  CJAuthResponse,
  CJCategory,
  CJFreightQuote,
  CJInventory,
  CJProduct,
  CJProductListResponse,
  CJProductSnapshot,
  CJVariant,
} from './cj-types';
import { mockCJProducts, mockCJCategories } from './cj-mock-data';

const CJ_BASE_URL = 'https://developers.cjdropshipping.com/api2.0/v1';
const CJ_API_KEY = process.env.CJ_API_KEY;
const CJ_MIN_REQUEST_INTERVAL_MS = 1_050;

let cachedToken: { token: string; expiresAt: number } | null = null;
let lastRequestAt = 0;

const asNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const first = String(value ?? '').match(/\d+(?:\.\d+)?/);
  return first ? Number(first[0]) : fallback;
};

const uniqueUrls = (values: unknown[]): string[] =>
  Array.from(new Set(values.filter((value): value is string => typeof value === 'string' && /^https:\/\//.test(value))));

function parseJsonStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return uniqueUrls(value);
  if (typeof value !== 'string' || !value.trim()) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? uniqueUrls(parsed) : [];
  } catch {
    return [];
  }
}

function parseDeliveryRange(value: unknown): { min: number | null; max: number | null; label: string } {
  const label = String(value ?? '').trim();
  const days = label.match(/\d+/g)?.map(Number) ?? [];
  return { min: days[0] ?? null, max: days[1] ?? days[0] ?? null, label };
}

function normalizeInventory(raw: any): CJInventory {
  return {
    countryCode: String(raw?.countryCode ?? '').toUpperCase(),
    countryName: String(raw?.countryNameEn ?? raw?.countryName ?? raw?.areaEn ?? ''),
    warehouseName: String(raw?.areaEn ?? raw?.countryNameEn ?? ''),
    totalInventory: asNumber(raw?.totalInventoryNum ?? raw?.totalInventory),
    cjInventory: asNumber(raw?.cjInventoryNum ?? raw?.cjInventory),
    factoryInventory: asNumber(raw?.factoryInventoryNum ?? raw?.factoryInventory),
    verified: String(raw?.verifiedWarehouse ?? '1') === '1',
  };
}

function normalizeVariant(raw: any): CJVariant {
  const inventories = Array.isArray(raw?.inventories) ? raw.inventories.map(normalizeInventory) : [];
  return {
    vid: String(raw?.vid ?? ''),
    name: String(raw?.variantKey ?? raw?.variantNameEn ?? raw?.variantName ?? 'Standard'),
    properties: String(raw?.variantProperty ?? raw?.variantKey ?? ''),
    sku: String(raw?.variantSku ?? ''),
    price: asNumber(raw?.variantSellPrice),
    suggestedPrice: asNumber(raw?.variantSugSellPrice) || undefined,
    image: typeof raw?.variantImage === 'string' ? raw.variantImage : undefined,
    inventory: inventories.reduce((sum: number, item: CJInventory) => sum + item.totalInventory, 0),
    weight: asNumber(raw?.variantWeight),
    length: asNumber(raw?.variantLength) || undefined,
    width: asNumber(raw?.variantWidth) || undefined,
    height: asNumber(raw?.variantHeight) || undefined,
    inventories,
  };
}

function normalizeProduct(raw: any): CJProduct {
  const variants = Array.isArray(raw?.variants) ? raw.variants.map(normalizeVariant) : [];
  const images = uniqueUrls([
    raw?.bigImage,
    ...(Array.isArray(raw?.productImageSet) ? raw.productImageSet : []),
    ...parseJsonStringArray(raw?.productImage),
    ...variants.map((variant: CJVariant) => variant.image),
  ]);
  const videos = uniqueUrls([
    raw?.productVideo,
    ...(Array.isArray(raw?.videoList)
      ? raw.videoList.map((video: any) => typeof video === 'string' ? video : video?.url ?? video?.videoUrl)
      : []),
  ]);
  const variantPrices = variants.map((variant: CJVariant) => variant.price).filter((price: number) => price > 0);
  const rawPrice = asNumber(raw?.sellPrice ?? raw?.nowPrice ?? raw?.discountPrice);
  const inventories = variants.flatMap((variant: CJVariant) => variant.inventories ?? []);
  const saStock = inventories.some((item: CJInventory) => item.countryCode === 'SA' && item.totalInventory > 0);
  const firstVariant = variants[0];

  return {
    id: String(raw?.pid ?? raw?.id ?? ''),
    name: String(raw?.productNameEn ?? raw?.nameEn ?? raw?.productName ?? ''),
    sku: String(raw?.productSku ?? raw?.sku ?? raw?.spu ?? ''),
    categoryId: raw?.categoryId ?? '',
    categoryName: String(raw?.categoryName ?? raw?.threeCategoryName ?? ''),
    brand: raw?.brandName ?? raw?.supplierName ?? null,
    description: String(raw?.description ?? ''),
    images,
    videos,
    weight: asNumber(raw?.productWeight ?? firstVariant?.weight),
    length: asNumber(firstVariant?.length),
    width: asNumber(firstVariant?.width),
    height: asNumber(firstVariant?.height),
    isFreeShipping: Number(raw?.addMarkStatus ?? 0) === 1,
    isInventoryWarning: Number(raw?.warehouseInventoryNum ?? 1) <= 0,
    variants,
    basePrice: variantPrices.length ? Math.min(...variantPrices) : rawPrice,
    sourceUrl: String(raw?.sourceFrom ?? ''),
    listedNum: asNumber(raw?.listedNum),
    inSaudiWarehouse: saStock,
  };
}

async function throttleCJ(): Promise<void> {
  const wait = CJ_MIN_REQUEST_INTERVAL_MS - (Date.now() - lastRequestAt);
  if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
  lastRequestAt = Date.now();
}

async function getAccessToken(): Promise<string> {
  if (!CJ_API_KEY) throw new Error('CJ_API_KEY غير مضبوط');
  if (cachedToken && Date.now() < cachedToken.expiresAt) return cachedToken.token;
  await throttleCJ();
  const res = await fetch(`${CJ_BASE_URL}/authentication/getAccessToken`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey: CJ_API_KEY }),
    cache: 'no-store',
  });
  const json: CJAuthResponse = await res.json();
  if (!res.ok || json.code !== 200 || !json.result) {
    throw new Error(`CJ authentication failed: ${json.message || res.status}`);
  }
  cachedToken = {
    token: json.data.accessToken,
    expiresAt: new Date(json.data.accessTokenExpiryDate).getTime() - 60_000,
  };
  return cachedToken.token;
}

async function cjFetch<T>(
  path: string,
  options: { method?: 'GET' | 'POST'; params?: Record<string, string | number>; body?: unknown } = {}
): Promise<T> {
  const token = await getAccessToken();
  await throttleCJ();
  const url = new URL(`${CJ_BASE_URL}${path}`);
  Object.entries(options.params ?? {}).forEach(([key, value]) => url.searchParams.set(key, String(value)));
  const res = await fetch(url.toString(), {
    method: options.method ?? 'GET',
    headers: {
      'CJ-Access-Token': token,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: 'no-store',
  });
  const json = await res.json();
  if (!res.ok || (json.code !== 200 && json.code !== 0) || json.result === false) {
    throw new Error(`CJ ${path}: ${json.message || res.status}`);
  }
  return json.data as T;
}

export const isCJConfigured = (): boolean => Boolean(CJ_API_KEY);

export async function listProducts(opts: {
  pageNum?: number;
  pageSize?: number;
  categoryId?: string | number;
  query?: string;
  inSaudiWarehouse?: boolean;
} = {}): Promise<CJProductListResponse> {
  if (!CJ_API_KEY) {
    let products = [...mockCJProducts] as CJProduct[];
    if (opts.query) {
      const query = opts.query.toLowerCase();
      products = products.filter((product) => `${product.name} ${product.categoryName}`.toLowerCase().includes(query));
    }
    if (opts.inSaudiWarehouse) products = products.filter((product) => product.inSaudiWarehouse);
    const pageNum = opts.pageNum ?? 1;
    const pageSize = opts.pageSize ?? 24;
    return { data: products.slice((pageNum - 1) * pageSize, pageNum * pageSize), total: products.length, pageNum, pageSize };
  }

  const page = opts.pageNum ?? 1;
  const size = Math.min(opts.pageSize ?? 24, 100);
  const raw = await cjFetch<any>('/product/listV2', {
    params: {
      page,
      size,
      features: 'enable_category,enable_video',
      ...(opts.query ? { keyWord: opts.query } : {}),
      ...(opts.categoryId ? { categoryId: opts.categoryId } : {}),
      ...(opts.inSaudiWarehouse ? { countryCode: 'SA' } : {}),
    },
  });
  const products = (raw?.content ?? []).flatMap((group: any) => group?.productList ?? []).map(normalizeProduct);
  return {
    data: products,
    total: asNumber(raw?.totalRecords, products.length),
    pageNum: asNumber(raw?.pageNumber, page),
    pageSize: asNumber(raw?.pageSize, size),
  };
}

export async function getProductDetails(productId: string): Promise<CJProduct | null> {
  if (!CJ_API_KEY) return (mockCJProducts as CJProduct[]).find((product) => product.id === productId) ?? null;
  const raw = await cjFetch<any>('/product/query', { params: { pid: productId } });
  return raw ? normalizeProduct(raw) : null;
}

export async function getProductInventory(productId: string): Promise<CJInventory[]> {
  if (!CJ_API_KEY) {
    const product = (mockCJProducts as CJProduct[]).find((item) => item.id === productId);
    return product?.inSaudiWarehouse
      ? [{ countryCode: 'SA', countryName: 'Saudi Arabia', warehouseName: 'Saudi Warehouse', totalInventory: 1, cjInventory: 1, factoryInventory: 0, verified: true }]
      : [];
  }
  const raw = await cjFetch<any>('/product/stock/getInventoryByPid', { params: { pid: productId } });
  return Array.isArray(raw?.inventories) ? raw.inventories.map(normalizeInventory) : [];
}

export async function calculateFreight(
  vid: string,
  startCountryCode: string,
  endCountryCode = 'SA',
  quantity = 1
): Promise<CJFreightQuote[]> {
  if (!CJ_API_KEY) return [];
  const raw = await cjFetch<any[]>('/logistic/freightCalculate', {
    method: 'POST',
    body: { startCountryCode, endCountryCode, products: [{ quantity, vid }] },
  });
  return (raw ?? []).map((quote: any) => {
    const delivery = parseDeliveryRange(quote?.logisticAging);
    return {
      originCountryCode: startCountryCode,
      destinationCountryCode: endCountryCode,
      logisticsName: String(quote?.logisticName ?? ''),
      priceUSD: asNumber(quote?.logisticPrice),
      deliveryMinDays: delivery.min,
      deliveryMaxDays: delivery.max,
      deliveryLabel: delivery.label,
      taxesFeeUSD: asNumber(quote?.taxesFee),
      serviceFeeUSD: asNumber(quote?.serviceFee),
      currency: 'USD' as const,
    };
  }).filter((quote) => quote.priceUSD > 0);
}

export async function getProductFulfillmentSnapshot(productId: string): Promise<CJProductSnapshot | null> {
  const product = await getProductDetails(productId);
  if (!product) return null;
  const inventories = await getProductInventory(productId);
  product.inSaudiWarehouse = inventories.some((item) => item.countryCode === 'SA' && item.totalInventory > 0);
  product.warehouse = product.inSaudiWarehouse ? 'SA' : 'CN';
  const selectedVariant = [...product.variants]
    .filter((variant) => variant.vid && variant.price > 0)
    .sort((a, b) => a.price - b.price)[0] ?? null;
  let freight: CJFreightQuote | null = null;
  if (selectedVariant) {
    const origins = product.inSaudiWarehouse ? ['SA', 'CN'] : ['CN'];
    for (const origin of origins) {
      try {
        const quotes = await calculateFreight(selectedVariant.vid, origin);
        const preferred = origin === 'SA'
          ? [...quotes].sort((a, b) => (a.deliveryMaxDays ?? 999) - (b.deliveryMaxDays ?? 999))[0]
          : [...quotes].sort((a, b) => a.priceUSD - b.priceUSD)[0];
        freight = preferred ?? null;
        if (freight) break;
      } catch {
        // Some products do not support every origin; try the next valid warehouse.
      }
    }
  }
  return { product, inventories, selectedVariant, freight, checkedAt: new Date().toISOString() };
}

export async function listCategories(): Promise<CJCategory[]> {
  if (!CJ_API_KEY) return mockCJCategories.map((category: any) => ({ ...category, categoryId: String(category.categoryId), parentCategoryId: category.parentCategoryId == null ? null : String(category.parentCategoryId) }));
  const raw = await cjFetch<any[]>('/product/getCategory');
  const result: CJCategory[] = [];
  const walk = (items: any[], level: number, parent: string | null) => {
    for (const item of items ?? []) {
      const id = String(item?.categoryId ?? item?.id ?? '');
      const name = String(item?.categoryName ?? item?.name ?? item?.nameEn ?? '');
      if (id && name) result.push({ categoryId: id, categoryName: name, categoryLevel: level, parentCategoryId: parent });
      walk(item?.children ?? item?.childList ?? item?.categoryList ?? [], level + 1, id || parent);
    }
  };
  walk(raw ?? [], 1, null);
  return result;
}

export async function createOrder(order: {
  products: Array<{ cjProductId: string; vid?: string; quantity: number }>;
  shipping: { name: string; phone: string; country: string; province: string; city: string; address: string };
}): Promise<{ orderId: string; trackingNumber?: string }> {
  if (!CJ_API_KEY) throw new Error('إنشاء طلب CJ معطّل حتى يتم ضبط المفتاح');
  return cjFetch('/shopping/order/createOrder', { method: 'POST', body: { products: order.products, shippingAddress: order.shipping } });
}
