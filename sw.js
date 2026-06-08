/**
 * ============================================================
 *  POOL BALANCE — SERVICE WORKER v3
 *  Versión incrementada para forzar refresco del cache en
 *  todos los clientes que tenían la versión anterior cacheada.
 * ============================================================
 */

const CACHE_NAME = 'pool-balance-v8';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/design-system.css',
  '/css/layout.css',
  '/css/components.css',
  '/data/config.js',
  '/js/app.js',
  '/js/router.js',
  '/js/components/nav.js',
  '/js/firebase/firebase.js',
  '/js/firebase/auth.js',
  '/js/firebase/firestore.js',
  '/js/firebase/pdf.js',
  '/js/views/home.js',
  '/js/views/servicios.js',
  '/js/views/biblioteca.js',
  '/js/views/bitacora-detalle.js',
  '/js/views/portal.js',
];

// ── Install: pre-cachear todos los assets críticos ──
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ── Activate: eliminar TODOS los caches viejos ──
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => {
            console.log('[SW] Eliminando cache viejo:', key);
            return caches.delete(key);
          })
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: Network First para JS/CSS/HTML, Cache First para imágenes ──
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo manejar requests del mismo origen
  if (url.origin !== location.origin) return;

  // ── Navegación (HTML): siempre red primero → fallback a /index.html ──
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // ── JS, CSS, data: Network First (siempre frescos) ──
  const isCodeAsset = url.pathname.match(/\.(js|css|json)$/);
  if (isCodeAsset) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // ── Imágenes y assets estáticos: Cache First ──
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
