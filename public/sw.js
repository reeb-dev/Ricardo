const CACHE = 'ricardio-v30';
const ASSETS = [
  './',
  'index.html',
  'style.css',
  'game.js',
  'icon.svg',
  'manifest.webmanifest',
  'img/logos/v8.png',
  'img/logos/hermetica.png',
  'img/logos/almafuerte.png',
  'img/logos/iorio.png',
  'img/covers/luchando.jpg',
  'img/covers/batalla.jpg',
  'img/covers/hermetica89.jpg',
  'img/covers/acido.jpg',
  'img/covers/victimas.jpg',
  'img/covers/guanaco.jpg',
  'img/covers/fondoblanco.jpg',
  'img/covers/toroypampa.jpg',
  'img/covers/trillando.jpg',
  'img/covers/ayerdeseo.jpg'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS.map(a => new Request(a, { cache: 'reload' })))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Network first and always revalidated (no-cache) so updates show up right away; the cache is only the offline fallback.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request, { cache: 'no-cache' })
      .then(r => {
        if (r.ok && new URL(e.request.url).origin === location.origin) {
          const copy = r.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return r;
      })
      .catch(() => caches.match(e.request))
  );
});
