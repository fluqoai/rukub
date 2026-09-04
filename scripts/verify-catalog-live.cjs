// Explicit live read/AI test. AI mode makes at most ONE paid generation;
// repeated identical input is loaded from the persisted cache. Never places CJ orders.
require('./register-ts.cjs');
const { createAdminSupabase } = require('../lib/supabase/client.ts');
async function main() {
  const mode = process.argv[2];
  if (mode === 'balance') {
    const r = await fetch('https://openrouter.ai/api/v1/key', { headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}` } });
    const body = await r.json(); console.log(JSON.stringify({ status: r.status, usage: body.data?.usage, limit: body.data?.limit, remaining: body.data?.limit_remaining })); return;
  }
  const db = createAdminSupabase();
  const { data: rows, error } = await db.from('products').select('*').eq('active', true);
  if (error) throw error;
  console.log('Active catalog:', rows.length);
  const product = rows.find(p => p.id === 'sunshade-umbrella') || rows.find(p => p.cj_product_id);
  if (!product) throw new Error('No source product');
  if (mode === 'ai') {
    const { generateArabicDraft } = require('../lib/openrouter-arabic.ts');
    const input = { name: 'Car sunshade umbrella', description: 'Foldable car windshield sunshade umbrella. Silver outer fabric. Black handle. Variant: Large 140 x 79 cm. Check windshield dimensions before purchase.', variants: [{ vid: product.metadata.supplier_items[0].vid, name: 'Large 140 x 79 cm' }] };
    const result = await generateArabicDraft(input, 'verification');
    console.log(JSON.stringify({ id: result.id, model: result.model, draft: result.draft, costUSD: result.costUSD, usage: result.usage, cached: !!result.cached }));
    const second = await generateArabicDraft(input, 'verification');
    if (!second.cached) throw new Error('Cache failed'); console.log('Identical request cache: PASS');
  } else if (mode === 'cj') {
    const { quoteSupplierItems } = require('../lib/cj-client.ts');
    const q = await quoteSupplierItems(product.metadata.supplier_items.map(s => ({ pid: s.pid, vid: s.vid, quantity: 1 })));
    console.log(JSON.stringify({ product: product.id, variants: q.live.map(s => ({ vid: s.vid, name: s.variant.name, price: s.variant.price, inventories: s.variant.inventories })), freight: q.freight, checkedAt: q.checkedAt }));
  } else throw new Error('Use balance, ai or cj');
}
main().catch(e => { console.error(e.message); process.exitCode = 1; });
