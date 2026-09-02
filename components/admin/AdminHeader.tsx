'use client';

import { Search, Bell, RefreshCw } from 'lucide-react';
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
        <div className="hidden items-center gap-2 rounded-full border border-sage-500/20 bg-linen-50 px-3 py-1.5 sm:flex">
          <Search className="h-3.5 w-3.5 text-ink-500" />
          <input
            type="search"
            placeholder="بحث سريع..."
            className="w-32 border-none bg-transparent text-xs text-ink-900 placeholder:text-ink-500/70 focus:outline-none"
          />
          <span className="font-mono text-[9px] text-ink-300">⌘K</span>
        </div>

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

        <button
          type="button"
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-sage-500/20 bg-linen-50 text-ink-700 transition-colors hover:bg-sage-50"
        >
          <Bell className="h-3.5 w-3.5" strokeWidth={1.5} />
          <span className="absolute -end-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-wood-500 text-[9px] font-semibold text-linen-50">
            3
          </span>
        </button>

        <div className="hidden flex-col items-end md:flex">
          <span className="font-mono text-xs text-ink-700">{time}</span>
          <span className="text-[10px] text-ink-500">السعودية</span>
        </div>
      </div>
    </header>
  );
}
