// Explicit Rukub production verification. No product publishing, checkout order,
// supplier purchase or email. The --ai flag permits one cached/idempotent AI draft.
const assert = require('node:assert/strict');
const { randomBytes, createHash } = require('node:crypto');
const { createClient } = require('@supabase/supabase-js');
const BASE = 'https://rukub.shop';
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

async function main() {
  assert.equal(new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname, 'lpebhjmtjhnyvwqhynih.supabase.co');
  for (const route of ['/', '/shop/women', '/shop/men', '/shop/shared', '/privacy']) {
    assert.equal((await fetch(BASE + route)).status, 200, route);
  }
  const publicResponse = await fetch(BASE + '/api/products');
  assert.equal(publicResponse.status, 200);
  const catalog = await publicResponse.json();
  assert.ok(catalog.success && catalog.products.length > 0);
  for (const product of catalog.products) {
    assert.equal(Object.hasOwn(product, 'cost'), false);
    assert.equal(Object.hasOwn(product, 'metadata'), false);
  }
  console.log('Public pages and safe catalog: PASS; active products:', catalog.products.length);
  for (const table of ['products', 'orders', 'customers', 'order_items', 'settings', 'admin_users', 'admin_sessions', 'notifications', 'audit_log', 'order_summary', 'top_products']) {
    const r = await fetch(process.env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/' + table + '?select=*&limit=0', {
      headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, Authorization: 'Bearer ' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY },
    });
    assert.equal(r.status, 401, table);
  }
  console.log('Direct anonymous access to private tables/views denied: PASS');
  for (const route of ['/api/admin/ai/arabic', '/api/admin/cj/variant?pid=p&vid=v']) {
    assert.equal((await fetch(BASE + route)).status, 401);
  }
  const { data: admin, error: adminError } = await db.from('admin_users').select('id').eq('active', true).limit(1).single();
  assert.ifError(adminError);
  const token = randomBytes(32).toString('hex');
  const hash = createHash('sha256').update(token).digest('hex');
  const session = await db.from('admin_sessions').insert({ admin_id: admin.id, token: hash, expires_at: new Date(Date.now() + 10 * 60_000).toISOString(), user_agent: 'rukub-production-verification' });
  assert.ifError(session.error);
  try {
    const headers = { Cookie: `rukub_admin_session=${token}`, 'Content-Type': 'application/json', Origin: BASE };
    const historyResponse = await fetch(BASE + '/api/admin/ai/arabic', { headers });
    assert.equal(historyResponse.status, 200);
    const history = await historyResponse.json();
    assert.ok(Array.isArray(history.generations));
    console.log('Production admin session and persisted AI history: PASS');
    if (process.argv.includes('--ai')) {
      const source = { name: 'Foldable travel storage pouch', description: 'Reusable zippered travel storage pouch. Color: black. Size: 20 x 15 cm. No material or care instructions supplied.', variants: [{ vid: 'verification-only-not-for-sale', name: 'Black 20 x 15 cm' }] };
      const response = await fetch(BASE + '/api/admin/ai/arabic', { method: 'POST', headers, body: JSON.stringify(source), signal: AbortSignal.timeout(65000) });
      const result = await response.json();
      assert.equal(response.status, 200, result.error);
      assert.equal(result.generation.status, 'complete');
      assert.ok(/[\u0600-\u06ff]/.test(JSON.stringify(result.generation.draft)));
      const cachedResponse = await fetch(BASE + '/api/admin/ai/arabic', { method: 'POST', headers, body: JSON.stringify(source) });
      const cached = await cachedResponse.json();
      assert.equal(cachedResponse.status, 200, cached.error);
      assert.equal(cached.generation.cached, true);
      console.log('Production Arabic generation and cache: PASS;', JSON.stringify({ model: result.generation.model, costUSD: result.generation.costUSD, alreadyCached: !!result.generation.cached }));
    }
    const { data: product, error } = await db.from('products').select('id,price,metadata').eq('id', 'sunshade-umbrella').eq('active', true).single();
    assert.ifError(error);
    const supplier = product.metadata.supplier_items[0];
    const checkedResponse = await fetch(`${BASE}/api/admin/cj/variant?pid=${encodeURIComponent(supplier.pid)}&vid=${encodeURIComponent(supplier.vid)}`, { headers });
    const checked = await checkedResponse.json();
    assert.equal(checkedResponse.status, 200, checked.error);
    assert.ok(checked.variant.costSAR > 0);
    const quoteResponse = await fetch(BASE + '/api/checkout/quote', { method: 'POST', headers, body: JSON.stringify({ items: [{ productId: product.id, expectedPrice: Number(product.price), quantity: 1 }] }) });
    const quote = await quoteResponse.json();
    assert.equal(quoteResponse.status, 200, quote.error);
    assert.equal(JSON.stringify(quote).includes('landed_cost'), false);
    console.log('Production CJ variant cost and public checkout quote: PASS');
  } finally {
    const deleted = await db.from('admin_sessions').delete().eq('token', hash);
    assert.ifError(deleted.error);
    console.log('Temporary admin session removed; no order or email created');
  }
}
main().catch(e => { console.error(e.message); process.exitCode = 1; });
