import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/admin-auth-server';
import { quoteSupplierItems } from '@/lib/cj-client';
import { calculateCatalogPricing } from '@/lib/cj-service';
import type { CatalogVariant } from '@/lib/catalog-variants';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;
export async function GET(req: NextRequest) {
  if (!await getCurrentAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const pid = req.nextUrl.searchParams.get('pid') || '';
    const vid = req.nextUrl.searchParams.get('vid') || '';
    if (!pid || !vid) return NextResponse.json({ error: 'PID و VID مطلوبان' }, { status: 400 });
    const { live, freight, checkedAt } = await quoteSupplierItems([{ pid, vid, quantity: 1 }]);
    const v = live[0].variant;
    const shippingUSD = freight.priceUSD + freight.taxesFeeUSD + freight.serviceFeeUSD;
    const pricing = calculateCatalogPricing(v.price, shippingUSD);
    const variant: CatalogVariant = { pid, vid, sku: v.sku || '', name: v.name, labelAr: v.name,
      image: v.image || null, enabled: false, priceSAR: pricing.retailPriceSAR, costSAR: pricing.landedCostSAR,
      supplierPriceUSD: v.price, shippingUSD, stock: (v.inventories ?? []).filter(i => i.countryCode === freight.originCountryCode).reduce((n, i) => n + i.totalInventory, 0),
      origin: freight.originCountryCode, logistics: freight.logisticsName, deliveryMin: freight.deliveryMinDays,
      deliveryMax: freight.deliveryMaxDays, checkedAt };
    return NextResponse.json({ success: true, variant });
  } catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : 'تعذر التحقق من النسخة' }, { status: 422 }); }
}
