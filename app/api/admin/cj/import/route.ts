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

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  try {
    const pid = req.nextUrl.searchParams.get('pid');
    if (!pid) return NextResponse.json({ success: false, error: 'pid مطلوب' }, { status: 400 });
    const raw = await getProductDetails(pid);
    if (!raw) return NextResponse.json({ success: false, error: 'المنتج غير موجود في CJ' }, { status: 404 });

    // The real API response has different field names than our static types.
    // Cast to any so we can read the actual response fields.
    const cj = raw as any;

    // Suggested pricing
    const priceUSD = parseFloat(String(cj.sellPrice ?? cj.variants?.[0]?.sellPrice ?? cj.basePrice ?? 0)) || 0;
    const costUSD = parseFloat(String(cj.basePrice ?? cj.price ?? 0)) || 0;
    const suggestedPrice = priceUSD > 0 ? Math.round(priceUSD * 3.75) : Math.round(costUSD * 3.75 * 2.5);
    const suggestedCost = Math.round(costUSD * 3.75);

    return NextResponse.json({
      success: true,
      cjProduct: raw,
      prefill: {
        id: `CJ-${cj.pid}`,
        name: cj.productNameEn || cj.productName || 'CJ Product',
        short_name: (cj.productNameEn || cj.productName || '').slice(0, 40),
        name_ar: cj.productName || null,
        description: cj.productNameEn || cj.productName || '',
        tagline: (cj.productNameEn || cj.productName || '').slice(0, 80),
        audience: 'shared',
        audience_label: 'مشترك',
        price: suggestedPrice,
        cost: suggestedCost,
        badge: null,
        tier: 1,
        is_hero: false,
        cj_product_id: String(cj.pid ?? ''),
        category_name: cj.threeCategoryName || cj.twoCategoryName || cj.oneCategoryName || null,
        brand: cj.brandName || null,
        weight: cj.productWeight ? Math.round(Number(cj.productWeight)) : null,
        images: cj.productImage ? [cj.productImage] : [],
        free_shipping: !!cj.isFreeShipping,
        estimated_delivery_days: 3,
        rating: 0,
        review_count: 0,
        sales_count: 0,
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
