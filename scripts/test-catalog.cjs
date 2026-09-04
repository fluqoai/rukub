const { mocks } = require('./register-ts.cjs');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { publicVariants, validateVariants, cartLineKey } = require('../lib/catalog-variants.ts');
const { validateArabicDraft } = require('../lib/arabic-draft.ts');
const { productSource, matchesProductSource, arabicProductPatch, productFormError, adminJson } = require('../lib/admin-product-editor.ts');
const variant = { vid: 'v1', pid: 'p1', sku: 'sku-red-m', name: 'Red M', labelAr: 'أحمر / M', image: null, enabled: true, priceSAR: 49, costSAR: 20, supplierPriceUSD: 1, shippingUSD: 3, stock: 5, origin: 'CN', logistics: 'Test', deliveryMin: 9, deliveryMax: 14, checkedAt: new Date().toISOString() };
const product = { id: 'p', name: 'منتج', short_name: 'منتج', price: 49, cost: 20, active: true, images: [], variants: [variant], metadata: { variant_schema: 1, supplier: 'CJdropshipping' } };
let current = product;
let failQuote = false;
mocks.set('@/lib/db/products', { getProduct: async () => current });
mocks.set('@/lib/cj-client', { quoteSupplierItems: async items => {
  if (failQuote) throw new Error('supplier unavailable');
  return { checkedAt: variant.checkedAt, live: items.map(i => ({ ...i, variant: { price: 1, sku: 'sku-red-m', name: 'Red M', inventories: [{ countryCode: 'CN', totalInventory: 5 }] } })), freight: { priceUSD: 3, taxesFeeUSD: 0, serviceFeeUSD: 0, originCountryCode: 'CN', logisticsName: 'Test', deliveryMinDays: 9, deliveryMaxDays: 14 } };
} });
const { validateCheckout } = require('../lib/checkout-validation.ts');
test('public variant never contains supplier cost or PID', () => {
  const list = publicVariants({ ...product, variants: [variant, { ...variant, vid: 'hidden', enabled: false }] });
  assert.equal(list.length, 1); assert.equal(list[0].vid, 'v1'); assert.equal('costSAR' in list[0], false); assert.equal('pid' in list[0], false);
  assert.deepEqual(publicVariants({ ...product, metadata: { supplier_items: [variant] } }), []);
});
test('unverified variants cannot be published', () => {
  assert.doesNotThrow(() => validateVariants(product));
  assert.throws(() => validateVariants({ ...product, variants: [{ ...variant, checkedAt: null }] }));
  assert.throws(() => validateVariants({ ...product, variants: [{ ...variant, costSAR: NaN }] }));
  assert.throws(() => validateVariants({ ...product, variants: [{ ...variant, enabled: false }] }));
  assert.throws(() => validateVariants({ ...product, active: undefined, variants: [{ ...variant, enabled: false }] }));
});
test('two variants stay separate in cart and remove/update independently', () => {
  const { useCartStore } = require('../lib/cart-store.ts');
  const cart = useCartStore.getState(); cart.clear();
  const item = { productId: 'p', variantId: 'v1', name: 'منتج', shortName: 'منتج', price: 49, audience: 'shared', slug: 'p', iconName: 'Package' };
  cart.addItem(item); cart.addItem({ ...item, variantId: 'v2' }, 2); cart.addItem(item);
  assert.deepEqual(useCartStore.getState().items.map(i => i.quantity), [2, 2]);
  cart.updateQuantity(cartLineKey(item), 3); cart.removeItem(cartLineKey({ ...item, variantId: 'v2' }));
  assert.equal(useCartStore.getState().items.length, 1); assert.equal(useCartStore.getState().items[0].quantity, 3);
});
test('AI cannot change or omit supplier variant identifiers', () => {
  const draft = { name: 'منتج عربي', short_name: 'منتج', tagline: '', description: '', usage: '', seo_title: '', seo_description: '', features: [], specifications: [], warnings: [], variants: [{ vid: 'v1', labelAr: 'أحمر / M' }] };
  assert.equal(validateArabicDraft(draft, ['v1']).variants[0].vid, 'v1');
  assert.throws(() => validateArabicDraft({ ...draft, variants: [{ vid: 'invented', labelAr: 'أحمر' }] }, ['v1']));
  assert.throws(() => validateArabicDraft({ ...draft, name: '<script>alert(1)</script>' }, ['v1']));
});
test('checkout validates exact VID, current price, availability and cumulative stock', async () => {
  const line = { productId: 'p', variantId: 'v1', quantity: 1, expectedPrice: 49 };
  const items = await validateCheckout([line]);
  assert.equal(items[0].variant, 'أحمر / M'); assert.equal(items[0].metadata.supplier_items[0].vid, 'v1');
  await assert.rejects(() => validateCheckout([{ ...line, variantId: undefined }]));
  await assert.rejects(() => validateCheckout([{ ...line, expectedPrice: 1 }]));
  await assert.rejects(() => validateCheckout([line, line]));
  await assert.rejects(() => validateCheckout([{ ...line, quantity: 3 }, { ...line, productId: 'other', quantity: 3 }]));
  current = { ...product, active: false }; await assert.rejects(() => validateCheckout([line])); current = product;
  failQuote = true; await assert.rejects(() => validateCheckout([line])); failQuote = false;
});
test('fixed bundles retain every supplier component', async () => {
  current = { ...product, cj_product_id: null, metadata: { supplier: 'CJdropshipping', supplier_items: [{ pid: 'p1', vid: 'v1' }, { pid: 'p2', vid: 'v2' }] } };
  const [item] = await validateCheckout([{ productId: 'bundle', quantity: 1, expectedPrice: 49 }]);
  assert.equal(item.metadata.supplier_items.length, 2); current = product;
});
test('Arabic options appear in email, with HTML safely escaped', () => {
  const { renderEmail } = require('../lib/email-templates.ts');
  const result = renderEmail('order_created', { orderId: 'TEST', customerName: '<b>اسم</b>', items: [{ name: 'منتج — أحمر / M <script>x</script>', quantity: 1, price: 49 }], subtotal: 49, shippingCost: 15, total: 64, shipping: { city: 'الرياض', district: 'اختبار', phone: '0500000000' }, paymentMethod: 'cod' });
  assert.match(result.text, /أحمر \/ M/); assert.ok(!result.html.includes('<script>')); assert.ok(result.html.includes('&lt;script&gt;'));
});

