'use client';

import { Check } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

type ToastProps = {
  message: string | null;
  onDone?: () => void;
  duration?: number;
};

export function Toast({ message, onDone, duration = 2500 }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const t = setTimeout(() => {
        setVisible(false);
        setTimeout(() => onDone?.(), 250);
      }, duration);
      return () => clearTimeout(t);
    }
  }, [message, duration, onDone]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-none fixed bottom-6 start-1/2 z-[100] -translate-x-1/2 rtl:translate-x-1/2"
        >
          <div className="flex items-center gap-2 rounded-full bg-ink-900 px-4 py-2.5 text-sm text-linen-50 shadow-card">
            <Check className="h-4 w-4 text-wood-400" strokeWidth={2} />
            <span>{message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
