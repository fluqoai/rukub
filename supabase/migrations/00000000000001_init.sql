-- ===========================================
-- Dropshoping — Full Schema (PostgreSQL / Supabase)
-- ===========================================
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- This script is idempotent — safe to re-run.

-- ==================== EXTENSIONS ====================
create extension if not exists "uuid-ossp";

-- ==================== ENUMS ====================
do $$ begin
  if not exists (select 1 from pg_type where typname = 'audience_type') then
    create type audience_type as enum ('women', 'men', 'shared');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname = 'order_status') then
    create type order_status as enum (
      'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'
    );
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
    create type notification_trigger as enum (
      'order_created', 'order_confirmed', 'order_shipped', 'order_delivered', 'order_cancelled'
    );
  end if;
end $$;

-- ==================== CUSTOMERS ====================
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
create index if not exists idx_customers_email on public.customers(email);
create index if not exists idx_customers_created_at on public.customers(created_at desc);

-- ==================== PRODUCTS ====================
create table if not exists public.products (
  id text primary key,        -- slug-based ID like "CJ-1001" or "p01"
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
  cj_product_id text,        -- if this is a CJ-imported product
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
create index if not exists idx_products_hero on public.products(is_hero) where is_hero = true;
create index if not exists idx_products_cj_id on public.products(cj_product_id) where cj_product_id is not null;
create index if not exists idx_products_price on public.products(price);

-- ==================== ORDERS ====================
create table if not exists public.orders (
  id text primary key,        -- local ID like "RKB-123456"
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
  shipping_address jsonb,    -- full shipping object
  cj_error text,
  metadata jsonb default '{}'::jsonb,
  placed_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_orders_customer on public.orders(customer_id);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_payment_method on public.orders(payment_method);
create index if not exists idx_orders_cj_id on public.orders(cj_order_id) where cj_order_id is not null;
create index if not exists idx_orders_placed_at on public.orders(placed_at desc);
create index if not exists idx_orders_tracking on public.orders(tracking_number) where tracking_number is not null;

-- ==================== ORDER ITEMS ====================
create table if not exists public.order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id text not null references public.orders(id) on delete cascade,
  product_id text not null,
  product_name text not null,
  product_short_name text not null,
  quantity int not null check (quantity > 0),
  price numeric(12, 2) not null,
  subtotal numeric(12, 2) not null,    -- price * quantity
  variant text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);
create index if not exists idx_order_items_order on public.order_items(order_id);
create index if not exists idx_order_items_product on public.order_items(product_id);

-- ==================== NOTIFICATIONS ====================
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
create index if not exists idx_notifications_order on public.notifications(order_id);
create index if not exists idx_notifications_status on public.notifications(status);
create index if not exists idx_notifications_sent_at on public.notifications(sent_at desc);
create index if not exists idx_notifications_channel on public.notifications(channel);

-- ==================== ADMIN USERS ====================
create table if not exists public.admin_users (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid unique,        -- linked to auth.users (if using Supabase Auth)
  email text unique not null,
  full_name text,
  role text not null default 'admin',
  active boolean default true,
  last_login_at timestamptz,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);
create index if not exists idx_admin_users_email on public.admin_users(email);
create index if not exists idx_admin_users_active on public.admin_users(active) where active = true;

-- ==================== SETTINGS (key-value store) ====================
create table if not exists public.settings (
  key text primary key,
  value jsonb not null,
  category text default 'general',
  description text,
  updated_at timestamptz default now(),
  updated_by uuid references public.admin_users(id) on delete set null
);
create index if not exists idx_settings_category on public.settings(category);

-- ==================== AUDIT LOG ====================
create table if not exists public.audit_log (
  id uuid primary key default uuid_generate_v4(),
  actor_id uuid references public.admin_users(id) on delete set null,
  actor_type text not null default 'admin',  -- 'admin', 'customer', 'system'
  action text not null,        -- 'order.update', 'settings.update', etc.
  resource_type text,          -- 'order', 'product', etc.
  resource_id text,
  before jsonb,
  after jsonb,
  ip_address text,
  user_agent text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);
create index if not exists idx_audit_actor on public.audit_log(actor_id);
create index if not exists idx_audit_resource on public.audit_log(resource_type, resource_id);
create index if not exists idx_audit_action on public.audit_log(action);
create index if not exists idx_audit_created_at on public.audit_log(created_at desc);

-- ==================== TRIGGERS ====================
-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$ begin
  if not exists (select 1 from pg_trigger where tgname = 'trg_customers_updated') then
    create trigger trg_customers_updated before update on public.customers
      for each row execute function public.set_updated_at();
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_trigger where tgname = 'trg_products_updated') then
    create trigger trg_products_updated before update on public.products
      for each row execute function public.set_updated_at();
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_trigger where tgname = 'trg_orders_updated') then
    create trigger trg_orders_updated before update on public.orders
      for each row execute function public.set_updated_at();
  end if;
end $$;

-- Auto-create/update customer on order placement
create or replace function public.upsert_customer_from_order()
returns trigger as $$
declare
  existing_customer_id uuid;
begin
  -- Try to find existing customer by phone
  select id into existing_customer_id
  from public.customers
  where phone = new.shipping_phone
  limit 1;

  if existing_customer_id is null then
    -- Create new customer
    insert into public.customers (full_name, phone, email, city, district, notes)
    values (new.shipping_full_name, new.shipping_phone, new.shipping_email, new.shipping_city, new.shipping_district, new.shipping_notes)
    returning id into existing_customer_id;
  end if;

  -- Update customer aggregate stats
  update public.customers
  set
    total_orders = total_orders + 1,
    total_spent = total_spent + new.total,
    last_order_at = new.placed_at,
    updated_at = now()
  where id = existing_customer_id;

  -- Link order to customer
  new.customer_id := existing_customer_id;

  return new;
end;
$$ language plpgsql;

do $$ begin
  if not exists (select 1 from pg_trigger where tgname = 'trg_orders_upsert_customer') then
    create trigger trg_orders_upsert_customer before insert on public.orders
      for each row execute function public.upsert_customer_from_order();
  end if;
end $$;

-- ==================== VIEWS ====================
-- Order summary view
create or replace view public.order_summary as
select
  o.id,
  o.status,
  o.payment_method,
  o.payment_status,
  o.shipping_full_name,
  o.shipping_phone,
  o.shipping_city,
  o.shipping_district,
  o.subtotal,
  o.shipping_cost,
  o.total,
  o.cj_order_id,
  o.tracking_number,
  o.placed_at,
  o.updated_at,
  c.id as customer_id,
  c.full_name as customer_name,
  c.email as customer_email,
  (select count(*) from public.order_items where order_id = o.id) as item_count
from public.orders o
left join public.customers c on c.id = o.customer_id;

-- Top products view
create or replace view public.top_products as
select
  p.id,
  p.name,
  p.short_name,
  p.price,
  p.images[1] as primary_image,
  p.audience,
  p.rating,
  p.review_count,
  p.sales_count,
  coalesce(sum(oi.quantity), 0)::int as units_sold,
  coalesce(sum(oi.subtotal), 0) as revenue
from public.products p
left join public.order_items oi on oi.product_id = p.id
group by p.id, p.name, p.short_name, p.price, p.images, p.audience, p.rating, p.review_count, p.sales_count;

-- ===========================================
-- Done! Schema created successfully.
-- ===========================================
