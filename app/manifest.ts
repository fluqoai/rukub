import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ركوب · Rukub',
    short_name: 'Rukub',
    description: 'إكسسوارات سيارات مختارة للسوق السعودي',
    lang: 'ar',
    dir: 'rtl',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#F5F1EA',
    theme_color: '#6B7A5A',
    categories: ['shopping', 'lifestyle', 'automotive'],
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
  };
}
