'use client';

import { Settings, Bell, Lock, CreditCard, Globe, Save } from 'lucide-react';
import { useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';

export default function AdminSettingsPage() {
  const [storeName, setStoreName] = useState('ركوب');
  const [storeEmail, setStoreEmail] = useState('support@rukub.shop');
  const [storePhone, setStorePhone] = useState('+966 5X XXX XXXX');
  const [currency, setCurrency] = useState('SAR');
  const [language, setLanguage] = useState('ar');
  const [freeShipping, setFreeShipping] = useState(199);
  const [codEnabled, setCodEnabled] = useState(true);
  const [tapEnabled, setTapEnabled] = useState(true);
  const [tabbyEnabled, setTabbyEnabled] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <>
      <AdminHeader title="الإعدادات" subtitle="إعدادات المتجر العامة" />

      <div className="p-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Store info */}
          <div className="rounded-3xl border border-sage-500/10 bg-linen-50 p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sage-500/10 text-sage-700">
                <Globe className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <h2 className="text-base font-semibold text-ink-900">معلومات المتجر</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-700">اسم المتجر</label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full rounded-xl border border-sage-500/20 bg-linen-50 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-700">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={storeEmail}
                  onChange={(e) => setStoreEmail(e.target.value)}
                  className="w-full rounded-xl border border-sage-500/20 bg-linen-50 px-3 py-2 text-sm"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-700">رقم الجوال</label>
                <input
                  type="tel"
                  value={storePhone}
                  onChange={(e) => setStorePhone(e.target.value)}
                  className="w-full rounded-xl border border-sage-500/20 bg-linen-50 px-3 py-2 text-sm"
                  dir="ltr"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-ink-700">العملة</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full rounded-xl border border-sage-500/20 bg-linen-50 px-3 py-2 text-sm"
                  >
                    <option value="SAR">ريال سعودي (SAR)</option>
                    <option value="AED">درهم إماراتي (AED)</option>
                    <option value="KWD">دينار كويتي (KWD)</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-ink-700">اللغة الافتراضية</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full rounded-xl border border-sage-500/20 bg-linen-50 px-3 py-2 text-sm"
                  >
                    <option value="ar">العربية</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-700">
                  حد الشحن المجاني (ريال)
                </label>
                <input
                  type="number"
                  value={freeShipping}
                  onChange={(e) => setFreeShipping(Number(e.target.value))}
                  className="w-full rounded-xl border border-sage-500/20 bg-linen-50 px-3 py-2 text-sm font-mono"
                  dir="ltr"
                />
              </div>
            </div>
          </div>

          {/* Payment methods */}
          <div className="rounded-3xl border border-sage-500/10 bg-linen-50 p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-wood-400/15 text-wood-700">
                <CreditCard className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <h2 className="text-base font-semibold text-ink-900">طرق الدفع</h2>
            </div>

            <div className="space-y-3">
              <ToggleRow
                label="الدفع عند الاستلام (COD)"
                description="العميل يدفع للمندوب نقداً"
                enabled={codEnabled}
                onChange={setCodEnabled}
              />
              <ToggleRow
                label="Tap Payments"
                description="مدى / فيزا / MC / Apple Pay"
                enabled={tapEnabled}
                onChange={setTapEnabled}
              />
              <ToggleRow
                label="Tabby (تقسيط)"
                description="4 دفعات بدون فوائد (200+ ريال)"
                enabled={tabbyEnabled}
                onChange={setTabbyEnabled}
              />
            </div>
          </div>

          {/* API keys status */}
          <div className="rounded-3xl border border-sage-500/10 bg-linen-50 p-6 lg:col-span-2">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink-900/8 text-ink-700">
                <Lock className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <h2 className="text-base font-semibold text-ink-900">حالة الـ API</h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <ApiStatusCard
                name="CJdropshipping"
                env="CJ_API_KEY"
                note="Mock mode — أضف المفتاح للإنتاج"
              />
              <ApiStatusCard
                name="Tap Payments"
                env="TAP_SECRET_KEY"
                note="Mock mode — أضف المفتاح للإنتاج"
              />
              <ApiStatusCard
                name="Tabby"
                env="TABBY_PUBLIC_KEY"
                note="Mock UI — أضف المفتاح للإنتاج"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-full bg-sage-500 px-6 py-3 text-sm font-medium text-linen-50 transition-colors hover:bg-sage-600"
          >
            <Save className="h-4 w-4" />
            {saved ? 'تم الحفظ ✓' : 'حفظ التغييرات'}
          </button>
        </div>
      </div>
    </>
  );
}

function ToggleRow({ label, description, enabled, onChange }: { label: string; description: string; enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-linen-100/40 p-3">
      <div>
        <p className="text-sm font-medium text-ink-900">{label}</p>
        <p className="text-[10px] text-ink-500">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!enabled)}
        className={`relative h-6 w-11 rounded-full transition-colors ${enabled ? 'bg-sage-500' : 'bg-ink-300'}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-5 rtl:-translate-x-5' : 'translate-x-0.5 rtl:-translate-x-0.5'}`}
        />
      </button>
    </div>
  );
}

function ApiStatusCard({ name, env, note }: { name: string; env: string; note: string }) {
  return (
    <div className="rounded-2xl bg-linen-100/40 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-ink-900">{name}</p>
        <span className="rounded-full bg-wood-400/15 px-2 py-0.5 text-[10px] font-medium text-wood-700">
          Mock
        </span>
      </div>
      <p className="mt-2 font-mono text-[10px] text-ink-500">{env}</p>
      <p className="mt-1 text-[10px] text-ink-500">{note}</p>
    </div>
  );
}
