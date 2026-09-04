// Local integration verification: temporary admin session and cancelled test
// order only. Never calls fulfillment or sends email. All created records clean up.
require('./register-ts.cjs');
const assert = require('node:assert/strict');
const { randomBytes, createHash } = require('node:crypto');
const fs = require('node:fs');
const { createAdminSupabase } = require('../lib/supabase/client.ts');
const { createOrder, getOrder } = require('../lib/db/orders.ts');
const BASE = 'http://localhost:3000';
const stateFile = require('node:path').join(__dirname, '..', 'catalog-test.local-secret');
const db = createAdminSupabase();
const digest = token => createHash('sha256').update(token).digest('hex');
async function main() {
  if (process.argv[2] === 'cleanup') {
    const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
    const { error } = await db.from('admin_sessions').delete().eq('token', digest(state[0].value));
    if (error) throw error;
    fs.unlinkSync(stateFile); console.log('Temporary verification session removed'); return;
  }
  for (const route of ['/api/admin/ai/arabic', '/api/admin/cj/variant?pid=p&vid=v']) {
    assert.equal((await fetch(BASE + route)).status, 401);
  }
  console.log('Admin-only routes reject unauthenticated requests: PASS');
  const { data: admin } = await db.from('admin_users').select('id').eq('active', true).limit(1).single();
  assert.ok(admin);
  const token = randomBytes(32).toString('hex');
  const { error } = await db.from('admin_sessions').insert({ admin_id: admin.id, token: digest(token), expires_at: new Date(Date.now() + 15 * 60_000).toISOString(), user_agent: 'catalog-local-verification' });
  if (error) throw error;
  let keepSession = false;
  const orderId = `RKB-VERIFY-${Date.now()}`;
  const testPhone = `VERIFY-${randomBytes(6).toString('hex')}`;
  try {
    const headers = { Cookie: `rukub_admin_session=${token}`, 'Content-Type': 'application/json' };
    const { data: source } = await db.from('products').select('*').eq('id', 'sunshade-umbrella').single();
    const supplier = source.metadata.supplier_items[0];
    const importedResponse = await fetch(`${BASE}/api/admin/cj/import?pid=${encodeURIComponent(supplier.pid)}`, { headers });
    const imported = await importedResponse.json(); assert.equal(importedResponse.status, 200, imported.error);
    assert.equal(imported.prefill.active, false); assert.ok(imported.prefill.variants.length > 1);
    assert.ok(imported.prefill.variants.every(v => !v.enabled));
    console.log('CJ import returns every variant disabled for review:', imported.prefill.variants.length);
    const verifiedResponse = await fetch(`${BASE}/api/admin/cj/variant?pid=${supplier.pid}&vid=${supplier.vid}`, { headers });
    const verified = await verifiedResponse.json(); assert.equal(verifiedResponse.status, 200, verified.error);
    assert.ok(verified.variant.stock > 0); assert.ok(verified.variant.costSAR > 0);
    console.log('Authenticated stock / freight / landed cost verification: PASS');
    const history = await fetch(`${BASE}/api/admin/ai/arabic`, { headers }).then(r => r.json());
    const saved = history.generations.find(g => g.status === 'complete'); assert.ok(saved);
    const cachedResponse = await fetch(`${BASE}/api/admin/ai/arabic`, { method: 'POST', headers, body: JSON.stringify(saved.source) });
    const cached = await cachedResponse.json(); assert.equal(cachedResponse.status, 200, cached.error); assert.equal(cached.generation.cached, true);
    console.log('Authenticated persisted AI draft retrieval without charge: PASS');
    const q = await fetch(`${BASE}/api/checkout/quote`, { method: 'POST', headers, body: JSON.stringify({ items: [{ productId: source.id, expectedPrice: Number(source.price), quantity: 1 }] }) });
    const quote = await q.json(); assert.equal(q.status, 200, quote.error); assert.equal(quote.items[0].deliveryMax, verified.variant.deliveryMax);
    assert.equal(JSON.stringify(quote).includes('landed_cost'), false);
    console.log('Public checkout quote from real CJ data, costs omitted: PASS');
    const { validateCheckout } = require('../lib/checkout-validation.ts');
    const items = await validateCheckout([{ productId: source.id, expectedPrice: Number(source.price), quantity: 1 }]);
    // Exercise the exact variant snapshot serialization without publishing a fixture product.
    items[0].variant = 'اختبار النسخة / Large'; items[0].metadata.variant_id = supplier.vid;
    await createOrder({ id: orderId, items, shipping: { fullName: 'اختبار تقني ملغي', phone: testPhone, city: 'Test', district: 'Test' }, paymentMethod: 'cod', status: 'cancelled', subtotal: Number(source.price), shippingCost: 15, total: Number(source.price) + 15 });
    const stored = await getOrder(orderId);
    assert.equal(stored.items[0].metadata.variant_id, supplier.vid); assert.equal(stored.items[0].metadata.supplier_items[0].vid, supplier.vid); assert.equal(stored.items[0].variant, items[0].variant);
    console.log('Order item variant + supplier snapshot database round-trip: PASS');
    fs.writeFileSync(stateFile, JSON.stringify([{ name: 'rukub_admin_session', value: token, domain: 'localhost', path: '/', httpOnly: true, secure: false, sameSite: 'Lax' }]));
    keepSession = true; console.log('15-minute local browser session ready (gitignored; clean up after UI check)');
  } finally {
    for (const [table, field, value] of [['order_items','order_id',orderId],['orders','id',orderId],['customers','phone',testPhone]]) {
      const result = await db.from(table).delete().eq(field, value); if (result.error) throw result.error;
    }
    console.log('Cancelled test order and its test customer removed; no email or supplier order sent');
    if (!keepSession) await db.from('admin_sessions').delete().eq('token', digest(token));
  }
}
main().catch(e => { console.error(e.message); process.exitCode = 1; });
