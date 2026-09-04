import { NextRequest, NextResponse } from 'next/server';
import { validateCheckout } from '@/lib/checkout-validation';
import { allowCheckoutRequest } from '@/lib/checkout-rate-limit';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;
export async function POST(req: NextRequest) {
  if (!allowCheckoutRequest(req)) return NextResponse.json({ error: 'طلبات متكررة؛ انتظر دقيقة ثم حاول مجددًا' }, { status: 429, headers: { 'Retry-After': '60' } });
  try {
    const { items } = await req.json();
    const checked = await validateCheckout(items);
    return NextResponse.json({ success: true, items: checked.map(i => ({ productId: i.productId, price: i.price, variant: i.variant,
      quantity: i.quantity, deliveryMin: i.metadata?.delivery_min_days, deliveryMax: i.metadata?.delivery_max_days })) }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) { return NextResponse.json({ success: false, error: e instanceof Error ? e.message : 'تعذر التحقق من المورد' }, { status: 409 }); }
}
