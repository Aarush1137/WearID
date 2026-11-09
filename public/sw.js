// WearID Service Worker — Progressive Web App Offline & Cache Strategy
const STATIC_CACHE = 'wearid-static-v1';
const API_CACHE = 'wearid-api-v1';

const PRECACHE_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-512-maskable.png',
  '/icons/apple-touch-icon.png',
];

// Install Event — Pre-cache core shell & fallback assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[SW] Pre-caching asset failed:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate Event — Clean up stale cache versions & claim clients
self.addEventListener('activate', (event) => {
  const allowedCaches = [STATIC_CACHE, API_CACHE];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => !allowedCaches.includes(name))
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event — Implements Cache-first for static, Network-first for API & navigation
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Ignore non-HTTP(S) and chrome-extension schemes
  if (!url.protocol.startsWith('http')) return;

  // Ignore mutations / non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // 1. Navigation requests (HTML pages) -> Network-first with offline fallback
  const isNavigation =
    request.mode === 'navigate' ||
    (request.headers.get('accept') && request.headers.get('accept').includes('text/html'));

  if (isNavigation) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          const fallback = await caches.match('/offline.html');
          return fallback || new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
        })
    );
    return;
  }

  // 2. API Routes -> Network-first with cached fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(API_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          return new Response(
            JSON.stringify({
              type: 'https://wearid.in/errors/offline',
              title: 'Offline',
              status: 503,
              detail: 'Device is offline and no cached response is available for this endpoint.',
            }),
            {
              status: 503,
              headers: { 'Content-Type': 'application/problem+json' },
            }
          );
        })
    );
    return;
  }

  // 3. Static Assets (/_next/static/, /icons/, /fonts/, images, stylesheets, scripts) -> Cache-first
  const isStatic =
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/screenshots/') ||
    url.pathname.startsWith('/fonts/') ||
    /\.(?:js|css|png|jpg|jpeg|svg|webp|woff2?|ico)$/i.test(url.pathname);

  if (isStatic) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {
          return cached;
        }
        return fetch(request)
          .then((response) => {
            if (response && response.status === 200) {
              const clone = response.clone();
              caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
            }
            return response;
          })
          .catch(() => {
            // If image fails, return transparent 1x1 if needed or just empty
            return new Response('', { status: 404 });
          });
      })
    );
    return;
  }

  // 4. Default strategy -> Network first, fallback to cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});
