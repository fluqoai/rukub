import 'server-only';
import { getProduct } from '@/lib/db/products';
import { catalogVariants, cartLineKey, money } from '@/lib/catalog-variants';
import { quoteSupplierItems } from '@/lib/cj-client';
import type { CreateOrderInput } from '@/lib/db/orders';

export type RequestedLine = { productId: string; variantId?: string; quantity: number; expectedPrice: number };
export async function validateCheckout(requested: RequestedLine[]): Promise<CreateOrderInput['items']> {
  if (!Array.isArray(requested) || !requested.length || requested.length > 10) throw new Error('السلة يجب أن تحتوي من 1 إلى 10 أسطر');
  const keys = new Set<string>();
  const reservedStock = new Map<string, number>();
  const result: CreateOrderInput['items'] = [];
  for (const item of requested) {
    if (!item || typeof item.productId !== 'string' || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 10 || !Number.isFinite(item.expectedPrice)) throw new Error('بيانات السلة غير صالحة؛ أعد إضافة المنتج');
    const key = cartLineKey(item);
    if (keys.has(key)) throw new Error('يوجد تكرار في السلة؛ أعد إضافة النسخة');
    keys.add(key);
    const row = await getProduct(item.productId);
    if (!row || !row.active) throw new Error('أحد المنتجات لم يعد متاحًا');
    const meta = (row.metadata || {}) as any;
    const variants = catalogVariants(row);
    const selected = variants.find(v => v.vid === item.variantId && v.enabled);
    if (meta.variant_schema === 1 && !selected) throw new Error(`اختر اللون والمقاس أو النوع لمنتج ${row.short_name}`);
    if (meta.variant_schema !== 1 && item.variantId) throw new Error('هذا المنتج لا يتيح النسخة المطلوبة');
    const price = selected?.priceSAR ?? Number(row.price);
    if (money(price) !== money(item.expectedPrice)) throw new Error(`تغير سعر ${row.short_name}؛ أعد إضافته من صفحة المنتج لمراجعة السعر`);
    const supplierItems = selected ? [{ pid: selected.pid, vid: selected.vid, quantity: item.quantity }] :
      Array.isArray(meta.supplier_items) ? meta.supplier_items.map((s: any) => ({ pid: s.pid, vid: s.vid, quantity: item.quantity * (s.quantity || 1) })) :
      meta.supplier_variant_id && row.cj_product_id ? [{ pid: row.cj_product_id, vid: meta.supplier_variant_id, quantity: item.quantity }] : [];
    if (meta.supplier === 'CJdropshipping' && !supplierItems.length) throw new Error('ربط المنتج بالمورد غير مكتمل');
    let snapshot: Record<string, unknown> = {};
    if (supplierItems.length) {
      const { live, freight, checkedAt } = await quoteSupplierItems(supplierItems);
      for (const s of live) {
        const stockKey = `${freight.originCountryCode}:${s.vid}`;
        const required = (reservedStock.get(stockKey) ?? 0) + s.quantity;
        const available = (s.variant.inventories ?? []).filter(i => i.countryCode === freight.originCountryCode).reduce((n, i) => n + i.totalInventory, 0);
        if (required > available) throw new Error('إجمالي كمية إحدى النسخ في السلة والباقات يتجاوز المخزون');
        reservedStock.set(stockKey, required);
      }
      const supplierUSD = live.reduce((n, s) => n + s.variant.price * s.quantity, 0);
      const shippingUSD = freight.priceUSD + freight.taxesFeeUSD + freight.serviceFeeUSD;
      const cost = money((supplierUSD + shippingUSD) * 3.75);
      const savedCost = (selected?.costSAR ?? Number(row.cost)) * item.quantity;
      if (cost > savedCost + Math.max(1, savedCost * 0.1) || cost >= price * item.quantity) throw new Error(`تغيرت تكلفة توريد ${row.short_name}؛ يحتاج مراجعة من المتجر قبل الشراء`);
      snapshot = { supplier: 'CJdropshipping', checked_at: checkedAt, origin: freight.originCountryCode,
        logistics: freight.logisticsName, delivery_min_days: freight.deliveryMinDays, delivery_max_days: freight.deliveryMaxDays,
        landed_cost_sar: cost, shipping_usd: shippingUSD,
        supplier_items: live.map(s => ({ pid: s.pid, vid: s.vid, sku: s.variant.sku, name: s.variant.name, quantity: s.quantity, price_usd: s.variant.price })) };
    }
    result.push({ productId: row.id, productName: row.name, productShortName: row.short_name, quantity: item.quantity,
      price, variant: selected?.labelAr || (supplierItems.length ? 'النسخة المعروضة' : undefined),
      metadata: { ...snapshot, variant_id: selected?.vid ?? null, variant_label: selected?.labelAr ?? null, image: selected?.image ?? (row.images as string[])?.[0] ?? null } });
  }
  return result;
}
