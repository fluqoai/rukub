// End-to-end test: create order via API, fetch it, patch status, verify Supabase round-trip.
const BASE = 'http://localhost:3000';
const orderId = 'RKB-E2E-' + new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);

const orderInput = {
  id: orderId,
  items: [
    { productId: 'p_car_organizer_01', productName: 'منظم السيارة المعلق - 4 قطع', productShortName: 'منظم السيارة المعلق', quantity: 1, price: 89 },
    { productId: 'p_phone_holder_01',  productName: 'حامل الجوال المغناطيسي للوحة القيادة', productShortName: 'حامل الجوال المغناطيسي', quantity: 2, price: 65 },
  ],
  shipping: { fullName: 'أحمد محمد', phone: '0501234567', email: 'ahmed@example.com', city: 'الرياض', district: 'العليا', notes: 'اتصل قبل الوصول' },
  paymentMethod: 'cod',
  subtotal: 219,
  shippingCost: 0,
  total: 219,
  status: 'pending',
};

async function call(method, url, body) {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json; try { json = JSON.parse(text); } catch { json = null; }
  return { status: res.status, text, json };
}

function log(label, r) {
  console.log(`\n=== ${label} ===`);
  console.log(`status: ${r.status}`);
  if (r.json) {
    const safe = JSON.stringify(r.json, (k, v) => typeof v === 'string' && v.length > 120 ? v.slice(0, 120) + '…' : v, 2);
    console.log(safe);
  } else {
    console.log(r.text.slice(0, 400));
  }
}

(async () => {
  console.log('orderId:', orderId);
  log('POST /api/orders', await call('POST', `${BASE}/api/orders`, orderInput));
  log('GET  /api/orders (list, last 5)', await call('GET', `${BASE}/api/orders?limit=5`));
  log('GET  /api/orders/:id', await call('GET', `${BASE}/api/orders/${orderId}`));
  log('PATCH /api/orders/:id  (status=confirmed)', await call('PATCH', `${BASE}/api/orders/${orderId}`, { status: 'confirmed' }));
  log('GET  /api/orders/:id  (after patch)', await call('GET', `${BASE}/api/orders/${orderId}`));
})();
