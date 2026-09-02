'use client';

import { useState, type FormEvent } from 'react';
import { User, Phone, Mail, MapPin, Home, MessageSquare, ArrowLeft, ArrowRight, type LucideIcon } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useCartStore, selectTotalItems } from '@/lib/cart-store';
import { cn } from '@/lib/utils';

type CustomerInfo = {
  fullName: string;
  phone: string;
  email: string;
  city: string;
  district: string;
  notes: string;
};

type CustomerInfoFormProps = {
  onSubmit: (info: CustomerInfo) => void;
  initial?: Partial<CustomerInfo>;
};

const saudiCities = [
  'الرياض',
  'جدة',
  'مكة المكرمة',
  'المدينة المنورة',
  'الدمام',
  'الخبر',
  'الطائف',
  'تبوك',
  'أبها',
  'حائل',
  'بريدة',
  'الجبيل',
  'الخرج',
  'نجران',
  'القطيف',
];

export function CustomerInfoForm({ onSubmit, initial }: CustomerInfoFormProps) {
  const { locale } = useI18n();
  const Arrow = locale === 'ar' ? ArrowLeft : ArrowRight;
  const totalItems = useCartStore(selectTotalItems);

  const [info, setInfo] = useState<CustomerInfo>({
    fullName: initial?.fullName ?? '',
    phone: initial?.phone ?? '',
    email: initial?.email ?? '',
    city: initial?.city ?? 'الرياض',
    district: initial?.district ?? '',
    notes: initial?.notes ?? '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CustomerInfo, string>>>({});

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};
    if (!info.fullName.trim()) newErrors.fullName = 'الاسم مطلوب';
    if (!info.phone.trim()) newErrors.phone = 'الجوال مطلوب';
    else if (!/^(\+?966|0)?5\d{8}$/.test(info.phone.replace(/\s/g, '')))
      newErrors.phone = 'رقم جوال سعودي غير صحيح';
    if (info.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(info.email))
      newErrors.email = 'بريد إلكتروني غير صحيح';
    if (!info.district.trim()) newErrors.district = 'الحي مطلوب';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSubmit(info);
  };

  const setField = <K extends keyof CustomerInfo>(key: K, value: CustomerInfo[K]) => {
    setInfo((p) => ({ ...p, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-ink-900">معلوماتك</h2>
        <p className="mt-1 text-sm text-ink-500">
          نحتاج هذه البيانات لتوصيل طلبك إليك
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="الاسم الكامل"
          icon={User}
          required
          error={errors.fullName}
        >
          <input
            type="text"
            value={info.fullName}
            onChange={(e) => setField('fullName', e.target.value)}
            placeholder="محمد العتيبي"
            className="form-input"
          />
        </Field>

        <Field
          label="رقم الجوال"
          icon={Phone}
          required
          error={errors.phone}
        >
          <input
            type="tel"
            value={info.phone}
            onChange={(e) => setField('phone', e.target.value)}
            placeholder="05XXXXXXXX"
            dir="ltr"
            className="form-input text-start"
          />
        </Field>
      </div>

      <Field
        label="البريد الإلكتروني (اختياري)"
        icon={Mail}
        error={errors.email}
      >
        <input
          type="email"
          value={info.email}
          onChange={(e) => setField('email', e.target.value)}
          placeholder="you@example.com"
          dir="ltr"
          className="form-input text-start"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="المدينة" icon={MapPin} required>
          <select
            value={info.city}
            onChange={(e) => setField('city', e.target.value)}
            className="form-input"
          >
            {saudiCities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label="الحي / الشارع"
          icon={Home}
          required
          error={errors.district}
        >
          <input
            type="text"
            value={info.district}
            onChange={(e) => setField('district', e.target.value)}
            placeholder="حي الياسمين، شارع الملك فهد"
            className="form-input"
          />
        </Field>
      </div>

      <Field label="ملاحظات (اختياري)" icon={MessageSquare}>
        <textarea
          value={info.notes}
          onChange={(e) => setField('notes', e.target.value)}
          placeholder="مثال: اتصلوا قبل الوصول، الشقة رقم 5"
          rows={3}
          className="form-input resize-none"
        />
      </Field>

      <div className="flex items-center justify-between border-t border-sage-500/10 pt-5">
        <span className="text-xs text-ink-500">
          {totalItems} منتج في السلة
        </span>
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-full bg-sage-500 px-6 py-3 text-sm font-medium text-linen-50 transition-colors hover:bg-sage-600"
        >
          المتابعة للدفع
          <Arrow className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>

      <style jsx>{`
        :global(.form-input) {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgb(107 122 90 / 0.2);
          background-color: rgb(245 241 234);
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          color: rgb(44 42 38);
          transition: all 0.2s;
        }
        :global(.form-input::placeholder) {
          color: rgb(168 162 150);
        }
        :global(.form-input:focus) {
          outline: none;
          border-color: rgb(107 122 90);
          background-color: rgb(251 249 245);
        }
        :global(select.form-input) {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%237A766E' stroke-width='1.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: left 0.75rem center;
          background-size: 1rem;
          padding-inline-start: 0.75rem;
        }
      `}</style>
    </form>
  );
}

type FieldProps = {
  label: string;
  icon: LucideIcon;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
};

function Field({ label, icon: Icon, required, error, children }: FieldProps) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-ink-700">
        <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
        {label}
        {required && <span className="text-wood-600">*</span>}
      </span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}
