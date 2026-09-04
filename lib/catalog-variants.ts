// Shared serializable types. Supplier costs stay server/admin-only.
export type CatalogVariant = {
  vid: string; pid: string; sku: string; name: string; labelAr: string;
  image: string | null; enabled: boolean; priceSAR: number; costSAR: number;
  supplierPriceUSD: number; shippingUSD: number | null;
  stock: number | null; origin: string | null; logistics: string | null;
  deliveryMin: number | null; deliveryMax: number | null; checkedAt: string | null;
};
export type PublicVariant = Pick<CatalogVariant, 'vid' | 'labelAr' | 'image' | 'priceSAR' | 'stock' | 'deliveryMin' | 'deliveryMax'>;
export const cartLineKey = (item: { productId: string; variantId?: string }) => `${item.productId}::${item.variantId || 'fixed'}`;
export const money = (n: number) => Math.round(n * 100) / 100;
export function catalogVariants(row: { variants?: unknown; metadata?: any }): CatalogVariant[] {
  if (row.metadata?.variant_schema !== 1 || !Array.isArray(row.variants)) return [];
  return row.variants as CatalogVariant[];
}
export function publicVariants(row: { variants?: unknown; metadata?: any }): PublicVariant[] {
  return catalogVariants(row).filter(v => v.enabled && v.checkedAt && v.priceSAR > 0).map(v => ({
    vid: v.vid, labelAr: v.labelAr || v.name, image: v.image, priceSAR: v.priceSAR,
    stock: v.stock, deliveryMin: v.deliveryMin, deliveryMax: v.deliveryMax,
  }));
}
export function validateVariants(row: { variants?: unknown; metadata?: any; active?: boolean }) {
  if (row.metadata?.variant_schema !== 1) return;
  const variants = catalogVariants(row);
  if (!variants.length || variants.length > 200 || new Set(variants.map(v => v.vid)).size !== variants.length) throw new Error('قائمة النسخ غير صالحة');
  for (const v of variants) {
    if (!v || !v.vid || !v.pid || !v.name || !Number.isFinite(v.priceSAR) || v.priceSAR < 0 || !Number.isFinite(v.costSAR) || v.costSAR < 0) throw new Error('بيانات النسخة غير صالحة');
    if (v.enabled && (!v.labelAr?.trim() || !v.checkedAt || !Number.isFinite(Date.parse(v.checkedAt)) || !Number.isFinite(v.stock) || !v.stock || v.stock <= 0 || !Number.isFinite(v.shippingUSD) || v.shippingUSD === null || v.shippingUSD < 0 || !v.origin || !v.deliveryMax || v.priceSAR <= v.costSAR)) throw new Error('تحقق من مخزون وشحن وسعر كل نسخة مفعلة أولاً');
  }
  if (row.active !== false && !variants.some(v => v.enabled)) throw new Error('فعّل نسخة واحدة على الأقل قبل نشر المنتج');
}
