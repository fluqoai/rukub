// Sentry server config — runs in API routes and server components.
import * as Sentry from '@sentry/nextjs';

const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? '0.1'),
    sendDefaultPii: false,
    ignoreErrors: ['NEXT_NOT_FOUND', 'NEXT_REDIRECT', 'AbortError'],
  });
}
