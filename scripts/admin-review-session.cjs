// Temporary, local-only browser session; never changes products or credentials.
const { createClient } = require('@supabase/supabase-js');
const { randomBytes, createHash } = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const file = path.join(__dirname, '..', 'admin-review.local-secret');
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
async function main() {
  if (process.argv[2] === 'cleanup') {
    const state = JSON.parse(fs.readFileSync(file, 'utf8'));
    const hash = createHash('sha256').update(state.cookies[0].value).digest('hex');
    const result = await db.from('admin_sessions').delete().eq('token', hash);
    if (result.error) throw result.error;
    fs.unlinkSync(file); console.log('Verification session removed'); return;
  }
  if (fs.existsSync(file)) throw new Error('Clean up the previous session first');
  const { data, error } = await db.from('admin_users').select('id').eq('active', true).limit(1).single();
  if (error) throw error;
  const token = randomBytes(32).toString('hex');
  const result = await db.from('admin_sessions').insert({ admin_id: data.id, token: createHash('sha256').update(token).digest('hex'), expires_at: new Date(Date.now()+3600000).toISOString(), user_agent:'admin-review-local' });
  if (result.error) throw result.error;
  fs.writeFileSync(file, JSON.stringify({ cookies: [{ name:'rukub_admin_session', value:token, domain:'localhost', path:'/', httpOnly:true, secure:false, sameSite:'Lax', expires: Math.floor(Date.now()/1000)+3600 }], origins:[] }));
  console.log('Local verification session ready');
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
