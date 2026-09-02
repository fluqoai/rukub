'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type Product } from '@/lib/products';
import { cn } from '@/lib/utils';

type ProductTabsProps = {
  product: Product;
};

const tabs = [
  { key: 'description', label: 'الوصف' },
  { key: 'specs', label: 'المواصفات' },
  { key: 'shipping', label: 'الشحن والإرجاع' },
] as const;

const specsData = (product: Product) => [
  { label: 'الفئة', value: product.audience === 'women' ? 'نسائي' : product.audience === 'men' ? 'رجالي' : 'مشترك' },
  { label: 'المستوى السعري', value: `الفئة ${product.tier}` },
  { label: 'التوصيل المتوقع', value: '2-5 أيام' },
  { label: 'بلد الشحن', value: 'المملكة العربية السعودية' },
  { label: 'الضمان', value: 'استبدال خلال 14 يوم' },
  { label: 'SKU', value: product.id.toUpperCase() },
];

export function ProductTabs({ product }: ProductTabsProps) {
  const [active, setActive] = useState<typeof tabs[number]['key']>('description');

  return (
    <div className="mt-16">
      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b border-sage-500/10">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActive(tab.key)}
            className={cn(
              'relative px-4 py-3 text-sm font-medium transition-colors',
              active === tab.key ? 'text-sage-600' : 'text-ink-500 hover:text-ink-700'
            )}
          >
            {tab.label}
            {active === tab.key && (
              <motion.span
                layoutId="tab-underline"
                className="absolute inset-x-0 -bottom-px h-0.5 bg-sage-500"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="py-8"
        >
          {active === 'description' && (
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <h3 className="text-lg font-semibold text-ink-900">عن هذا المنتج</h3>
                <p className="mt-4 leading-relaxed text-ink-700">
                  {product.description}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink-900">المميزات</h3>
                <ul className="mt-4 space-y-3">
                  {product.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-sage-500/10 text-sage-600">
                        <svg
                          className="h-3 w-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-sm leading-relaxed text-ink-700">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {active === 'specs' && (
            <div className="overflow-hidden rounded-2xl border border-sage-500/10">
              <table className="w-full">
                <tbody>
                  {specsData(product).map((spec, i) => (
                    <tr
                      key={spec.label}
                      className={cn(
                        'border-b border-sage-500/5 last:border-0',
                        i % 2 === 0 ? 'bg-linen-50' : 'bg-linen-100/40'
                      )}
                    >
                      <td className="w-1/3 px-5 py-3.5 text-sm text-ink-500">
                        {spec.label}
                      </td>
                      <td className="px-5 py-3.5 text-sm font-medium text-ink-900">
                        {spec.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {active === 'shipping' && (
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="text-lg font-semibold text-ink-900">الشحن</h3>
                <ul className="mt-4 space-y-2 text-sm text-ink-700">
                  <li>• توصيل خلال 2-5 أيام عمل من مستودع السعودية</li>
                  <li>• شحن مجاني للطلبات فوق 199 ريال</li>
                  <li>• تتبع الطلب عبر رقم الجوال</li>
                  <li>• توصيل لجميع مدن المملكة</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink-900">الإرجاع والضمان</h3>
                <ul className="mt-4 space-y-2 text-sm text-ink-700">
                  <li>• إرجاع مجاني خلال 14 يوم من الاستلام</li>
                  <li>• ضمان استبدال في حال وجود عيب مصنعي</li>
                  <li>• تواصل مع خدمة العملاء خلال ساعة على واتساب</li>
                </ul>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
