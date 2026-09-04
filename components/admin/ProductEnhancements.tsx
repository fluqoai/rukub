'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Loader2, Sparkles, RefreshCw } from 'lucide-react';
import type { CatalogVariant } from '@/lib/catalog-variants';
import type { ArabicDraft } from '@/lib/arabic-draft';
import { formatSAR } from '@/lib/utils';
import { adminJson, arabicProductPatch, matchesProductSource, productSource } from '@/lib/admin-product-editor';

type Form = { name?: string; description?: string; cj_product_id?: string | null; variants?: CatalogVariant[]; metadata?: Record<string, any> };
const inputClass = 'w-full rounded-xl border border-sage-500/20 bg-white px-3 py-2 text-sm';
export function ProductEnhancements({ form, onChange, onSave, onBusyChange, onReviewChange, mode = 'content' }: { form: Form; onChange: (patch: Record<string, any>) => void; onSave: (patch: Record<string, any>) => Promise<boolean>; onBusyChange: (busy: boolean) => void; onReviewChange: (open: boolean) => void; mode?: 'details' | 'content' | 'variants' }) {
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [generation, setGeneration] = useState<any>(null);
  const [draft, setDraft] = useState<ArabicDraft | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [success, setSuccess] = useState('');
  const [variantSearch, setVariantSearch] = useState('');
  useEffect(() => { onBusyChange(!!busy); return () => onBusyChange(false); }, [busy, onBusyChange]);
  const reviewing = !!draft;
  useEffect(() => { onReviewChange(reviewing); return () => onReviewChange(false); }, [reviewing, onReviewChange]);
  const variants = form.metadata?.variant_schema === 1 ? form.variants || [] : [];
  const updateVariant = (vid: string, patch: Partial<CatalogVariant>) => onChange({ variants: variants.map(v => v.vid === vid ? { ...v, ...patch } : v) });
  async function verify(v: CatalogVariant) {
    setBusy(v.vid); setError('');
    try {
      const data = await adminJson(`/api/admin/cj/variant?pid=${encodeURIComponent(v.pid)}&vid=${encodeURIComponent(v.vid)}`);
      updateVariant(v.vid, { ...data.variant, labelAr: v.labelAr, enabled: v.enabled,
        priceSAR: v.priceSAR > data.variant.costSAR ? v.priceSAR : data.variant.priceSAR });
      setSuccess('تم تحديث المخزون والتكلفة. راجع سعر البيع ثم فعّل الخيار المطلوب.');
    } catch (e) { setError(e instanceof Error ? e.message : 'تعذر التحقق'); }
    finally { setBusy(''); }
  }
  async function importVariants() {
    if (!confirm('سيتم جلب النسخ كمراجعة جديدة غير مفعلة. فعّل النسخ المطلوبة بعد التحقق ثم احفظ المنتج.')) return;
    setBusy('import'); setError('');
    try {
      const data = await adminJson(`/api/admin/cj/import?pid=${encodeURIComponent(form.cj_product_id || '')}`);
      onChange({ variants: data.prefill.variants, metadata: { ...form.metadata, ...data.prefill.metadata }, active: false });
    } catch (e) { setError(e instanceof Error ? e.message : 'تعذر الاستيراد'); } finally { setBusy(''); }
  }
  async function translate() {
    setBusy('ai'); setError('');
    try {
      setSuccess('');
      const data = await adminJson('/api/admin/ai/arabic', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(productSource(form)) });
      setGeneration(data.generation); setDraft(data.generation.draft);
    } catch (e) { setError(e instanceof Error ? e.message : 'تعذر التعريب'); } finally { setBusy(''); }
  }
  async function applyDraft(saveNow = false) {
    if (!draft) return;
    setError('');
    try {
      const patch = arabicProductPatch(form, generation, draft);
      if (saveNow) { if (!await onSave(patch)) return; }
      else { onChange(patch); setSuccess('تم تطبيق التعريب في النموذج فقط. اضغط حفظ المنتج بالأسفل لحفظه في قاعدة البيانات.'); }
      setDraft(null);
    } catch (e) { setError(e instanceof Error ? e.message : 'تعذر تطبيق المسودة'); }
  }
  return <section hidden={mode === 'details'} className="space-y-5">
    <div className="rounded-2xl border border-sage-500/15 bg-white p-5"><p className="mb-2 text-xs font-medium text-sage-600">{mode === 'content' ? 'محتوى عربي يليق بمتجرك' : 'خيارات المورد والأسعار'}</p><h3 className="text-xl font-semibold text-ink-900">{mode === 'content' ? 'من بيانات المورد إلى وصف واضح' : 'كل لون ومقاس، ببياناته الحقيقية'}</h3><p className="mt-2 text-sm leading-7 text-ink-500">{mode === 'content' ? 'جهّز المسودة، راجع المعلومات، ثم احفظ التعريب والمنتج معًا. لا يتغير سعر المنتج أو ربطه بالمورد.' : 'تحقق من الشحن والمخزون، حدد سعر البيع، ثم فعّل الخيارات التي تريد بيعها فقط.'}</p></div>
    {mode === 'content' && <>
    <div className="flex flex-wrap gap-2">
      <button type="button" disabled={!!busy || !form.name || variants.length > 40} onClick={translate} className="inline-flex items-center gap-2 rounded-xl bg-sage-600 px-4 py-3 text-sm font-medium text-white disabled:opacity-50">{busy === 'ai' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}{busy === 'ai' ? 'جارٍ تجهيز المسودة…' : 'تجهيز المحتوى بالعربية'}</button>
      <button type="button" disabled={!!busy} className="rounded-xl border bg-white px-4 py-3 text-sm" onClick={async () => { setBusy('history'); setError(''); try { const d = await adminJson('/api/admin/ai/arabic'); setHistory(d.generations.filter((g: any) => matchesProductSource(form, g.source))); setHistoryOpen(true); } catch (e) { setError(e instanceof Error ? e.message : 'تعذر تحميل المسودات'); } finally { setBusy(''); } }}>مسودات هذا المنتج</button>
    </div>
    <p className="text-xs leading-6 text-ink-500">التعريب مسودة للمراجعة، وليس نشرًا تلقائيًا. لا يغير السعر أو PID أو VID. الحد الأولي: 20 طلبًا يوميًا و100 إجمالًا. الطلب المطابق يُسترجع دون تكلفة جديدة.</p>
    {!form.name && <p className="text-sm text-amber-800">أدخل اسم المنتج ووصفه في قسم بيانات المنتج، أو استورده من CJ أولًا.</p>}
    {variants.length > 40 && <p role="alert" className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">هذا المنتج يحتوي على أكثر من 40 خيارًا؛ التعريب الآلي غير متاح له حاليًا. يمكنك تحرير المحتوى وأسماء الخيارات يدويًا.</p>}
    {historyOpen && <div className="space-y-2 rounded-2xl border bg-white p-4"><div className="flex items-center justify-between"><h4 className="text-sm font-semibold">مسودات مطابقة لهذا المصدر</h4><button type="button" onClick={() => setHistoryOpen(false)} className="rounded-lg border px-3 py-2 text-xs">إغلاق السجل</button></div>{history.length === 0 && <p className="py-3 text-sm text-ink-500">لا توجد مسودات مطابقة بعد. يمكنك تجهيز مسودة عربية جديدة.</p>}{history.map(g => <div key={g.id} className="flex items-center justify-between gap-2 rounded-xl bg-linen-50 p-3 text-xs"><span>{g.source?.name?.slice(0,60)} · {g.status === 'complete' ? 'جاهزة للمراجعة' : g.status === 'error' ? 'تعذر التوليد' : 'قيد المعالجة'}</span>{g.status === 'complete' && <button type="button" className="shrink-0 rounded-lg border bg-white px-3 py-2" onClick={() => { setGeneration(g); setDraft(g.draft); setHistoryOpen(false); setSuccess(''); }}>فتح المسودة</button>}{g.status === 'error' && <span>{g.error}</span>}</div>)}</div>}
    {draft && <div className="space-y-3 rounded-2xl border bg-white p-4">
      <h3 className="font-semibold">راجع المسودة قبل اعتمادها</h3>
      <p className="text-xs">{generation.model} · التكلفة المسجلة: {generation.costUSD != null ? `$${Number(generation.costUSD).toFixed(6)}` : 'لم تُرجعها المنصة'} {generation.cached ? '· مسترجعة دون توليد جديد' : ''}</p>
      <a href={`/api/admin/ai/arabic?id=${generation.id}`} target="_blank" rel="noreferrer" className="text-xs text-sage-700 underline">سجل المسودة والاستهلاك</a>
      {(['name','short_name','tagline','description','usage','seo_title','seo_description'] as const).map((field, i) => <label key={field} className="block text-xs">{['الاسم','الاسم المختصر','الشعار','الوصف','طريقة الاستخدام','عنوان SEO','وصف SEO'][i]}<textarea className={inputClass} rows={field === 'description' ? 4 : 2} value={draft[field]} onChange={e => setDraft({ ...draft, [field]: e.target.value })} /></label>)}
      <label className="block text-xs">المميزات — سطر لكل ميزة<textarea className={inputClass} value={draft.features.join('\n')} onChange={e => setDraft({ ...draft, features: e.target.value.split('\n') })} /></label>
      {draft.specifications.map((s, i) => <div key={i} className="grid grid-cols-2 gap-2"><input aria-label="اسم المواصفة" className={inputClass} value={s.label} onChange={e => setDraft({ ...draft, specifications: draft.specifications.map((x,j) => j===i ? {...x,label:e.target.value}:x) })} /><input aria-label="قيمة المواصفة" className={inputClass} value={s.value} onChange={e => setDraft({ ...draft, specifications: draft.specifications.map((x,j) => j===i ? {...x,value:e.target.value}:x) })} /></div>)}
      {draft.variants.map((v, i) => <label key={v.vid} className="block text-xs">{variants.find(s => s.vid === v.vid)?.name || v.vid}<input className={inputClass} value={v.labelAr} onChange={e => setDraft({ ...draft, variants: draft.variants.map((x,j) => i===j ? {...x,labelAr:e.target.value}:x) })} /></label>)}
      {draft.warnings.length > 0 && <ul className="list-inside list-disc text-xs text-amber-800">{draft.warnings.map((w,i) => <li key={i}>{w}</li>)}</ul>}
      <div className="flex flex-wrap gap-2"><button type="button" onClick={() => applyDraft(true)} className="rounded-xl bg-sage-600 px-4 py-3 text-sm font-medium text-white">اعتماد التعريب وحفظ المنتج</button><button type="button" onClick={() => applyDraft()} className="rounded-xl border px-4 py-3 text-sm">تطبيق في النموذج فقط</button><button type="button" onClick={() => { if (confirm('إغلاق مراجعة المسودة؟ التعديلات اليدوية غير المطبقة لن تُحفظ.')) setDraft(null); }} className="rounded-xl px-3 py-2 text-xs text-ink-500">إغلاق دون تطبيق</button></div>
      <p className="text-xs leading-6 text-ink-500">راجع المعلومات قبل الاعتماد. الحفظ يحترم حالة المنتج الحالية: المسودة لا تُنشر تلقائيًا. تبقى أسعار الخيارات وربطها بالمورد كما هي.</p>
    </div>}
    </>}
    {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    {success && <p role="status" className="rounded-xl border border-sage-500/20 bg-sage-50 p-4 text-sm text-sage-700">{success}</p>}
    {mode === 'variants' && !variants.length && <div className="rounded-2xl border border-dashed p-6 text-center"><p className="mb-4 text-sm text-ink-500">لا توجد خيارات بديلة لهذا المنتج. الباقات ذات المكونات الثابتة تبقى على ربطها الحالي.</p>{form.cj_product_id && (!form.metadata?.supplier_items || form.metadata.supplier_items.length <= 1) && <button type="button" disabled={!!busy} onClick={importVariants} className="inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-3 text-sm"><RefreshCw className="h-4 w-4" />جلب خيارات CJ لهذا المنتج</button>}</div>}
    {mode === 'variants' && variants.length > 0 && <div className="space-y-3"><div className="flex flex-wrap items-center justify-between gap-3"><h3 className="font-semibold">{variants.length} خيار · {variants.filter(v => v.enabled).length} متاح للبيع</h3><input aria-label="بحث في خيارات المنتج" placeholder="ابحث باللون أو المقاس…" className="rounded-xl border bg-white px-3 py-2 text-sm" value={variantSearch} onChange={e => setVariantSearch(e.target.value)} /></div>
      {variants.filter(v => `${v.name} ${v.labelAr} ${v.sku}`.toLowerCase().includes(variantSearch.toLowerCase())).map(v => <div key={v.vid} className="space-y-3 rounded-2xl border border-sage-500/20 bg-white p-4">
        <div className="flex gap-3">{v.image && <Image src={v.image} alt={v.name} width={64} height={64} unoptimized className="h-16 w-16 rounded-lg object-contain" />}<div className="min-w-0 flex-1"><p className="text-sm" dir="auto">{v.name}</p><p className="break-all font-mono text-[10px]" dir="ltr">VID: {v.vid} · SKU: {v.sku}</p><p className="text-xs">المورد: ${v.supplierPriceUSD} · الشحن والرسوم: {v.shippingUSD == null ? 'غير متحقق' : `$${v.shippingUSD}`} · التكلفة: {formatSAR(v.costSAR)} · الهامش قبل التسويق: {formatSAR(v.priceSAR - v.costSAR)}</p></div></div>
        <label className="block text-xs">اسم الخيار بالعربية<input className={inputClass} value={v.labelAr} onChange={e => updateVariant(v.vid, { labelAr: e.target.value })} /></label>
        <label className="block text-xs">سعر بيع هذه النسخة بالريال<input type="number" min="0" step="0.01" className={inputClass} value={v.priceSAR} onChange={e => updateVariant(v.vid, { priceSAR: Number(e.target.value) })} /></label>
        <div className="flex flex-wrap items-center gap-3 text-xs"><button type="button" disabled={!!busy} onClick={() => verify(v)} className="rounded-lg border px-3 py-2">{busy === v.vid ? 'جارٍ التحقق...' : 'تحقق من المخزون والشحن'}</button><label className="flex items-center gap-1"><input type="checkbox" disabled={!v.checkedAt || !v.stock || !!busy} checked={v.enabled} onChange={e => updateVariant(v.vid, { enabled: e.target.checked })} />إتاحة للبيع</label></div>
        <p className="text-xs text-ink-500">{v.checkedAt ? `مخزون: ${v.stock} · ${v.origin} → SA · ${v.deliveryMin}–${v.deliveryMax} يوم · ${new Date(v.checkedAt).toLocaleString('ar-SA')}` : 'لا تُنشر هذه النسخة حتى يتم التحقق'}</p>
      </div>)}
    </div>}
  </section>;
}
