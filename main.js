// 1. Register service worker
if ('serviceWorker' in navigator && 'PushManager' in window) {
  navigator.serviceWorker.register('/service-worker.js')
    .then(reg => console.log('Service Worker Registered'))
    .catch(err => console.error('SW registration failed:', err));
}

// 2. Request notification permission
Notification.requestPermission().then(permission => {
  if (permission !== 'granted') {
    alert('Please allow notifications to receive updates!');
  }
});

// 3. Subscribe user to push
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}

const vapidPublicKey = 'BCKv40EB0-UZ4q__UZISg5YatDKAjPL6I4G26wUAQuem1iZB3624Lt1CN883zRDKetExU-V08sm5BpVz5cOlCuM';

navigator.serviceWorker.ready.then(registration => {
  registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
  }).then(subscription => {
    // Send subscription to server
    fetch('/subscribe', {
      method: 'POST',
      body: JSON.stringify(subscription),
      headers: { 'Content-Type': 'application/json' }
    });
  });
});
