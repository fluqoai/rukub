'use client';

import { useEffect, useState, useCallback } from 'react';

// Public-facing product type — what client components use.
// Maps the DB row into a UI-friendly shape.
export type PublicProduct = {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  audience: 'women' | 'men' | 'shared';
  price: number;
  oldPrice?: number | null;
  cost?: number;
  tagline: string;
  description: string;
  badge?: string | null;
  tier: number;
  isHero?: boolean;
  freeShipping?: boolean;
  rating: number;
  reviewCount: number;
  salesCount: number;
  estimatedDeliveryDays: number;
  image: string | null;
};

type DbProduct = {
  id: string;
  name: string;
  short_name: string;
  audience: 'women' | 'men' | 'shared';
  price: number;
  old_price: number | null;
  cost: number;
  tagline: string;
  description: string;
  badge: string | null;
  tier: number;
  is_hero: boolean;
  free_shipping: boolean;
  rating: number;
  review_count: number;
  sales_count: number;
  estimated_delivery_days: number;
  images: string[];
};

function fromDb(p: DbProduct): PublicProduct {
  return {
    id: p.id,
    slug: p.id, // DB doesn't separate slug; we use id as the URL slug
    name: p.name,
    shortName: p.short_name,
    audience: p.audience,
    price: Number(p.price),
    oldPrice: p.old_price,
    cost: Number(p.cost),
    tagline: p.tagline,
    description: p.description,
    badge: p.badge,
    tier: p.tier ?? 1,
    isHero: !!p.is_hero,
    freeShipping: !!p.free_shipping,
    rating: Number(p.rating ?? 0),
    reviewCount: p.review_count ?? 0,
    salesCount: p.sales_count ?? 0,
    estimatedDeliveryDays: p.estimated_delivery_days ?? 3,
    image: p.images?.[0] ?? null,
  };
}

/**
 * Hook: list public products with optional audience/search filter.
 * Falls back to [] while loading or on error.
 */
export function usePublicProducts(opts: { audience?: 'women' | 'men' | 'shared' | 'all'; search?: string; limit?: number; featured?: boolean } = {}) {
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOnce = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (opts.audience && opts.audience !== 'all') params.set('audience', opts.audience);
      if (opts.search) params.set('q', opts.search);
      if (opts.limit) params.set('limit', String(opts.limit));
      if (opts.featured) params.set('featured', '1');
      const r = await fetch(`/api/products?${params}`);
      const data = await r.json();
      if (!r.ok || !data.success) throw new Error(data.error || 'Failed');
      setProducts((data.products ?? []).map(fromDb));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.audience, opts.search, opts.limit, opts.featured]);

  useEffect(() => { fetchOnce(); }, [fetchOnce]);

  return { products, loading, error, refetch: fetchOnce };
}

/**
 * Hook: get a single product by id.
 */
export function usePublicProduct(idOrSlug: string) {
  const [product, setProduct] = useState<PublicProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(`/api/products/${encodeURIComponent(idOrSlug)}`);
      const data = await r.json();
      if (!r.ok || !data.success) throw new Error(data.error || 'Not found');
      setProduct(fromDb(data.product));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Not found');
    } finally {
      setLoading(false);
    }
  }, [idOrSlug]);

  useEffect(() => { refetch(); }, [refetch]);
  return { product, loading, error, refetch };
}
