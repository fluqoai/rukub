'use client';

import { Languages } from 'lucide-react';
import { useI18n, type Locale } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export function LanguageToggle({ className }: { className?: string }) {
  const { locale, setLocale } = useI18n();
  const next: Locale = locale === 'ar' ? 'en' : 'ar';
  return (
    <button
      type="button"
      onClick={() => setLocale(next)}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-sage-500/20 bg-linen-50 px-3 py-1.5 text-xs font-medium text-ink-700 transition-colors hover:bg-sage-50',
        className
      )}
      aria-label="Toggle language"
    >
      <Languages className="h-3.5 w-3.5" strokeWidth={1.5} />
      <span className="min-w-[24px] text-center">{locale === 'ar' ? 'EN' : 'ع'}</span>
    </button>
  );
}
