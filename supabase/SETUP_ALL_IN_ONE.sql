-- ===========================================
-- Dropshoping — Complete Setup (ALL IN ONE)
-- ===========================================
-- Run this SINGLE file in: Supabase Dashboard → SQL Editor → New Query
-- Project: lpebhjmtjhnyvwqhynih
-- Safe to re-run (all statements are idempotent)

-- ===========================================
-- PART 1: SCHEMA (Tables + Enums + Triggers + Views)
-- ===========================================

create extension if not exists "uuid-ossp";

-- ENUMS
do $$ begin
  if not exists (select 1 from pg_type where typname = 'audience_type') then
    create type audience_type as enum ('women', 'men', 'shared');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname = 'order_status') then
    create type order_status as enum ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname = 'payment_method') then
    create type payment_method as enum ('cod', 'tap', 'tabby');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname = 'notification_channel') then
    create type notification_channel as enum ('email', 'whatsapp');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname = 'notification_status') then
    create type notification_status as enum ('pending', 'sent', 'delivered', 'read', 'failed', 'bounced');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname = 'notification_trigger') then
    create type notification_trigger as enum ('order_created', 'order_confirmed', 'order_shipped', 'order_delivered', 'order_cancelled');
  end if;
end $$;

-- TABLES
create table if not exists public.customers (
  id uuid primary key default uuid_generate_v4(),
  full_name text not null,
  phone text not null unique,
  email text,
  city text,
  district text,
  notes text,
  total_orders int default 0,
  total_spent numeric(12, 2) default 0,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_customers_phone on public.customers(phone);

create table if not exists public.products (
  id text primary key,
  name text not null,
  short_name text not null,
  name_ar text,
  description text not null,
  tagline text not null,
  audience audience_type not null default 'shared',
  audience_label text not null default 'مشترك',
  price numeric(12, 2) not null,
  old_price numeric(12, 2),
  cost numeric(12, 2) not null default 0,
  margin numeric(5, 2),
  badge text,
  tier int default 1,
  is_hero boolean default false,
  cj_product_id text,
  category_id int,
  category_name text,
  brand text,
  weight int,
  images text[] default '{}',
  variants jsonb default '[]'::jsonb,
  free_shipping boolean default false,
  estimated_delivery_days int default 5,
  rating numeric(3, 1) default 0,
  review_count int default 0,
  sales_count int default 0,
  metadata jsonb default '{}'::jsonb,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_products_audience on public.products(audience);
create index if not exists idx_products_active on public.products(active) where active = true;

create table if not exists public.orders (
  id text primary key,
  customer_id uuid references public.customers(id) on delete set null,
  status order_status not null default 'pending',
  payment_method payment_method not null default 'cod',
  payment_status text default 'pending',
  cj_order_id text,
  tracking_number text,
  subtotal numeric(12, 2) not null,
  shipping_cost numeric(12, 2) default 0,
  total numeric(12, 2) not null,
  currency text default 'SAR',
  shipping_full_name text not null,
  shipping_phone text not null,
  shipping_email text,
  shipping_city text not null,
  shipping_district text not null,
  shipping_notes text,
  shipping_address jsonb,
  cj_error text,
  metadata jsonb default '{}'::jsonb,
  placed_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_orders_placed_at on public.orders(placed_at desc);
create index if not exists idx_orders_status on public.orders(status);

create table if not exists public.order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id text not null references public.orders(id) on delete cascade,
  product_id text not null,
  product_name text not null,
  product_short_name text not null,
  quantity int not null check (quantity > 0),
  price numeric(12, 2) not null,
  subtotal numeric(12, 2) not null,
  variant text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);
create index if not exists idx_order_items_order on public.order_items(order_id);

create table if not exists public.notifications (
  id text primary key,
  order_id text references public.orders(id) on delete set null,
  channel notification_channel not null,
  trigger notification_trigger not null,
  recipient text not null,
  subject text,
  body text not null,
  status notification_status not null default 'pending',
  provider text,
  error text,
  sent_at timestamptz default now()
);
create index if not exists idx_notifications_sent_at on public.notifications(sent_at desc);

create table if not exists public.admin_users (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid unique,
  email text unique not null,
  full_name text,
  role text not null default 'admin',
  active boolean default true,
  last_login_at timestamptz,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists public.settings (
  key text primary key,
  value jsonb not null,
  category text default 'general',
  description text,
  updated_at timestamptz default now(),
  updated_by uuid references public.admin_users(id) on delete set null
);

create table if not exists public.audit_log (
  id uuid primary key default uuid_generate_v4(),
  actor_id uuid references public.admin_users(id) on delete set null,
  actor_type text not null default 'admin',
  action text not null,
  resource_type text,
  resource_id text,
  before jsonb,
  after jsonb,
  ip_address text,
  user_agent text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- TRIGGERS
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_customers_updated on public.customers;
create trigger trg_customers_updated before update on public.customers
  for each row execute function public.set_updated_at();

drop trigger if exists trg_products_updated on public.products;
create trigger trg_products_updated before update on public.products
  for each row execute function public.set_updated_at();

drop trigger if exists trg_orders_updated on public.orders;
create trigger trg_orders_updated before update on public.orders
  for each row execute function public.set_updated_at();

create or replace function public.upsert_customer_from_order()
returns trigger as $$
declare
  existing_customer_id uuid;
begin
  select id into existing_customer_id
  from public.customers
  where phone = new.shipping_phone
  limit 1;

  if existing_customer_id is null then
    insert into public.customers (full_name, phone, email, city, district, notes)
    values (new.shipping_full_name, new.shipping_phone, new.shipping_email, new.shipping_city, new.shipping_district, new.shipping_notes)
    returning id into existing_customer_id;
  end if;

  update public.customers
  set
    total_orders = total_orders + 1,
    total_spent = total_spent + new.total,
    updated_at = now()
  where id = existing_customer_id;

  new.customer_id := existing_customer_id;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_orders_upsert_customer on public.orders;
create trigger trg_orders_upsert_customer before insert on public.orders
  for each row execute function public.upsert_customer_from_order();

-- VIEWS
create or replace view public.order_summary as
select
  o.id, o.status, o.payment_method, o.payment_status,
  o.shipping_full_name, o.shipping_phone, o.shipping_city, o.shipping_district,
  o.subtotal, o.shipping_cost, o.total,
  o.cj_order_id, o.tracking_number,
  o.placed_at, o.updated_at,
  c.id as customer_id, c.full_name as customer_name, c.email as customer_email,
  (select count(*) from public.order_items where order_id = o.id) as item_count
from public.orders o
left join public.customers c on c.id = o.customer_id;

create or replace view public.top_products as
select
  p.id, p.name, p.short_name, p.price,
  p.audience, p.rating, p.review_count, p.sales_count,
  coalesce(sum(oi.quantity), 0)::int as units_sold,
  coalesce(sum(oi.subtotal), 0) as revenue
from public.products p
left join public.order_items oi on oi.product_id = p.id
group by p.id, p.name, p.short_name, p.price, p.audience, p.rating, p.review_count, p.sales_count;

-- ===========================================
-- PART 2: ROW LEVEL SECURITY
-- ===========================================

alter table public.customers enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.notifications enable row level security;
alter table public.admin_users enable row level security;
alter table public.settings enable row level security;
alter table public.audit_log enable row level security;

-- Drop all existing policies
do $$
declare r record;
begin
  for r in (select policyname, tablename from pg_policies where schemaname = 'public') loop
    execute format('drop policy if exists %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

-- Public read for active products
create policy "Active products are public" on public.products
  for select to anon, authenticated using (active = true);

-- Anyone can create customers (on checkout)
create policy "Customers can be created" on public.customers
  for insert to anon, authenticated with check (true);

-- Anyone can read customers
create policy "Customers are readable" on public.customers
  for select to anon, authenticated using (true);

-- Anyone can create orders
create policy "Orders can be created" on public.orders
  for insert to anon, authenticated with check (true);

-- Anyone can read orders (in MVP)
create policy "Orders are readable" on public.orders
  for select to anon, authenticated using (true);

-- Order items readable
create policy "Order items readable" on public.order_items
  for select to anon, authenticated using (true);

-- Order items can be created
create policy "Order items can be created" on public.order_items
  for insert to anon, authenticated with check (true);

-- Notifications readable
create policy "Notifications readable" on public.notifications
  for select to anon, authenticated using (true);

-- Settings readable
create policy "Settings readable" on public.settings
  for select to anon, authenticated using (true);

-- ===========================================
-- PART 3: SEED DATA (20 products + settings)
-- ===========================================

insert into public.products (id, name, short_name, description, tagline, audience, audience_label, price, cost, margin, badge, tier, is_hero, rating, review_count, sales_count, free_shipping, estimated_delivery_days) values
  ('p01', 'منظم فراغ المقعد الجانبي', 'منظم فراغ المقعد', 'الحل النهائي للفوضى بين المقعد ونقطة التوقف. يمنع سقوط الجوال، المفاتيح، النقود، وبطاقات الـ VIP في تلك المنطقة المستحيلة الوصول. تصميم بسيط يناسب 99% من السيارات.', 'وداعاً للجوال اللي يطيح بين المقاعد', 'shared', 'مشترك', 49, 12, 0.75, 'الأكثر مبيعاً', 1, true, 4.8, 230, 5230, true, 2),
  ('p02', 'شاحن السيارة المغناطيسي 15W', 'شاحن مغناطيسي', 'شاحن لاسلكي بتقنية MagSafe يثبّت جوالك بقبضة مغناطيسية قوية أثناء الطريق ويشحنه في نفس الوقت بـ 15W. متوافق مع iPhone 12 وما بعده.', 'يثبّت جوالك ويشحنه في نفس الوقت', 'men', 'للرجال', 149, 45, 0.70, 'الأكثر مبيعاً', 3, true, 4.7, 412, 3200, true, 2),
  ('p03', 'معطر السيارة الفاخر - مجموعة عود/مسك/عنبر', 'معطر عود فاخر', 'معطر سيارة بتصميم أنيق بنفحات عود ملكي، مسك أبيض، وعنبر دافئ. عبوة معدنية متينة بغطاء خشبي طبيعي، تدوم 60-90 يوم.', 'نفحة هوية سعودية في كل رحلة', 'shared', 'مشترك', 29, 6, 0.79, 'الأكثر مبيعاً', 1, true, 4.9, 1240, 18200, true, 2),
  ('p04', 'وسادة التبريد المائية - هدية الصيف', 'وسادة تبريد', 'وسادة مقعد بتقنية التبريد المائي و gel - تخفض حرارة المقعد بـ 15° في 30 ثانية. مروحة هادئة بـ 3 سرعات، USB-C للشحن، تغطية قابلة للغسل.', 'تقطع 15° عن مقعدك في 30 ثانية', 'shared', 'مشترك', 129, 38, 0.71, 'جديد', 3, true, 4.6, 89, 410, true, 3),
  ('p05', 'كاميرا السيارة الذكية 4K', 'داش كام 4K', 'كاميرا داش بـ 4K حقيقية، زاوية عريضة 170°، رؤية ليلية بـ Sony IMX335، تسجيل حلقي تلقائي، مستشعر حركة، وحساس G لتسجيل الحوادث. ذاكرة 64GB مرفقة.', 'شاهد كل شيء، ليلاً ونهاراً', 'men', 'للرجال', 349, 95, 0.73, 'شحن سريع', 4, false, 4.8, 256, 1820, true, 2),
  ('p06', 'منظم المقعد الخلفي - مجموعة العائلة', 'منظم العائلة', 'منظم يثبت على ظهر المقعد الأمامي، يحتوي على 6 جيوب للألعاب، الكتب، المناديل، القناني، والأجهزة اللوحية. مقاوم للماء، سهل التنظيف، يناسب جميع السيارات.', 'العائلة كلها مرتّبة في مقعد واحد', 'women', 'للنساء', 99, 28, 0.72, 'جديد', 2, true, 4.7, 145, 980, true, 2),
  ('p07', 'منفاخ الإطارات المحمول 12V', 'منفاخ إطارات', 'منفاخ إطارات محمول ببطارية ليثيوم قابلة للشحن، شاشة رقمية لقراءة الضغط، إطفاء تلقائي عند الضغط المستهدف. مصباح LED مدمج للطوارئ.', 'نفخ إطار في دقيقتين، في أي مكان', 'men', 'للرجال', 199, 55, 0.72, null, 3, false, 4.5, 78, 560, true, 3),
  ('p08', 'شاحن سيارة USB-C + USB-A 65W', 'شاحن سريع 65W', 'شاحن سيارة بمنفذين USB-C و USB-A بقدرة إجمالية 65W. يدعم PD و QC للشحن السريع. حجم مدمج، إضاءة LED زرقاء خفيفة.', 'اشحن جوالك ولابتوبك من نفس المكان', 'men', 'للرجال', 59, 14, 0.76, null, 2, false, 4.6, 189, 2100, true, 2),
  ('p09', 'طقم الإضاءة LED الداخلية RGB', 'إضاءة LED', 'طقم إضاءة LED داخلية بـ 4×24" LED strips. تطبيق تحكم. موسيقى متزامنة. 16 مليون لون. لاصق خلفي.', 'أضف شخصية لسيارتك', 'men', 'للرجال', 89, 22, 0.75, null, 2, false, 4.4, 234, 1820, true, 2),
  ('p10', 'واقي الشمس القلاب 5-طبقات', 'واقي شمس', 'واقي شمس قلاب 5-طبقات بعزل حراري قوي. يناسب معظم السيارات، طي مدمج، تخزين سهل. يقلل حرارة المقصورة الداخلية حتى 30°.', 'درع سيارتك من لهيب الشمس', 'shared', 'مشترك', 69, 18, 0.74, null, 2, false, 4.5, 312, 3450, true, 2),
  ('p11', 'كشاف LED 60W للأعمال', 'مكبرة LED', 'مكبرة سيارة LED طويلة المدى بقوة 60W مع هوائي 4G مدمج. مقاومة للماء IP67، تركيب بدون تعديلات في السيارة. إضاءة 360° قابلة للتعديل.', 'أمان إضافي للقيادة الليلية والصحراوية', 'men', 'للرجال', 169, 45, 0.73, null, 3, false, 4.6, 67, 320, true, 3),
  ('p12', 'مكنسة السيارة اللاسلكية المحمولة 15000Pa', 'مكنسة سيارة', 'مكنسة سيارة لاسلكية بقوة شفط 15000Pa، بطارية قابلة للشحن 30 دقيقة تشغيل مستمر. 4 فوهات لجميع الزوايا، فلتر HEPA قابل للغسل.', 'تنظيف عميق بقوة شفط 15000Pa', 'shared', 'مشترك', 179, 48, 0.73, null, 3, false, 4.5, 145, 870, true, 3),
  ('p13', 'غطاء المقود الجلدي - 4 مقاسات', 'غطاء مقود', 'غطاء مقود جلد طبيعي بـ 4 مقاسات (S/M/L/XL) تناسب كل السيارات. تركيب بدون أدوات، ملمس مريح، مقاوم للعرق والحرارة.', 'قبضة أريح، شكل أرقى', 'men', 'للرجال', 79, 22, 0.72, null, 2, false, 4.6, 198, 1650, true, 2),
  ('p14', 'وسادة الظهر الميموري فوم', 'وسادة ظهر', 'وسادة ظهر ميموري فوم طبية، تدعم الفقرات القطنية، تقلل الضغط على العصعص. غطاء مخملي قابل للإزالة والغسل. مثالية لمن يقودون أكثر من ساعة يومياً.', 'دعم قطني لساعات من القيادة المريحة', 'women', 'للنساء', 119, 32, 0.73, null, 3, false, 4.7, 245, 1320, true, 2),
  ('p15', 'تعاليق المرآة - مجموعة Premium', 'تعاليق مرآة', '7 تصاميم أنيقة مستوحاة من الفن العربي والخطوط الكلاسيكية - عود، هلال، نجوم، خطوط هندسية. خشب طبيعي أو أكريليك فاخر مع حبل قطني.', 'لمسة شخصية على كل رحلة', 'women', 'للنساء', 29, 5, 0.83, 'لمسة شخصية', 1, true, 4.8, 380, 5800, true, 2),
  ('p16', 'منظم شنطة السيارة القابل للطي', 'منظم شنطة', 'منظم شنطة قابل للطي، 3 حجرات، جيوب جانبية. يتحمل حتى 30kg. يفتح وينطوي في ثوانٍ، يناسب جميع السيارات. مثالي للعائلات والمسافرين.', 'شنطة مرتّبة = رحلات بلا فوضى', 'men', 'للرجال', 139, 38, 0.73, null, 3, false, 4.5, 89, 540, true, 3),
  ('p17', 'مرآة رؤية خلفية مضادة للوهج', 'مرآة مضادة للوهج', 'مرآة سيارة إضافية بمشبك، زجاج مضاد للوهج، وضع ليلي تلقائي يقلل إضاءة المصابيح الخلفية. رؤية عريضة بزاوية 180°.', 'قيادة ليلية أكثر أماناً', 'shared', 'مشترك', 59, 14, 0.76, null, 2, false, 4.7, 134, 920, true, 2),
  ('p18', 'ناشر العطور بالموجات فوق الصوتية 200ml', 'ناشر عطور', 'ناشر عطور بالموجات فوق الصوتية بـ 7 نفحات، إضاءة LED مهدّئة، USB-C للشحن. تقنية الضباب البارد الآمنة على الأقمشة. خزان 200ml يكفي لشهر كامل.', 'سيارة برائحة الـ spa', 'women', 'للنساء', 149, 42, 0.72, 'جديد', 3, false, 4.6, 87, 410, true, 2),
  ('p19', 'صينية الأكواب والمسكة للسائق (Bento)', 'صينية أكواب', 'صينية بثلاثة جيوب + فتحة للقناني، تثبت على المقعد أو الكونسول الوسطي. سطح مضاد للانزلاق، سهلة التنظيف. تصميم أنيق بلون بيج هادئ.', 'كل شيء في متناول يدك بأمان', 'women', 'للنساء', 49, 12, 0.76, null, 1, false, 4.5, 156, 1240, true, 2),
  ('p20', 'مرآة الرؤية الخلفية الذكية 10.88"', 'مرآة ذكية', 'مرآة رؤية خلفية ذكية بشاشة 10.88" IPS، كاميرا أمامية 4K + كاميرا خلفية، تسجيل حلقي، GPS مدمج، رؤية ليلية. تتصل بالهاتف عبر WiFi.', 'استبدل مرآتك بكاميرا وشاشة', 'men', 'للرجال', 449, 130, 0.71, 'شحن سريع', 4, false, 4.7, 89, 280, true, 2)
on conflict (id) do update set
  name = excluded.name,
  price = excluded.price,
  updated_at = now();

insert into public.settings (key, value, category, description) values
  ('store.name', '"ركوب"'::jsonb, 'general', 'اسم المتجر'),
  ('store.email', '"support@rukub.shop"'::jsonb, 'general', 'البريد الإلكتروني'),
  ('store.currency', '"SAR"'::jsonb, 'general', 'العملة'),
  ('payment.cod_enabled', 'true'::jsonb, 'payment', 'تفعيل COD'),
  ('payment.tap_enabled', 'true'::jsonb, 'payment', 'تفعيل Tap'),
  ('admin.demo_login', '"admin / admin123"'::jsonb, 'admin', 'بيانات دخول الأدمن')
on conflict (key) do update set
  value = excluded.value,
  updated_at = now();

-- ===========================================
-- PART 4: ADMIN AUTH (password_hash + sessions)
-- ===========================================

-- Add password_hash to admin_users
alter table public.admin_users
  add column if not exists password_hash text;

-- Admin sessions table
create table if not exists public.admin_sessions (
  id uuid primary key default uuid_generate_v4(),
  admin_id uuid not null references public.admin_users(id) on delete cascade,
  token text unique not null,
  user_agent text,
  ip_address text,
  expires_at timestamptz not null,
  created_at timestamptz default now()
);
create index if not exists idx_admin_sessions_token on public.admin_sessions(token);
create index if not exists idx_admin_sessions_admin on public.admin_sessions(admin_id);
create index if not exists idx_admin_sessions_expires on public.admin_sessions(expires_at);

alter table public.admin_sessions enable row level security;
-- No public RLS — only service role accesses this table.

-- Default admin (password: admin123 — change after first login)
delete from public.admin_users where email = 'admin@rukub.shop';
insert into public.admin_users (email, full_name, role, active, password_hash)
values (
  'admin@rukub.shop',
  'مدير المتجر',
  'admin',
  true,
  'b6e3fc34adddbda36031cf01f3ad850f:44c6ad7125b9144f6b0a29ee6a4d639d39b6d369eb3e666de408f848a0342fe52cb899b80168df0ff94ead88b8e60f5aa5f52d65afec2edc3503f0ca631c1969'
);

-- ===========================================
-- DONE! Schema + RLS + Seed + Admin Auth complete.
-- ===========================================

-- Verify:
-- select count(*) from public.products;       -- should return 20
-- select count(*) from public.settings;       -- should return 6
-- select email, full_name, role from public.admin_users;  -- admin@rukub.shop
