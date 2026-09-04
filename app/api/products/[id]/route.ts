// Public product detail API
// GET /api/products/[id] — returns one product (by id or slug)

import { NextRequest, NextResponse } from 'next/server';
import { getPublicProduct } from '@/lib/public-products';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const product = await getPublicProduct(params.id);
    if (!product) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, product });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Unknown' },
      { status: 500 }
    );
  }
}
