// Admin: import a CJ product by pid.
// Returns the CJ product details (name, image, price, etc.) pre-formatted
// for the admin product form.
//
// Note: the real CJ API returns many fields (pid, productNameEn, threeCategoryName,
// brandName, productImage, etc.) that aren't on our internal CJProduct type.
// We accept the full response as `any` here to access all real fields.

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/admin-auth-server';
import { getProductFulfillmentSnapshot } from '@/lib/cj-client';
import { calculateCatalogPricing } from '@/lib/cj-service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  try {
    const pid = req.nextUrl.searchParams.get('pid');
    if (!pid) return NextResponse.json({ success: false, error: 'pid مطلوب' }, { status: 400 });
    const snapshot = await getProductFulfillmentSnapshot(pid);
    if (!snapshot) return NextResponse.json({ success: false, error: 'المنتج غير موجود في CJ' }, { status: 404 });
    const { product, selectedVariant, freight, inventories, checkedAt } = snapshot;
    if (!selectedVariant) {
      return NextResponse.json({ success: false, error: 'لا توجد نسخة قابلة للبيع بسعر واضح في CJ' }, { status: 422 });
    }
    const pricing = calculateCatalogPricing(selectedVariant.price, freight?.priceUSD ?? 0);
    const localInventory = inventories
      .filter((item) => item.countryCode === 'SA')
      .reduce((sum, item) => sum + item.totalInventory, 0);
    const deliveryMax = freight?.deliveryMaxDays ?? 14;

    return NextResponse.json({
      success: true,
      cjProduct: product,
      fulfillment: { inventories, selectedVariant, freight, checkedAt },
      prefill: {
        id: `cj-${product.id.toLowerCase()}`,
        name: product.name || 'CJ Product',
        short_name: product.name.slice(0, 48),
        name_ar: null,
        description: product.name,
        tagline: product.name.slice(0, 90),
        audience: 'shared',
        audience_label: 'العناية اليومية',
        price: pricing.retailPriceSAR,
        cost: pricing.landedCostSAR,
        badge: null,
        tier: 1,
        is_hero: false,
        cj_product_id: product.id,
        category_name: product.categoryName || null,
        brand: product.brand,
        weight: selectedVariant.weight || product.weight || null,
        images: product.images.slice(0, 10),
        variants: product.variants,
        free_shipping: product.isFreeShipping,
        estimated_delivery_days: deliveryMax,
        rating: 0,
        review_count: 0,
        sales_count: 0,
        metadata: {
          supplier: 'CJdropshipping',
          supplier_product_id: product.id,
          supplier_variant_id: selectedVariant.vid,
          supplier_sku: selectedVariant.sku,
          supplier_price_usd: selectedVariant.price,
          shipping_price_usd: freight?.priceUSD ?? null,
          logistics_name: freight?.logisticsName ?? null,
          delivery_min_days: freight?.deliveryMinDays ?? null,
          delivery_max_days: freight?.deliveryMaxDays ?? null,
          shipping_origin: freight?.originCountryCode ?? null,
          local_inventory_sa: localInventory,
          inventory_verified_at: checkedAt,
          exchange_rate: 3.75,
          landed_cost_sar: pricing.landedCostSAR,
          listed_num: product.listedNum,
          videos: product.videos ?? [],
        },
        active: true,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Unknown' },
      { status: 500 }
    );
  }
}
