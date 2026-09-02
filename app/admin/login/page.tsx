'use client';

import { Suspense, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import { Container } from '@/components/ui/Container';

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginFallback() {
  return (
    <main className="flex min-h-[90vh] items-center justify-center bg-linen-100/50">
      <Loader2 className="h-6 w-6 animate-spin text-ink-500" />
    </main>
  );
}

function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const redirectTo = search.get('redirect') || '/admin';

  const [email, setEmail] = useState('admin@rukub.shop');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'فشل تسجيل الدخول');
        return;
      }
      router.replace(redirectTo);
      router.refresh();
    } catch (err) {
      setError('تعذر الاتصال بالخادم. حاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-[90vh] items-center justify-center bg-linen-100/50 py-12">
      <Container>
        <div className="mx-auto max-w-md">
          <div className="mb-6 text-center">
            <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-ink-900 text-linen-50">
              <ShieldCheck className="h-7 w-7" strokeWidth={1.5} />
            </div>
            <h1 className="mt-4 text-2xl font-semibold text-ink-900">لوحة الإدارة</h1>
            <p className="mt-1 text-sm text-ink-500">ركوب · Admin</p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-sage-500/10 bg-linen-50 p-6 shadow-card"
          >
            {error && (
              <div className="mb-4 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-700">
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <Mail className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@rukub.shop"
                    className="w-full rounded-xl border border-sage-500/20 bg-linen-50 ps-10 pe-4 py-3 text-sm focus:border-sage-500 focus:outline-none"
                    dir="ltr"
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-700">
                  كلمة المرور
                </label>
                <div className="relative">
                  <Lock className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-sage-500/20 bg-linen-50 ps-10 pe-4 py-3 text-sm focus:border-sage-500 focus:outline-none"
                    dir="ltr"
                    required
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-ink-900 px-5 py-3 text-sm font-medium text-linen-50 transition-colors hover:bg-ink-700 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    جارٍ التحقق...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    دخول
                  </>
                )}
              </button>
            </div>

            <div className="mt-5 rounded-2xl bg-sage-50/60 p-3 text-[10px] text-ink-500">
              <p className="font-medium text-ink-700">للتجربة الأولى:</p>
              <p className="mt-1 font-mono" dir="ltr">
                admin@rukub.shop · admin123
              </p>
              <p className="mt-1 text-ink-500">غيّر كلمة المرور بعد الدخول من الإعدادات.</p>
            </div>
          </form>
        </div>
      </Container>
    </main>
  );
}
