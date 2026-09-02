// Public product detail API
// GET /api/products/[id] — returns one product (by id or slug)

import { NextRequest, NextResponse } from 'next/server';
import { getProduct } from '@/lib/db/products';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Try as id first, then by slug-like pattern
    let product = await getProduct(params.id);
    if (!product) {
      // Could be a slug like "seat-gap-organizer" — try to find by name match
      const { listProducts } = await import('@/lib/db/products');
      const all = await listProducts({ search: params.id, limit: 1 });
      product = all[0] ?? null;
    }
    if (!product) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, product });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Unknown' },
      { status: 500 }
    );
  }
}
