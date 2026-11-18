/* Offline cache. When you change any file, bump CACHE (v1 → v2) so iPads fetch the new version. */
const CACHE = 'genetic-world-v2';
const FILES = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/style.css',
  'js/data.js',
  'js/genetics.js',
  'js/state.js',
  'js/sound.js',
  'js/ui.js',
  'js/drag.js',
  'js/creature.js',
  'js/runner.js',
  'js/stations/s1-parents.js',
  'js/stations/s2-zoom.js',
  'js/stations/s3-gametes.js',
  'js/stations/s4-punnett.js',
  'js/stations/s5-hatch.js',
  'js/boss.js',
  'js/screens.js',
  'js/quiz.js',
  'js/teacher.js',
  'js/main.js',
  'fonts/Mitr-Regular.ttf',
  'fonts/Mitr-Medium.ttf',
  'fonts/Mitr-SemiBold.ttf',
  'icons/icon.svg',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/apple-touch-icon.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Serve from cache first (works offline), refresh the cache in the background. */
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then((hit) => {
      const net = fetch(e.request)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(e.request, copy));
          }
          return res;
        })
        .catch(() => hit);
      return hit || net;
    })
  );
});
