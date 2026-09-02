// One-shot test of CJ API connectivity.
// 1) Auth: get access token
// 2) List products in Saudi warehouse
// 3) Report

const KEY = process.env.CJ_API_KEY;
const BASE = 'https://developers.cjdropshipping.com/api2.0/v1';

async function main() {
  if (!KEY) {
    console.error('CJ_API_KEY not set in env');
    process.exit(1);
  }
  console.log('Using API key prefix:', KEY.slice(0, 6) + '…' + KEY.slice(-4));
  console.log('');

  // 1) Auth
  console.log('1) POST /authentication/getAccessToken ...');
  const authRes = await fetch(`${BASE}/authentication/getAccessToken`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey: KEY }),
  });
  const authJson = await authRes.json();
  console.log('   HTTP:', authRes.status);
  console.log('   code:', authJson.code, '· message:', authJson.message);
  if (authJson.code !== 200) {
    console.log('   ✗ Auth failed. Common causes:');
    console.log('     - Account not yet approved by CJ (1-3 days)');
    console.log('     - Wrong API key (regenerate in dashboard)');
    console.log('     - Account in different region');
    return;
  }
  const token = authJson.data.accessToken;
  const expiry = new Date(authJson.data.accessTokenExpiryDate).toISOString();
  console.log('   ✓ Token valid until', expiry);

  // 2) List products (Saudi warehouse if possible)
  console.log('');
  console.log('2) GET /product/list?pageNum=1&pageSize=5 ...');
  const listRes = await fetch(`${BASE}/product/list?pageNum=1&pageSize=5`, {
    headers: { 'CJ-Access-Token': token },
  });
  const listJson = await listRes.json();
  console.log('   HTTP:', listRes.status);
  console.log('   code:', listJson.code, '· message:', listJson.message);
  if (listJson.code === 200) {
    const prods = listJson.data?.data ?? listJson.data ?? [];
    console.log('   ✓ Got', prods.length, 'products (first page)');
    prods.slice(0, 5).forEach((p) => {
      console.log('     -', p.id, '·', (p.name || '').slice(0, 50));
    });
    console.log('   total available:', listJson.data?.total ?? '?');
  }

  // 3) Try listing Saudi warehouse
  console.log('');
  console.log('3) GET /product/list?warehouseCountry=SA&pageSize=5 ...');
  const saRes = await fetch(`${BASE}/product/list?warehouseCountry=SA&pageNum=1&pageSize=5`, {
    headers: { 'CJ-Access-Token': token },
  });
  const saJson = await saRes.json();
  console.log('   HTTP:', saRes.status);
  console.log('   code:', saJson.code, '· message:', saJson.message);
  if (saJson.code === 200) {
    const prods = saJson.data?.data ?? saJson.data ?? [];
    console.log('   ✓ Saudi warehouse products:', prods.length, 'on first page');
    prods.slice(0, 3).forEach((p) => {
      console.log('     -', p.id, '·', (p.name || '').slice(0, 50));
    });
  }
}

main().catch((e) => {
  console.error('Error:', e.message);
  process.exit(1);
});
