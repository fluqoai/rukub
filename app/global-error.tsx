'use client';

// Global error boundary. Catches unhandled client errors and shows a
// graceful Arabic fallback. Sentry picks up the error via beforeSend
// in sentry.client.config.ts.

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Sentry auto-captures unhandled errors via init in sentry.client.config.ts
    // Nothing extra to do here; the error is reported.
    console.error('[global-error]', error);
  }, [error]);

  return (
    <html lang="ar" dir="rtl">
      <body
        style={{
          fontFamily:
            'system-ui, -apple-system, "Segoe UI", Tahoma, sans-serif',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#F5F1EA',
          color: '#1B1B1B',
          padding: '24px',
        }}
      >
        <div
          style={{
            maxWidth: 480,
            textAlign: 'center',
            background: '#FAFAF7',
            borderRadius: 24,
            padding: '40px 32px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          }}
        >
          <h1
            style={{
              fontSize: 28,
              fontWeight: 600,
              marginBottom: 12,
              color: '#1B1B1B',
            }}
          >
            عذراً، حدث خطأ غير متوقع
          </h1>
          <p
            style={{
              fontSize: 14,
              color: '#5C5C5C',
              lineHeight: 1.6,
              marginBottom: 24,
            }}
          >
            فريقنا يعمل على إصلاح المشكلة. يمكنك المحاولة مرة أخرى أو العودة
            للصفحة الرئيسية.
          </p>
          {error.digest && (
            <p
              style={{
                fontSize: 11,
                color: '#999',
                fontFamily: 'monospace',
                marginBottom: 16,
              }}
            >
              رقم الخطأ: {error.digest}
            </p>
          )}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <button
              onClick={reset}
              style={{
                background: '#5C7F66',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: 999,
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              إعادة المحاولة
            </button>
            <Link
              href="/"
              style={{
                background: 'transparent',
                color: '#1B1B1B',
                border: '1px solid #D6D0C4',
                padding: '12px 24px',
                borderRadius: 999,
                fontSize: 14,
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              الرئيسية
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
