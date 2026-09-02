import { NextRequest, NextResponse } from 'next/server';
import { createCharge, isTapConfigured } from '@/lib/tap-client';
import { createMockCharge } from '@/lib/tap-mock-store';

export const dynamic = 'force-dynamic';

type CreateChargeBody = {
  amount: number;
  currency: 'SAR';
  orderId: string;
  customer: {
    first_name: string;
    last_name?: string;
    email?: string;
    phone: string; // E.164 format
  };
  description?: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateChargeBody;

    // Validation
    if (!body.amount || body.amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'المبلغ غير صحيح' },
        { status: 400 }
      );
    }
    if (!body.orderId) {
      return NextResponse.json(
        { success: false, error: 'رقم الطلب مفقود' },
        { status: 400 }
      );
    }
    if (!body.customer?.first_name || !body.customer?.phone) {
      return NextResponse.json(
        { success: false, error: 'بيانات العميل ناقصة' },
        { status: 400 }
      );
    }

    // Phone normalization
    const phoneClean = body.customer.phone.replace(/\s/g, '').replace(/^0/, '');
    const phone = phoneClean.startsWith('966') ? phoneClean : `966${phoneClean}`;

    const payload = {
      amount: body.amount,
      currency: 'SAR' as const,
      threeDSecure: true,
      description: body.description ?? `طلب ركوب #${body.orderId}`,
      reference: {
        transaction: body.orderId,
        order: body.orderId,
      },
      customer: {
        first_name: body.customer.first_name,
        last_name: body.customer.last_name,
        email: body.customer.email ?? `${body.orderId}@rukub.shop`,
        phone: {
          country_code: '966',
          number: phone.replace('966', ''),
        },
      },
      redirect: {
        url: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/checkout/tap-callback?order=${body.orderId}`,
      },
      metadata: {
        order_id: body.orderId,
        source: 'rukub-storefront',
      },
    };

    const result = await createCharge(payload);

    // Save mock charge if in mock mode
    if (!isTapConfigured()) {
      createMockCharge({
        id: result.id,
        amount: body.amount,
        currency: 'SAR',
        customer: {
          first_name: body.customer.first_name,
          email: body.customer.email ?? '',
          phone: body.customer.phone,
        },
        reference: { order: body.orderId },
      });
    }

    return NextResponse.json({
      success: true,
      chargeId: result.id,
      redirectUrl: result.redirectUrl,
      mode: result.mode,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'حدث خطأ غير متوقع',
      },
      { status: 500 }
    );
  }
}
