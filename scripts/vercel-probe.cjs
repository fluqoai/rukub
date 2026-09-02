// Probe live Vercel site to see real errors
(async () => {
  const BASE = 'https://rukub.vercel.app';
  for (const p of ['/api/products', '/shop/women', '/shop/men', '/shop/shared', '/privacy']) {
    try {
      const r = await fetch(BASE + p, { signal: AbortSignal.timeout(15000) });
      const body = await r.text();
      console.log(p, '·', r.status, '·', body.length, 'bytes');
      const titleMatch = body.match(/<title>([^<]+)<\/title>/);
      if (titleMatch) console.log('  title:', titleMatch[1]);
      // Try to extract error message from HTML
      const errMatch = body.match(/Error[^<"']{0,300}/);
      if (errMatch) console.log('  err:', errMatch[0]);
      // JSON error pattern
      const jsonMatch = body.match(/"error":"([^"]+)"/);
      if (jsonMatch) console.log('  json.err:', jsonMatch[1]);
    } catch (e) {
      console.log(p, '· ERR', e.message);
    }
  }
})();
