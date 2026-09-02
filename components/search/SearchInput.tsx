'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type SearchInputProps = {
  className?: string;
  autoFocus?: boolean;
  initialQuery?: string;
};

export function SearchInput({ className, autoFocus = false, initialQuery = '' }: SearchInputProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState(initialQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  // Sync with URL when navigating
  useEffect(() => {
    if (pathname !== '/search') {
      setQuery('');
    }
  }, [pathname]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push('/search');
    }
  };

  return (
    <form
      onSubmit={submit}
      className={cn(
        'group relative flex items-center rounded-full border border-sage-500/20 bg-linen-50 transition-colors focus-within:border-sage-500/50',
        className
      )}
    >
      <Search
        className="absolute start-3 h-4 w-4 text-ink-500 transition-colors group-focus-within:text-sage-600"
        strokeWidth={1.5}
      />
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="ابحث عن منتج..."
        className="w-full bg-transparent px-9 py-2 text-sm text-ink-900 placeholder:text-ink-500/70 focus:outline-none"
        dir="auto"
      />
      {query && (
        <button
          type="button"
          onClick={() => {
            setQuery('');
            inputRef.current?.focus();
          }}
          className="absolute end-2 inline-flex h-6 w-6 items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-sage-50 hover:text-ink-700"
          aria-label="مسح البحث"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </form>
  );
}
