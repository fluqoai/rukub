// Find the automotive category by trying IDs and checking if products look car-related.
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

  for (const cid of ['9', '7', '10', '8', '14', '15', '20', '18', '19', '13', '11', '12', '16', '17']) {
    const r = await jget(`/product/list?categoryId=${cid}&pageNum=1&pageSize=8&saleStatus=1`, token);
    if (r.code !== 200) { console.log(`id=${cid}: ${r.message}`); continue; }
    const items = r.data?.list ?? [];
    console.log(`\n=== categoryId=${cid} · total=${r.data?.total} ===`);
    items.slice(0, 8).forEach((p) => {
      const name = p.productNameEn || p.productName || '?';
      const shipsSA = (p.shippingCountryCodes || []).includes('SA');
      console.log(`  ${p.pid}: ${name.slice(0,55)} | ${p.sellPrice} | SA:${shipsSA?'Y':'n'}`);
    });
  }
}

main().catch((e) => { console.error('Error:', e.message); });
