import { NextRequest, NextResponse } from 'next/server';
import { createOrder } from '@/lib/cj-client';
import { getCJStatus } from '@/lib/cj-service';

export const dynamic = 'force-dynamic';

type CreateOrderBody = {
  products: Array<{ cjProductId: string; vid?: string; quantity: number }>;
  shipping: {
    name: string;
    phone: string;
    country: string;
    province: string;
    city: string;
    address: string;
  };
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateOrderBody;

    // Basic validation
    if (!body.products?.length) {
      return NextResponse.json(
        { success: false, error: 'لا توجد منتجات في الطلب' },
        { status: 400 }
      );
    }
    if (!body.shipping?.name || !body.shipping?.phone || !body.shipping?.address) {
      return NextResponse.json(
        { success: false, error: 'معلومات الشحن غير مكتملة' },
        { status: 400 }
      );
    }

    // Phone validation (Saudi)
    const phone = body.shipping.phone.replace(/\s/g, '');
    if (!/^(\+?966|0)?5\d{8}$/.test(phone)) {
      return NextResponse.json(
        { success: false, error: 'رقم الجوال غير صحيح' },
        { status: 400 }
      );
    }

    const result = await createOrder(body);
    const status = getCJStatus();

    return NextResponse.json({
      success: true,
      ...result,
      mode: status.mode,
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

