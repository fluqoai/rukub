// Per-product admin endpoints
// PATCH /api/admin/products/[id]  — update
// DELETE /api/admin/products/[id] — soft delete (or hard if ?hard=1)

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/admin-auth-server';
import { getProduct, updateProduct, deleteProduct, type ProductUpdateInput } from '@/lib/db/products';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  const product = await getProduct(params.id);
  if (!product) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true, product });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  try {
    const updates = (await req.json()) as ProductUpdateInput;
    const product = await updateProduct(params.id, updates);
    return NextResponse.json({ success: true, product });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Unknown' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  try {
    const hard = req.nextUrl.searchParams.get('hard') === '1';
    await deleteProduct(params.id, hard);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Unknown' },
      { status: 500 }
    );
  }
}
