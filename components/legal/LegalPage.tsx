// Shared layout for legal/policy pages (privacy, terms, refund).
// RTL Arabic-first with anchor links for sections.

import { Container } from '@/components/ui/Container';
import { Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';

export type LegalSection = {
  id: string;
  title: string;
  paragraphs: (string | { list: string[] })[];
};

export type LegalPageProps = {
  title: string;
  subtitle: string;
  lastUpdated: string;       // e.g. "2 سبتمبر 2026"
  sections: LegalSection[];
  toc?: boolean;            // show table of contents at top
};

export function LegalPage({ title, subtitle, lastUpdated, sections, toc = true }: LegalPageProps) {
  return (
    <main className="bg-linen-50/40 py-12 md:py-20">
      <Container className="max-w-3xl">
        <header className="mb-10 border-b border-sage-500/10 pb-8">
          <span className="eyebrow">ركوب · السياسات</span>
          <h1 className="mt-3 text-3xl font-semibold text-ink-900 md:text-4xl">{title}</h1>
          <p className="mt-3 text-base text-ink-500">{subtitle}</p>
          <p className="mt-4 text-[10px] text-ink-300">آخر تحديث: {lastUpdated}</p>
        </header>

        {toc && (
          <nav className="mb-10 rounded-2xl border border-sage-500/10 bg-linen-50 p-4">
            <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-ink-500">
              المحتويات
            </p>
            <ul className="space-y-1.5">
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="text-sm text-sage-600 transition-colors hover:text-sage-700"
                  >
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <div className="space-y-10 text-base leading-relaxed text-ink-700">
          {sections.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-24">
              <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-ink-900">
                <Link
                  href={`#${s.id}`}
                  aria-label={`رابط إلى ${s.title}`}
                  className="text-sage-500 opacity-0 transition-opacity hover:opacity-100 group-hover:opacity-100"
                >
                  <LinkIcon className="h-4 w-4" strokeWidth={1.5} />
                </Link>
                {s.title}
              </h2>
              <div className="space-y-3">
                {s.paragraphs.map((p, i) =>
                  typeof p === 'string' ? (
                    <p key={i}>{p}</p>
                  ) : (
                    <ul key={i} className="list-inside list-disc space-y-1.5 ps-1 marker:text-sage-500">
                      {p.list.map((item, j) => (
                        <li key={j}>{item}</li>
                      ))}
                    </ul>
                  )
                )}
              </div>
            </section>
          ))}
        </div>

        <footer className="mt-12 border-t border-sage-500/10 pt-6 text-xs text-ink-500">
          <p>
            لأي استفسار:{' '}
            <a href="mailto:support@rukub.shop" className="text-sage-600 hover:text-sage-700" dir="ltr">
              support@rukub.shop
            </a>
          </p>
        </footer>
      </Container>
    </main>
  );
}
