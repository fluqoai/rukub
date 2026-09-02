'use client';

import { Instagram, Twitter, MessageCircle, Mail } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { useI18n } from '@/lib/i18n';

export function Footer() {
  const { t } = useI18n();

  const shopLinks = [
    { label: t('nav.women'), href: '/shop/women' },
    { label: t('nav.men'), href: '/shop/men' },
    { label: t('nav.shared'), href: '/shop/shared' },
    { label: t('bundles.eyebrow'), href: '/#bundles' },
  ];

  const supportLinks = [
    { label: 'طلباتي', href: '/orders' },
    { label: 'سياسة الخصوصية', href: '/privacy' },
    { label: 'شروط الاستخدام', href: '/terms' },
    { label: 'سياسة الإرجاع', href: '/refund' },
    { label: 'تواصل معنا', href: 'mailto:support@rukub.shop' },
  ];

  return (
    <footer className="border-t border-sage-500/10 bg-linen-100/60">
      <Container className="py-14">
        <div className="grid gap-10 md:grid-cols-12">
          {/* Brand */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sage-500 text-linen-50">
                <span className="font-mono text-sm font-bold">ر</span>
              </div>
              <span className="text-base font-semibold text-ink-900">ركوب</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-500">
              {t('footer.tagline')}
            </p>

            <div className="mt-6 flex items-center gap-3">
              {[Instagram, Twitter, MessageCircle, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-sage-500/20 bg-linen-50 text-ink-700 transition-colors hover:bg-sage-50"
                  aria-label="social"
                >
                  <Icon className="h-4 w-4" strokeWidth={1.5} />
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div className="md:col-span-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-900">
              {t('footer.shop')}
            </h4>
            <ul className="mt-4 space-y-2.5">
              {shopLinks.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="text-sm text-ink-500 transition-colors hover:text-sage-600">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="md:col-span-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-900">
              {t('footer.support')}
            </h4>
            <ul className="mt-4 space-y-2.5">
              {supportLinks.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="text-sm text-ink-500 transition-colors hover:text-sage-600">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-900">
              {t('footer.contact')}
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm text-ink-500">
              <li>الرياض، السعودية</li>
              <li>support@rukub.shop</li>
              <li dir="ltr" className="text-start">+966 5X XXX XXXX</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-sage-500/10 pt-6 text-xs text-ink-500 sm:flex-row">
          <p>© 2026 ركوب. {t('footer.rights')}.</p>
          <div className="flex items-center gap-3 text-[10px]">
            <span className="text-ink-300">{t('footer.payment')}:</span>
            <span className="rounded bg-linen-50 px-2 py-1 font-mono text-ink-700">مدى</span>
            <span className="rounded bg-linen-50 px-2 py-1 font-mono text-ink-700">Visa</span>
            <span className="rounded bg-linen-50 px-2 py-1 font-mono text-ink-700">MC</span>
            <span className="rounded bg-linen-50 px-2 py-1 font-mono text-ink-700">Apple Pay</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
