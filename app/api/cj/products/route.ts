import { NextRequest, NextResponse } from 'next/server';
import { getDiscoverProducts, getCJStatus } from '@/lib/cj-service';
import { getCurrentAdmin } from '@/lib/admin-auth-server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    if (!(await getCurrentAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const sp = req.nextUrl.searchParams;
    const result = await getDiscoverProducts({
      page: Number(sp.get('page') ?? '1'),
      query: sp.get('q') ?? undefined,
      categoryId: sp.get('category') ? Number(sp.get('category')) : undefined,
      inSaudiOnly: sp.get('sa') === '1',
      audience: (sp.get('audience') as 'women' | 'men' | 'shared') ?? undefined,
      sort: (sp.get('sort') as any) ?? undefined,
    });
    return NextResponse.json({
      ...result,
      status: getCJStatus(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
