const CACHE_NAME = 'recallmaturity-v1';
const ASSETS = ['./', './index.html', './manifest.json'];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).catch(() => {})
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // Network-first for Google APIs so backup/restore always uses live data.
  if (e.request.url.includes('googleapis.com') || e.request.url.includes('google.com')) {
    return;
  }
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, resClone)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
