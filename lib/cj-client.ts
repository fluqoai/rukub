// CJdropshipping API client.
// Server-side only. Reads CJ_API_KEY from env. Falls back to mock data when not set.
//
// Reference: https://developers.cjdropshipping.com/api2.0/v1/

import 'server-only';
import type { CJAuthResponse, CJProduct, CJCategory, CJProductListResponse } from './cj-types';
import { mockCJProducts, mockCJCategories } from './cj-mock-data';

const CJ_BASE_URL = 'https://developers.cjdropshipping.com/api2.0/v1';
const CJ_API_KEY = process.env.CJ_API_KEY;

// ---- Auth token caching (token valid for ~15 days) ----
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (!CJ_API_KEY) {
    throw new Error('CJ_API_KEY not set — using mock data');
  }
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }
  const res = await fetch(`${CJ_BASE_URL}/authentication/getAccessToken`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey: CJ_API_KEY }),
  });
  if (!res.ok) {
    throw new Error(`CJ auth failed: ${res.status}`);
  }
  const json: CJAuthResponse = await res.json();
  if (json.code !== 200 || !json.result) {
    throw new Error(`CJ auth error: ${json.message}`);
  }
  cachedToken = {
    token: json.data.accessToken,
    expiresAt: new Date(json.data.accessTokenExpiryDate).getTime() - 60_000, // refresh 1min early
  };
  return json.data.accessToken;
}

async function cjFetch<T>(path: string, params: Record<string, string | number> = {}): Promise<T> {
  const token = await getAccessToken();
  const url = new URL(`${CJ_BASE_URL}${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  const res = await fetch(url.toString(), {
    headers: { 'CJ-Access-Token': token },
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`CJ ${path} failed: ${res.status}`);
  }
  const json = await res.json();
  if (json.code !== 200) {
    throw new Error(`CJ ${path} error: ${json.message}`);
  }
  return json.data as T;
}

// ---- Public API ----

export const isCJConfigured = (): boolean => !!CJ_API_KEY;

/** List products with optional filters */
export async function listProducts(opts: {
  pageNum?: number;
  pageSize?: number;
  categoryId?: number;
  query?: string;
  inSaudiWarehouse?: boolean;
} = {}): Promise<CJProductListResponse> {
  if (!CJ_API_KEY) {
    // Mock mode
    let products = [...mockCJProducts];
    if (opts.query) {
      const q = opts.query.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q) ||
          (p.brand ?? '').toLowerCase().includes(q)
      );
    }
    if (opts.categoryId) {
      products = products.filter((p) => p.categoryId === opts.categoryId);
    }
    if (opts.inSaudiWarehouse) {
      products = products.filter((p) => p.inSaudiWarehouse);
    }
    const pageNum = opts.pageNum ?? 1;
    const pageSize = opts.pageSize ?? 24;
    const start = (pageNum - 1) * pageSize;
    return {
      data: products.slice(start, start + pageSize),
      total: products.length,
      pageNum,
      pageSize,
    };
  }
  const params: Record<string, string | number> = {
    pageNum: opts.pageNum ?? 1,
    pageSize: opts.pageSize ?? 24,
  };
  if (opts.categoryId) params.categoryId = opts.categoryId;
  if (opts.query) params.keyWord = opts.query;
  if (opts.inSaudiWarehouse) params.warehouseCountry = 'SA';
  return cjFetch<CJProductListResponse>('/product/list', params);
}

/** Get product details by ID */
export async function getProductDetails(productId: string): Promise<CJProduct | null> {
  if (!CJ_API_KEY) {
    return mockCJProducts.find((p) => p.id === productId) ?? null;
  }
  return cjFetch<CJProduct>('/product/details', { pid: productId });
}

/** List categories */
export async function listCategories(): Promise<CJCategory[]> {
  if (!CJ_API_KEY) {
    return mockCJCategories;
  }
  // CJ doesn't have a list categories endpoint; usually pre-defined.
  return mockCJCategories;
}

/** Create order (real) or simulate (mock) */
export async function createOrder(order: {
  products: Array<{ cjProductId: string; vid?: string; quantity: number }>;
  shipping: {
    name: string;
    phone: string;
    country: string;
    province: string;
    city: string;
    address: string;
  };
}): Promise<{ orderId: string; trackingNumber?: string }> {
  if (!CJ_API_KEY) {
    // Mock: generate fake order id
    return {
      orderId: `RKB-${Date.now().toString().slice(-8)}`,
      trackingNumber: `TRK${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
    };
  }
  // Real: POST /shopping/order/createOrder
  // Reference: https://developers.cjdropshipping.com/api2.0/v1/shopping/order/createOrder
  const token = await getAccessToken();
  const res = await fetch(`${CJ_BASE_URL}/shopping/order/createOrder`, {
    method: 'POST',
    headers: { 'CJ-Access-Token': token, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      products: order.products,
      shippingAddress: order.shipping,
    }),
  });
  if (!res.ok) throw new Error(`CJ order failed: ${res.status}`);
  const json = await res.json();
  if (json.code !== 200) throw new Error(`CJ order error: ${json.message}`);
  return json.data;
}
