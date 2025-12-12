// ============================
// 1. FIREBASE MESSAGING (Must be at the top)
// ============================
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyAs2S6iRhnYhmqNuF0QCCYu5NuzxHxIRv0",
  authDomain: "tvnstream-b4497.firebaseapp.com",
  databaseURL: "https://tvnstream-b4497-default-rtdb.firebaseio.com",
  projectId: "tvnstream-b4497",
  storageBucket: "tvnstream-b4497.firebasestorage.app",
  messagingSenderId: "308384754214",
  appId: "1:308384754214:web:2938e76cd29b288f75d4e7",
  measurementId: "G-VFNH70R4D9"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// This handles the notification when the browser is CLOSED or in BACKGROUND
// Note: If your sender script sends a "notification" block, this might be skipped 
// by the browser in favor of the default display. That is normal behavior.
messaging.onBackgroundMessage((payload) => {
  console.log('[sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon || 'https://uploads.onecompiler.io/43ddry4jt/43s3sjvch/Zone%20Vault%20logo.png',
    // data handles the click action URL
    data: { url: payload.data?.click_action || '/' } 
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// ============================
// 2. CACHING
// ============================
const CACHE_NAME = 'zonevault-v120'; // UPDATED VERSION
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

// INSTALL: Cache files immediately
self.addEventListener('install', event => {
  console.log('[sw.js] Installing new version:', CACHE_NAME);
  self.skipWaiting(); // Forces this new SW to become active immediately
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .catch(err => console.error('[sw.js] Cache install failed:', err))
  );
});

// ACTIVATE: Remove old caches
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
      .then(() => self.clients.claim()) // Take control of all open tabs immediately
  );
});

// FETCH: Respond from cache or network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
      .catch(err => console.error('[sw.js] Fetch failed:', err))
  );
});

// ============================
// 3. NOTIFICATION CLICK
// ============================
self.addEventListener('notificationclick', event => {
  console.log('[sw.js] Notification clicked');
  event.notification.close(); // Close the notification

  // Get the URL from the data payload
  let urlToOpen = '/';
  if (event.notification.data && event.notification.data.url) {
    urlToOpen = event.notification.data.url;
  }

  // Logic to open the window or focus an existing one
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(windowClients => {
        // 1. If a tab with the URL is already open, focus it
        for (let client of windowClients) {
          if (client.url.includes(urlToOpen) && 'focus' in client) {
            return client.focus();
          }
        }
        // 2. Otherwise, open a new tab
        if (clients.openWindow) {
          // Handle relative vs absolute URLs
          if (urlToOpen.startsWith('/')) {
            urlToOpen = self.registration.scope.replace(/\/$/, '') + urlToOpen;
          }
          return clients.openWindow(urlToOpen);
        }
      })
  );
});
