import { NextResponse } from 'next/server';
import { getAllCategories, getCJStatus } from '@/lib/cj-service';
import { getCurrentAdmin } from '@/lib/admin-auth-server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!(await getCurrentAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const categories = await getAllCategories();
    return NextResponse.json({
      categories,
      status: getCJStatus(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
