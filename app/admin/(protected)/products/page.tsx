'use client';

import { useEffect, useState } from 'react';
import {
  Package, Plus, Search, Trash2, Edit3, X, Download, ImageIcon, Eye, EyeOff,
  Save, Loader2, ExternalLink, AlertCircle,
} from 'lucide-react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { formatSAR, cn } from '@/lib/utils';

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
  free_shipping: boolean;
  estimated_delivery_days: number;
  rating: number;
  review_count: number;
  sales_count: number;
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
  free_shipping: false,
  estimated_delivery_days: 3,
  rating: 0,
  review_count: 0,
  sales_count: 0,
  active: true,
};

const audienceLabel: Record<string, string> = { women: 'للنساء', men: 'للرجال', shared: 'مشترك' };

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

  const fetchProducts = async () => {
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
  };

  useEffect(() => { fetchProducts(); }, [includeInactive]);

  const filtered = products.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.short_name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
  });

  const startCreate = () => {
    setForm(emptyForm);
    setCreating(true);
    setCjPid('');
    setCjError(null);
  };

  const startEdit = (p: Product) => {
    setForm({ ...p });
    setEditing(p);
    setCjPid('');
    setCjError(null);
  };

  const closeModal = () => {
    setCreating(false);
    setEditing(null);
    setCjError(null);
  };

  const importFromCJ = async () => {
    if (!cjPid.trim()) return;
    setCjLoading(true);
    setCjError(null);
    try {
      const res = await fetch(`/api/admin/cj/import?pid=${encodeURIComponent(cjPid.trim())}`);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'فشل الاستيراد');
      setForm({ ...emptyForm, ...data.prefill });
    } catch (e) {
      setCjError(e instanceof Error ? e.message : 'Unknown');
    } finally {
      setCjLoading(false);
    }
  };

  const save = async () => {
    if (!form.id || !form.name || !form.short_name) {
      setCjError('id و name و short_name مطلوبة');
      return;
    }
    setSaving(true);
    setCjError(null);
    try {
      const url = editing ? `/api/admin/products/${editing.id}` : '/api/admin/products';
      const method = editing ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'فشل الحفظ');
      await fetchProducts();
      closeModal();
    } catch (e) {
      setCjError(e instanceof Error ? e.message : 'Unknown');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (p: Product) => {
    if (!confirm(`حذف "${p.name}"؟\n(يمكنك استرجاعه لاحقاً بإلغاء التعطيل من Supabase)`)) return;
    try {
      const res = await fetch(`/api/admin/products/${p.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'فشل الحذف');
      await fetchProducts();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Unknown');
    }
  };

  const toggleActive = async (p: Product) => {
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
      alert(e instanceof Error ? e.message : 'Unknown');
    }
  };

  return (
    <>
      <AdminHeader title="المنتجات" subtitle={`${products.length} منتج في الكتالوج`} />

      <div className="p-6">
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
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
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
              return (
                <div
                  key={p.id}
                  className={cn(
                    'group overflow-hidden rounded-3xl border bg-linen-50 transition-opacity',
                    p.active ? 'border-sage-500/10' : 'border-ink-900/10 opacity-60'
                  )}
                >
                  <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-gradient-to-br from-sage-100 via-linen-50 to-wood-400/10">
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={img} alt={p.name} className="h-full w-full object-cover" loading="lazy" />
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
                      {p.margin ? Math.round(p.margin * 100) : Math.round(((p.price - p.cost) / p.price) * 100)}%
                    </p>
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
                        className="inline-flex items-center gap-1 rounded-full border border-sage-500/20 bg-linen-50 px-2.5 py-1.5 text-xs font-medium text-ink-700 hover:bg-sage-50"
                        title={p.active ? 'إخفاء من المتجر' : 'إظهار في المتجر'}
                      >
                        {p.active ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(p)}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-sage-500/20 bg-linen-50 p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-ink-900">
                {editing ? `تعديل: ${editing.name}` : 'منتج جديد'}
              </h2>
              <button type="button" onClick={closeModal} className="rounded-full p-1.5 text-ink-500 hover:bg-sage-50">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* CJ Import */}
            {!editing && (
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
            <div className="space-y-4">
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
                    <option value="women">للنساء</option>
                    <option value="men">للرجال</option>
                    <option value="shared">مشترك</option>
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
                  onChange={(e) => setForm({ ...form, images: e.target.value.split('\n').map(s => s.trim()).filter(Boolean) })}
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
                  <input type="number" min="1" max="30" value={form.estimated_delivery_days ?? 3} onChange={(e) => setForm({ ...form, estimated_delivery_days: Number(e.target.value) })}
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

            <div className="mt-6 flex items-center justify-end gap-2">
              <button type="button" onClick={closeModal} className="rounded-full border border-sage-500/20 bg-linen-50 px-4 py-2 text-sm font-medium text-ink-700">
                إلغاء
              </button>
              <button type="button" onClick={save} disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-full bg-sage-500 px-4 py-2 text-sm font-medium text-linen-50 hover:bg-sage-600 disabled:opacity-60">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {editing ? 'حفظ التعديلات' : 'إضافة المنتج'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-wider text-ink-500">{label}</label>
      {children}
    </div>
  );
}
