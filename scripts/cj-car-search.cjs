// Search CJ for car accessories — Arabic and English keywords.
const KEY = process.env.CJ_API_KEY;
const BASE = 'https://developers.cjdropshipping.com/api2.0/v1';

async function main() {
  const authRes = await fetch(`${BASE}/authentication/getAccessToken`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey: KEY }),
  });
  const authJson = await authRes.json();
  if (authJson.code !== 200) { console.log('AUTH FAILED'); return; }
  const token = authJson.data.accessToken;

  const queries = [
    { ar: 'منظم سيارة', en: 'car organizer' },
    { ar: 'شاحن سيارة', en: 'car charger' },
    { ar: 'حامل جوال سيارة', en: 'car phone holder' },
    { ar: 'معطر سيارة', en: 'car air freshener' },
    { ar: 'كاميرا سيارة', en: 'dash cam' },
    { ar: 'مكنسة سيارة', en: 'car vacuum' },
  ];

  for (const q of queries) {
    // 1.5s delay to respect QPS limit
    await new Promise((r) => setTimeout(r, 1500));
    const res = await fetch(`${BASE}/product/list?keyWord=${encodeURIComponent(q.en)}&pageNum=1&pageSize=5&saleStatus=1`, {
      headers: { 'CJ-Access-Token': token },
    });
    const j = await res.json();
    if (j.code !== 200) { console.log(`[${q.en}] code=${j.code} ${j.message}`); continue; }
    const items = j.data?.list ?? [];
    console.log(`\n[${q.ar} / ${q.en}] total=${j.data?.total}, showing first 5:`);
    items.slice(0, 5).forEach((p) => {
      console.log(`  pid=${p.pid}`);
      console.log(`    name: ${(p.productNameEn || p.productName || '').slice(0, 60)}`);
      console.log(`    cat: ${p.threeCategoryName || p.twoCategoryName || p.oneCategoryName || '?'}`);
      console.log(`    price: ${p.sellPrice}`);
      console.log(`    image: ${(p.productImage || '').slice(0, 80)}`);
      console.log(`    ships to SA: ${(p.shippingCountryCodes || []).includes('SA') ? 'YES' : 'no'}`);
    });
  }
}

main().catch((e) => { console.error('Error:', e.message); });
