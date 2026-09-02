// CJ product exploration: discover the actual response shape.
const KEY = process.env.CJ_API_KEY;
const BASE = 'https://developers.cjdropshipping.com/api2.0/v1';

async function main() {
  const authRes = await fetch(`${BASE}/authentication/getAccessToken`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey: KEY }),
  });
  const authJson = await authRes.json();
  if (authJson.code !== 200) { console.log('AUTH FAILED'); return; }
  const token = authJson.data.accessToken;

  // 1) Raw product list — show top-level structure
  const r1 = await fetch(`${BASE}/product/list?pageNum=1&pageSize=3`, { headers: { 'CJ-Access-Token': token } });
  const j1 = await r1.json();
  console.log('=== /product/list ===');
  console.log('top-level keys:', Object.keys(j1));
  console.log('data keys:', j1.data ? Object.keys(j1.data) : 'no data');
  console.log('first 3 items structure:');
  const items = j1.data?.dataList ?? j1.data?.list ?? j1.data?.data ?? j1.data ?? [];
  console.log('item count:', Array.isArray(items) ? items.length : 'not array');
  if (Array.isArray(items) && items[0]) {
    console.log('item[0] keys:', Object.keys(items[0]));
    console.log('item[0] sample:');
    const s = items[0];
    console.log('  id:', s.id ?? s.pid);
    console.log('  name:', s.nameEn ?? s.name ?? s.productNameEn);
    console.log('  categoryName:', s.categoryName);
    console.log('  bigImage:', (s.bigImage || '').slice(0, 80));
    console.log('  sellPrice:', s.sellPrice);
    console.log('  warehouseList:', JSON.stringify(s.warehouseList || s.warehouses || []).slice(0, 200));
  }

  // 2) Saudi warehouse filter
  console.log('\n=== /product/list?countryName=Saudi Arabia&pageSize=3 ===');
  const r2 = await fetch(`${BASE}/product/list?countryName=Saudi+Arabia&pageNum=1&pageSize=3`, { headers: { 'CJ-Access-Token': token } });
  const j2 = await r2.json();
  console.log('code:', j2.code, '· message:', j2.message);
  const saItems = j2.data?.dataList ?? j2.data?.list ?? j2.data?.data ?? j2.data ?? [];
  console.log('SA items count:', Array.isArray(saItems) ? saItems.length : 'not array');

  // 3) Try a category search for "car"
  console.log('\n=== /product/list?keyWord=car&pageSize=3 ===');
  const r3 = await fetch(`${BASE}/product/list?keyWord=car&pageNum=1&pageSize=3`, { headers: { 'CJ-Access-Token': token } });
  const j3 = await r3.json();
  console.log('code:', j3.code, '· total:', j3.data?.total);
  const kwItems = j3.data?.dataList ?? j3.data?.list ?? j3.data?.data ?? j3.data ?? [];
  console.log('matched items:', Array.isArray(kwItems) ? kwItems.length : 'not array');
  if (Array.isArray(kwItems)) {
    kwItems.slice(0, 3).forEach((p) => {
      console.log('  -', p.id ?? p.pid, '·', (p.nameEn ?? p.name ?? '').slice(0, 60));
    });
  }
}

main().catch((e) => { console.error('Error:', e.message); });
