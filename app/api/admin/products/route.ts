// Admin product CRUD
// GET /api/admin/products         — list
// POST /api/admin/products        — create
//
// Per-product endpoints live in /api/admin/products/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/admin-auth-server';
import { listProducts, createProduct, getProduct, type ProductCreateInput } from '@/lib/db/products';
import { productFormError } from '@/lib/admin-product-editor';

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
    const validation = productFormError(body);
    if (validation) {
      return NextResponse.json(
        { success: false, error: validation },
        { status: 400 }
      );
    }
    if (await getProduct(body.id)) return NextResponse.json({ success: false, error: 'يوجد منتج بهذا المعرّف بالفعل. افتحه من الكتالوج لتعديله، أو اختر معرّفًا مختلفًا.' }, { status: 409 });
    if (!['women', 'men', 'shared'].includes(body.audience)) {
      return NextResponse.json({ success: false, error: 'audience غير صحيح' }, { status: 400 });
    }
    const product = await createProduct(body);
    return NextResponse.json({ success: true, product });
  } catch (err) {
    console.error('[admin/products] create failed', { operation: 'create', errorType: err instanceof Error ? err.name : 'unknown' });
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Unknown' },
      { status: 500 }
    );
  }
}
