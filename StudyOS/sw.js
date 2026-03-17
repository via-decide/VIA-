const CACHE_VERSION = 'studyos-v2';
const PRECACHE_NAME = `${CACHE_VERSION}-precache`;
const RUNTIME_STATIC_NAME = `${CACHE_VERSION}-runtime-static`;
const RUNTIME_PAGE_NAME = `${CACHE_VERSION}-runtime-page`;
const RUNTIME_CONFIG_NAME = `${CACHE_VERSION}-runtime-config`;

const APP_SHELL = './index.html';
const OFFLINE_FALLBACK = './privacy-policy.html';

const REQUIRED_PRECACHE_URLS = [
  './',
  APP_SHELL,
  OFFLINE_FALLBACK,
  './manifest.json',
  '../shared/tool-registry.js'
];

const OPTIONAL_PRECACHE_URLS = [
  '../shared/tool-storage.js',
  '../shared/tool-bridge.js',
  './vendor/tailwindcss-runtime-3.4.16.js',
  './vendor/chart.umd.min.js',
  './vendor/pdf.min.js',
  './vendor/pdf.worker.min.js'
];

function isSameOrigin(url) {
  return url.origin === self.location.origin;
}

function isNavigationRequest(request) {
  return request.mode === 'navigate';
}

function isStaticAssetRequest(requestUrl, request) {
  if (!isSameOrigin(requestUrl)) return false;
  if (request.destination && ['style', 'script', 'image', 'font'].includes(request.destination)) {
    return true;
  }
  return /\.(?:css|js|mjs|png|jpg|jpeg|svg|gif|webp|ico|woff2?|ttf)$/i.test(requestUrl.pathname);
}

function isConfigOrManifestRequest(requestUrl) {
  if (!isSameOrigin(requestUrl)) return false;
  return requestUrl.pathname.endsWith('config.json') ||
    requestUrl.pathname.endsWith('manifest.json') ||
    requestUrl.pathname.endsWith('manifest.webmanifest') ||
    requestUrl.pathname.endsWith('assetlinks.json');
}

async function notifyClients(payload) {
  const clients = await self.clients.matchAll({ type: 'window' });
  clients.forEach((client) => client.postMessage(payload));
}

async function cacheOptionalUrls(cache, urls) {
  await Promise.all(
    urls.map(async (url) => {
      try {
        const response = await fetch(url, { cache: 'no-cache' });
        if (response.ok) {
          await cache.put(url, response.clone());
        }
      } catch (_) {
        // Optional dependency; ignore fetch errors for non-existent files.
      }
    })
  );
}

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(PRECACHE_NAME);
    await cache.addAll(REQUIRED_PRECACHE_URLS);
    await cacheOptionalUrls(cache, OPTIONAL_PRECACHE_URLS);
    self.skipWaiting();
    await notifyClients({ type: 'OFFLINE_READY' });
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const validCacheNames = new Set([
      PRECACHE_NAME,
      RUNTIME_STATIC_NAME,
      RUNTIME_PAGE_NAME,
      RUNTIME_CONFIG_NAME
    ]);

    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames
        .filter((cacheName) => !validCacheNames.has(cacheName))
        .map((cacheName) => caches.delete(cacheName))
    );

    await self.clients.claim();
    await notifyClients({ type: 'OFFLINE_READY' });
  })());
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const requestUrl = new URL(request.url);

  if (isNavigationRequest(request)) {
    event.respondWith((async () => {
      const cache = await caches.open(RUNTIME_PAGE_NAME);

      try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
          cache.put(request, networkResponse.clone());
        }
        return networkResponse;
      } catch (_) {
        const cachedPage = await cache.match(request);
        if (cachedPage) return cachedPage;
        const shell = await caches.match(APP_SHELL);
        if (shell) return shell;
        return caches.match(OFFLINE_FALLBACK);
      }
    })());
    return;
  }

  if (isConfigOrManifestRequest(requestUrl)) {
    event.respondWith((async () => {
      const cache = await caches.open(RUNTIME_CONFIG_NAME);
      const cached = await cache.match(request);

      try {
        const response = await fetch(request);
        if (response.ok) {
          cache.put(request, response.clone());
        }
        return response;
      } catch (_) {
        return cached || Response.error();
      }
    })());
    return;
  }

  if (isStaticAssetRequest(requestUrl, request)) {
    event.respondWith((async () => {
      const cache = await caches.open(RUNTIME_STATIC_NAME);
      const cached = await cache.match(request);
      if (cached) return cached;

      const response = await fetch(request);
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })());
  }
});
