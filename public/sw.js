// Rukub Service Worker
// Conservative offline support. Application HTML and Next.js chunks stay
// network-first so deployments never mix an old client bundle with new HTML.

const CACHE_NAME = 'rukub-v3';
const STATIC_ASSETS = [
  '/manifest.webmanifest',
  '/icon.svg',
  '/brand/rukub-hero.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip admin, api, checkout
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith('/_next/')) return;
  if (
    url.pathname.startsWith('/admin') ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/checkout') ||
    url.pathname.startsWith('/cart') ||
    url.pathname.startsWith('/orders')
  ) {
    return;
  }

  // Network-first for HTML, cache fallback
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned));
          return response;
        })
        .catch(() => caches.match(request).then((r) => r || caches.match('/')))
    );
    return;
  }

  // Only cache known public assets. Everything else remains network-owned.
  if (STATIC_ASSETS.includes(url.pathname)) {
    event.respondWith(caches.match(request).then((cached) => cached || fetch(request)));
  }
});
