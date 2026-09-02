// Sentry client config — runs in the browser.
// Disable entirely when SENTRY_DSN is not set so dev isn't noisy.
import * as Sentry from '@sentry/nextjs';

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: Number(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? '0.1'),
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: 0,
    // Don't send PII like email/phone unless explicitly enabled
    sendDefaultPii: false,
    // Filter out noisy non-actionable errors
    ignoreErrors: [
      'NEXT_NOT_FOUND',
      'NEXT_REDIRECT',
      'AbortError',
      'NetworkError',
    ],
  });
}
