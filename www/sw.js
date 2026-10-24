const V = 'formulater-v50';

const F = [
  './',
  './index.html',
  './formulas.js',
  './update-config.js',
  './upload.js',
  './responsive.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(V).then(cache => cache.addAll(F))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== V)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Let PDF/OCR libraries load directly without service-worker caching.
self.addEventListener('fetch', e => {
  if (
    e.request.method !== 'GET' ||
    /\/lib\//.test(e.request.url)
  ) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;

      return fetch(e.request).catch(() => {
        if (e.request.mode === 'navigate') {
          return caches.match('./index.html');
        }

        return Response.error();
      });
    })
  );
});