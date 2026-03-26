const CACHE_NAME = 'via-pwa-v1';
const ASSETS = [
  './',
  './viadecide.html',
  './manifest.json',
  './shared/vd-auth.js',
  './js/via-navigation.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
