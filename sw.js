// Service worker – uloží aplikaci do mobilu, aby běžela i bez internetu.
// Když nahraješ novou verzi aplikace, zvyš číslo verze níže (v1 -> v2),
// jinak bude mobil dál používat starou uloženou verzi.
const CACHE = 'fitko-v1';
const FILES = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];

// 1) Instalace: stáhne a uloží všechny soubory aplikace
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

// 2) Aktivace: smaže staré verze cache
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

// 3) Každý požadavek: nejdřív z uložené kopie, teprve pak z internetu
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(hit =>
      hit || fetch(e.request).catch(() => caches.match('./index.html'))
    )
  );
});
