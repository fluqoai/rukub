// Admin: import a CJ product by pid.
// Returns the CJ product details (name, image, price, etc.) pre-formatted
// for the admin product form.
//
// Note: the real CJ API returns many fields (pid, productNameEn, threeCategoryName,
// brandName, productImage, etc.) that aren't on our internal CJProduct type.
// We accept the full response as `any` here to access all real fields.

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/admin-auth-server';
import { getProductDetails } from '@/lib/cj-client';
import type { CatalogVariant } from '@/lib/catalog-variants';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  try {
    const pid = req.nextUrl.searchParams.get('pid');
    if (!pid) return NextResponse.json({ success: false, error: 'pid مطلوب' }, { status: 400 });
    const product = await getProductDetails(pid);
    if (!product) return NextResponse.json({ success: false, error: 'المنتج غير موجود في CJ' }, { status: 404 });
    const variants: CatalogVariant[] = product.variants.map(v => ({ pid: product.id, vid: v.vid, sku: v.sku || '', name: v.name,
      labelAr: v.name, image: v.image || null, enabled: false, priceSAR: 0, costSAR: 0, supplierPriceUSD: v.price,
      shippingUSD: null, stock: null, origin: null, logistics: null, deliveryMin: null, deliveryMax: null, checkedAt: null }));

    return NextResponse.json({
      success: true,
      cjProduct: product,
      prefill: {
        id: `cj-${product.id.toLowerCase()}`,
        name: product.name || 'CJ Product',
        short_name: product.name.slice(0, 48),
        name_ar: null,
        description: product.description.replace(/<[^>]*>/g, ' ').slice(0, 6000) || product.name,
        tagline: product.name.slice(0, 90),
        audience: 'shared',
        audience_label: 'العناية اليومية',
        price: 0,
        cost: 0,
        badge: null,
        tier: 1,
        is_hero: false,
        cj_product_id: product.id,
        category_name: product.categoryName || null,
        brand: product.brand,
        weight: product.weight || null,
        images: product.images.slice(0, 10),
        variants,
        free_shipping: false,
        estimated_delivery_days: 0,
        rating: 0,
        review_count: 0,
        sales_count: 0,
        metadata: {
          supplier: 'CJdropshipping',
          supplier_product_id: product.id,
          variant_schema: 1,
          source_name: product.name,
          source_description: product.description.replace(/<[^>]*>/g, ' ').slice(0, 6000),
          exchange_rate: 3.75,
          listed_num: product.listedNum,
          videos: product.videos ?? [],
        },
        active: false,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Unknown' },
      { status: 500 }
    );
  }
}
