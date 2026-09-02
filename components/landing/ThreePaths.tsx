'use client';

import { ArrowLeft, ArrowRight, Sparkles, Wrench, Users } from 'lucide-react';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { FadeIn } from '@/components/motion/FadeIn';
import { useI18n } from '@/lib/i18n';

const paths = [
  {
    icon: Sparkles,
    key: 'women',
    color: 'from-sage-100 to-linen-100',
    accent: 'bg-sage-500/10 text-sage-700',
    border: 'border-sage-500/15',
  },
  {
    icon: Wrench,
    key: 'men',
    color: 'from-ink-900/5 to-sage-100',
    accent: 'bg-ink-900/8 text-ink-900',
    border: 'border-ink-900/10',
  },
  {
    icon: Users,
    key: 'shared',
    color: 'from-wood-400/15 to-linen-100',
    accent: 'bg-wood-500/10 text-wood-700',
    border: 'border-wood-500/15',
  },
] as const;

export function ThreePaths() {
  const { t, locale } = useI18n();
  const Arrow = locale === 'ar' ? ArrowLeft : ArrowRight;

  return (
    <section className="py-20 md:py-28">
      <Container>
        <FadeIn className="text-center">
          <span className="eyebrow">{t('paths.eyebrow')}</span>
          <h2 className="mt-4 text-display-lg font-semibold text-ink-900 text-balance">
            {t('paths.title')}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-ink-500">
            {t('paths.subtitle')}
          </p>
        </FadeIn>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {paths.map((p, i) => (
            <FadeIn key={p.key} delay={i * 0.1}>
              <Link
                href={`/shop/${p.key}`}
                className={`group relative block overflow-hidden rounded-4xl border ${p.border} bg-gradient-to-br ${p.color} p-8 transition-colors hover:border-sage-500/30`}
              >
                {/* Decorative shape */}
                <div
                  className="pointer-events-none absolute -end-12 -top-12 h-40 w-40 rounded-full opacity-30 blur-2xl"
                  style={{
                    background:
                      p.key === 'women'
                        ? 'rgb(168 184 138)'
                        : p.key === 'men'
                        ? 'rgb(107 122 90)'
                        : 'rgb(201 168 124)',
                  }}
                />

                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${p.accent}`}>
                  <p.icon className="h-6 w-6" strokeWidth={1.5} />
                </div>

                <h3 className="mt-6 text-2xl font-semibold text-ink-900">
                  {t(`paths.${p.key}.title`)}
                </h3>
                <p className="mt-1 text-sm text-ink-500">
                  {t(`paths.${p.key}.subtitle`)}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-ink-700">
                  {t(`paths.${p.key}.desc`)}
                </p>

                <div className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-sage-600">
                  {t('paths.cta')}
                  <Arrow className="h-4 w-4 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
                </div>
              </Link>
            </FadeIn>
          ))}
        </div>
      </Container>
    </section>
  );
}
