// Trigger a new Vercel deployment (uses latest git commit on main).
const https = require('https');
const TOKEN = process.env.VERCEL_TOKEN;
const PROJ_ID = 'prj_G3KPhxRNHnB0cHk7TFlqzfAYr3Kt';
const PROJ_NAME = 'rukub';

const opts = {
  method: 'POST',
  hostname: 'api.vercel.com',
  path: '/v13/deployments',
  headers: {
    Authorization: `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
  },
};
const body = JSON.stringify({
  name: PROJ_NAME,
  target: 'production',
  gitSource: { type: 'github', ref: 'main', repoId: 1355080950, repoOwnerId: 317608074, gitCredentialId: 'cred_ece44bb52ae9422ba4ab157c43e2b94e3906e096' },
});

const req = https.request(opts, (res) => {
  let d = '';
  res.on('data', (c) => (d += c));
  res.on('end', () => {
    console.log('status:', res.statusCode);
    const j = JSON.parse(d);
    console.log('uid:', j.uid);
    console.log('url:', j.url);
    console.log('state:', j.state);
    if (j.error) console.log('error:', j.error);
  });
});
req.write(body);
req.end();
