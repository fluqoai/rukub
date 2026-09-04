'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type PublicProduct as Product } from '@/lib/public-products';
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
  ...((product as any).specifications || []),
  { label: 'الاستخدام', value: product.audience === 'women' ? 'ترتيب وأناقة' : product.audience === 'men' ? 'تقنية واستعداد' : 'العناية اليومية' },
  { label: 'التوصيل', value: (product as any).deliveryMaxDays ? `${(product as any).deliveryMinDays ?? (product as any).deliveryMaxDays}–${(product as any).deliveryMaxDays} يوم عمل تقريباً` : 'يُحدّث بعد تأكيد الطلب' },
  { label: 'وجهة الشحن', value: 'المملكة العربية السعودية' },
  { label: 'الإرجاع', value: 'وفق السياسة المنشورة' },
  { label: 'SKU', value: product.id.toUpperCase() },
];

export function ProductTabs({ product }: ProductTabsProps) {
  const [active, setActive] = useState<typeof tabs[number]['key']>('description');

  return (
    <div id="product-details" className="mt-12 scroll-mt-24 rounded-3xl border border-sage-500/15 bg-white p-4 md:p-8">
      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b border-sage-500/10">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            aria-pressed={active === tab.key}
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
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="py-8"
        >
          {active === 'description' && (
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <h3 className="text-lg font-semibold text-ink-900">عن هذا المنتج</h3>
                <p className="mt-4 whitespace-pre-line leading-8 text-ink-700" dir="auto">
                  {product.description}
                </p>
                {(product as any).usage && <div className="mt-5"><h4 className="font-medium">طريقة الاستخدام</h4><p className="mt-2 whitespace-pre-line text-sm leading-7">{(product as any).usage}</p></div>}
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
                  <li>• المدة تعتمد على توفر المنتج والمدينة</li>
                  <li>• شحن مجاني للطلبات بقيمة 199 ريال فأكثر</li>
                  <li>• تتبع الطلب عبر رقم الجوال</li>
                  <li>• تظهر المدن المدعومة أثناء إتمام الطلب</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink-900">الإرجاع والضمان</h3>
                <ul className="mt-4 space-y-2 text-sm text-ink-700">
                  <li>• الاستبدال والاسترجاع وفق السياسة المنشورة</li>
                  <li>• ضمان استبدال في حال وجود عيب مصنعي</li>
                  <li>• تواصل كتابي عبر support@rukub.shop</li>
                </ul>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
