'use client';

import Link from 'next/link';
import { Sparkles, Wrench, Users, ChevronLeft, ChevronRight, Package, CheckCircle2, RotateCcw } from 'lucide-react';
import { type Audience } from '@/lib/products';
import type { PublicProduct } from '@/lib/public-products';
import { useI18n } from '@/lib/i18n';
import { Container } from '@/components/ui/Container';
import { FadeIn } from '@/components/motion/FadeIn';
import { useMemo } from 'react';

type SectionHeroProps = {
  audience: Audience;
  products: PublicProduct[];
};

const sectionConfig: Record<Audience, {
  title: string;
  subtitle: string;
  description: string;
  Icon: typeof Sparkles;
  bg: string;
  accent: string;
  eyebrow: string;
}> = {
  women: {
    title: 'ترتيب وأناقة',
    subtitle: 'كل غرض في مكانه',
    description: 'حلول عملية تثبّت أغراضك، تقلل الفوضى، وتحافظ على مقصورة مرتبة تعكس ذوقك.',
    Icon: Sparkles,
    bg: 'from-sage-100 via-linen-50 to-wood-400/15',
    accent: 'sage',
    eyebrow: 'اختيارات منظمة',
  },
  men: {
    title: 'تقنية واستعداد',
    subtitle: 'جاهز للطريق قبل أن تحتاج الأداة',
    description: 'أدوات وتقنيات تمنحك تحكماً أكبر واستعداداً أفضل للمواقف اليومية والطوارئ.',
    Icon: Wrench,
    bg: 'from-ink-900/5 via-linen-50 to-sage-200',
    accent: 'ink',
    eyebrow: 'تقنية مفيدة',
  },
  shared: {
    title: 'العناية اليومية',
    subtitle: 'نتيجة تراها من أول استخدام',
    description: 'منتجات نظافة وحماية عملية تناسب مختلف السيارات والسائقين وتسهّل العناية بالمقصورة.',
    Icon: Users,
    bg: 'from-wood-400/15 via-linen-50 to-sage-100',
    accent: 'wood',
    eyebrow: 'لكل سيارة',
  },
};

export function SectionHero({ audience, products }: SectionHeroProps) {
  const { locale } = useI18n();
  const Chevron = locale === 'ar' ? ChevronLeft : ChevronRight;
  const config = sectionConfig[audience];
  const Icon = config.Icon;
  const productCount = products.length;

  // Get a few featured product names for the visual
  const featuredNames = useMemo(
    () => products.slice(0, 3).map((p) => p.shortName),
    [products]
  );

  return (
    <section className={`relative overflow-hidden bg-gradient-to-br ${config.bg}`}>
      {/* Decorative blobs */}
      <div
        className="blob"
        style={{
          top: '-20%',
          insetInlineStart: '-10%',
          width: '400px',
          height: '400px',
          background: audience === 'women'
            ? 'radial-gradient(circle, rgb(168 184 138 / 0.4) 0%, transparent 70%)'
            : audience === 'men'
            ? 'radial-gradient(circle, rgb(44 42 38 / 0.15) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgb(201 168 124 / 0.4) 0%, transparent 70%)',
        }}
      />

      <Container className="relative py-16 md:py-20">
        {/* Breadcrumb */}
        <FadeIn>
          <nav className="flex items-center gap-1.5 text-xs text-ink-500">
            <Link href="/" className="hover:text-sage-600">الرئيسية</Link>
            <Chevron className="h-3 w-3" />
            <span className="text-ink-900">المتجر</span>
            <Chevron className="h-3 w-3" />
            <span className="text-ink-900">{config.title}</span>
          </nav>
        </FadeIn>

        <div className="mt-8 grid gap-10 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <FadeIn delay={0.1}>
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-ink-500">
                <Icon className="h-4 w-4" strokeWidth={1.5} />
                <span>{config.eyebrow}</span>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <h1 className="mt-4 text-display-xl font-semibold text-ink-900 text-balance">
                {config.title}
              </h1>
              <p className="mt-2 text-xl text-sage-600">{config.subtitle}</p>
            </FadeIn>

            <FadeIn delay={0.3} className="mt-5 max-w-2xl text-base leading-relaxed text-ink-700">
              {config.description}
            </FadeIn>
          </div>

          {/* Stats card */}
          <FadeIn delay={0.4} className="md:col-span-5">
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                Icon={Package}
                value={String(productCount).padStart(2, '0')}
                label="منتج مختار"
              />
              <StatCard
                Icon={CheckCircle2}
                value="واضح"
                label="وصف المنتج"
              />
              <StatCard
                Icon={RotateCcw}
                value="معلنة"
                label="سياسة الإرجاع"
              />
              <StatCard
                Icon={config.Icon}
                value="COD"
                label="دفع عند الاستلام"
              />
            </div>
          </FadeIn>
        </div>
      </Container>
    </section>
  );
}

type StatCardProps = {
  Icon: typeof Package;
  value: string;
  label: string;
};

function StatCard({ Icon, value, label }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-sage-500/10 bg-linen-50/80 p-4 backdrop-blur-sm">
      <div className="flex items-center gap-2 text-ink-500">
        <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
        <span className="text-[10px] uppercase tracking-wider">{label}</span>
      </div>
      <p className="mt-2 font-mono text-2xl font-semibold tabular-nums text-ink-900">
        {value}
      </p>
    </div>
  );
}
