/**
 * ============================================================
 *  POOL BALANCE — SERVICE WORKER
 *  Estrategia: Cache First para assets estáticos,
 *  Network First para datos dinámicos.
 * ============================================================
 */

const CACHE_NAME = 'pool-balance-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/design-system.css',
  '/css/layout.css',
  '/css/components.css',
  '/js/app.js',
  '/js/router.js',
  '/js/views/home.js',
  '/js/views/servicios.js',
  '/js/views/biblioteca.js',
  '/js/views/portal.js',
  '/js/components/nav.js',
  '/data/config.js',
  '/manifest.json',
];

// ── Install: pre-cachear assets críticos ──
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// ── Activate: limpiar caches viejos ──
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: Cache First para estáticos, Network First para el resto ──
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo manejar requests del mismo origen
  if (url.origin !== location.origin) return;

  // Network First para navegación (HTML)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Cache First para assets estáticos
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      }).catch(() => caches.match('/index.html'));
    })
  );
});
