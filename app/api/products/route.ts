// Public products API — no auth required
// GET /api/products?audience=women|men|shared&search=...&limit=...&featured=1

import { NextRequest, NextResponse } from 'next/server';
import { unstable_noStore } from 'next/cache';
import { getPublicProducts } from '@/lib/public-products';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  unstable_noStore();
  try {
    const sp = req.nextUrl.searchParams;
    const audience = (sp.get('audience') as 'women' | 'men' | 'shared' | 'all' | null) || 'all';
    const search = sp.get('q') || undefined;
    const limit = sp.get('limit') ? Number(sp.get('limit')) : undefined;
    const isHero = sp.get('featured') === '1';

    let products = await getPublicProducts({ audience, search });
    if (isHero) products = products.filter((product) => product.isHero);
    if (limit) products = products.slice(0, limit);
    return NextResponse.json({ success: true, products, total: products.length });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Unknown' },
      { status: 500 }
    );
  }
}
