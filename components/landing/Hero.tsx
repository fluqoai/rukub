'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Banknote, RotateCcw, ShieldCheck, Truck } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { FadeIn } from '@/components/motion/FadeIn';

const assurances = [
  { Icon: Banknote, label: 'الدفع عند الاستلام' },
  { Icon: RotateCcw, label: 'سياسة إرجاع واضحة' },
  { Icon: Truck, label: 'تحديثات واضحة للطلب' },
];

export function Hero() {
  return (
    <section className="relative isolate min-h-[640px] overflow-hidden bg-ink-900 text-linen-50 md:min-h-[720px]">
      <Image src="/brand/rukub-hero.png" alt="مقصورة سيارة أنيقة مجهزة لإطلالة مرتبة ومريحة" fill priority sizes="100vw" className="object-cover object-[38%_center]" />
      <div className="absolute inset-0 bg-gradient-to-l from-ink-900 via-ink-900/80 to-ink-900/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink-900/75 via-transparent to-ink-900/20" />

      <Container className="relative flex min-h-[640px] items-center py-20 md:min-h-[720px]">
        <div className="max-w-2xl">
          <FadeIn>
            <span className="inline-flex items-center gap-2 rounded-full border border-linen-50/20 bg-linen-50/10 px-4 py-2 text-xs text-linen-100 backdrop-blur">
              <ShieldCheck className="h-4 w-4 text-wood-400" />
              مختارات عملية للسيارة في السعودية
            </span>
          </FadeIn>
          <FadeIn delay={0.08}>
            <h1 className="mt-6 text-4xl font-semibold leading-[1.18] text-linen-50 sm:text-5xl md:text-6xl">
              كل رحلة تبدأ من
              <span className="mt-1 block text-wood-400">سيارة مرتبة ومجهزة.</span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.16} className="mt-6 max-w-xl text-base leading-8 text-linen-100/80 md:text-lg">
            إكسسوارات مختارة للراحة والتنظيم والأمان، بتجربة شراء عربية بسيطة ودعم محلي من لحظة الطلب حتى الاستلام.
          </FadeIn>
          <FadeIn delay={0.24} className="mt-8 flex flex-wrap gap-3">
            <Link href="/discover" className="inline-flex items-center gap-2 rounded-full bg-linen-50 px-6 py-3.5 text-sm font-semibold text-ink-900 transition hover:bg-white">
              تسوق المنتجات <ArrowLeft className="h-4 w-4" />
            </Link>
            <Link href="/orders" className="inline-flex items-center rounded-full border border-linen-50/25 bg-linen-50/10 px-6 py-3.5 text-sm font-medium text-linen-50 backdrop-blur transition hover:bg-linen-50/15">متابعة طلبك</Link>
          </FadeIn>
          <FadeIn delay={0.32} className="mt-12 grid gap-3 sm:grid-cols-3">
            {assurances.map(({ Icon, label }) => <div key={label} className="flex items-center gap-2 text-xs text-linen-100/75"><Icon className="h-4 w-4 flex-none text-wood-400" strokeWidth={1.7} /><span>{label}</span></div>)}
          </FadeIn>
        </div>
      </Container>
      <p className="absolute bottom-4 end-5 text-[10px] text-linen-100/45">صورة تعبيرية لهوية ركوب</p>
    </section>
  );
}
