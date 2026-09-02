// Try category-based browse + different search params.
const KEY = process.env.CJ_API_KEY;
const BASE = 'https://developers.cjdropshipping.com/api2.0/v1';

async function jget(path, token) {
  await new Promise((r) => setTimeout(r, 1500));
  const r = await fetch(`${BASE}${path}`, { headers: { 'CJ-Access-Token': token } });
  return r.json();
}

async function main() {
  const authRes = await fetch(`${BASE}/authentication/getAccessToken`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey: KEY }),
  });
  const authJson = await authRes.json();
  const token = authJson.data.accessToken;

  // 1) Try category list endpoint
  console.log('=== /product/category/list ===');
  const cat = await jget('/product/category/list?level=2', token);
  console.log('code:', cat.code, '· categories:', cat.data?.length ?? '?');
  if (cat.code === 200 && Array.isArray(cat.data)) {
    // find automotive
    const auto = cat.data.filter((c) =>
      /auto|car|vehicle/i.test(JSON.stringify(c))
    );
    console.log('automotive-related categories:');
    auto.slice(0, 5).forEach((c) => {
      console.log('  id:', c.id ?? c.categoryId, '· name:', c.categoryName ?? c.nameEn, '· level:', c.categoryLevel);
    });
  }

  // 2) Try a specific category id from common car-accessory category
  console.log('\n=== /product/list?categoryId= ... (try common IDs) ===');
  // Common CJ automotive top-level category IDs (try a few)
  for (const cid of ['9', '14', '7', '8', '10', '20', '21', '23']) {
    const r = await jget(`/product/list?categoryId=${cid}&pageNum=1&pageSize=2`, token);
    if (r.code === 200 && r.data?.list?.length) {
      console.log(`categoryId=${cid}: total=${r.data.total}, first: ${r.data.list[0].productNameEn}`);
    } else {
      console.log(`categoryId=${cid}: code=${r.code} ${r.message}`);
    }
  }

  // 3) Search with different parameter names
  console.log('\n=== Try alternative search params ===');
  const tests = [
    { p: '/product/list?keyword=car+charger&pageSize=3', label: 'keyword (lowercase)' },
    { p: '/product/list?keyWord=car+charger&pageSize=3', label: 'keyWord (camelCase)' },
    { p: '/product/list?name=car+charger&pageSize=3', label: 'name' },
    { p: '/product/list?search=car+charger&pageSize=3', label: 'search' },
    { p: '/product/list?q=car+charger&pageSize=3', label: 'q' },
  ];
  for (const t of tests) {
    const r = await jget(t.p, token);
    const first = r.data?.list?.[0]?.productNameEn ?? r.data?.list?.[0]?.productName ?? '(none)';
    console.log(`  ${t.label}: total=${r.data?.total} code=${r.code} first="${first.slice(0,40)}"`);
  }
}

main().catch((e) => { console.error('Error:', e.message); });
