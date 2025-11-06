// 🔹 Version your cache
const CACHE_NAME = 'zonevault-v100';
const urlsToCache = [
  './',
  './index.html',
  './home.html',
  './nanabnb.html',
  './hxwfanconcert.html',
  './svtholiday.html',
  './arenatour.html',
  './svtjapanconcert.html',
  './rightheregoyang.html',
  './bdaymessage'
];

// ======================================================
// ✅ INSTALL: cache the new version
// ======================================================
self.addEventListener('install', event => {
  console.log('[sw.js] Installing new service worker...');
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[sw.js] Caching files...');
      return cache.addAll(urlsToCache);
    })
  );
});

// ======================================================
// ✅ ACTIVATE: remove old caches
// ======================================================
self.addEventListener('activate', event => {
  console.log('[sw.js] Activating new service worker...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(name => {
          if (name !== CACHE_NAME) {
            console.log('[sw.js] Deleting old cache:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// ======================================================
// ✅ FETCH: respond from cache or network
// ======================================================
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

// ======================================================
// ✅ PUSH NOTIFICATIONS
// ======================================================
self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Zone Vault';
  const options = {
    body: data.body || 'New notification!',
    icon: data.icon || '/favicon-new.png',
    data: data.url || '/'
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data)
  );
});
