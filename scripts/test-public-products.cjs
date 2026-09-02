// Insert a test product via Supabase admin client, then check it appears on /shop
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Read .env.local manually
const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach((l) => {
  const m = l.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
  if (m) env[m[1]] = m[2].trim();
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  // 1) Get baseline count
  const before = await fetch('http://localhost:3000/api/products').then((r) => r.json());
  console.log('Products on /api/products BEFORE:', before.products?.length);

  // 2) Insert a test product
  const testId = 'TEST-CJ-' + Date.now();
  console.log('\nInserting test product:', testId);
  const { data, error } = await supabase.from('products').insert({
    id: testId,
    name: 'منتج اختبار من CJ',
    short_name: 'منتج اختبار',
    description: 'هذا منتج اختبار للتحقق من تكامل الموقع مع Supabase. شاحن لاسلكي للسيارة بقوة 15W.',
    tagline: 'منتج اختبار - للتأكد من ظهوره على الموقع',
    audience: 'men',
    audience_label: 'للرجال',
    price: 89,
    cost: 30,
    badge: 'جديد',
    tier: 2,
    is_hero: true,
    cj_product_id: 'TEST12345',
    category_name: 'Car Accessories',
    images: ['https://picsum.photos/seed/' + testId + '/600/600'],
    free_shipping: true,
    estimated_delivery_days: 3,
    active: true,
  }).select();
  if (error) {
    console.error('Insert error:', error.message);
    return;
  }
  console.log('Inserted:', data[0].id, '·', data[0].name);

  // 3) Check via API
  const after = await fetch('http://localhost:3000/api/products').then((r) => r.json());
  console.log('Products on /api/products AFTER:', after.products?.length);
  const found = after.products?.find((p) => p.id === testId);
  console.log('Test product visible via API:', !!found);
  if (found) console.log('  name:', found.name, '· price:', found.price, '· image:', found.images?.[0]);

  // 4) Check via shop page
  const shopRes = await fetch('http://localhost:3000/shop/men');
  const html = await shopRes.text();
  const visible = html.includes('منتج اختبار');
  console.log('Test product visible on /shop/men:', visible);
  console.log('Shop page size:', html.length, 'bytes');

  // 5) Cleanup
  console.log('\nCleaning up...');
  await supabase.from('products').delete().eq('id', testId);
  console.log('Deleted test product');
}

main().catch((e) => { console.error('Error:', e.message); process.exit(1); });
