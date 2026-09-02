// Admin product CRUD
// GET /api/admin/products         — list
// POST /api/admin/products        — create
//
// Per-product endpoints live in /api/admin/products/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/admin-auth-server';
import { listProducts, createProduct, type ProductCreateInput } from '@/lib/db/products';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  try {
    const sp = req.nextUrl.searchParams;
    const includeInactive = sp.get('includeInactive') === '1';
    const products = await listProducts({
      audience: (sp.get('audience') as any) || 'all',
      search: sp.get('q') || undefined,
      limit: sp.get('limit') ? Number(sp.get('limit')) : undefined,
      includeInactive,
    });
    return NextResponse.json({ success: true, products });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Unknown' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  try {
    const body = (await req.json()) as ProductCreateInput;
    if (!body.id || !body.name || !body.short_name || !body.description || !body.tagline) {
      return NextResponse.json(
        { success: false, error: 'بيانات ناقصة (id, name, short_name, description, tagline)' },
        { status: 400 }
      );
    }
    if (!['women', 'men', 'shared'].includes(body.audience)) {
      return NextResponse.json({ success: false, error: 'audience غير صحيح' }, { status: 400 });
    }
    const product = await createProduct(body);
    return NextResponse.json({ success: true, product });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Unknown' },
      { status: 500 }
    );
  }
}
