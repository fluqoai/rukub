'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

export type Locale = 'ar' | 'en';

type Dict = Record<string, string>;

const ar: Dict = {
  // Navigation
  'nav.home': 'الرئيسية',
  'nav.women': 'الراحة والتنظيم',
  'nav.men': 'التقنية والأمان',
  'nav.shared': 'أساسيات يومية',
  'nav.about': 'عن المتجر',
  'nav.cart': 'السلة',
  // Hero
  'hero.badge': 'جديد · توصيل من مستودع السعودية خلال 2-5 أيام',
  'hero.title.line1': 'اكسسوارات سياراتك،',
  'hero.title.line2': 'مختارة بعناية.',
  'hero.subtitle':
    '20 منتجاً مدروساً بهامش ربح عالٍ، توصيل سريع، ودفع عند الاستلام. بدون تغليف، بدون شحن، بدون صداع.',
  'hero.cta.shop': 'تسوّق الآن',
  'hero.cta.bundles': 'اكتشف الباندلز',
  'hero.trust.shipping': 'شحن خلال 2-5 أيام',
  'hero.trust.cod': 'دفع عند الاستلام',
  'hero.trust.returns': 'إرجاع خلال 14 يوم',
  // Three Paths
  'paths.eyebrow': 'تسوق حسب احتياجك',
  'paths.title': 'ما الذي تريد تحسينه في سيارتك؟',
  'paths.subtitle': 'تصنيف واضح يساعدك على الوصول للمنتج المناسب بسرعة.',
  'paths.women.title': 'الراحة والتنظيم',
  'paths.women.subtitle': 'مساحة أهدأ وأكثر ترتيباً',
  'paths.women.desc': 'منظمات، وسائد، وحلول عملية للاستخدام اليومي.',
  'paths.men.title': 'التقنية والأمان',
  'paths.men.subtitle': 'تجهيزات ذكية للطريق',
  'paths.men.desc': 'شواحن، كاميرات، وأدوات مساعدة للقيادة.',
  'paths.shared.title': 'أساسيات يومية',
  'paths.shared.subtitle': 'تفاصيل تصنع فرقاً',
  'paths.shared.desc': 'منتجات مفيدة تناسب مختلف السيارات والسائقين.',
  'paths.cta': 'استكشف',
  // Products
  'products.eyebrow': 'الأكثر طلباً',
  'products.title': '20 منتجاً مختاراً بعناية',
  'products.subtitle': 'كل منتج هنا تم اختياره بناءً على طلب حقيقي وهامش ربح مستدام.',
  'products.filter.all': 'الكل',
  'products.filter.women': 'للنساء',
  'products.filter.men': 'للرجال',
  'products.filter.shared': 'مشترك',
  'products.add': 'أضف للسلة',
  'products.details': 'التفاصيل',
  // Bundles
  'bundles.eyebrow': 'باندلز',
  'bundles.title': 'وفّر أكثر، خذ أكثر',
  'bundles.subtitle': 'ثلاث باقات مدروسة — كل واحدة تحل مشكلة كاملة.',
  'bundles.save': 'وفّرت',
  'bundles.includes': 'يشمل',
  'bundles.buy': 'اشترِ الباندل',
  // Why
  'why.eyebrow': 'لماذا ركوب',
  'why.title': 'تجربة واضحة من الاختيار إلى الاستلام',
  'why.shipping.title': 'متابعة الشحن',
  'why.shipping.desc': 'نشاركك حالة الطلب ورقم التتبع عندما يصبح متاحاً.',
  'why.cod.title': 'دفع عند الاستلام',
  'why.cod.desc': 'أكد طلبك الآن وادفع للمندوب عند الاستلام.',
  'why.installment.title': 'الدفع الإلكتروني قريباً',
  'why.installment.desc': 'سيتم تفعيله بعد اعتماد بوابة الدفع خلال الفترة القادمة.',
  'why.support.title': 'دعم بالعربية',
  'why.support.desc': 'تواصل كتابي عبر البريد مع الاحتفاظ بسجل واضح لطلبك.',
  // Testimonials
  'testimonials.eyebrow': 'آراء العملاء',
  'testimonials.title': 'ليش يقولون عنا كذا',
  // Newsletter
  'newsletter.title': 'احصل على عروض حصرية',
  'newsletter.desc': 'اشترك في النشرة — خصومات موسمية، منتجات جديدة، نصائح للعناية بسيارتك.',
  'newsletter.placeholder': 'بريدك الإلكتروني',
  'newsletter.cta': 'اشترك',
  'newsletter.privacy': 'نحترم خصوصيتك. إلغاء الاشتراك بنقرة واحدة.',
  // Footer
  'footer.tagline': 'إكسسوارات سيارات مختارة بعناية. للسوق السعودي.',
  'footer.shop': 'تسوّق',
  'footer.support': 'الدعم',
  'footer.contact': 'تواصل',
  'footer.rights': 'جميع الحقوق محفوظة',
  'footer.payment': 'طرق الدفع',
};

