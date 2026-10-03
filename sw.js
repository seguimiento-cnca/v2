const CACHE_NAME = 'seguimiento-cnca-pruebas-1';
const ASSETS = [
  '/v2/',
  '/v2/index.html'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Primero la red (siempre la versión más reciente); la caché solo si no hay conexión
self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET') return;
  if(e.request.url.includes('supabase.co')) return;
  e.respondWith(
    fetch(e.request).then(res => {
      if(res && res.status === 200 && res.type === 'basic'){
        const clone = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
      }
      return res;
    }).catch(() => caches.match(e.request))
  );
});
