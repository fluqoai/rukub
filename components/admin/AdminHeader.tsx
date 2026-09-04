'use client';

import { Bell, RefreshCw, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type AdminHeaderProps = {
  title: string;
  subtitle?: string;
  onRefresh?: () => void;
};

export function AdminHeader({ title, subtitle, onRefresh }: AdminHeaderProps) {
  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('ar-SA', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'Asia/Riyadh',
        })
      );
    };
    update();
    const interval = setInterval(update, 60_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b border-sage-500/10 bg-linen-50/80 px-6 backdrop-blur">
      <div>
        <h1 className="text-lg font-semibold text-ink-900">{title}</h1>
        {subtitle && <p className="text-xs text-ink-500">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2">
        <Link href="/" target="_blank" className="hidden items-center gap-2 rounded-xl border border-sage-500/20 px-3 py-2 text-xs sm:flex">معاينة المتجر<ExternalLink className="h-3.5 w-3.5" /></Link>

        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-sage-500/20 bg-linen-50 text-ink-700 transition-colors hover:bg-sage-50"
            title="تحديث"
          >
            <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
        )}

        <Link
          href="/admin/notifications"
          aria-label="الإشعارات"
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-sage-500/20 bg-linen-50 text-ink-700 transition-colors hover:bg-sage-50"
        >
          <Bell className="h-3.5 w-3.5" strokeWidth={1.5} />
        </Link>

        <div className="hidden flex-col items-end md:flex">
          <span className="font-mono text-xs text-ink-700">{time}</span>
          <span className="text-[10px] text-ink-500">السعودية</span>
        </div>
      </div>
    </header>
  );
}
