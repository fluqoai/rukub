'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Package, Plus, Search, Trash2, Edit3, X, Download, ImageIcon, Eye, EyeOff,
  Save, Loader2, ExternalLink, AlertCircle,
} from 'lucide-react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { formatSAR, cn } from '@/lib/utils';
import { ProductEnhancements } from '@/components/admin/ProductEnhancements';
import type { CatalogVariant } from '@/lib/catalog-variants';
import { adminJson, productFormError } from '@/lib/admin-product-editor';

type Product = {
  id: string;
  name: string;
  short_name: string;
  name_ar: string | null;
  description: string;
  tagline: string;
  audience: 'women' | 'men' | 'shared';
  audience_label: string;
  price: number;
  old_price: number | null;
  cost: number;
  margin: number | null;
  badge: string | null;
  tier: number;
  is_hero: boolean;
  cj_product_id: string | null;
  category_name: string | null;
  brand: string | null;
  weight: number | null;
  images: string[];
  variants: CatalogVariant[];
  free_shipping: boolean;
  estimated_delivery_days: number;
  rating: number;
  review_count: number;
  sales_count: number;
  metadata: Record<string, any>;
  active: boolean;
  updated_at?: string;
};

type Prefill = Partial<Product>;

const emptyForm: Prefill = {
  id: '',
  name: '',
  short_name: '',
  name_ar: '',
  description: '',
  tagline: '',
  audience: 'shared',
  audience_label: 'مشترك',
  price: 0,
  old_price: 0,
  cost: 0,
  badge: '',
  tier: 1,
  is_hero: false,
  cj_product_id: '',
  category_name: '',
  brand: '',
  weight: 0,
  images: [],
  variants: [],
  free_shipping: false,
  estimated_delivery_days: 14,
  rating: 0,
  review_count: 0,
  sales_count: 0,
  metadata: {},
  active: false,
};

