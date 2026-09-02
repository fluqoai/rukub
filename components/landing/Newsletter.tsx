'use client';

import { useState, type FormEvent } from 'react';
import { Send, Check } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { FadeIn } from '@/components/motion/FadeIn';
import { useI18n } from '@/lib/i18n';

export function Newsletter() {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  };

  return (
    <section className="pb-20">
      <Container>
        <FadeIn>
          <div className="relative overflow-hidden rounded-4xl bg-sage-500 px-6 py-14 text-linen-50 md:px-12 md:py-20">
            <div
              className="blob"
              style={{
                top: '-30%',
                insetInlineEnd: '-10%',
                width: '400px',
                height: '400px',
                background: 'radial-gradient(circle, rgb(184 149 106 / 0.5) 0%, transparent 70%)',
              }}
            />

            <div className="relative mx-auto max-w-2xl text-center">
              <h2 className="text-display-lg font-semibold text-linen-50 text-balance">
                {t('newsletter.title')}
              </h2>
              <p className="mt-4 text-base text-linen-100/85">
                {t('newsletter.desc')}
              </p>

              {!submitted ? (
                <form
                  onSubmit={onSubmit}
                  className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center"
                >
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('newsletter.placeholder')}
                    className="w-full flex-1 rounded-full border border-linen-50/20 bg-linen-50/10 px-5 py-3 text-sm text-linen-50 placeholder:text-linen-100/60 backdrop-blur-sm focus:bg-linen-50/15 focus:outline-none sm:max-w-xs"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-ink-900 px-6 py-3 text-sm font-medium text-linen-50 transition-colors hover:bg-ink-700"
                  >
                    <Send className="h-4 w-4" strokeWidth={1.5} />
                    {t('newsletter.cta')}
                  </button>
                </form>
              ) : (
                <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-linen-50/15 px-5 py-3 text-sm backdrop-blur-sm">
                  <Check className="h-4 w-4 text-wood-400" />
                  <span>شكراً لاشتراكك — راجع بريدك قريباً.</span>
                </div>
              )}

              <p className="mt-4 text-xs text-linen-100/60">
                {t('newsletter.privacy')}
              </p>
            </div>
          </div>
        </FadeIn>
      </Container>
    </section>
  );
}
