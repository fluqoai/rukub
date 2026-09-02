# ركوب · Rukub

متجر دروب شيبنج لإكسسوارات السيارات في السعودية.

> هذا الـ **Scaffold** — يحتوي على صفحة هبوط كاملة بالعربية (RTL) مع لوحة ألوان Sage/Linen/Wood. بيانات 20 منتج جاهزة. الصور حالياً placeholders بأيقونات — استبدلها بصور حقيقية لاحقاً.

---

## التشغيل السريع

```bash
# 1. تثبيت المكتبات
npm install

# 2. تشغيل بيئة التطوير
npm run dev

# افتح http://localhost:3000
```

## البناء للإنتاج

```bash
npm run build
npm run start
```

---

## هيكل المشروع

```
.
├── app/
│   ├── layout.tsx          # Root layout (RTL, fonts, i18n)
│   ├── page.tsx            # Landing page
│   └── globals.css         # Tailwind + design tokens
│
├── components/
│   ├── ui/                 # Container, LanguageToggle
│   ├── motion/             # FadeIn (Framer Motion wrapper)
│   └── landing/            # Hero, Header, ThreePaths, FeaturedProducts,
│                           # Bundles, WhyUs, Testimonials, Newsletter, Footer
│
├── lib/
│   ├── products.ts         # الـ 20 منتج (بيانات كاملة)
│   ├── i18n.tsx            # Arabic/English toggle
│   └── utils.ts            # cn, formatSAR
│
├── tailwind.config.ts      # لوحة الساچي + الخطوط
└── next.config.mjs
```

---

## تخصيصات سريعة

### 1. استبدال أسماء النطاقات والـ contact
- `components/landing/Footer.tsx` — البريد، رقم الجوال، المدينة
- `app/layout.tsx` — meta tags

### 2. إضافة صور حقيقية للمنتجات
- ضع الصور في `public/products/{id}.webp` (موصى به WebP، استخدم `sharp` لاحقاً)
- في `components/landing/ProductCard.tsx` استبدل الـ `<Icon />` بـ `<Image>`

### 3. ربط CJdropshipping API
- أضف `lib/cj.ts` للـ API client
- استبدل `lib/products.ts` بالـ fetch من CJ
- أضف webhook في `app/api/cj-webhook/route.ts`

### 4. الدفع
- **Tap Payments** أو **HyperPay** لـ مدى/Visa/Mastercard/Apple Pay
- **Tabby** / **Tamara** للتقسيط
- متغيرات البيئة في `.env.local`:
  ```
  NEXT_PUBLIC_TAP_PUBLIC_KEY=
  TABBY_SECRET_KEY=
  ```

### 5. تفعيل i18n كامل
- حالياً: زر اللغة يبدّل النصوص فقط
- للتطوير: استخدم `next-intl` مع `[locale]` routing
- النصوص موجودة في `lib/i18n.tsx` (ar/en)

---

## Roadmap — ما التالي؟

| المهمة | الحالة |
|---|---|
| صفحة هبوط كاملة | ✅ |
| بيانات 20 منتج | ✅ |
| لوحة ألوان + خطوط | ✅ |
| تبديل لغة AR/EN (هيكل) | ✅ |
| صفحة منتج تفصيلية | ⏳ |
| صفحة السلة + checkout | ⏳ |
| تكامل CJdropshipping | ⏳ |
| تكامل Tabby/Tap | ⏳ |
| بحث + فلتر سيارة (Year/Make/Model) | ⏳ |
| لوحة إدارة الطلبات | ⏳ |
| نظام تقييمات حقيقية | ⏳ |

---

## المكتبات الأساسية

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** (لوحة الساچي مخصصة)
- **Framer Motion** — entrance/scroll reveals (لا hover)
- **Lucide React** — أيقونات
- **IBM Plex Sans Arabic** — خط نظيف وحديث

## ملاحظات التصميم

- ❌ بدون hover transforms / parallax / mouse-driven motion
- ✅ Framer Motion للدخول (fade-up) و scroll-reveal
- ✅ Real content over AI-feel placeholders (لما تتوفر صور حقيقية، استخدمها)
- ✅ Arabic RTL أساسي، مع زر تبديل للإنجليزية
- ✅ Reduced motion مُحترم تلقائياً
