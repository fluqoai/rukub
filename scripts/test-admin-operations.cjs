const { mocks } = require('./register-ts.cjs');
const { test } = require('node:test');
const assert = require('node:assert/strict');
let admin = { id: 'admin' };
let row = { id:'fixture',status:'confirmed' };
let saved;
mocks.set('@/lib/admin-auth-server',{ getCurrentAdmin:async()=>admin });
mocks.set('@/lib/db/orders',{getOrder:async()=>row,updateOrderStatus:async(id,status,extras)=>{saved={id,status,...extras};return saved;}});
const { PATCH } = require('../app/api/orders/[id]/route.ts');
const req = body => new Request('http://localhost/api/orders/fixture',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
test('mail preferences and write-ahead log protect real sending; provider results persist',async()=>{
  let enabled=true, logFails=false, calls=0, update;
  mocks.set('./email-client',{sendOrderEmail:async()=>{calls++;return {status:'sent',provider:'resend',id:'provider-id'};}});
  mocks.set('./supabase/client',{createAdminSupabase:()=>({from:table=>table==='settings'?{select:()=>({eq:()=>({maybeSingle:async()=>({data:{value:{order_created:enabled}},error:null})})})}:{insert:async()=>({error:logFails?{}:null}),update:patch=>({eq:async()=>{update=patch;return {error:null};}})}})});
  const {sendOrderNotification}=require('../lib/notifications-service.ts');
  const input={trigger:'order_created',order:{id:'fixture',items:[],shipping:{email:'test@example.invalid',fullName:'Test'},total:0}};
  enabled=false;assert.equal((await sendOrderNotification(input)).email.sent,false);assert.equal(calls,0);
  enabled=true;logFails=true;assert.equal((await sendOrderNotification(input)).email.sent,false);assert.equal(calls,0);
  logFails=false;assert.equal((await sendOrderNotification(input)).email.sent,true);assert.equal(calls,1);assert.equal(update.status,'sent');
});
test('tracking-only update retains status; invalid updates and unauthenticated calls never save',async()=>{
  let res=await PATCH(req({trackingNumber:'TRACK-123'}),{params:{id:'fixture'}});
  assert.equal(res.status,200);assert.equal(saved.status,undefined);assert.equal(saved.trackingNumber,'TRACK-123');
  for(const body of [{},{status:'invented'},{trackingNumber:42}])assert.equal((await PATCH(req(body),{params:{id:'fixture'}})).status,400);
  row=null;assert.equal((await PATCH(req({status:'shipped'}),{params:{id:'fixture'}})).status,404);
  admin=null;assert.equal((await PATCH(req({status:'shipped'}),{params:{id:'fixture'}})).status,401);
});
test('sparse AI source still produces a saveable Arabic tagline, without inventing specifications',()=>{
  const {arabicProductPatch,productSource,productFormError}=require('../lib/admin-product-editor.ts');
  const form={id:'fixture',name:'Armrest pad',description:'Armrest pad',short_name:'Pad',tagline:'Imported',price:10,cost:5,active:false,metadata:{},variants:[]};
  const draft={name:'وسادة مسند ذراع',short_name:'وسادة مسند',description:'وسادة لمسند ذراع السيارة.',tagline:'',features:[],variants:[],specifications:[],usage:'',seo_title:'',seo_description:'',warnings:[]};
  const patch=arabicProductPatch(form,{id:'g',source:productSource(form)},draft);
  assert.equal(productFormError({...form,...patch}),null);assert.equal(patch.tagline,draft.short_name);assert.deepEqual(patch.metadata.specifications,[]);
});
test('public product keeps saved Arabic description, usage, and more than three features without supplier secrets',async()=>{
  mocks.set('next/cache',{unstable_noStore:()=>{}});
  mocks.set('@/lib/db/products',{listProducts:async()=>[{id:'fixture',name:'اسم عربي',short_name:'عربي',description:'وصف عربي محفوظ',tagline:'تعريف',price:20,cost:7,active:true,audience:'shared',images:[],metadata:{features:['أ','ب','ج','د'],usage:'طريقة الاستخدام',specifications:[{label:'اللون',value:'أسود'}],supplier_secret:'private'}}]});
  const {getPublicProducts}=require('../lib/public-products.ts');
  const [p]=await getPublicProducts();assert.equal(p.description,'وصف عربي محفوظ');assert.equal(p.features.length,4);assert.equal(p.usage,'طريقة الاستخدام');assert.equal('cost' in p,false);assert.equal('metadata' in p,false);
});
