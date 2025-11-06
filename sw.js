// 🔹 Version your cache
const CACHE_NAME = 'zonevault-v100'; // ⬅ Change this every time you update

// 🔹 Files to cache for offline access
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
// ✅ FIREBASE CLOUD MESSAGING (Push Notifications)
// ======================================================
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyAs2S6iRhnYhmqNuF0QCCYu5NuzxHxIRv0",
  authDomain: "tvnstream-b4497.firebaseapp.com",
  projectId: "tvnstream-b4497",
  messagingSenderId: "308384754214",
  appId: "1:308384754214:web:2938e76cd29b288f75d4e7"
});

const messaging = firebase.messaging();

// Handle background push notifications
messaging.onBackgroundMessage((payload) => {
  console.log('[sw.js] Received background message: ', payload);

  const notificationTitle = payload.notification?.title || "New Notification";
  const notificationOptions = {
    body: payload.notification?.body || "You have a new update!",
    icon: "https://uploads.onecompiler.io/43ddry4jt/43s3sjvch/Zone%20Vault%20logo.png", // optional
    badge: "/badge.png", // optional
    vibrate: [200, 100, 200],
    data: payload.data || {}
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[sw.js] Notification click received.');
  event.notification.close();
  event.waitUntil(
    clients.openWindow('https://zonevault.com')
  );
});
