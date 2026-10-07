// Service worker – uloží simulátor do mobilu, aby běžel i bez internetu.
// Při nahrání nové verze zvyš číslo verze níže (v1 -> v2).
const CACHE = 'svaly-v1';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

// maže jen staré verze simulátoru, cache aplikace Fitko nechává být
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('svaly-') && k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

// nejdřív uložená kopie; co ještě uložené není (např. písma), stáhne a uloží
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request).then(res => {
      if (res && (res.ok || res.type === 'opaque')) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return res;
    }).catch(() => e.request.mode === 'navigate' ? caches.match('./index.html') : undefined))
  );
});
