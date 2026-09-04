import { createHash, timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getOrder } from '@/lib/db/orders';

export const dynamic = 'force-dynamic';

function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, '');
  if (digits.startsWith('966')) return digits.slice(3);
  if (digits.startsWith('0')) return digits.slice(1);
  return digits;
}

function safelyMatches(left: string, right: string) {
  const a = createHash('sha256').update(left).digest();
  const b = createHash('sha256').update(right).digest();
  return timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { orderId?: string; phone?: string };
    const orderId = body.orderId?.trim().toUpperCase();
    const phone = normalizePhone(body.phone ?? '');
    if (!orderId || !/^RKB-[A-F0-9]{8}$/.test(orderId) || phone.length !== 9) {
      return NextResponse.json({ success: false, error: 'تحقق من رقم الطلب ورقم الجوال' }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
    }
    const order = await getOrder(orderId);
    if (!order || !safelyMatches(phone, normalizePhone(order.shipping_phone ?? ''))) {
      return NextResponse.json({ success: false, error: 'لم نجد طلباً مطابقاً لهذه البيانات' }, { status: 404, headers: { 'Cache-Control': 'no-store' } });
    }
    const safeOrder = {
      id: order.id, status: order.status, payment_method: order.payment_method,
      payment_status: order.payment_status, tracking_number: order.tracking_number,
      subtotal: order.subtotal, shipping_cost: order.shipping_cost, total: order.total,
      shipping_full_name: order.shipping_full_name, shipping_city: order.shipping_city,
      shipping_district: order.shipping_district, placed_at: order.placed_at,
      items: order.items.map((i: any) => ({ id: i.id, product_name: i.product_name, product_short_name: i.product_short_name, quantity: i.quantity, price: i.price, subtotal: i.subtotal, variant: i.variant })),
    };
    return NextResponse.json({ success: true, order: safeOrder }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ success: false, error: 'تعذر التحقق من الطلب الآن' }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
}