const audienceLabel: Record<string, string> = { women: 'ترتيب وأناقة', men: 'تقنية واستعداد', shared: 'العناية اليومية' };

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [includeInactive, setIncludeInactive] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Prefill>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [cjPid, setCjPid] = useState('');
  const [cjLoading, setCjLoading] = useState(false);
  const [cjError, setCjError] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [editorTab, setEditorTab] = useState<'details' | 'content' | 'variants'>('details');
  const [enhancing, setEnhancing] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [rowBusy, setRowBusy] = useState('');
  const [initialForm, setInitialForm] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);
  const isOpen = creating || !!editing;
  const working = saving || cjLoading || enhancing;
  const dirty = isOpen && (JSON.stringify(form) !== initialForm || reviewOpen);
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();
    return () => { document.body.style.overflow = overflow; previous?.focus(); };
  }, [isOpen]);
  useEffect(() => {
    if (!dirty) return;
    const prevent = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', prevent);
    return () => window.removeEventListener('beforeunload', prevent);
  }, [dirty]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/products?includeInactive=${includeInactive ? 1 : 0}`);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'فشل التحميل');
      setProducts(data.products);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown');
    } finally {
      setLoading(false);
    }
  }, [includeInactive]);

  useEffect(() => { void fetchProducts(); }, [fetchProducts]);

  const filtered = products.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.short_name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
  });

  const startCreate = () => {
    const fresh = { ...emptyForm, id: `product-${crypto.randomUUID().slice(0, 8)}` };
    setForm(fresh);
    setInitialForm(JSON.stringify(fresh)); setEditorTab('details'); setNotice('');
    setCreating(true);
    setCjPid('');
    setCjError(null);
  };

  const startEdit = (p: Product) => {
    setForm({ ...p });
    setInitialForm(JSON.stringify(p)); setEditorTab('details'); setNotice('');
    setEditing(p);
    setCjPid('');
    setCjError(null);
  };

  const closeModal = () => {
    if (working) return;
    if (dirty && !confirm('لديك تغييرات غير محفوظة. هل تريد إغلاق المحرر دون حفظها؟')) return;
    setCreating(false);
    setEditing(null);
    setCjError(null);
  };

  const importFromCJ = async () => {
    if (!cjPid.trim()) return;
    if (dirty && !confirm('سيستبدل الاستيراد بيانات النموذج الحالي. هل تريد المتابعة؟')) return;
    setCjLoading(true);
    setCjError(null);
    try {
      const data = await adminJson(`/api/admin/cj/import?pid=${encodeURIComponent(cjPid.trim())}`);
      const existing = products.find(p => p.id === data.prefill.id);
      if (existing) { setCjError('هذا المنتج موجود بالفعل في الكتالوج. أغلق المحرر وابحث عنه ثم اختر تعديل.'); return; }
      setForm({ ...emptyForm, ...data.prefill });
      setEditorTab('content');
    } catch (e) {
      setCjError(e instanceof Error ? e.message : 'Unknown');
    } finally {
      setCjLoading(false);
    }
  };

  const save = async (patch: Prefill = {}): Promise<boolean> => {
    if (saving || cjLoading || enhancing) return false;
    if (reviewOpen && !patch.metadata?.ai_generation_id) {
      setEditorTab('content');
      setCjError('مسودة التعريب لم تُعتمد بعد. اضغط «اعتماد التعريب وحفظ المنتج» لحفظ النص العربي الذي تراجعه.');
      return false;
    }
    const next = { ...form, ...patch, images: (patch.images ?? form.images ?? []).map(url => url.trim()).filter(Boolean) };
    setForm(next);
    const validation = productFormError(next);
    if (validation) { setCjError(validation); return false; }
    setSaving(true);
    setCjError(null);
    try {
      const url = editing ? `/api/admin/products/${encodeURIComponent(editing.id)}` : '/api/admin/products';
      const method = editing ? 'PATCH' : 'POST';
      const data = await adminJson(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(next),
      });
      setNotice(`تم حفظ «${data.product.name}» ${data.product.active ? 'وهو ظاهر في المتجر' : 'كمسودة غير منشورة'}.`);
      setCreating(false); setEditing(null);
      await fetchProducts();
      return true;
    } catch (e) {
      setCjError(e instanceof Error ? e.message : 'Unknown');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const remove = async (p: Product) => {
    if (!confirm(`أرشفة «${p.name}» وإخفاؤه من المتجر؟ يمكنك إظهاره مجددًا من هذه اللوحة.`)) return;
    setRowBusy(p.id);
    try {
      const res = await fetch(`/api/admin/products/${p.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'فشل الحذف');
      await fetchProducts();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'تعذرت الأرشفة');
    } finally { setRowBusy(''); }
  };

  const toggleActive = async (p: Product) => {
    setRowBusy(p.id);
    try {
      const res = await fetch(`/api/admin/products/${p.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !p.active }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'فشل التحديث');
      await fetchProducts();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'تعذر تغيير حالة المنتج');
    } finally { setRowBusy(''); }
  };

  return (
    <>
      <AdminHeader title="كتالوج المنتجات" subtitle="إدارة المحتوى والأسعار وخيارات المورد" onRefresh={fetchProducts} />

      <div className="mx-auto max-w-[1600px] p-4 md:p-8">
        <div className="mb-6 grid grid-cols-3 gap-3">
          {[['المنتجات', products.length], ['ظاهرة في المتجر', products.filter(p => p.active).length], ['مسودات / مؤرشفة', products.filter(p => !p.active).length]].map(([label, value]) => <div key={label} className="rounded-2xl border border-sage-500/10 bg-white p-3 md:p-5"><p className="text-xs text-ink-500">{label}</p><p className="mt-2 text-2xl font-semibold text-ink-900">{value}</p></div>)}
        </div>
        {notice && <p role="status" className="mb-4 rounded-xl border border-sage-500/20 bg-sage-50 p-4 text-sm text-sage-700">{notice}</p>}
        {/* Action bar */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="flex flex-1 items-center gap-2 rounded-2xl border border-sage-500/10 bg-linen-50 px-3 py-2">
            <Search className="h-4 w-4 text-ink-500" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث بالاسم أو المعرّف..."
              className="flex-1 border-none bg-transparent text-sm focus:outline-none"
            />
          </div>
          <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs text-ink-500">
            <input
              type="checkbox"
              checked={includeInactive}
              onChange={(e) => setIncludeInactive(e.target.checked)}
              className="rounded"
            />
            عرض المعطّلة
          </label>
          <button
            type="button"
            onClick={startCreate}
            className="inline-flex items-center gap-1.5 rounded-full bg-sage-500 px-4 py-2 text-sm font-medium text-linen-50 hover:bg-sage-600"
          >
            <Plus className="h-4 w-4" />
            منتج جديد
          </button>
        </div>

        {error && (
          <div role="alert" className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-sage-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-sage-500/10 bg-linen-50 p-12 text-center">
            <Package className="mx-auto h-12 w-12 text-ink-300" strokeWidth={1.25} />
            <p className="mt-3 text-sm text-ink-500">
              {products.length === 0 ? 'لا توجد منتجات بعد. أضف منتجك الأول.' : 'لا نتائج للبحث.'}
            </p>
            {products.length === 0 && (
              <button
                type="button"
                onClick={startCreate}
                className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-sage-500 px-4 py-2 text-sm font-medium text-linen-50 hover:bg-sage-600"
              >
                <Plus className="h-4 w-4" />
                أضف منتج
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p) => {
              const img = p.images?.[0];
              const supplier = p.metadata ?? {};
              return (
                <div
                  key={p.id}
                  className={cn(
                    'group overflow-hidden rounded-2xl border bg-white transition-shadow hover:shadow-md',
                    p.active ? 'border-sage-500/20' : 'border-ink-900/10'
                  )}
                >
                  <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-gradient-to-br from-sage-100 via-linen-50 to-wood-400/10">
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={img} alt={p.name} className="h-full w-full object-contain p-3" loading="lazy" />
                    ) : (
                      <ImageIcon className="h-12 w-12 text-ink-300" strokeWidth={1.25} />
                    )}
                    {p.cj_product_id && (
                      <span className="absolute end-2 top-2 inline-flex items-center gap-1 rounded-full bg-ink-900/80 px-2 py-0.5 text-[10px] text-linen-50">
                        CJ
                      </span>
                    )}
                    {!p.active && (
                      <span className="absolute start-2 top-2 inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] text-red-700">
                        معطّل
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="line-clamp-2 text-sm font-medium text-ink-900">{p.name}</p>
                    <p className="mt-0.5 line-clamp-1 text-[10px] text-ink-500">{p.tagline}</p>
                    <div className="mt-3 flex items-baseline justify-between">
                      <span className="font-mono text-sm font-semibold text-ink-900">
                        {formatSAR(p.price)}
                      </span>
                      <span className="rounded-full bg-sage-50 px-2 py-0.5 text-[10px] font-medium text-sage-700">
                        {audienceLabel[p.audience] ?? p.audience_label}
                      </span>
                    </div>
                    <p className="mt-1 font-mono text-[10px] text-ink-500">
                      SKU: {p.id} · تكلفة: {formatSAR(p.cost)} · هامش:{' '}
                      {p.price > 0 ? Math.round(((p.price - p.cost) / p.price) * 100) : 0}%
                    </p>
                    {supplier.supplier === 'CJdropshipping' && (
                      <p className="mt-1 text-[10px] leading-5 text-ink-500" dir="ltr">
                        CJ ${Number(supplier.supplier_price_usd ?? 0).toFixed(2)} + shipping ${Number(supplier.shipping_price_usd ?? 0).toFixed(2)} · {supplier.shipping_origin ?? '—'}→SA · {supplier.delivery_min_days ?? '—'}–{supplier.delivery_max_days ?? '—'} days
                      </p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => startEdit(p)}
                        className="inline-flex flex-1 items-center justify-center gap-1 rounded-full bg-sage-500/10 px-2.5 py-1.5 text-xs font-medium text-sage-700 hover:bg-sage-500/20"
                      >
                        <Edit3 className="h-3 w-3" />
                        تعديل
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleActive(p)}
                        disabled={!!rowBusy}
                        aria-label={p.active ? 'إخفاء من المتجر' : 'إظهار في المتجر'}
                        className="inline-flex items-center gap-1 rounded-full border border-sage-500/20 bg-linen-50 px-2.5 py-1.5 text-xs font-medium text-ink-700 hover:bg-sage-50"
                        title={p.active ? 'إخفاء من المتجر' : 'إظهار في المتجر'}
                      >
                        {p.active ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(p)}
                        disabled={!!rowBusy || !p.active}
                        aria-label={`أرشفة ${p.name}`}
                        title="أرشفة وإخفاء المنتج"
                        className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {(creating || editing) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/60 p-0 backdrop-blur-sm sm:p-5">
          <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="product-editor-title" tabIndex={-1}
            onKeyDown={event => {
              if (event.key === 'Escape') { event.preventDefault(); closeModal(); }
              if (event.key === 'Tab') {
                const items = [...(dialogRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href]') || [])].filter(el => el.getClientRects().length && !el.closest('fieldset:disabled'));
                const first = items[0], last = items[items.length - 1];
                if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) { event.preventDefault(); last?.focus(); }
                else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
              }
            }} className="flex h-[100dvh] w-full max-w-5xl flex-col overflow-hidden bg-white shadow-2xl outline-none sm:h-[92dvh] sm:rounded-3xl">
            <div className="flex shrink-0 items-center justify-between border-b border-sage-500/10 px-5 py-4 md:px-8">
              <div><p className="mb-1 text-xs text-sage-600">ركوب / إدارة الكتالوج</p><h2 id="product-editor-title" className="text-lg font-semibold text-ink-900">
                {editing ? `تعديل: ${editing.name}` : 'منتج جديد'}
              </h2></div>
              <button type="button" disabled={working} aria-label="إغلاق محرر المنتج" onClick={closeModal} className="rounded-xl p-3 text-ink-500 hover:bg-sage-50 disabled:opacity-40">
                <X className="h-4 w-4" />
              </button>
            </div>
            <nav aria-label="أقسام تحرير المنتج" className="flex shrink-0 gap-2 border-b border-sage-500/10 bg-linen-50 px-4 py-3 md:px-8">
              {([['details', 'بيانات المنتج'], ['content', 'التعريب والمحتوى'], ['variants', 'الخيارات والتكلفة']] as const).map(([tab, label]) => <button key={tab} type="button" aria-pressed={editorTab === tab} onClick={() => setEditorTab(tab)} className={cn('flex-1 rounded-xl px-2 py-3 text-xs font-medium transition-colors sm:flex-none sm:px-6 sm:text-sm', editorTab === tab ? 'bg-ink-900 text-white' : 'text-ink-500 hover:bg-white')}>{label}</button>)}
            </nav>
            <div className="min-h-0 flex-1 overflow-y-auto bg-linen-50/40 px-5 py-5 md:px-8">
            <fieldset disabled={working} onChange={() => setCjError(null)} className="min-w-0">

            {/* CJ Import */}
            {!editing && editorTab === 'details' && (
              <div className="mb-5 rounded-2xl border border-sage-500/20 bg-sage-50/40 p-3">
                <div className="mb-2 flex items-center gap-2 text-xs font-medium text-sage-700">
                  <Download className="h-3.5 w-3.5" />
                  استيراد من CJ Dropshipping
                </div>
                <p className="mb-2 text-[10px] text-ink-500">
                  افتح cjdropshipping.com، اختر المنتج، انسخ الـ pid (من URL أو رقم المنتج)، ألصقه هنا.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    aria-label="معرّف منتج CJ"
                    value={cjPid}
                    onChange={(e) => setCjPid(e.target.value)}
                    placeholder="مثال: 2609021303401604300"
                    className="flex-1 rounded-xl border border-sage-500/20 bg-linen-50 px-3 py-2 text-sm focus:border-sage-500 focus:outline-none"
                    dir="ltr"
                  />
                  <a
                    href="https://cjdropshipping.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-xl border border-sage-500/20 bg-linen-50 px-3 py-2 text-xs text-ink-700 hover:bg-sage-50"
                  >
                    <ExternalLink className="h-3 w-3" />
                    CJ
                  </a>
                  <button
                    type="button"
                    onClick={importFromCJ}
                    disabled={cjLoading || !cjPid.trim()}
                    className="inline-flex items-center gap-1 rounded-xl bg-sage-500 px-3 py-2 text-xs font-medium text-linen-50 hover:bg-sage-600 disabled:opacity-60"
                  >
                    {cjLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
                    استيراد
                  </button>
                </div>
                {cjError && (
                  <div className="mt-2 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-2 text-[10px] text-red-700">
                    <AlertCircle className="mt-0.5 h-3 w-3 flex-shrink-0" />
                    <span>{cjError}</span>
                  </div>
                )}
              </div>
            )}

            {/* Form */}
            <ProductEnhancements key={form.cj_product_id || editing?.id || 'new'} mode={editorTab} form={form} onReviewChange={setReviewOpen} onBusyChange={setEnhancing} onSave={save} onChange={(patch) => { setCjError(null); setForm(previous => ({ ...previous, ...patch })); }} />
            <div hidden={editorTab !== 'details'} className="space-y-5 rounded-2xl border border-sage-500/10 bg-white p-4 md:p-6">
              <div><h3 className="font-semibold">معلومات المنتج</h3><p className="mt-1 text-xs leading-6 text-ink-500">احفظ المنتج كمسودة أولًا، ثم راجع المحتوى والخيارات قبل إظهاره في المتجر.</p></div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="المعرّف (slug)">
                  <input value={form.id ?? ''} onChange={(e) => setForm({ ...form, id: e.target.value })} disabled={!!editing}
                    placeholder="p_car_charger_01 أو CJ-2609021303401604300"
                    className="w-full rounded-xl border border-sage-500/20 bg-linen-50 px-3 py-2 text-sm focus:border-sage-500 focus:outline-none disabled:opacity-60"
                    dir="ltr" />
                </Field>
                <Field label="الفئة">
                  <select value={form.audience ?? 'shared'} onChange={(e) => setForm({ ...form, audience: e.target.value as any, audience_label: audienceLabel[e.target.value] })}
                    className="w-full rounded-xl border border-sage-500/20 bg-linen-50 px-3 py-2 text-sm focus:border-sage-500 focus:outline-none">
                    <option value="women">ترتيب وأناقة</option>
                    <option value="men">تقنية واستعداد</option>
                    <option value="shared">العناية اليومية</option>
                  </select>
                </Field>
              </div>

              <Field label="الاسم (يظهر في المتجر)">
                <input value={form.name ?? ''} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-xl border border-sage-500/20 bg-linen-50 px-3 py-2 text-sm focus:border-sage-500 focus:outline-none" />
              </Field>
              <Field label="الاسم المختصر">
                <input value={form.short_name ?? ''} onChange={(e) => setForm({ ...form, short_name: e.target.value })}
                  className="w-full rounded-xl border border-sage-500/20 bg-linen-50 px-3 py-2 text-sm focus:border-sage-500 focus:outline-none" />
              </Field>
              <Field label="الشعار (يظهر تحت الاسم)">
                <input value={form.tagline ?? ''} onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                  className="w-full rounded-xl border border-sage-500/20 bg-linen-50 px-3 py-2 text-sm focus:border-sage-500 focus:outline-none" />
              </Field>
              <Field label="الوصف">
                <textarea value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3}
                  className="w-full rounded-xl border border-sage-500/20 bg-linen-50 px-3 py-2 text-sm focus:border-sage-500 focus:outline-none" />
              </Field>

              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="سعر البيع (SAR)">
                  <input type="number" step="0.01" value={form.price ?? 0} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                    className="w-full rounded-xl border border-sage-500/20 bg-linen-50 px-3 py-2 text-sm focus:border-sage-500 focus:outline-none" dir="ltr" />
                </Field>
                <Field label="التكلفة (SAR)">
                  <input type="number" step="0.01" value={form.cost ?? 0} onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })}
                    className="w-full rounded-xl border border-sage-500/20 bg-linen-50 px-3 py-2 text-sm focus:border-sage-500 focus:outline-none" dir="ltr" />
                </Field>
                <Field label="السعر القديم (اختياري)">
                  <input type="number" step="0.01" value={form.old_price ?? 0} onChange={(e) => setForm({ ...form, old_price: Number(e.target.value) })}
                    className="w-full rounded-xl border border-sage-500/20 bg-linen-50 px-3 py-2 text-sm focus:border-sage-500 focus:outline-none" dir="ltr" />
                </Field>
              </div>

              <Field label="روابط الصور (سطر لكل رابط)">
                <textarea
                  value={(form.images ?? []).join('\n')}
                  onChange={(e) => setForm({ ...form, images: e.target.value.split('\n') })}
                  rows={3}
                  placeholder="https://cf.cjdropshipping.com/...&#10;https://cf.cjdropshipping.com/..."
                  className="w-full rounded-xl border border-sage-500/20 bg-linen-50 px-3 py-2 text-sm focus:border-sage-500 focus:outline-none"
                  dir="ltr"
                />
                {form.images && form.images[0] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.images[0]} alt="معاينة" className="mt-2 h-24 w-24 rounded-xl object-cover" />
                )}
              </Field>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="الشارة (اختياري)">
                  <input value={form.badge ?? ''} onChange={(e) => setForm({ ...form, badge: e.target.value || null })}
                    placeholder="الأكثر مبيعاً / جديد"
                    className="w-full rounded-xl border border-sage-500/20 bg-linen-50 px-3 py-2 text-sm focus:border-sage-500 focus:outline-none" />
                </Field>
                <Field label="المستوى (1-4)">
                  <select value={form.tier ?? 1} onChange={(e) => setForm({ ...form, tier: Number(e.target.value) })}
                    className="w-full rounded-xl border border-sage-500/20 bg-linen-50 px-3 py-2 text-sm focus:border-sage-500 focus:outline-none">
                    <option value="1">1 (دخولي)</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4 (بريميوم)</option>
                  </select>
                </Field>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="الفئة عند CJ">
                  <input value={form.category_name ?? ''} onChange={(e) => setForm({ ...form, category_name: e.target.value || null })}
                    className="w-full rounded-xl border border-sage-500/20 bg-linen-50 px-3 py-2 text-sm focus:border-sage-500 focus:outline-none" />
                </Field>
                <Field label="البراند">
                  <input value={form.brand ?? ''} onChange={(e) => setForm({ ...form, brand: e.target.value || null })}
                    className="w-full rounded-xl border border-sage-500/20 bg-linen-50 px-3 py-2 text-sm focus:border-sage-500 focus:outline-none" />
                </Field>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="أيام التوصيل">
                  <input type="number" min="1" max="45" value={form.estimated_delivery_days ?? 14} onChange={(e) => setForm({ ...form, estimated_delivery_days: Number(e.target.value) })}
                    className="w-full rounded-xl border border-sage-500/20 bg-linen-50 px-3 py-2 text-sm focus:border-sage-500 focus:outline-none" dir="ltr" />
                </Field>
                <Field label="الوزن (غرام)">
                  <input type="number" min="0" value={form.weight ?? 0} onChange={(e) => setForm({ ...form, weight: Number(e.target.value) })}
                    className="w-full rounded-xl border border-sage-500/20 bg-linen-50 px-3 py-2 text-sm focus:border-sage-500 focus:outline-none" dir="ltr" />
                </Field>
              </div>

              <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-sage-500/10 bg-linen-100/40 p-3 text-sm">
                <label className="inline-flex cursor-pointer items-center gap-2">
                  <input type="checkbox" checked={!!form.is_hero} onChange={(e) => setForm({ ...form, is_hero: e.target.checked })} className="rounded" />
                  <span>مميّز (Hero)</span>
                </label>
                <label className="inline-flex cursor-pointer items-center gap-2">
                  <input type="checkbox" checked={!!form.free_shipping} onChange={(e) => setForm({ ...form, free_shipping: e.target.checked })} className="rounded" />
                  <span>شحن مجاني</span>
                </label>
                <label className="inline-flex cursor-pointer items-center gap-2">
                  <input type="checkbox" checked={!!form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="rounded" />
                  <span>نشط (يظهر في المتجر)</span>
                </label>
              </div>

              {form.cj_product_id && (
                <div className="rounded-2xl bg-sage-50/40 p-2 font-mono text-[10px] text-ink-500">
                  CJ pid: {form.cj_product_id}
                </div>
              )}
            </div>

            </fieldset>
            </div>
            <div className="shrink-0 border-t border-sage-500/15 bg-white px-5 py-4 md:px-8">
              {cjError && <div role="alert" className="mb-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{cjError}</span></div>}
              <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-ink-500" role="status">{working ? 'جارٍ إكمال العملية…' : dirty ? 'تغييرات غير محفوظة' : 'جاهز للتحرير'} · {form.active ? 'سيظهر في المتجر' : 'مسودة غير منشورة'}</p>
              <div className="flex gap-2"><button type="button" disabled={working} onClick={closeModal} className="rounded-xl border border-sage-500/20 bg-white px-4 py-2.5 text-sm font-medium text-ink-700 disabled:opacity-40">
                إغلاق
              </button>
              <button type="button" onClick={() => save()} disabled={working}
                className="inline-flex items-center gap-2 rounded-xl bg-sage-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-sage-700 disabled:opacity-60">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? 'جارٍ الحفظ…' : form.active ? 'حفظ المنتج' : 'حفظ المسودة'}
              </button>
              </div></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-xs font-medium text-ink-700">{label}</span>
      {children}
    </label>
  );
}
