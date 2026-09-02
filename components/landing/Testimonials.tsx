'use client';

import { Star, Quote } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { FadeIn } from '@/components/motion/FadeIn';
import { useI18n } from '@/lib/i18n';

type Testimonial = {
  name: string;
  city: string;
  product: string;
  rating: number;
  text: string;
};

const testimonials: Testimonial[] = [
  {
    name: 'نورة القحطاني',
    city: 'الرياض',
    product: 'منظم فراغ المقعد',
    rating: 5,
    text: 'كنت أخسر جوالتي كل أسبوع بين المقاعد. الحين أنسى إنه في مشكلة أصلاً. جودة المنتج عالية، وصل في 3 أيام.',
  },
  {
    name: 'محمد العتيبي',
    city: 'جدة',
    product: 'شاحن MagSafe',
    rating: 5,
    text: 'بصراحة ما توقعت الشحن يكون بهالسرعة. شغال تمام مع iPhone 15 برو ماكس، المغناطيس قوي حتى في المطبات.',
  },
  {
    name: 'سارة الدوسري',
    city: 'الدمام',
    product: 'باندل نهاية الفوضى',
    rating: 5,
    text: 'المنظم الخلفي غيّر سيارتنا. ولدي عمره سنتين أخيراً يلقى ألعابه بدون ما يصير فوضى. وفّرت 88 ريال على الباندل.',
  },
  {
    name: 'خالد الشهري',
    city: 'الطائف',
    product: 'داش كام 4K',
    rating: 5,
    text: 'جودة الصورة ممتازة حتى بالليل. حساس G سجّل لي حادثة بسيطة الأسبوع الماضي وأنقذتني من مطالبة تأمين وهمية.',
  },
  {
    name: 'هند الزهراني',
    city: 'مكة',
    product: 'معطر عود فاخر',
    rating: 5,
    text: 'الريحة ثابته لأسبوعين كاملين. شكل العبوة فخم، حتى حطيتها في السيارة بدون ما تشين. وفّرت مع باندل الهدية.',
  },
  {
    name: 'فهد المطيري',
    city: 'الخبر',
    product: 'منفاخ إطارات',
    rating: 5,
    text: 'استخدمته مرتين في أسبوع. البطارية قوية، الإطفاء التلقائي يوفر لي ما أضطر أراقب القراءة. مفيد جداً في رحلات البر.',
  },
];

export function Testimonials() {
  const { t } = useI18n();

  return (
    <section className="py-20 md:py-28">
      <Container>
        <FadeIn className="text-center">
          <span className="eyebrow">{t('testimonials.eyebrow')}</span>
          <h2 className="mt-4 text-display-lg font-semibold text-ink-900 text-balance">
            {t('testimonials.title')}
          </h2>
        </FadeIn>

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t_item, i) => (
            <FadeIn key={t_item.name} delay={i * 0.06}>
              <article className="group relative h-full rounded-3xl border border-sage-500/10 bg-linen-50 p-6 transition-shadow hover:shadow-card">
                <Quote
                  className="absolute end-5 top-5 h-7 w-7 text-sage-500/15"
                  strokeWidth={1.5}
                />

                <div className="flex items-center gap-0.5 text-wood-500">
                  {Array.from({ length: t_item.rating }).map((_, idx) => (
                    <Star key={idx} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>

                <p className="mt-4 text-sm leading-relaxed text-ink-700">
                  &ldquo;{t_item.text}&rdquo;
                </p>

                <div className="mt-6 flex items-center justify-between border-t border-sage-500/10 pt-4">
                  <div>
                    <p className="text-sm font-medium text-ink-900">
                      {t_item.name}
                    </p>
                    <p className="text-xs text-ink-500">{t_item.city}</p>
                  </div>
                  <div className="rounded-full bg-sage-50 px-3 py-1 text-[10px] font-medium text-sage-700">
                    {t_item.product}
                  </div>
                </div>
              </article>
            </FadeIn>
          ))}
        </div>
      </Container>
    </section>
  );
}
