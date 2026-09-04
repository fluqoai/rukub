'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { adminJson } from '@/lib/admin-product-editor';
import type { Notification } from '@/lib/supabase/types';
import { defaultPreferences } from '@/lib/notifications-types';
const labels = { order_created:'استلام الطلب',order_confirmed:'تأكيد الطلب',order_shipped:'الشحن',order_delivered:'التسليم',order_cancelled:'الإلغاء' };
export default function AdminNotificationsPage() {
  const [rows,setRows]=useState<Notification[]>([]);
  const [prefs,setPrefs]=useState(defaultPreferences.email);
  const [busy,setBusy]=useState(true);
  const [error,setError]=useState('');
  const [notice,setNotice]=useState('');
  const [filter,setFilter]=useState('all');
  const load=useCallback(async()=>{setBusy(true);setError('');try{const d=await adminJson('/api/admin/notifications');setRows(d.notifications);setPrefs(d.preferences);}catch(e){setError(e instanceof Error?e.message:'تعذر التحميل');}finally{setBusy(false);}},[]);
  useEffect(()=>{void load();},[load]);
  async function save(){setBusy(true);setError('');setNotice('');try{await adminJson('/api/admin/notifications',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(prefs)});setNotice('تم حفظ تفضيلات البريد على الخادم؛ تسري على الرسائل التالية.');}catch(e){setError(e instanceof Error?e.message:'تعذر الحفظ');}finally{setBusy(false);}}
  return <><AdminHeader title="إشعارات البريد" subtitle="سجل خادمي موحد · أحدث 100 محاولة" onRefresh={load}/><div className="mx-auto max-w-6xl space-y-5 p-4 md:p-8">
    {error&&<p role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}{notice&&<p role="status" className="rounded-xl bg-sage-50 p-4 text-sage-700">{notice}</p>}
    <section className="rounded-2xl border bg-white p-5"><h2 className="font-semibold">تفضيلات الإرسال</h2><p className="mt-2 text-sm leading-7 text-ink-500">هذه التفضيلات تؤثر فعليًا في رسائل المتجر التالية. السجلات المحلية القديمة لا تُعد إثبات إرسال. قبول مزود البريد للرسالة لا يعني وصولها إلى صندوق العميل.</p><fieldset disabled={busy} className="my-4 grid gap-3 sm:grid-cols-2">{Object.entries(labels).map(([key,label])=><label key={key} className="flex items-center gap-3 rounded-xl border p-3"><input type="checkbox" checked={prefs[key as keyof typeof prefs]} onChange={e=>setPrefs({...prefs,[key]:e.target.checked})}/>{label}</label>)}</fieldset><button disabled={busy} onClick={save} className="rounded-xl bg-sage-600 px-5 py-3 text-sm text-white disabled:opacity-50">{busy?'جارٍ المعالجة…':'حفظ تفضيلات البريد'}</button></section>
    <label className="block text-sm">حالة الرسائل <select value={filter} onChange={e=>setFilter(e.target.value)} className="ms-3 rounded-xl border p-3"><option value="all">الكل</option><option value="sent">قبلها المزود</option><option value="failed">فشلت</option><option value="pending">قيد الإرسال</option></select></label>
    {rows.filter(r=>filter==='all'||r.status===filter).map(r=><article key={r.id} className="rounded-2xl border bg-white p-5"><div className="flex flex-wrap justify-between gap-3"><Link className="text-sage-700 underline" href={`/admin/orders/${encodeURIComponent(r.order_id||'')}`}>{r.order_id}</Link><span className="text-sm">{r.status==='sent'?'قبلها مزود البريد':r.status==='failed'?'فشل الإرسال':'قيد الإرسال أو غير محسوم'}</span></div><p className="mt-2 text-sm">{labels[r.trigger as keyof typeof labels]||r.trigger} · {new Date(r.sent_at).toLocaleString('ar-SA')}</p><p dir="ltr" className="mt-2 break-all text-xs">{r.recipient}</p>{r.error&&<p className="mt-3 text-sm text-red-700">{r.error}</p>}</article>)}
    {!busy&&!error&&!rows.length&&<p className="rounded-2xl border bg-white p-8 text-center">لا توجد محاولات بريد مسجلة على الخادم بعد.</p>}
  </div></>;
}
