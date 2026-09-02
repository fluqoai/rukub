'use client';

import { ShoppingBag, Package, Sparkles, Gift } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { FadeIn } from '@/components/motion/FadeIn';
import { useI18n } from '@/lib/i18n';
import { formatSAR } from '@/lib/utils';

type Bundle = {
  id: string;
  title: string;
  subtitle: string;
  items: string[];
  individualTotal: number;
  bundlePrice: number;
  Icon: typeof Package;
  accent: string;
};

const bundles: Bundle[] = [
  {
    id: 'b1',
    title: 'باندل "نهاية الفوضى"',
    subtitle: 'لكل سيارة فيها أطفال ومقتنيات',
    items: ['منظم فراغ المقعد', 'صينية أكواب السائق', 'منظم شنطة السيارة'],
    individualTotal: 237,
    bundlePrice: 149,
    Icon: Package,
    accent: 'from-sage-100 to-linen-100',
  },
  {
    id: 'b2',
    title: 'باندل "سيارة جديدة"',
    subtitle: 'أهلاً بك في سيارتك الجديدة',
    items: ['شاحن لاسلكي MagSafe', 'واقي شمس قلاب', 'معطر عود فاخر', 'تعليقة مرآة'],
    individualTotal: 316,
    bundlePrice: 229,
    Icon: Sparkles,
    accent: 'from-wood-400/15 to-sage-100',
  },
  {
    id: 'b3',
    title: 'باندل "هديتك لأحد غالي"',
    subtitle: 'تغليف جاهز، لمسة شخصية',
    items: ['معطر عود فاخر', 'تعليقة مرآة فاخرة', 'غطاء مقود جلدي', 'صندوق هدايا'],
    individualTotal: 137,
    bundlePrice: 99,
    Icon: Gift,
    accent: 'from-sage-100 to-wood-400/10',
  },
];

export function Bundles() {
  const { t } = useI18n();

  return (
    <section id="bundles" className="py-20 md:py-28">
      <Container>
        <FadeIn className="text-center">
          <span className="eyebrow">{t('bundles.eyebrow')}</span>
          <h2 className="mt-4 text-display-lg font-semibold text-ink-900 text-balance">
            {t('bundles.title')}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-ink-500">
            {t('bundles.subtitle')}
          </p>
        </FadeIn>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {bundles.map((b, i) => {
            const save = b.individualTotal - b.bundlePrice;
            const savePercent = Math.round((save / b.individualTotal) * 100);
            return (
              <FadeIn key={b.id} delay={i * 0.1}>
                <div className="group relative flex h-full flex-col overflow-hidden rounded-4xl border border-sage-500/10 bg-linen-50 p-7 transition-shadow hover:shadow-card">
                  {/* gradient background */}
                  <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${b.accent} opacity-50`} />

                  <div className="relative">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sage-500/10 text-sage-700">
                      <b.Icon className="h-6 w-6" strokeWidth={1.5} />
                    </div>

                    <h3 className="mt-5 text-xl font-semibold text-ink-900">
                      {b.title}
                    </h3>
                    <p className="mt-1 text-sm text-ink-500">{b.subtitle}</p>

                    <div className="mt-6 rounded-2xl bg-linen-50/80 p-4 backdrop-blur-sm">
                      <p className="text-xs font-medium uppercase tracking-wider text-ink-500">
                        {t('bundles.includes')}
                      </p>
                      <ul className="mt-3 space-y-1.5">
                        {b.items.map((item) => (
                          <li
                            key={item}
                            className="flex items-center gap-2 text-sm text-ink-700"
                          >
                            <span className="h-1 w-1 rounded-full bg-sage-500" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-6 flex items-end justify-between">
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="font-mono text-2xl font-semibold text-ink-900">
                            {formatSAR(b.bundlePrice)}
                          </span>
                          <span className="text-sm text-ink-300 line-through">
                            {formatSAR(b.individualTotal)}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-wood-600">
                          {t('bundles.save')} {formatSAR(save)} · {savePercent}%
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink-900 px-4 py-3 text-sm font-medium text-linen-50 transition-colors hover:bg-ink-700"
                    >
                      <ShoppingBag className="h-4 w-4" strokeWidth={1.5} />
                      {t('bundles.buy')}
                    </button>
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
