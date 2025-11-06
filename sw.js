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

// ============================
// INSTALL: cache files
// ============================
self.addEventListener('install', event => {
  console.log('[sw.js] Installing...');
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// ============================
// ACTIVATE: remove old caches
// ============================
self.addEventListener('activate', event => {
  console.log('[sw.js] Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => Promise.all(
      cacheNames.map(name => {
        if (name !== CACHE_NAME) {
          console.log('[sw.js] Deleting old cache:', name);
          return caches.delete(name);
        }
      })
    )).then(() => self.clients.claim())
  );
});

// ============================
// FETCH: respond from cache or network
// ============================
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});

// ============================
// PUSH: show notifications
// ============================
self.addEventListener('push', function(event) {
  console.log('[sw.js] Push Received.');
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Zone Vault';
  const options = {
    body: data.body || 'You have a new update!',
    icon: data.icon || '/icon.png',
    badge: data.badge || '/badge.png',
    data: data.url || '/',
    vibrate: [100, 50, 100],
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// ============================
// NOTIFICATION CLICK: open site
// ============================
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data)
  );
});