const en: Dict = {
  'nav.home': 'Home',
  'nav.women': 'For Her',
  'nav.men': 'For Him',
  'nav.shared': 'Shared',
  'nav.about': 'About',
  'nav.cart': 'Cart',
  'hero.badge': 'New · Shipping from Saudi warehouse in 2-5 days',
  'hero.title.line1': 'Car accessories,',
  'hero.title.line2': 'thoughtfully curated.',
  'hero.subtitle':
    '20 high-demand, high-margin products, fast shipping, cash on delivery. No packaging, no shipping, no headaches.',
  'hero.cta.shop': 'Shop now',
  'hero.cta.bundles': 'Explore bundles',
  'hero.trust.shipping': 'Ships in 2-5 days',
  'hero.trust.cod': 'Cash on delivery',
  'hero.trust.returns': '14-day returns',
  'paths.eyebrow': 'Three paths, one car',
  'paths.title': 'Pick what fits you',
  'paths.subtitle': 'We divided accessories by your real need — not by color.',
  'paths.women.title': 'For Her',
  'paths.women.subtitle': 'Your car, your space',
  'paths.women.desc': 'Comfort, organization, care, a personal touch.',
  'paths.men.title': 'For Him',
  'paths.men.subtitle': 'Performance & tech',
  'paths.men.desc': 'Electronics, safety, performance, care.',
  'paths.shared.title': 'Shared',
  'paths.shared.subtitle': 'The essentials',
  'paths.shared.desc': 'Practical items every driver needs.',
  'paths.cta': 'Explore',
  'products.eyebrow': 'Most in demand',
  'products.title': '20 hand-picked products',
  'products.subtitle': 'Each product here was chosen based on real demand and sustainable margins.',
  'products.filter.all': 'All',
  'products.filter.women': 'For Her',
  'products.filter.men': 'For Him',
  'products.filter.shared': 'Shared',
  'products.add': 'Add to cart',
  'products.details': 'Details',
  'bundles.eyebrow': 'Bundles',
  'bundles.title': 'Save more, take more',
  'bundles.subtitle': 'Three thoughtful bundles — each one solves a complete problem.',
  'bundles.save': 'You save',
  'bundles.includes': 'Includes',
  'bundles.buy': 'Buy bundle',
  'why.eyebrow': 'Why Rukub',
  'why.title': 'A shopping experience without the headache',
  'why.shipping.title': 'Fast shipping',
  'why.shipping.desc': 'From a Saudi warehouse — your customer receives it in 2-5 days.',
  'why.cod.title': 'Cash on delivery',
  'why.cod.desc': '40% of our customers prefer cash — and we respect that.',
  'why.installment.title': 'Tabby installments',
  'why.installment.desc': '4 payments, 0% interest, on orders 200+ SAR.',
  'why.support.title': 'Arabic support',
  'why.support.desc': 'Our team responds by email in Arabic.',
  'testimonials.eyebrow': 'Customer stories',
  'testimonials.title': 'Why they say what they say',
  'newsletter.title': 'Get exclusive offers',
  'newsletter.desc': 'Subscribe — seasonal discounts, new arrivals, car care tips.',
  'newsletter.placeholder': 'Your email',
  'newsletter.cta': 'Subscribe',
  'newsletter.privacy': 'We respect your privacy. Unsubscribe with one click.',
  'footer.tagline': 'Thoughtfully curated car accessories. For Saudi Arabia.',
  'footer.shop': 'Shop',
  'footer.support': 'Support',
  'footer.contact': 'Contact',
  'footer.rights': 'All rights reserved',
  'footer.payment': 'Payment methods',
};

const dictionaries: Record<Locale, Dict> = { ar, en };

type I18nContextValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
  dir: 'rtl' | 'ltr';
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('ar');
  const t = (key: string) => dictionaries[locale][key] ?? key;
  const dir: 'rtl' | 'ltr' = locale === 'ar' ? 'rtl' : 'ltr';
  return (
    <I18nContext.Provider value={{ locale, setLocale, t, dir }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider');
  return ctx;
}
