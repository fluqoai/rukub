'use client';

import Image from 'next/image';
import { type Product } from '@/lib/products';
import { lifestylePhotos } from '@/lib/product-images';

type LifestyleScenesProps = {
  product: Product;
};

const scenes = [
  {
    src: lifestylePhotos.dashboard,
    title: 'في سيارتك',
    desc: 'مصمم ليبدو كأنه جزء من سيارتك',
  },
  {
    src: lifestylePhotos.road,
    title: 'في كل رحلة',
    desc: 'سواء مدينة أو سفر طويل',
  },
  {
    src: lifestylePhotos.night,
    title: 'ليلاً ونهاراً',
    desc: 'أداء ثابت في كل الظروف',
  },
];

export function LifestyleScenes({ product }: LifestyleScenesProps) {
  return (
    <section className="mt-16">
      <div className="mb-8 text-center">
        <span className="eyebrow">لمسات من الحياة</span>
        <h2 className="mt-3 text-2xl font-semibold text-ink-900">
          {product.shortName} في سيارتك
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-ink-500">
          شاهد كيف يبدو المنتج في سياقات حقيقية
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {scenes.map((scene, i) => (
          <div
            key={i}
            className="group relative aspect-[4/5] overflow-hidden rounded-3xl bg-linen-100"
          >
            <Image
              src={scene.src}
              alt={scene.title}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-900/80 via-ink-900/30 to-transparent p-6 text-linen-50">
              <h3 className="text-lg font-semibold">{scene.title}</h3>
              <p className="mt-1 text-xs text-linen-200/85">{scene.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
