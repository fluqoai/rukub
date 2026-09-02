// Products service — Supabase-backed (server-only)
import 'server-only';
import { createAdminSupabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

type ProductRow = Database['public']['Tables']['products']['Row'];
type ProductInsert = Database['public']['Tables']['products']['Insert'];
type ProductUpdate = Database['public']['Tables']['products']['Update'];

export type ProductCreateInput = {
  id: string;
  name: string;
  short_name: string;
  name_ar?: string;
  description: string;
  tagline: string;
  audience: 'women' | 'men' | 'shared';
  audience_label?: string;
  price: number;
  old_price?: number;
  cost: number;
  badge?: string;
  tier?: number;
  is_hero?: boolean;
  cj_product_id?: string;
  category_name?: string;
  brand?: string;
  weight?: number;
  images?: string[];
  variants?: any;
  free_shipping?: boolean;
  estimated_delivery_days?: number;
  rating?: number;
  review_count?: number;
  sales_count?: number;
  active?: boolean;
};

export type ProductUpdateInput = Partial<Omit<ProductCreateInput, 'id'>>;

/**
 * Get all active products.
 */
export async function listProducts(opts: {
  audience?: 'women' | 'men' | 'shared' | 'all';
  isHero?: boolean;
  search?: string;
  limit?: number;
  includeInactive?: boolean;
} = {}) {
  const supabase = createAdminSupabase();
  let query = supabase.from('products').select('*').order('tier', { ascending: true });
  if (!opts.includeInactive) query = query.eq('active', true);
  if (opts.audience && opts.audience !== 'all') query = query.eq('audience', opts.audience);
  if (opts.isHero) query = query.eq('is_hero', true);
  if (opts.search) {
    query = query.or(
      `name.ilike.%${opts.search}%,short_name.ilike.%${opts.search}%,description.ilike.%${opts.search}%,tagline.ilike.%${opts.search}%`
    );
  }
  if (opts.limit) query = query.limit(opts.limit);
  const { data, error } = await query;
  if (error) throw new Error(`Failed to list products: ${error.message}`);
  return (data ?? []) as ProductRow[];
}

/**
 * Get a single product by ID.
 */
export async function getProduct(productId: string) {
  const supabase = createAdminSupabase();
  const { data, error } = await supabase.from('products').select('*').eq('id', productId).single();
  if (error) return null;
  return data as ProductRow;
}

/**
 * Create a new product.
 */
export async function createProduct(input: ProductCreateInput): Promise<ProductRow> {
  const supabase = createAdminSupabase();
  const audienceLabels = { women: 'للنساء', men: 'للرجال', shared: 'مشترك' };
  const margin = input.price > 0 ? (input.price - input.cost) / input.price : 0;
  const row: ProductInsert = {
    id: input.id,
    name: input.name,
    short_name: input.short_name,
    name_ar: input.name_ar ?? null,
    description: input.description,
    tagline: input.tagline,
    audience: input.audience,
    audience_label: input.audience_label ?? audienceLabels[input.audience],
    price: input.price,
    old_price: input.old_price ?? null,
    cost: input.cost,
    margin: Math.round(margin * 100) / 100,
    badge: input.badge ?? null,
    tier: input.tier ?? 1,
    is_hero: input.is_hero ?? false,
    cj_product_id: input.cj_product_id ?? null,
    category_name: input.category_name ?? null,
    brand: input.brand ?? null,
    weight: input.weight ?? null,
    images: input.images ?? [],
    variants: input.variants ?? [],
    free_shipping: input.free_shipping ?? false,
    estimated_delivery_days: input.estimated_delivery_days ?? 3,
    rating: input.rating ?? 0,
    review_count: input.review_count ?? 0,
    sales_count: input.sales_count ?? 0,
    active: input.active ?? true,
  };
  const { data, error } = await supabase.from('products').insert(row).select().single();
  if (error) throw new Error(`Failed to create product: ${error.message}`);
  return data as ProductRow;
}

/**
 * Update a product.
 */
export async function updateProduct(productId: string, updates: ProductUpdateInput): Promise<ProductRow> {
  const supabase = createAdminSupabase();
  const patch: ProductUpdate = {};
  if (updates.name !== undefined) patch.name = updates.name;
  if (updates.short_name !== undefined) patch.short_name = updates.short_name;
  if (updates.name_ar !== undefined) patch.name_ar = updates.name_ar;
  if (updates.description !== undefined) patch.description = updates.description;
  if (updates.tagline !== undefined) patch.tagline = updates.tagline;
  if (updates.audience !== undefined) patch.audience = updates.audience;
  if (updates.audience_label !== undefined) patch.audience_label = updates.audience_label;
  if (updates.price !== undefined) patch.price = updates.price;
  if (updates.old_price !== undefined) patch.old_price = updates.old_price;
  if (updates.cost !== undefined) patch.cost = updates.cost;
  if (updates.badge !== undefined) patch.badge = updates.badge;
  if (updates.tier !== undefined) patch.tier = updates.tier;
  if (updates.is_hero !== undefined) patch.is_hero = updates.is_hero;
  if (updates.cj_product_id !== undefined) patch.cj_product_id = updates.cj_product_id;
  if (updates.category_name !== undefined) patch.category_name = updates.category_name;
  if (updates.brand !== undefined) patch.brand = updates.brand;
  if (updates.weight !== undefined) patch.weight = updates.weight;
  if (updates.images !== undefined) patch.images = updates.images;
  if (updates.variants !== undefined) patch.variants = updates.variants;
  if (updates.free_shipping !== undefined) patch.free_shipping = updates.free_shipping;
  if (updates.estimated_delivery_days !== undefined) patch.estimated_delivery_days = updates.estimated_delivery_days;
  if (updates.rating !== undefined) patch.rating = updates.rating;
  if (updates.review_count !== undefined) patch.review_count = updates.review_count;
  if (updates.sales_count !== undefined) patch.sales_count = updates.sales_count;
  if (updates.active !== undefined) patch.active = updates.active;
  // Recompute margin if price or cost changed
  if (updates.price !== undefined || updates.cost !== undefined) {
    const existing = await getProduct(productId);
    if (existing) {
      const newPrice = updates.price ?? Number(existing.price);
      const newCost = updates.cost ?? Number(existing.cost);
      patch.margin = newPrice > 0 ? Math.round(((newPrice - newCost) / newPrice) * 100) / 100 : 0;
    }
  }
  const { data, error } = await supabase.from('products').update(patch).eq('id', productId).select().single();
  if (error) throw new Error(`Failed to update product: ${error.message}`);
  return data as ProductRow;
}

/**
 * Delete a product (soft delete by setting active=false, unless hard=true).
 */
export async function deleteProduct(productId: string, hard = false): Promise<void> {
  const supabase = createAdminSupabase();
  if (hard) {
    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (error) throw new Error(`Failed to delete product: ${error.message}`);
  } else {
    const { error } = await supabase.from('products').update({ active: false }).eq('id', productId);
    if (error) throw new Error(`Failed to deactivate product: ${error.message}`);
  }
}
