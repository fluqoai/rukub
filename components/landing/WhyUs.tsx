'use client';

import { Truck, Banknote, CreditCard, MessageCircle } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { FadeIn } from '@/components/motion/FadeIn';
import { useI18n } from '@/lib/i18n';

const reasons = [
  { icon: Truck, key: 'shipping' },
  { icon: Banknote, key: 'cod' },
  { icon: CreditCard, key: 'installment' },
  { icon: MessageCircle, key: 'support' },
] as const;

export function WhyUs() {
  const { t } = useI18n();

  return (
    <section id="about" className="bg-ink-900 py-20 text-linen-50 md:py-28">
      <Container>
        <FadeIn className="text-center">
          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-wood-400">
            <span className="h-px w-8 bg-wood-400" />
            {t('why.eyebrow')}
          </span>
          <h2 className="mt-4 text-display-lg font-semibold text-linen-50 text-balance">
            {t('why.title')}
          </h2>
        </FadeIn>

        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map(({ icon: Icon, key }, i) => (
            <FadeIn key={key} delay={i * 0.08}>
              <div className="text-center">
                <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-sage-500/20 text-wood-400">
                  <Icon className="h-7 w-7" strokeWidth={1.5} />
                </div>
                <h3 className="mt-5 text-lg font-medium text-linen-50">
                  {t(`why.${key}.title`)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-linen-200/70">
                  {t(`why.${key}.desc`)}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </Container>
    </section>
  );
}