test('editor reports missing fields and blocks unverified publication, not inactive drafts', () => {
  assert.match(productFormError({ id: 'draft' }), /اسم المنتج/);
  const form = { ...product, description: 'وصف', tagline: 'عبارة', active: false, variants: [{ ...variant, enabled: false, checkedAt: null, stock: null }] };
  assert.equal(productFormError(form), null);
  assert.match(productFormError({ ...form, active: true }), /فعّل نسخة/);
});

test('source match ignores JSONB property order but rejects other descriptions and VIDs', () => {
  const form = { ...product, name: 'Source', description: '<p>Source details</p>' };
  const source = productSource(form);
  assert.equal(matchesProductSource(form, { variants: source.variants, description: source.description, name: source.name }), true);
  assert.equal(matchesProductSource(form, { ...source, description: 'Another product' }), false);
  assert.equal(matchesProductSource(form, { ...source, variants: [{ name: variant.name, vid: 'wrong' }] }), false);
});

test('applying Arabic preserves original source, prices and legacy supplier variants', () => {
  const form = { ...product, name: 'Source', description: 'Source details', variants: [{ legacy: true }], metadata: { supplier_items: [{ pid: 'p1', vid: 'v1' }] } };
  const generation = { id: 'draft-1', source: productSource(form) };
  const draft = { name: 'حقيبة سفر', short_name: 'حقيبة', tagline: 'تنظيم', description: 'وصف عربي', usage: '', seo_title: '', seo_description: '', features: ['ميزة', ''], specifications: [], warnings: [], variants: [] };
  const patch = arabicProductPatch(form, generation, draft);
  assert.equal('variants' in patch, false);
  assert.equal('price' in patch, false);
  assert.equal('active' in patch, false);
  assert.deepEqual(patch.metadata.features, ['ميزة']);
  assert.equal(matchesProductSource({ ...form, ...patch }, generation.source), true);
  assert.deepEqual(patch.metadata.supplier_items, form.metadata.supplier_items);
});

test('reviewed Arabic changes labels only and rejects malformed edited drafts', () => {
  const form = { ...product, description: 'Source' };
  const generation = { id: 'draft-2', source: productSource(form) };
  const draft = { name: 'منتج عربي', short_name: 'منتج', tagline: 'تنظيم', description: 'وصف', usage: '', seo_title: '', seo_description: '', features: [], specifications: [], warnings: [], variants: [{ vid:'v1', labelAr:'أحمر متوسط' }] };
  const patch = arabicProductPatch(form, generation, draft);
  assert.equal(patch.variants[0].priceSAR, variant.priceSAR);
  assert.equal(patch.variants[0].vid, variant.vid);
  assert.equal(patch.variants[0].labelAr, 'أحمر متوسط');
  assert.throws(() => arabicProductPatch(form, generation, { ...draft, name:'' }));
});

test('admin request explains expired sessions and non-JSON server responses', async () => {
  const original = global.fetch;
  try {
    global.fetch = async () => new Response('', { status:401 });
    await assert.rejects(() => adminJson('/test'), /انتهت جلسة/);
    global.fetch = async () => new Response('<html>timeout</html>', { status:504 });
    await assert.rejects(() => adminJson('/test'), /لم يكتمل رد الخادم/);
  } finally { global.fetch = original; }
});
