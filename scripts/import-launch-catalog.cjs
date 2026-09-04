/**
 * Builds Rukub's curated launch catalog from live CJ product, inventory and
 * freight data, then upserts it to Supabase. Run with:
 *   node --env-file=.env.local scripts/import-launch-catalog.cjs --apply
 * Without --apply it performs a read-only preview.
 */

const { createClient } = require('@supabase/supabase-js');

const BASE = 'https://developers.cjdropshipping.com/api2.0/v1';
const USD_TO_SAR = 3.75;
const APPLY = process.argv.includes('--apply');
const REQUIRED = ['CJ_API_KEY', 'NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
for (const key of REQUIRED) {
  if (!process.env[key]) throw new Error(`${key} is required`);
}

const launchCatalog = [
  {
    id: 'care-bundle',
    name: 'باقة العناية اليومية بالمقصورة',
    shortName: 'باقة العناية اليومية',
    audience: 'shared',
    category: 'العناية اليومية',
    price: 89,
    badge: 'مختار لركوب',
    hero: true,
    tagline: 'نظافة أسرع ونتيجة تراها من أول استخدام',
    description: 'فرشاة عملية للتفاصيل مع منشفتين مايكروفايبر للعناية اليومية بالأسطح الداخلية. باقة واحدة تساعدك على إزالة الغبار وآثار اللمس والحفاظ على مقصورة مرتبة.',
    features: ['فرشاة للتفاصيل والزوايا الدقيقة', 'منشفتان مايكروفايبر ناعمتان', 'مناسبة للعناية الدورية داخل السيارة'],
    items: [
      { pid: '9ADD5FDA-6BB5-44FC-ABE5-7EC5DE53B013', vid: '26AB6960-4FB6-49C1-A5DB-5901679639BA' },
      { pid: '1594564817967394816', vid: '1594564818013532160' },
    ],
  },
  {
    id: 'road-safety-bundle',
    name: 'باقة الاستعداد للطريق',
    shortName: 'باقة أمان الطريق',
    audience: 'men',
    category: 'تقنية واستعداد',
    price: 79,
    badge: 'مختار لركوب',
    hero: true,
    tagline: 'أداتان صغيرتان لطمأنينة أكبر على الطريق',
    description: 'مطرقة طوارئ بقاطع حزام مع مقياس رقمي لضغط الإطارات. احتفظ بهما في السيارة لتفحص الضغط بسرعة وتكون مستعداً للمواقف الطارئة.',
    features: ['مقياس رقمي سريع لضغط الإطارات', 'مطرقة طوارئ مع قاطع حزام', 'حجم مدمج للتخزين داخل السيارة'],
    items: [
      { pid: '27E3DCDC-8A4D-4E51-A5A6-4EC273932D98', vid: 'C335DFEA-DA18-49F0-A31C-B4287BDB6386' },
      { pid: '1396344554650734592', vid: '1396344556018077696' },
    ],
  },
  {
    id: 'sunshade-umbrella',
    name: 'مظلة الزجاج الأمامي القابلة للطي',
    shortName: 'مظلة الزجاج الأمامي',
    audience: 'shared',
    category: 'صيف السعودية',
    price: 89,
    badge: 'جديد',
    hero: true,
    tagline: 'افتحها في ثوانٍ وخفف تعرض المقصورة للشمس',
    description: 'واقي شمس بتصميم المظلة يسهل فتحه وطيه وتخزينه. يساعد على حماية لوحة القيادة والمقود من التعرض المباشر للشمس عند الوقوف.',
    features: ['فتح وطي سريع بتصميم المظلة', 'طبقة عاكسة لأشعة الشمس', 'تخزين مدمج عند عدم الاستخدام'],
    items: [{ pid: '1422487068914880512', vid: '1422487071611817984' }],
  },
  {
    id: 'handbag-phone-hooks',
    name: 'خطاف الحقيبة وحامل الجوال للمقعد — قطعتان',
    shortName: 'خطاف الحقيبة والجوال',
    audience: 'women',
    category: 'ترتيب وأناقة',
    price: 69,
    badge: 'جديد',
    hero: true,
    tagline: 'ثبّتي حقيبتك واجعلي الجوال في مكان واضح',
    description: 'قطعتان تثبتان خلف مسند الرأس لتعليق الحقيبة أو الأكياس، مع مساحة لاستخدام الجوال. حل بسيط يقلل سقوط الأغراض وانتقالها أثناء القيادة.',
    features: ['تثبيت خلف مسند الرأس دون أدوات', 'يحمل الحقيبة والأكياس بعيداً عن الأرضية', 'تصميم مزدوج يمكن استخدامه للجوال'],
    items: [{ pid: '9BF844B3-4D1A-483F-AC2E-8F8226F33AFB', vid: '43BEEE65-BB89-44D6-A691-C6B32299B789' }],
  },
  {
    id: 'telescopic-phone-holder',
    name: 'حامل جوال تلسكوبي للسيارة',
    shortName: 'حامل جوال تلسكوبي',
    audience: 'men',
    category: 'تقنية واستعداد',
    price: 69,
    badge: 'جديد',
    hero: false,
    tagline: 'زاوية أوضح للجوال وتحكم أسهل أثناء الطريق',
    description: 'حامل جوال بذراع تلسكوبي قابل للضبط يساعدك على اختيار زاوية رؤية مناسبة دون الإمساك بالهاتف أثناء القيادة.',
    features: ['ذراع تلسكوبي قابل للضبط', 'دوران لتعديل زاوية الرؤية', 'استخدام بيد واحدة بعد التثبيت'],
    items: [{ pid: 'F49539CA-E1AC-459B-AE22-E2A28BAE6939', vid: 'A9254282-F8ED-4977-9F5A-D26036673405' }],
  },
  {
    id: 'sun-visor-tissue-holder',
    name: 'حامل مناديل لحاجب الشمس',
    shortName: 'حامل مناديل السيارة',
    audience: 'women',
    category: 'ترتيب وأناقة',
    price: 39,
    badge: 'جديد',
    hero: false,
    tagline: 'المناديل في متناول يدك دون فوضى',
    description: 'حامل رفيع يثبت على حاجب الشمس ليبقي المناديل قريبة ومنظمة ويوفر مساحة الكونسول وحاملات الأكواب.',
    features: ['تثبيت سريع على حاجب الشمس', 'يوفر مساحة التخزين الأمامية', 'وصول سهل دون البحث بين الأغراض'],
    items: [{ pid: '1368839170755268608' }],
  },
];

let token;
let lastRequestAt = 0;
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const number = (value) => Number(String(value ?? '').match(/\d+(?:\.\d+)?/)?.[0] ?? 0);
const urls = (values) => [...new Set(values.filter((value) => typeof value === 'string' && value.startsWith('https://')))];

async function auth() {
  const response = await fetch(`${BASE}/authentication/getAccessToken`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ apiKey: process.env.CJ_API_KEY }),
  });
  const json = await response.json();
  if (!response.ok || json.code !== 200) throw new Error(`CJ auth: ${json.message || response.status}`);
  token = json.data.accessToken;
  lastRequestAt = Date.now();
}

