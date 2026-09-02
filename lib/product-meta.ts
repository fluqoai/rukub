// Mock data for product variants and reviews.
// Variants are visual-only (color swatches) — they don't change the actual SKU.
// Reviews are static mock data — replace with real reviews from API later.

import { type Product } from './products';

export type Variant = {
  id: string;
  name: string;
  swatch: string; // hex color for the swatch
  selected?: boolean;
};

const variantPresets: Record<string, Variant[]> = {
  default: [
    { id: 'black', name: 'أسود', swatch: '#2C2A26', selected: true },
    { id: 'beige', name: 'بيج', swatch: '#D5CBB6' },
    { id: 'sage', name: 'أخضر ساچي', swatch: '#6B7A5A' },
    { id: 'wood', name: 'خشبي', swatch: '#B8956A' },
  ],
  cool: [
    { id: 'black', name: 'أسود', swatch: '#2C2A26', selected: true },
    { id: 'silver', name: 'فضي', swatch: '#C9C5BD' },
    { id: 'navy', name: 'كحلي', swatch: '#3A4A5C' },
  ],
  warm: [
    { id: 'beige', name: 'بيج', swatch: '#D5CBB6', selected: true },
    { id: 'pink', name: 'وردي', swatch: '#E8B8B0' },
    { id: 'sage', name: 'ساچي', swatch: '#A8B88A' },
    { id: 'wood', name: 'خشبي', swatch: '#B8956A' },
  ],
  fragrance: [
    { id: 'oud', name: 'عود', swatch: '#7A5F3F', selected: true },
    { id: 'musk', name: 'مسك', swatch: '#E8E1D2' },
    { id: 'amber', name: 'عنبر', swatch: '#C9A87C' },
  ],
};

export function getVariantsForProduct(product: Product): Variant[] {
  if (product.audience === 'women') return variantPresets.warm;
  if (product.id === 'p03') return variantPresets.fragrance;
  if (product.id === 'p09' || product.id === 'p11') return variantPresets.cool;
  return variantPresets.default;
}

// ---- Reviews ----

export type Review = {
  id: string;
  name: string;
  city: string;
  rating: number;
  date: string;
  text: string;
  verified: boolean;
  helpful: number;
  variant?: string;
  photos?: number; // count of attached photos (visual only)
};

const reviewTemplates: Array<Omit<Review, 'id' | 'date' | 'helpful'>> = [
  {
    name: 'أحمد المالكي',
    city: 'جدة',
    rating: 5,
    verified: true,
    text: 'منتج ممتاز وجودة عالية. وصل في الوقت المحدد والتغليف كان محترم. أنصح فيه بقوة.',
  },
  {
    name: 'سارة الحربي',
    city: 'الرياض',
    rating: 5,
    verified: true,
    text: 'استلمته بسرعة، شكله حلو جداً في السيارة والمادة المستخدم فاخرة. اشتريته كهدية لأختي وعجبت فيها.',
  },
  {
    name: 'فيصل العنزي',
    city: 'الدمام',
    rating: 4,
    verified: true,
    text: 'جيد جداً، يتحمل حرارة الجو. شغال تمام من أول يوم. خصم 10% لو طلبت الثاني.',
  },
  {
    name: 'نجلاء السبيعي',
    city: 'الطائف',
    rating: 5,
    verified: true,
    text: 'تجربة شراء ممتازة، فريق الدعم رد بسرعة على استفساري قبل الطلب. المنتج كما في الصورة بالضبط.',
  },
  {
    name: 'بدر الدوسري',
    city: 'الخبر',
    rating: 4,
    verified: false,
    text: 'المنتج يفي بالغرض. سهل التركيب بدون أي خبرة. طلبت واحد إضافي لسيارة زوجتي.',
  },
  {
    name: 'لمياء القرشي',
    city: 'مكة',
    rating: 5,
    verified: true,
    text: 'الجودة تفوق السعر بكثير. مقارنة بمنتجات اشتريتها من أمازون بنفس السعر، هذا أفضل بمراحل.',
  },
  {
    name: 'تركي الزايدي',
    city: 'أبها',
    rating: 3,
    verified: true,
    text: 'مقبول، فيه أحسن منه. لكن للسعر هذا يعتبر صفقة. الشحن كان سريع.',
  },
];

function generateReviews(product: Product): Review[] {
  // deterministic-ish: use product id to pick subset
  const seed = product.id.charCodeAt(1) + product.id.charCodeAt(2);
  const count = 4 + (seed % 3); // 4-6 reviews
  const baseDate = new Date('2026-08-15').getTime();
  const reviews: Review[] = [];
  for (let i = 0; i < count; i++) {
    const t = reviewTemplates[(seed + i) % reviewTemplates.length];
    const date = new Date(baseDate - i * 86400000 * (3 + (seed % 4))).toISOString();
    reviews.push({
      ...t,
      id: `${product.id}-r${i}`,
      date,
      helpful: 5 + ((seed + i * 3) % 30),
      variant: i % 2 === 0 ? 'أسود' : undefined,
      photos: i % 3 === 0 ? 1 + (i % 3) : undefined,
    });
  }
  return reviews;
}

export function getReviewsForProduct(product: Product): Review[] {
  return generateReviews(product);
}

export function getAverageRating(reviews: Review[]): {
  average: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
} {
  const distribution: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews.forEach((r) => {
    distribution[r.rating as 1 | 2 | 3 | 4 | 5]++;
  });
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return {
    average: reviews.length === 0 ? 0 : sum / reviews.length,
    distribution,
  };
}
