import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { IBM_Plex_Sans_Arabic, IBM_Plex_Mono } from 'next/font/google';
import { I18nProvider } from '@/lib/i18n';
import { StorefrontChrome } from '@/components/StorefrontChrome';
import { OrganizationJsonLd, WebSiteJsonLd } from '@/components/seo/JsonLd';
import './globals.css';

const ibmArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-arabic',
  display: 'swap',
});

const ibmMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://rukub.shop';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'ركوب · إكسسوارات سيارات مختارة للسعودية',
    template: '%s · ركوب',
  },
  description:
    'إكسسوارات سيارة عملية مختارة للترتيب والعناية والتقنية والاستعداد في السعودية، مع أسعار ومدة توصيل واضحة.',
  keywords: [
    'إكسسوارات سيارات',
    'اكسسوارات سيارة',
    'car accessories Saudi Arabia',
    'car accessories KSA',
    'إكسسوارات داخلية سيارة',
  ],
  authors: [{ name: 'ركوب' }],
  creator: 'ركوب',
  publisher: 'ركوب',
  formatDetection: { telephone: false, address: false, email: false },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'ar_SA',
    url: SITE_URL,
    siteName: 'ركوب · Rukub',
    title: 'ركوب · إكسسوارات سيارات مختارة للسعودية',
    description:
      'إكسسوارات سيارة عملية مختارة للسوق السعودي، مع الدفع عند الاستلام وتجربة شراء عربية واضحة.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ركوب · إكسسوارات سيارات مختارة للسعودية',
    description: 'إكسسوارات عملية لسيارة أكثر ترتيباً وراحة.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    shortcut: '/icon.svg',
  },
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'ركوب',
    statusBarStyle: 'default',
  },
  applicationName: 'ركوب',
  category: 'shopping',
  classification: 'E-commerce',
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-title': 'ركوب',
    'apple-mobile-web-app-status-bar-style': 'default',
    'format-detection': 'telephone=no',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#6B7A5A' },
    { media: '(prefers-color-scheme: dark)', color: '#363D2E' },
  ],
  colorScheme: 'light',
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${ibmArabic.variable} ${ibmMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <OrganizationJsonLd />
        <WebSiteJsonLd />
      </head>
      <body className="font-sans">
        <I18nProvider>
          <StorefrontChrome>{children}</StorefrontChrome>
        </I18nProvider>
        {process.env.NODE_ENV === 'production' && (
          <Script id="rukub-service-worker" strategy="afterInteractive">
            {`
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function(err) {
                    console.log('SW registration skipped:', err.message);
                  });
                });
              }
            `}
          </Script>
        )}
      </body>
    </html>
  );
}
