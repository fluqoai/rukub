import { NextResponse } from 'next/server';
import { getAllCategories, getCJStatus } from '@/lib/cj-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
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
