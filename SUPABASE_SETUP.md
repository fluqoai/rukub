# Supabase Setup Guide — Dropshoping

## Quick Start (5 minutes)

### 1. Open Supabase SQL Editor

1. افتح [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. اختر المشروع: `lpebhjmtjhnyvwqhynih` (dropshoping)
3. من القائمة الجانبية: **SQL Editor**
4. اضغط **New query**

### 2. شغّل الـ Migrations بالترتيب

#### Migration 1: Schema (الجداول + Enums + Triggers)
افتح الملف: `supabase/migrations/00000000000001_init.sql`
- انسخ المحتوى كله
- الصقه في SQL Editor
- اضغط **Run** أو `Ctrl+Enter`
- ✅ لازم تشوف: "Success. No rows returned"

#### Migration 2: RLS (Row Level Security)
افتح الملف: `supabase/migrations/00000000000002_rls.sql`
- نفس الطريقة
- اضغط **Run**
- ✅ لازم تشوف: "Success. No rows returned"

#### Migration 3: Seed (20 منتج + إعدادات)
افتح الملف: `supabase/migrations/00000000000003_seed.sql`
- نفس الطريقة
- اضغط **Run**
- ✅ لازم تشوف: "Success. 20 rows inserted"

### 3. تحقق من البيانات

اذهب إلى **Table Editor** من القائمة الجانبية:
- ✅ `products` — لازم تشوف 20 صف
- ✅ `customers` — فاضي
- ✅ `orders` — فاضي
- ✅ `settings` — 12 صف

### 4. تأكد من الـ Credentials في `.env.local`

افتح `C:\Users\khayrat\Desktop\MyProjects\dropshoping\.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://lpebhjmtjhnyvwqhynih.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
SUPABASE_JWKS_URL=https://lpebhjmtjhnyvwqhynih.supabase.co/auth/v1/.well-known/jwks.json
```

✅ هذا محفوظ عندك فعلاً.

## اختبار سريع (اختياري)

في SQL Editor شغّل:
```sql
select count(*) from public.products;
```
لازم يرجع `20`.

```sql
select * from public.settings limit 5;
```
لازم يرجع 5 صفوف.

## 🎉 Done!

المشروع جاهز. كل المميزات في التطبيق ستعمل تلقائياً:
- ✅ Orders تُحفظ في DB
- ✅ Admin يرى كل الطلبات
- ✅ Products من DB
- ✅ Real-time updates

## Troubleshooting

### خطأ: "relation already exists"
الـ migrations **idempotent** — آمنة لإعادة التشغيل. شغّلها مرة ثانية.

### خطأ: "permission denied"
- تأكد إنك مش داخل SQL Editor كـ read-only
- استخدم **postgres** role (مش anon)

### الجداول لا تظهر في Table Editor
- Refresh الصفحة (F5)
- تأكد إن الـ schema = `public`

## Backup Strategy (مهم للإنتاج)

من **Database** → **Backups**:
- Point-in-time recovery: متاح في Pro
- Daily backups: تلقائي في Free tier
- Manual backup: Settings → Database → Backups

## Next Steps

1. ✅ Setup complete
2. → Run `npm run dev` locally to test
3. → Try placing a test order
4. → Check the order in Supabase Table Editor
5. → Deploy to production
