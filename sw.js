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

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// This handles the notification when the browser is CLOSED or in BACKGROUND
messaging.onBackgroundMessage((payload) => {
  console.log('[sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon || 'https://uploads.onecompiler.io/43ddry4jt/43s3sjvch/Zone%20Vault%20logo.png',
    badge: '/badge.png', // Ensure you have this image or remove this line
    // We store the URL in the 'data' property so the click handler can use it
    data: { url: payload.data?.click_action || '/' } 
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});


// ============================
// 2. CACHING (Your existing setup)
// ============================
const CACHE_NAME = 'zonevault-v104'; // I incremented this for you
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

// INSTALL: cache files
self.addEventListener('install', event => {
  console.log('[sw.js] Installing...');
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .catch(err => console.error('[sw.js] Cache install failed:', err))
  );
});

// ACTIVATE: remove old caches
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

// FETCH: respond from cache or network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
      .catch(err => console.error('[sw.js] Fetch failed:', err))
  );
});

// ============================
// 3. NOTIFICATION CLICK (Updated to work with Firebase)
// ============================
self.addEventListener('notificationclick', event => {
  console.log('[sw.js] Notification clicked');
  event.notification.close();

  // Retrieve the URL we stored in the data object above
  // Firebase typically sends it in payload.data.click_action
  let urlToOpen = '/';
  if (event.notification.data && event.notification.data.url) {
    urlToOpen = event.notification.data.url;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(windowClients => {
        // Focus if already open
        for (let client of windowClients) {
          if (client.url.includes(urlToOpen) && 'focus' in client) {
            return client.focus();
          }
        }
        // Otherwise open new tab
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});
