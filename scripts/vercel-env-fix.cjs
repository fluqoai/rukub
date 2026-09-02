// Fix Vercel env vars: delete and re-add as plaintext.
// Vercel's API shows the same encrypted eyJ2... prefix for all values
// regardless of content, so we can't tell from the read what the real
// plaintext is. The fix: delete and re-add using values from .env.local.

const fs = require('fs');
const path = require('path');
const https = require('https');

const TOKEN = process.env.VERCEL_TOKEN;
const PROJ_ID = 'prj_G3KPhxRNHnB0cHk7TFlqzfAYr3Kt';

if (!TOKEN) {
  console.error('Set VERCEL_TOKEN env var');
  process.exit(1);
}

// Read .env.local
const envLocal = fs.readFileSync(path.join('C:\\Users\\khayrat\\Desktop\\MyProjects\\dropshoping', '.env.local'), 'utf8');
const env = {};
envLocal.split('\n').forEach((line) => {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
  if (m) env[m[1]] = m[2].trim();
});

console.log('Loaded from .env.local:');
Object.keys(env).forEach((k) => console.log(' ', k, '=', env[k].slice(0, 30) + (env[k].length > 30 ? '...' : '')));

const HEADERS = { Authorization: `Bearer ${TOKEN}` };

function req(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const opts = {
      method,
      hostname: 'api.vercel.com',
      path,
      headers: {
        ...HEADERS,
        ...(data ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    };
    const r = https.request(opts, (res) => {
      let d = '';
      res.on('data', (c) => (d += c));
      res.on('end', () => {
        const status = res.statusCode;
        let parsed;
        try { parsed = JSON.parse(d); } catch { parsed = d; }
        resolve({ status, body: parsed });
      });
    });
    r.on('error', reject);
    if (data) r.write(data);
    r.end();
  });
}

// 1) list existing env vars
(async () => {
  console.log('\n=== current env vars (production) ===');
  const r = await req('GET', `/v9/projects/${PROJ_ID}/env?target=production`);
  if (r.body.envs) {
    r.body.envs.forEach((e) => console.log(' ', e.key, '·', e.type));
  }

  // 2) Delete all existing production env vars
  console.log('\n=== deleting existing production env vars ===');
  if (r.body.envs) {
    for (const e of r.body.envs) {
      const res = await req('DELETE', `/v9/projects/${PROJ_ID}/env/${e.id}`);
      console.log('  deleted', e.key, '·', res.status);
    }
  }

  // 3) Add the env vars we want
  console.log('\n=== adding production env vars ===');
  for (const [key, value] of Object.entries(env)) {
    if (!value) continue;
    const res = await req('POST', `/v10/projects/${PROJ_ID}/env`, {
      key,
      value,
      type: 'plain',  // plain text (not sensitive/encrypted)
      target: ['production'],
    });
    console.log('  added', key, '·', res.status, res.body.error?.message || 'OK');
  }

  // 4) Verify
  console.log('\n=== verify ===');
  const r2 = await req('GET', `/v9/projects/${PROJ_ID}/env?target=production`);
  if (r2.body.envs) {
    r2.body.envs.forEach((e) => console.log(' ', e.key, '·', e.type, '· length:', e.value?.length || 0));
  }
})();
