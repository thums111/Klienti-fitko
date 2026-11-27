// Service worker zpěvníku – appka jde otevřít i bez internetu.
// Nejdřív zkusí internet (abys měl vždy nejnovější verzi), bez internetu vezme uloženou kopii.
const CACHE = 'zpevnik-v5.5';
const FILES = ['./', './index.html', './manifest.webmanifest', './ikona-192.png', './ikona-512.png', './favicon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x.startsWith('zpevnik-') && x !== CACHE).map(x => caches.delete(x)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); return r; })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then(h => h || caches.match('./index.html')))
  );
});
