export type ArabicDraft = {
  name: string; short_name: string; tagline: string; description: string;
  features: string[]; specifications: Array<{ label: string; value: string }>;
  usage: string; seo_title: string; seo_description: string;
  variants: Array<{ vid: string; labelAr: string }>; warnings: string[];
};
const string = { type: 'string' };
export const arabicDraftSchema = {
  type: 'object', additionalProperties: false,
  properties: { name: string, short_name: string, tagline: string, description: string,
    features: { type: 'array', items: string }, usage: string, seo_title: string, seo_description: string,
    specifications: { type: 'array', items: { type: 'object', additionalProperties: false, properties: { label: string, value: string }, required: ['label', 'value'] } },
    variants: { type: 'array', items: { type: 'object', additionalProperties: false, properties: { vid: string, labelAr: string }, required: ['vid', 'labelAr'] } },
    warnings: { type: 'array', items: string } },
  required: ['name','short_name','tagline','description','features','specifications','usage','seo_title','seo_description','variants','warnings'],
};
export function validateArabicDraft(value: unknown, vids: string[]): ArabicDraft {
  const d = value as ArabicDraft;
  if (!d || typeof d !== 'object') throw new Error('لم يُرجع النموذج مسودة صالحة');
  for (const field of ['name','short_name','tagline','description','usage','seo_title','seo_description'] as const) {
    if (typeof d[field] !== 'string' || d[field].length > 4000 || /<[^>]*>/.test(d[field])) throw new Error('صيغة النص المقترح غير صالحة');
  }
  if (!d.name.trim() || !/[\u0600-\u06ff]/.test(d.name)) throw new Error('الاسم المقترح ليس بالعربية');
  if (Object.keys(d).some(key => !arabicDraftSchema.required.includes(key))) throw new Error('المسودة تتضمن حقولًا غير مسموحة');
  if (d.name.length > 250 || d.short_name.length > 80 || d.seo_title.length > 65 || d.seo_description.length > 160) throw new Error('بعض عناوين المسودة أطول من الحد المسموح');
  if (!Array.isArray(d.features) || d.features.length > 8 || d.features.some(s => typeof s !== 'string' || s.length > 300)) throw new Error('المميزات غير صالحة');
  if (!Array.isArray(d.warnings) || d.warnings.some(s => typeof s !== 'string')) throw new Error('التحذيرات غير صالحة');
  if (!Array.isArray(d.specifications) || d.specifications.length > 20 || d.specifications.some(s => typeof s.label !== 'string' || typeof s.value !== 'string')) throw new Error('المواصفات غير صالحة');
  if (!Array.isArray(d.variants) || d.variants.length !== vids.length || new Set(d.variants.map(v => v.vid)).size !== vids.length || d.variants.some(v => !vids.includes(v.vid) || typeof v.labelAr !== 'string' || !v.labelAr.trim() || v.labelAr.length > 250)) throw new Error('غيّر النموذج هوية نسخة؛ تم رفض المسودة لحماية الربط');
  return d;
}
