// 🔹 Version your cache
const CACHE_NAME = 'zonevault-v102'; // increment version when you update cache
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
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .catch(err => console.error('[sw.js] Cache install failed:', err))
  );
});

// ============================
// ACTIVATE: remove old caches
// ============================
self.addEventListener('activate', event => {
  console.log('[sw.js] Activating...');
  event.waitUntil(
    caches.keys()
      .then(cacheNames =>
        Promise.all(
          cacheNames.map(name => {
            if (name !== CACHE_NAME) {
              console.log('[sw.js] Deleting old cache:', name);
              return caches.delete(name);
            }
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

// ============================
// FETCH: respond from cache or network
// ============================
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
      .catch(err => console.error('[sw.js] Fetch failed:', err))
  );
});

// ============================
// PUSH: show notifications
// ============================
self.addEventListener('push', event => {
  console.log('[sw.js] Push Received.');
  
  let data = { title: 'Zone Vault', body: 'You have a new update!', url: '/', icon: '/icon.png' };
  
  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (err) {
    console.error('[sw.js] Error parsing push data:', err);
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icon.png',
    badge: data.badge || '/badge.png',
    data: data.url,
    vibrate: [100, 50, 100],
    requireInteraction: true // keeps notification on screen until user interacts
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// ============================
// NOTIFICATION CLICK: open site
// ============================
self.addEventListener('notificationclick', event => {
  event.notification.close();

  const urlToOpen = event.notification.data || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(windowClients => {
        // Focus if already open
        for (let client of windowClients) {
          if (client.url === urlToOpen && 'focus' in client) return client.focus();
        }
        // Otherwise open new tab
        if (clients.openWindow) return clients.openWindow(urlToOpen);
      })
  );
});
