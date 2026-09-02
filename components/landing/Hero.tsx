'use client';

import { Truck, Banknote, RotateCcw, ArrowLeft, ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { FadeIn } from '@/components/motion/FadeIn';
import { useI18n } from '@/lib/i18n';

const trustItems = [
  { icon: Truck, key: 'hero.trust.shipping' },
  { icon: Banknote, key: 'hero.trust.cod' },
  { icon: RotateCcw, key: 'hero.trust.returns' },
];

export function Hero() {
  const { t, locale } = useI18n();
  const Arrow = locale === 'ar' ? ArrowLeft : ArrowRight;

  return (
    <section className="relative overflow-hidden">
      {/* decorative blobs — no interaction, just background color */}
      <div
        className="blob"
        style={{
          top: '-10%',
          insetInlineStart: '-8%',
          width: '480px',
          height: '480px',
          background: 'radial-gradient(circle, rgb(168 184 138 / 0.5) 0%, transparent 70%)',
        }}
      />
      <div
        className="blob"
        style={{
          bottom: '-15%',
          insetInlineEnd: '-10%',
          width: '520px',
          height: '520px',
          background: 'radial-gradient(circle, rgb(201 168 124 / 0.35) 0%, transparent 70%)',
        }}
      />

      <Container className="relative grid gap-12 pb-20 pt-16 md:grid-cols-12 md:gap-8 md:pb-28 md:pt-24">
        {/* Content */}
        <div className="md:col-span-7">
          <FadeIn>
            <span className="eyebrow">{t('hero.badge')}</span>
          </FadeIn>

          <FadeIn delay={0.1}>
            <h1 className="mt-5 text-display-xl font-semibold text-ink-900 text-balance">
              {t('hero.title.line1')}
              <br />
              <span className="text-sage-500">{t('hero.title.line2')}</span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.2} className="mt-6 max-w-xl text-lg leading-relaxed text-ink-700">
            {t('hero.subtitle')}
          </FadeIn>

          <FadeIn delay={0.3} className="mt-8 flex flex-wrap items-center gap-3">
            <a href="#products" className="btn-primary">
              {t('hero.cta.shop')}
              <Arrow className="h-4 w-4" strokeWidth={2} />
            </a>
            <a href="#bundles" className="btn-secondary">
              {t('hero.cta.bundles')}
            </a>
          </FadeIn>

          <FadeIn delay={0.4} className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-3">
            {trustItems.map(({ icon: Icon, key }) => (
              <div key={key} className="flex items-center gap-2 text-sm text-ink-500">
                <Icon className="h-4 w-4 text-sage-500" strokeWidth={1.5} />
                <span>{t(key)}</span>
              </div>
            ))}
          </FadeIn>
        </div>

        {/* Visual: composed product showcase */}
        <FadeIn delay={0.3} className="relative md:col-span-5">
          <HeroVisual />
        </FadeIn>
      </Container>
    </section>
  );
}

function HeroVisual() {
  return (
    <div className="relative aspect-[4/5] w-full">
      {/* Base card */}
      <div className="absolute inset-0 rounded-4xl bg-gradient-to-br from-sage-100 via-linen-50 to-wood-400/20 shadow-card" />

      {/* Inner pattern */}
      <div
        className="absolute inset-0 rounded-4xl opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 30%, rgb(107 122 90 / 0.15) 0%, transparent 40%),
                            radial-gradient(circle at 80% 70%, rgb(184 149 106 / 0.2) 0%, transparent 50%)`,
        }}
      />

      {/* Floating product cards */}
      <div className="absolute inset-0 p-6">
        {/* Top card — Hero product 1 */}
        <div className="absolute end-6 top-8 w-40 rounded-2xl bg-linen-50 p-3 shadow-card">
          <div className="mb-2 aspect-square w-full rounded-xl bg-sage-100" />
          <div className="h-1.5 w-3/4 rounded-full bg-sage-200" />
          <div className="mt-1.5 h-1.5 w-1/2 rounded-full bg-sage-100" />
          <div className="mt-2 flex items-center justify-between">
            <span className="font-mono text-xs font-medium text-ink-900">49</span>
            <span className="text-[10px] text-ink-500 line-through">79</span>
          </div>
        </div>

        {/* Middle card — Hero product 2 */}
        <div className="absolute start-6 top-1/3 w-44 rounded-2xl bg-linen-50 p-3 shadow-card">
          <div className="mb-2 aspect-square w-full rounded-xl bg-wood-400/30" />
          <div className="h-1.5 w-2/3 rounded-full bg-wood-400/40" />
          <div className="mt-1.5 h-1.5 w-1/3 rounded-full bg-wood-400/20" />
          <div className="mt-2 flex items-center justify-between">
            <span className="font-mono text-xs font-medium text-ink-900">149</span>
            <span className="text-[10px] text-ink-500 line-through">199</span>
          </div>
        </div>

        {/* Bottom card — Hero product 3 */}
        <div className="absolute bottom-8 end-1/2 w-36 translate-x-1/2 rounded-2xl bg-sage-500 p-3 text-linen-50 shadow-card">
          <div className="mb-2 aspect-square w-full rounded-xl bg-sage-600/60" />
          <div className="h-1.5 w-3/4 rounded-full bg-sage-400" />
          <div className="mt-1.5 h-1.5 w-1/2 rounded-full bg-sage-400/60" />
          <div className="mt-2 flex items-center justify-between">
            <span className="font-mono text-xs font-medium">29</span>
            <span className="rounded-full bg-wood-500 px-1.5 py-0.5 text-[8px] font-medium text-linen-50">
              الأكثر مبيعاً
            </span>
          </div>
        </div>
      </div>

      {/* Decorative dotted frame */}
      <div className="absolute -end-3 -top-3 h-12 w-12 rounded-full border border-dashed border-sage-500/40" />
      <div className="absolute -bottom-4 -start-4 h-20 w-20 rounded-full border border-dashed border-wood-500/30" />
    </div>
  );
}
