import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/admin-auth-server';
import { generateArabicDraft } from '@/lib/openrouter-arabic';
import { createAdminSupabase } from '@/lib/supabase/client';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;
export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (req.headers.get('origin') && req.headers.get('origin') !== req.nextUrl.origin) return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  try {
    const text = await req.text();
    if (text.length > 20000) return NextResponse.json({ error: 'المصدر طويل جدًا' }, { status: 413 });
    const generation = await generateArabicDraft(JSON.parse(text), admin.id);
    return NextResponse.json({ success: true, generation });
  } catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : 'تعذر إنشاء المسودة' }, { status: 422 }); }
}
export async function GET(req: NextRequest) {
  if (!await getCurrentAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = req.nextUrl.searchParams.get('id');
  const db = createAdminSupabase() as any;
  let query = db.from('settings').select('key,value').like('key', 'ai:gen:%').order('updated_at', { ascending: false }).limit(20);
  if (id) query = query.eq('key', `ai:gen:${id}`);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: 'تعذر قراءة سجل المسودات' }, { status: 500 });
  return NextResponse.json({ success: true, generations: data.map((r: any) => r.value) }, { headers: { 'Cache-Control': 'no-store' } });
}
