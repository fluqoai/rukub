'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import { type ReactNode } from 'react';

type FadeInProps = {
  children: ReactNode;
  delay?: number;
  y?: number;
  duration?: number;
  className?: string;
  as?: 'div' | 'section' | 'article' | 'li' | 'header' | 'footer';
} & Omit<HTMLMotionProps<'div'>, 'children' | 'className'>;

export function FadeIn({
  children,
  delay = 0,
  y = 12,
  duration = 0.6,
  className,
  as = 'div',
  ...rest
}: FadeInProps) {
  const MotionTag = motion[as] as typeof motion.div;
  return (
    <MotionTag
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}
