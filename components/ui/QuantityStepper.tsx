'use client';

import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

type QuantityStepperProps = {
  value: number;
  onChange: (qty: number) => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md';
  className?: string;
};

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  size = 'md',
  className,
}: QuantityStepperProps) {
  const decrement = () => onChange(Math.max(min, value - 1));
  const increment = () => onChange(Math.min(max, value + 1));

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border border-sage-500/20 bg-linen-50',
        size === 'sm' ? 'h-8' : 'h-10',
        className
      )}
    >
      <button
        type="button"
        onClick={decrement}
        disabled={value <= min}
        className={cn(
          'inline-flex items-center justify-center text-ink-700 transition-colors hover:bg-sage-50 disabled:cursor-not-allowed disabled:opacity-40',
          size === 'sm' ? 'h-8 w-8' : 'h-10 w-10'
        )}
        aria-label="إنقاص الكمية"
      >
        <Minus className="h-3.5 w-3.5" strokeWidth={2} />
      </button>
      <span
        className={cn(
          'min-w-[2.5rem] text-center font-mono font-medium tabular-nums text-ink-900',
          size === 'sm' ? 'text-xs' : 'text-sm'
        )}
      >
        {value}
      </span>
      <button
        type="button"
        onClick={increment}
        disabled={value >= max}
        className={cn(
          'inline-flex items-center justify-center text-ink-700 transition-colors hover:bg-sage-50 disabled:cursor-not-allowed disabled:opacity-40',
          size === 'sm' ? 'h-8 w-8' : 'h-10 w-10'
        )}
        aria-label="زيادة الكمية"
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={2} />
      </button>
    </div>
  );
}
