import { catalogVariants, validateVariants } from './catalog-variants';
import { validateArabicDraft, type ArabicDraft } from './arabic-draft';

type Source = { name: string; description: string; variants: { vid: string; name: string }[] };
type Editable = { name?: string; description?: string; variants?: unknown; metadata?: Record<string, any> };
export function productSource(form: Editable): Source {
  return {
    name: String(form.metadata?.source_name ?? form.name ?? '').slice(0, 500),
    description: String(form.metadata?.source_description ?? form.description ?? '').replace(/<[^>]*>/g, ' ').slice(0, 5000),
    variants: catalogVariants(form).map(v => ({ vid: v.vid.slice(0, 100), name: v.name.slice(0, 150) })),
  };
}
export function matchesProductSource(form: Editable, source?: Source) {
  if (!source) return false;
  const current = productSource(form);
  return current.name === source.name && current.description === source.description &&
    Array.isArray(source.variants) && current.variants.length === source.variants.length &&
    current.variants.every((v, i) => v.vid === source.variants[i].vid && v.name === source.variants[i].name);
}
export function arabicProductPatch(form: Editable, generation: { id: string; source: Source }, draft: ArabicDraft) {
  if (!matchesProductSource(form, generation.source)) throw new Error('المسودة لا تطابق مصدر هذا المنتج وخياراته. جهّز مسودة جديدة لهذا المصدر.');
  const variants = catalogVariants(form);
  const reviewed = validateArabicDraft({ ...draft, features: draft.features.map(s => s.trim()).filter(Boolean) }, variants.map(v => v.vid));
  const labels = new Map(reviewed.variants.map(v => [v.vid, v.labelAr]));
  return {
    name: reviewed.name, name_ar: reviewed.name, short_name: reviewed.short_name,
    tagline: reviewed.tagline.trim() || reviewed.short_name, description: reviewed.description.trim() || reviewed.name,
    ...(form.metadata?.variant_schema === 1 ? { variants: variants.map(v => ({ ...v, labelAr: labels.get(v.vid)! })) } : {}),
    metadata: { ...form.metadata, source_name: generation.source.name, source_description: generation.source.description,
      features: reviewed.features, specifications: reviewed.specifications, usage: reviewed.usage,
      seo_title: reviewed.seo_title, seo_description: reviewed.seo_description, ai_generation_id: generation.id,
      ai_reviewed_at: new Date().toISOString() },
  };
}
export function productFormError(form: Record<string, any>): string | null {
  const labels: Record<string, string> = { id: 'معرّف المنتج', name: 'اسم المنتج', short_name: 'الاسم المختصر', tagline: 'العبارة التعريفية', description: 'الوصف' };
  const missing = Object.keys(labels).filter(key => typeof form[key] !== 'string' || !form[key].trim());
  if (missing.length) return `أكمل الحقول المطلوبة: ${missing.map(key => labels[key]).join('، ')}.`;
  if (!/^[a-zA-Z0-9_-]+$/.test(form.id)) return 'استخدم حروفًا إنجليزية وأرقامًا وشرطة فقط في معرّف المنتج.';
  if (![form.price, form.cost].every(n => Number.isFinite(n) && n >= 0)) return 'سعر البيع والتكلفة يجب أن يكونا رقمين غير سالبين.';
  try { validateVariants(form); } catch (e) { return e instanceof Error ? e.message : 'راجع خيارات المنتج'; }
  if (form.active && form.metadata?.variant_schema !== 1 && form.price <= 0) return 'حدد سعر بيع أكبر من صفر قبل إظهار المنتج في المتجر.';
  return null;
}
export async function adminJson(url: string, init?: RequestInit) {
  let response: Response;
  try { response = await fetch(url, { ...init, signal: init?.signal ?? AbortSignal.timeout(65000) }); }
  catch { throw new Error('تعذر الاتصال أو انتهت المهلة. بقيت بياناتك في النموذج؛ تحقق من الاتصال ثم حاول مجددًا.'); }
  if (response.status === 401) throw new Error('انتهت جلسة الإدارة. افتح تسجيل الدخول في تبويب آخر ثم أعد المحاولة؛ لا تغلق هذا النموذج.');
  let data;
  try { data = await response.json(); } catch { throw new Error('لم يكتمل رد الخادم. بقيت بياناتك في النموذج؛ أعد المحاولة بعد قليل.'); }
  if (!response.ok || data.success === false) throw new Error(data.error || 'تعذر إكمال العملية');
  return data;
}
