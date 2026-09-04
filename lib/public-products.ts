// Server-side: returns public-facing products combining DB + static icon mapping.
// Used by /shop/[audience] and /products/[slug] server components.
//
// The static `lib/products.ts` keeps its rich data (icons, features) for the
// curated 20 products. New admin-added products from the DB get default icons
// and features until the admin customizes them.

import 'server-only';
import { unstable_noStore } from 'next/cache';
import { Package, type LucideIcon } from 'lucide-react';
import { listProducts } from '@/lib/db/products';
import { products as staticProducts, type Product as StaticProduct, type Audience } from '@/lib/products';

export type PublicProduct = Omit<StaticProduct, 'icon' | 'cost'> & {
  iconName: string;       // serializable — client maps to LucideIcon
  imageUrl?: string | null;
  imageUrls: string[];
  deliveryMinDays?: number | null;
  deliveryMaxDays?: number | null;
  shippingOrigin?: string | null;
  localInventorySA?: number;
  fromDb: boolean;
};

// Maps icon component display name (heuristic) to a string we send over the wire.
// Client-side has the same map (lib/icon-map.ts) for resolution.
function getIconName(icon: LucideIcon): string {
  // Lucide icon components have a `displayName` or `name` we can read in modern bundlers.
  // Fallback to a known list of names.
  return (icon as any).displayName || (icon as any).name || 'Package';
}

function mapStaticToPublic(product: StaticProduct): PublicProduct {
  const { icon, cost: _cost, ...serializable } = product;
  return {
    ...serializable,
    iconName: getIconName(icon),
    imageUrl: null,
    imageUrls: [],
    deliveryMinDays: null,
    deliveryMaxDays: null,
    shippingOrigin: null,
    localInventorySA: 0,
    fromDb: false,
  };
}

function mapDbToPublic(row: any): PublicProduct {
  const staticMatch = staticProducts.find((s) => s.id === row.id);
  const icon: LucideIcon = staticMatch?.icon ?? Package;
  const defaultFeatures: [string, string, string] = staticMatch?.features ?? [
    'اختيار عملي للاستخدام اليومي',
    'تفاصيل المنتج موضحة قبل الشراء',
    'تحديثات الطلب تصل عبر البريد',
  ];
  const metadata = row.metadata && typeof row.metadata === 'object' ? row.metadata : {};
  const storedFeatures = Array.isArray(metadata.features) ? metadata.features.filter((item: unknown) => typeof item === 'string').slice(0, 3) : [];
  const features = storedFeatures.length === 3 ? storedFeatures as [string, string, string] : defaultFeatures;
  const imageUrls = Array.isArray(row.images) ? row.images.filter((image: unknown) => typeof image === 'string' && image.startsWith('https://')) : [];
  return {
    id: row.id,
    slug: staticMatch?.slug ?? row.id,
    name: row.name,
    shortName: row.short_name,
    audience: row.audience as Audience,
    price: Number(row.price),
    oldPrice: row.old_price ?? undefined,
    iconName: getIconName(icon),
    tagline: row.tagline,
    description: row.description,
    features,
    badge: row.badge ?? undefined,
    tier: (row.tier as any) ?? 1,
    isHero: !!row.is_hero,
    imageUrl: imageUrls[0] ?? null,
    imageUrls,
    deliveryMinDays: Number(metadata.delivery_min_days) || null,
    deliveryMaxDays: Number(metadata.delivery_max_days ?? row.estimated_delivery_days) || null,
    shippingOrigin: typeof metadata.shipping_origin === 'string' ? metadata.shipping_origin : null,
    localInventorySA: Number(metadata.local_inventory_sa) || 0,
    fromDb: true,
  };
}

/**
 * Server-side fetch of public products.
 * Pass audience: 'all' to get all.
 */
export async function getPublicProducts(opts: { audience?: Audience | 'all'; search?: string } = {}): Promise<PublicProduct[]> {
  unstable_noStore();
  const audience = opts.audience ?? 'all';
  try {
    const rows = await listProducts({
      audience: audience as any,
      search: opts.search,
    });
    if (rows.length > 0) return rows.map(mapDbToPublic);
    throw new Error('Product catalog is empty');
  } catch (e) {
    // Fall back to static if DB fails
    console.error('[public-products] DB fetch failed, using static fallback:', e);
    let fallback = staticProducts;
    if (audience !== 'all') fallback = fallback.filter((p) => p.audience === audience);
    if (opts.search) {
      const q = opts.search.toLowerCase();
      fallback = fallback.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.shortName.toLowerCase().includes(q) ||
          p.tagline.toLowerCase().includes(q)
      );
    }
    return fallback.map(mapStaticToPublic);
  }
}

/**
 * Server-side fetch of one product by id (or slug from static list).
 */
export async function getPublicProduct(idOrSlug: string): Promise<PublicProduct | null> {
  unstable_noStore();
  try {
    const { getProduct } = await import('@/lib/db/products');
    const row = await getProduct(idOrSlug);
    if (row) return mapDbToPublic(row);
  } catch (e) {
    console.error('[public-products] getProduct failed:', e);
  }
  // Fallback: static by id or slug
  const staticMatch = staticProducts.find((p) => p.id === idOrSlug || p.slug === idOrSlug);
  if (staticMatch) return mapStaticToPublic(staticMatch);
  return null;
}