async function cj(path, options = {}) {
  const wait = 1100 - (Date.now() - lastRequestAt);
  if (wait > 0) await delay(wait);
  lastRequestAt = Date.now();
  const response = await fetch(`${BASE}${path}`, {
    method: options.method ?? 'GET',
    headers: { 'CJ-Access-Token': token, ...(options.body ? { 'content-type': 'application/json' } : {}) },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const json = await response.json();
  if (!response.ok || ![0, 200].includes(json.code) || json.result === false) throw new Error(`${path}: ${json.message || response.status}`);
  return json.data;
}

function productImages(detail) {
  let legacy = [];
  try { legacy = JSON.parse(detail.productImage || '[]'); } catch { legacy = []; }
  return urls([detail.bigImage, ...(detail.productImageSet || []), ...legacy, ...(detail.variants || []).map((v) => v.variantImage)]);
}

function chooseVariant(detail, requestedVid) {
  const variants = detail.variants || [];
  const selected = variants.find((variant) => variant.vid === requestedVid)
    || [...variants].filter((variant) => number(variant.variantSellPrice) > 0).sort((a, b) => number(a.variantSellPrice) - number(b.variantSellPrice))[0];
  if (!selected) throw new Error(`No sellable variant for ${detail.pid}`);
  return selected;
}

function deliveryRange(label) {
  const days = String(label || '').match(/\d+/g)?.map(Number) || [];
  return { min: days[0] || null, max: days[1] || days[0] || null };
}

async function buildProduct(config) {
  const supplierItems = [];
  let allLocal = true;
  let listedNum = 0;
  let images = [];
  let videos = [];

  for (const item of config.items) {
    const detail = await cj(`/product/query?pid=${encodeURIComponent(item.pid)}`);
    const variant = chooseVariant(detail, item.vid);
    const inventory = await cj(`/product/stock/getInventoryByPid?pid=${encodeURIComponent(item.pid)}`);
    const warehouses = inventory?.inventories || [];
    const localInventory = warehouses
      .filter((entry) => entry.countryCode === 'SA')
      .reduce((sum, entry) => sum + number(entry.totalInventoryNum ?? entry.totalInventory), 0);
    allLocal = allLocal && localInventory > 0;
    listedNum += number(detail.listedNum);
    images = urls([...images, ...productImages(detail).slice(0, config.items.length > 1 ? 4 : 8)]);
    videos = urls([...videos, detail.productVideo]);
    supplierItems.push({
      pid: detail.pid,
      vid: variant.vid,
      sku: variant.variantSku,
      name: detail.productNameEn,
      price_usd: number(variant.variantSellPrice),
      weight_g: number(variant.variantWeight),
      local_inventory_sa: localInventory,
    });
  }

  const origin = allLocal ? 'SA' : 'CN';
  const freightOptions = await cj('/logistic/freightCalculate', {
    method: 'POST',
    body: {
      startCountryCode: origin,
      endCountryCode: 'SA',
      products: supplierItems.map((item) => ({ quantity: 1, vid: item.vid })),
    },
  });
  if (!Array.isArray(freightOptions) || !freightOptions.length) throw new Error(`No Saudi freight quote for ${config.id}`);
  const quotes = freightOptions.map((quote) => ({ ...quote, ...deliveryRange(quote.logisticAging) }));
  const freight = origin === 'SA'
    ? quotes.sort((a, b) => (a.max || 999) - (b.max || 999))[0]
    : quotes.sort((a, b) => number(a.logisticPrice) - number(b.logisticPrice))[0];
  const productUSD = supplierItems.reduce((sum, item) => sum + item.price_usd, 0);
  const shippingUSD = number(freight.logisticPrice);
  const landedCostSAR = Math.round((productUSD + shippingUSD) * USD_TO_SAR * 100) / 100;
  const checkedAt = new Date().toISOString();

  return {
    id: config.id,
    name: config.name,
    short_name: config.shortName,
    name_ar: config.name,
    description: config.description,
    tagline: config.tagline,
    audience: config.audience,
    audience_label: config.category,
    price: config.price,
    old_price: null,
    cost: landedCostSAR,
    margin: Math.round(((config.price - landedCostSAR) / config.price) * 100) / 100,
    badge: allLocal ? 'متوفر محلياً' : config.badge,
    tier: config.price < 50 ? 1 : config.price < 90 ? 2 : 3,
    is_hero: config.hero,
    cj_product_id: supplierItems.length === 1 ? supplierItems[0].pid : null,
    category_id: null,
    category_name: config.category,
    brand: 'Rukub Selection',
    weight: supplierItems.reduce((sum, item) => sum + item.weight_g, 0),
    images: images.slice(0, 10),
    variants: supplierItems,
    free_shipping: false,
    estimated_delivery_days: freight.max || 14,
    rating: 0,
    review_count: 0,
    sales_count: 0,
    metadata: {
      supplier: 'CJdropshipping',
      supplier_items: supplierItems,
      supplier_price_usd: productUSD,
      shipping_price_usd: shippingUSD,
      logistics_name: freight.logisticName,
      delivery_min_days: freight.min,
      delivery_max_days: freight.max,
      shipping_origin: origin,
      local_inventory_sa: allLocal ? Math.min(...supplierItems.map((item) => item.local_inventory_sa)) : 0,
      inventory_verified_at: checkedAt,
      exchange_rate: USD_TO_SAR,
      landed_cost_sar: landedCostSAR,
      listed_num: listedNum,
      videos,
      features: config.features,
    },
    active: true,
  };
}

async function main() {
  await auth();
  const products = [];
  for (const config of launchCatalog) {
    process.stdout.write(`Checking ${config.id}... `);
    const product = await buildProduct(config);
    products.push(product);
    console.log(`cost ${product.cost} SAR, ${product.metadata.delivery_min_days}-${product.metadata.delivery_max_days} days, origin ${product.metadata.shipping_origin}`);
  }

  console.table(products.map((product) => ({
    id: product.id,
    price: product.price,
    cost: product.cost,
    margin: `${Math.round(product.margin * 100)}%`,
    delivery: `${product.metadata.delivery_min_days}-${product.metadata.delivery_max_days}`,
    images: product.images.length,
  })));

  if (!APPLY) {
    console.log('Preview complete. Re-run with --apply to update Supabase.');
    return;
  }

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const ids = products.map((product) => product.id);
  const { error: deactivateError } = await supabase.from('products').update({ active: false }).not('id', 'in', `(${ids.join(',')})`);
  if (deactivateError) throw new Error(`Deactivate old catalog: ${deactivateError.message}`);
  const { error: upsertError } = await supabase.from('products').upsert(products, { onConflict: 'id' });
  if (upsertError) throw new Error(`Upsert launch catalog: ${upsertError.message}`);
  const { data: verified, error: verifyError } = await supabase.from('products').select('id,name,price,cost,images,metadata,active').in('id', ids).eq('active', true);
  if (verifyError || verified?.length !== products.length) throw new Error(`Verification failed: ${verifyError?.message || 'row count mismatch'}`);
  console.log(`Applied and verified ${verified.length} active launch products.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
