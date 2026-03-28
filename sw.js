/* VIA — Service Worker v2.0 */
const CACHE = 'via-v2';

const SHELL = [
  '/',
  '/viadecide.html',
  '/manifest.json',
  '/shared/vd-auth.js',
  '/js/via-navigation.js',
  '/assets/icon-192.png',
  '/assets/icon-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c =>
      Promise.allSettled(SHELL.map(u => c.add(u).catch(() => null)))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const { request } = e;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;

  // Never cache: Firebase, Google APIs, Anthropic, external CDNs
  const skip = ['firebase', 'googleapis', 'gstatic', 'anthropic', 'supabase', 'fonts.g', 'cdn.', 'cdnjs.'];
  if (skip.some(s => url.hostname.includes(s))) return;

  // Never cache API proxy routes
  if (url.pathname.startsWith('/api/')) return;

  // Navigation: network-first, fallback to cached shell
  if (request.mode === 'navigate') {
    e.respondWith(
      fetch(request).catch(() => caches.match('/viadecide.html') || caches.match('/'))
    );
    return;
  }

  // Static assets: cache-first, update in background
  e.respondWith(
    caches.match(request).then(cached => {
      const networkFetch = fetch(request).then(res => {
        if (res && res.status === 200 && res.type !== 'opaque') {
          caches.open(CACHE).then(c => c.put(request, res.clone()));
        }
        return res;
      }).catch(() => null);
      return cached || networkFetch;
    })
  );
});
