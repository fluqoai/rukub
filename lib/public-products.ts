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

export type PublicProduct = Omit<StaticProduct, 'icon'> & {
  iconName: string;       // serializable — client maps to LucideIcon
  imageUrl?: string | null;
  fromDb: boolean;
};

// Maps icon component display name (heuristic) to a string we send over the wire.
// Client-side has the same map (lib/icon-map.ts) for resolution.
function getIconName(icon: LucideIcon): string {
  // Lucide icon components have a `displayName` or `name` we can read in modern bundlers.
  // Fallback to a known list of names.
  return (icon as any).displayName || (icon as any).name || 'Package';
}

function mapDbToPublic(row: any): PublicProduct {
  const staticMatch = staticProducts.find((s) => s.id === row.id);
  const icon: LucideIcon = staticMatch?.icon ?? Package;
  const defaultFeatures: [string, string, string] = staticMatch?.features ?? [
    'منتج أصلي مع ضمان',
    'شحن سريع من المستودع',
    'دفع آمن عند الاستلام',
  ];
  return {
    id: row.id,
    slug: staticMatch?.slug ?? row.id,
    name: row.name,
    shortName: row.short_name,
    audience: row.audience as Audience,
    price: Number(row.price),
    oldPrice: row.old_price ?? undefined,
    cost: Number(row.cost ?? 0),
    iconName: getIconName(icon),
    tagline: row.tagline,
    description: row.description,
    features: defaultFeatures,
    badge: row.badge ?? undefined,
    tier: (row.tier as any) ?? 1,
    isHero: !!row.is_hero,
    imageUrl: row.images?.[0] ?? null,
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
    return rows.map(mapDbToPublic);
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
    return fallback.map((p) => ({ ...p, iconName: getIconName(p.icon), fromDb: false }));
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
  if (staticMatch) return { ...staticMatch, iconName: getIconName(staticMatch.icon), fromDb: false };
  return null;
}
