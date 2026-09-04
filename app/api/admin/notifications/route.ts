import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/admin-auth-server';
import { createAdminSupabase } from '@/lib/supabase/client';
import { defaultPreferences } from '@/lib/notifications-types';
export const dynamic = 'force-dynamic';
export async function GET() {
  if (!await getCurrentAdmin()) return NextResponse.json({ error: 'انتهت جلسة الإدارة' }, { status: 401 });
  const db = createAdminSupabase();
  const [log, prefs] = await Promise.all([
    db.from('notifications').select('*').eq('channel','email').order('sent_at',{ascending:false}).limit(100),
    (db.from('settings') as any).select('value').eq('key','notifications:email').maybeSingle(),
  ]);
  if (log.error || prefs.error) return NextResponse.json({error:'تعذر تحميل سجل البريد والتفضيلات'}, {status:500});
  return NextResponse.json({success:true,notifications:log.data,preferences:{...defaultPreferences.email,...prefs.data?.value}}, {headers:{'Cache-Control':'no-store'}});
}
export async function PATCH(req: NextRequest) {
  if (!await getCurrentAdmin()) return NextResponse.json({ error: 'انتهت جلسة الإدارة' }, { status: 401 });
  if (req.headers.get('origin') && req.headers.get('origin') !== req.nextUrl.origin) return NextResponse.json({error:'Invalid origin'}, {status:403});
  const body = await req.json().catch(()=>null);
  const keys = Object.keys(defaultPreferences.email);
  if (!body || keys.some(k=>typeof body[k]!=='boolean') || Object.keys(body).some(k=>!keys.includes(k))) return NextResponse.json({error:'تفضيلات غير صحيحة'}, {status:400});
  const {error} = await (createAdminSupabase().from('settings') as any).upsert({key:'notifications:email',value:body});
  return NextResponse.json(error?{error:'تعذر حفظ التفضيلات'}:{success:true}, {status:error?500:200});
}
