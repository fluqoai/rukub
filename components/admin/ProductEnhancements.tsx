'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Loader2, Sparkles, RefreshCw } from 'lucide-react';
import type { CatalogVariant } from '@/lib/catalog-variants';
import type { ArabicDraft } from '@/lib/arabic-draft';
import { formatSAR } from '@/lib/utils';

type Form = { name?: string; description?: string; cj_product_id?: string | null; variants?: CatalogVariant[]; metadata?: Record<string, any> };
const inputClass = 'w-full rounded-xl border border-sage-500/20 bg-white px-3 py-2 text-sm';
export function ProductEnhancements({ form, onChange }: { form: Form; onChange: (patch: Record<string, any>) => void }) {
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [generation, setGeneration] = useState<any>(null);
  const [draft, setDraft] = useState<ArabicDraft | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const variants = form.metadata?.variant_schema === 1 ? form.variants || [] : [];
  const updateVariant = (vid: string, patch: Partial<CatalogVariant>) => onChange({ variants: variants.map(v => v.vid === vid ? { ...v, ...patch } : v) });
  async function verify(v: CatalogVariant) {
    setBusy(v.vid); setError('');
    try {
      const r = await fetch(`/api/admin/cj/variant?pid=${encodeURIComponent(v.pid)}&vid=${encodeURIComponent(v.vid)}`);
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      updateVariant(v.vid, { ...data.variant, labelAr: v.labelAr, enabled: v.enabled,
        priceSAR: v.priceSAR > data.variant.costSAR ? v.priceSAR : data.variant.priceSAR });
    } catch (e) { setError(e instanceof Error ? e.message : 'تعذر التحقق'); }
    finally { setBusy(''); }
  }
  async function importVariants() {
    if (!confirm('سيتم جلب النسخ كمراجعة جديدة غير مفعلة. فعّل النسخ المطلوبة بعد التحقق ثم احفظ المنتج.')) return;
    setBusy('import'); setError('');
    try {
      const r = await fetch(`/api/admin/cj/import?pid=${encodeURIComponent(form.cj_product_id || '')}`);
      const data = await r.json(); if (!r.ok) throw new Error(data.error);
      onChange({ variants: data.prefill.variants, metadata: { ...form.metadata, ...data.prefill.metadata }, active: false });
    } catch (e) { setError(e instanceof Error ? e.message : 'تعذر الاستيراد'); } finally { setBusy(''); }
  }
  async function translate() {
    setBusy('ai'); setError('');
    try {
      const r = await fetch('/api/admin/ai/arabic', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
        name: form.metadata?.source_name || form.name || '', description: form.metadata?.source_description || form.description || '',
        variants: variants.map(v => ({ vid: v.vid, name: v.name })) }) });
      const data = await r.json(); if (!r.ok) throw new Error(data.error);
      setGeneration(data.generation); setDraft(data.generation.draft);
    } catch (e) { setError(e instanceof Error ? e.message : 'تعذر التعريب'); } finally { setBusy(''); }
  }
  function applyDraft() {
    if (!draft) return;
    const sourceName = form.metadata?.source_name || form.name || '';
    if (generation.source?.name !== sourceName.slice(0, 500)) { setError('هذه المسودة تخص مصدرًا مختلفًا؛ افتح مسودة هذا المنتج'); return; }
    const labels = new Map(draft.variants.map(v => [v.vid, v.labelAr]));
    if (labels.size !== variants.length || variants.some(v => !labels.has(v.vid))) { setError('هذه المسودة تخص نسخًا مختلفة؛ لا يمكن تطبيقها على هذا المنتج'); return; }
    onChange({ name: draft.name, name_ar: draft.name, short_name: draft.short_name, tagline: draft.tagline, description: draft.description,
      variants: variants.map(v => ({ ...v, labelAr: labels.get(v.vid) || v.labelAr })),
      metadata: { ...form.metadata, features: draft.features, specifications: draft.specifications, usage: draft.usage,
        seo_title: draft.seo_title, seo_description: draft.seo_description, ai_generation_id: generation.id, ai_reviewed_at: new Date().toISOString() } });
    setDraft(null);
  }
  return <section className="my-5 space-y-4 rounded-2xl border border-sage-500/20 bg-sage-50/30 p-4">
    <div className="flex flex-wrap gap-2">
      <button type="button" disabled={!!busy || !form.name} onClick={translate} className="inline-flex items-center gap-2 rounded-xl bg-sage-600 px-3 py-2 text-sm text-white disabled:opacity-50">{busy === 'ai' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}تجهيز المحتوى بالعربية</button>
      <button type="button" disabled={!!busy} className="rounded-xl border px-3 py-2 text-xs" onClick={async () => { setBusy('history'); try { const r = await fetch('/api/admin/ai/arabic'); const d = await r.json(); if (!r.ok) throw new Error(d.error); setHistory(d.generations); } catch { setError('تعذر تحميل المسودات'); } finally { setBusy(''); } }}>المسودات المحفوظة</button>
      {form.cj_product_id && !variants.length && <button type="button" disabled={!!busy} onClick={importVariants} className="inline-flex items-center gap-1 rounded-xl border px-3 py-2 text-xs"><RefreshCw className="h-3 w-3" />جلب خيارات CJ لهذا المنتج</button>}
    </div>
    <p className="text-xs leading-6 text-ink-500">التعريب مسودة للمراجعة، وليس نشرًا تلقائيًا. لا يغير السعر أو PID أو VID. الحد الأولي: 20 طلبًا يوميًا و100 إجمالًا. الطلب المطابق يُسترجع دون تكلفة جديدة.</p>
    {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {history.length > 0 && <div className="space-y-2"><button type="button" onClick={() => setHistory([])} className="text-xs">إغلاق السجل</button>{history.map(g => <div key={g.id} className="flex items-center justify-between gap-2 rounded-xl bg-white p-2 text-xs"><span>{g.source?.name?.slice(0,60)} · {g.status}</span>{g.status === 'complete' && <button type="button" onClick={() => { setGeneration(g); setDraft(g.draft); setHistory([]); }}>فتح المسودة</button>}</div>)}</div>}
    {draft && <div className="space-y-3 rounded-2xl border bg-white p-4">
      <h3 className="font-semibold">راجع المسودة قبل اعتمادها</h3>
      <p className="text-xs">{generation.model} · التكلفة المسجلة: {generation.costUSD != null ? `$${Number(generation.costUSD).toFixed(6)}` : 'لم تُرجعها المنصة'} {generation.cached ? '· مسترجعة دون توليد جديد' : ''}</p>
      <a href={`/api/admin/ai/arabic?id=${generation.id}`} target="_blank" rel="noreferrer" className="text-xs text-sage-700 underline">سجل المسودة والاستهلاك</a>
      {(['name','short_name','tagline','description','usage','seo_title','seo_description'] as const).map((field, i) => <label key={field} className="block text-xs">{['الاسم','الاسم المختصر','الشعار','الوصف','طريقة الاستخدام','عنوان SEO','وصف SEO'][i]}<textarea className={inputClass} rows={field === 'description' ? 4 : 2} value={draft[field]} onChange={e => setDraft({ ...draft, [field]: e.target.value })} /></label>)}
      <label className="block text-xs">المميزات — سطر لكل ميزة<textarea className={inputClass} value={draft.features.join('\n')} onChange={e => setDraft({ ...draft, features: e.target.value.split('\n').filter(Boolean) })} /></label>
      {draft.specifications.map((s, i) => <div key={i} className="grid grid-cols-2 gap-2"><input aria-label="اسم المواصفة" className={inputClass} value={s.label} onChange={e => setDraft({ ...draft, specifications: draft.specifications.map((x,j) => j===i ? {...x,label:e.target.value}:x) })} /><input aria-label="قيمة المواصفة" className={inputClass} value={s.value} onChange={e => setDraft({ ...draft, specifications: draft.specifications.map((x,j) => j===i ? {...x,value:e.target.value}:x) })} /></div>)}
      {draft.variants.map((v, i) => <label key={v.vid} className="block text-xs">{variants.find(s => s.vid === v.vid)?.name || v.vid}<input className={inputClass} value={v.labelAr} onChange={e => setDraft({ ...draft, variants: draft.variants.map((x,j) => i===j ? {...x,labelAr:e.target.value}:x) })} /></label>)}
      {draft.warnings.length > 0 && <ul className="list-inside list-disc text-xs text-amber-800">{draft.warnings.map((w,i) => <li key={i}>{w}</li>)}</ul>}
      <div className="flex gap-2"><button type="button" onClick={applyDraft} className="rounded-xl bg-sage-600 px-4 py-2 text-sm text-white">راجعت المعلومات — اعتماد في النموذج</button><button type="button" onClick={() => setDraft(null)} className="rounded-xl border px-3 py-2 text-xs">إغلاق دون تطبيق</button></div>
      <p className="text-xs text-ink-500">بعد الاعتماد اضغط حفظ المنتج؛ الأسعار والنسخ لا تتغير تلقائيًا.</p>
    </div>}
    {variants.length > 0 && <div className="space-y-3"><h3 className="font-semibold">النسخ: اللون / المقاس / النوع ({variants.length})</h3><p className="text-xs text-ink-500">كل سطر تركيبة أصلية واحدة في CJ. تحقق من الشحن أولًا، ثم فعّل ما تريد بيعه فقط. الصورة تخص النسخة، ولا يُخمن ربطها من الترجمة.</p>
      {variants.map(v => <div key={v.vid} className="space-y-2 rounded-xl border border-sage-500/20 bg-white p-3">
        <div className="flex gap-3">{v.image && <Image src={v.image} alt={v.name} width={64} height={64} unoptimized className="h-16 w-16 rounded-lg object-contain" />}<div className="min-w-0 flex-1"><p className="text-sm" dir="auto">{v.name}</p><p className="break-all font-mono text-[10px]" dir="ltr">VID: {v.vid} · SKU: {v.sku}</p><p className="text-xs">المورد: ${v.supplierPriceUSD} · الشحن والرسوم: {v.shippingUSD == null ? 'غير متحقق' : `$${v.shippingUSD}`} · التكلفة: {formatSAR(v.costSAR)} · الهامش قبل التسويق: {formatSAR(v.priceSAR - v.costSAR)}</p></div></div>
        <label className="block text-xs">اسم الخيار بالعربية<input className={inputClass} value={v.labelAr} onChange={e => updateVariant(v.vid, { labelAr: e.target.value })} /></label>
        <label className="block text-xs">سعر بيع هذه النسخة بالريال<input type="number" min="0" step="0.01" className={inputClass} value={v.priceSAR} onChange={e => updateVariant(v.vid, { priceSAR: Number(e.target.value) })} /></label>
        <div className="flex flex-wrap items-center gap-3 text-xs"><button type="button" disabled={!!busy} onClick={() => verify(v)} className="rounded-lg border px-3 py-2">{busy === v.vid ? 'جارٍ التحقق...' : 'تحقق من المخزون والشحن'}</button><label className="flex items-center gap-1"><input type="checkbox" disabled={!v.checkedAt || !v.stock || !!busy} checked={v.enabled} onChange={e => updateVariant(v.vid, { enabled: e.target.checked })} />إتاحة للبيع</label></div>
        <p className="text-xs text-ink-500">{v.checkedAt ? `مخزون: ${v.stock} · ${v.origin} → SA · ${v.deliveryMin}–${v.deliveryMax} يوم · ${new Date(v.checkedAt).toLocaleString('ar-SA')}` : 'لا تُنشر هذه النسخة حتى يتم التحقق'}</p>
      </div>)}
    </div>}
  </section>;
}
