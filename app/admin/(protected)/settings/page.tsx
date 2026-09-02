'use client';

import { useEffect, useState } from 'react';
import { Lock, CreditCard, Globe, Save, Eye, EyeOff, Check, AlertCircle } from 'lucide-react';
import { AdminHeader } from '@/components/admin/AdminHeader';

type Settings = {
  storeName: string;
  storeEmail: string;
  storePhone: string;
  freeShipping: number;
  codEnabled: boolean;
  tapEnabled: boolean;
  tapMode: 'mock' | 'test' | 'live';
  cjMode: 'mock' | 'live';
};

const DEFAULT_SETTINGS: Settings = {
  storeName: 'ركوب',
  storeEmail: 'support@rukub.shop',
  storePhone: '+966 5X XXX XXXX',
  freeShipping: 199,
  codEnabled: true,
  tapEnabled: true,
  tapMode: 'mock',
  cjMode: 'mock',
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState<null | 'ok' | 'err'>(null);
  const [savedMessage, setSavedMessage] = useState('');

  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwdBusy, setPwdBusy] = useState(false);
  const [pwdResult, setPwdResult] = useState<null | { ok: boolean; message: string }>(null);

  // Pull system status (CJ + Tap mode) once
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch('/api/admin/status', { credentials: 'include' });
        if (!alive) return;
        if (res.ok) {
          const json = await res.json();
          if (json?.status) {
            setSettings((s) => ({
              ...s,
              tapMode: json.status.tapMode,
              cjMode: json.status.cjMode,
            }));
          }
        }
      } catch {
        // silent — defaults stay
      }
    })();
    return () => { alive = false; };
  }, []);

  const handleSave = () => {
    setSaved('ok');
    setSavedMessage('تم حفظ الإعدادات');
    setTimeout(() => setSaved(null), 2500);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdResult(null);

    if (newPwd.length < 8) {
      setPwdResult({ ok: false, message: 'كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل' });
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdResult({ ok: false, message: 'كلمتا المرور الجديدتان غير متطابقتين' });
      return;
    }
    if (currentPwd === newPwd) {
      setPwdResult({ ok: false, message: 'كلمة المرور الجديدة يجب أن تكون مختلفة عن الحالية' });
      return;
    }

    setPwdBusy(true);
    try {
      const res = await fetch('/api/admin/password', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: currentPwd, newPassword: newPwd }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setPwdResult({ ok: false, message: json.error ?? 'فشل تحديث كلمة المرور' });
        return;
      }
      setPwdResult({ ok: true, message: 'تم تحديث كلمة المرور بنجاح' });
      setCurrentPwd('');
      setNewPwd('');
      setConfirmPwd('');
    } catch (err) {
      setPwdResult({ ok: false, message: 'تعذر الاتصال بالخادم' });
    } finally {
      setPwdBusy(false);
    }
  };

  return (
    <>
      <AdminHeader title="الإعدادات" subtitle="إعدادات المتجر والحساب" />

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
                  value={settings.storeName}
                  onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                  className="w-full rounded-xl border border-sage-500/20 bg-linen-50 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-700">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={settings.storeEmail}
                  onChange={(e) => setSettings({ ...settings, storeEmail: e.target.value })}
                  className="w-full rounded-xl border border-sage-500/20 bg-linen-50 px-3 py-2 text-sm"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-700">رقم الجوال</label>
                <input
                  type="tel"
                  value={settings.storePhone}
                  onChange={(e) => setSettings({ ...settings, storePhone: e.target.value })}
                  className="w-full rounded-xl border border-sage-500/20 bg-linen-50 px-3 py-2 text-sm"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-700">
                  حد الشحن المجاني (ريال)
                </label>
                <input
                  type="number"
                  value={settings.freeShipping}
                  onChange={(e) => setSettings({ ...settings, freeShipping: Number(e.target.value) })}
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
                enabled={settings.codEnabled}
                onChange={(v) => setSettings({ ...settings, codEnabled: v })}
              />
              <ToggleRow
                label={`Tap Payments · ${settings.tapMode === 'live' ? 'مباشر' : settings.tapMode === 'test' ? 'اختباري' : 'محاكاة'}`}
                description="مدى / فيزا / MC / Apple Pay"
                enabled={settings.tapEnabled}
                onChange={(v) => setSettings({ ...settings, tapEnabled: v })}
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

            <div className="grid gap-3 sm:grid-cols-2">
              <ApiStatusCard
                name="CJdropshipping"
                env="CJ_API_KEY"
                mode={settings.cjMode}
                note={settings.cjMode === 'live' ? 'مفعّل للإنتاج' : 'Mock — أضف المفتاح في Vercel للإنتاج'}
              />
              <ApiStatusCard
                name="Tap Payments"
                env="TAP_SECRET_KEY"
                mode={settings.tapMode}
                note={
                  settings.tapMode === 'live'
                    ? 'مفعّل للإنتاج (مفتاح sk_live_)'
                    : settings.tapMode === 'test'
                    ? 'وضع اختبار (sk_test_) — أضف sk_live_ للإنتاج'
                    : 'Mock — أضف TAP_SECRET_KEY في Vercel'
                }
              />
            </div>
          </div>

          {/* Change admin password */}
          <div className="rounded-3xl border border-sage-500/10 bg-linen-50 p-6 lg:col-span-2">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-wood-400/15 text-wood-700">
                <Lock className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="text-base font-semibold text-ink-900">تغيير كلمة مرور الإدارة</h2>
                <p className="text-[11px] text-ink-500">
                  استبدل كلمة المرور الافتراضية فوراً قبل الإطلاق
                </p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-700">
                  كلمة المرور الحالية
                </label>
                <div className="relative">
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    value={currentPwd}
                    onChange={(e) => setCurrentPwd(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-sage-500/20 bg-linen-50 px-3 py-2 pl-10 text-sm"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-1 text-ink-500 hover:text-ink-700"
                    aria-label={showCurrent ? 'إخفاء' : 'إظهار'}
                  >
                    {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-ink-700">
                    كلمة المرور الجديدة (8 أحرف على الأقل)
                  </label>
                  <div className="relative">
                    <input
                      type={showNew ? 'text' : 'password'}
                      value={newPwd}
                      onChange={(e) => setNewPwd(e.target.value)}
                      required
                      minLength={8}
                      autoComplete="new-password"
                      className="w-full rounded-xl border border-sage-500/20 bg-linen-50 px-3 py-2 pl-10 text-sm"
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-1 text-ink-500 hover:text-ink-700"
                      aria-label={showNew ? 'إخفاء' : 'إظهار'}
                    >
                      {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-ink-700">
                    تأكيد كلمة المرور
                  </label>
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={confirmPwd}
                    onChange={(e) => setConfirmPwd(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-sage-500/20 bg-linen-50 px-3 py-2 text-sm"
                    dir="ltr"
                  />
                </div>
              </div>

              {pwdResult && (
                <div
                  className={`flex items-start gap-2 rounded-xl px-3 py-2 text-xs ${
                    pwdResult.ok
                      ? 'bg-sage-500/10 text-sage-700'
                      : 'bg-rose-500/10 text-rose-700'
                  }`}
                >
                  {pwdResult.ok ? (
                    <Check className="mt-0.5 h-4 w-4 shrink-0" />
                  ) : (
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  )}
                  <span>{pwdResult.message}</span>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={pwdBusy}
                  className="inline-flex items-center gap-2 rounded-full bg-ink-900 px-5 py-2.5 text-sm font-medium text-linen-50 transition-colors hover:bg-ink-800 disabled:opacity-50"
                >
                  {pwdBusy ? 'جاري التحديث…' : 'تحديث كلمة المرور'}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          {saved && (
            <span
              className={`text-xs ${
                saved === 'ok' ? 'text-sage-700' : 'text-rose-700'
              }`}
            >
              {savedMessage}
            </span>
          )}
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-full bg-sage-500 px-6 py-3 text-sm font-medium text-linen-50 transition-colors hover:bg-sage-600"
          >
            <Save className="h-4 w-4" />
            حفظ الإعدادات
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
        aria-pressed={enabled}
        className={`relative h-6 w-11 rounded-full transition-colors ${enabled ? 'bg-sage-500' : 'bg-ink-300'}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-5 rtl:-translate-x-5' : 'translate-x-0.5 rtl:-translate-x-0.5'}`}
        />
      </button>
    </div>
  );
}

function ApiStatusCard({ name, env, mode, note }: { name: string; env: string; mode: 'mock' | 'test' | 'live'; note: string }) {
  const pill = mode === 'live'
    ? 'bg-sage-500/15 text-sage-700'
    : mode === 'test'
    ? 'bg-amber-500/15 text-amber-700'
    : 'bg-wood-400/15 text-wood-700';
  const label = mode === 'live' ? 'Live' : mode === 'test' ? 'Test' : 'Mock';
  return (
    <div className="rounded-2xl bg-linen-100/40 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-ink-900">{name}</p>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${pill}`}>
          {label}
        </span>
      </div>
      <p className="mt-2 font-mono text-[10px] text-ink-500">{env}</p>
      <p className="mt-1 text-[10px] text-ink-500">{note}</p>
    </div>
  );
}
