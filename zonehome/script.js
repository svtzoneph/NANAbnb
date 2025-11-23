// ==========================================
// 1. GLOBAL SETTINGS & GTAG LOGIC
// =========================================
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-1B2RJ659GL');

// ==========================================
// 2. THEME LOADER
// ==========================================
(function() {
  const savedTheme = localStorage.getItem('zoneVaultTheme');
  if(savedTheme) {
    const style = document.createElement('style');
    style.innerHTML = `
      body { 
        background: ${savedTheme} !important; 
        background-size: cover !important;
        background-attachment: fixed !important;
        background-repeat: no-repeat !important;
        min-height: 100vh;
      }
    `;
    document.head.appendChild(style);
  }
})();

// ==========================================
// 3. FIREBASE MODULE
// ==========================================
import { initializeApp, getApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  set,
  update,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import {
  getAuth
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// ---------- FIREBASE CONFIG ----------
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

// ---------- INITIALIZE ----------
let app;
try {
  app = getApp();
} catch {
  app = initializeApp(firebaseConfig);
}
const db = getDatabase(app);
const auth = getAuth(app);

// ---------- LOCAL USER IDENTIFIER ----------
let userId = localStorage.getItem("userId");
if (!userId) {
  userId = "user_" + Math.random().toString(36).substring(2, 10);
  localStorage.setItem("userId", userId);
}

// ---------- DEVICE INFO ----------
const deviceInfo = navigator.userAgent;

// ---------- FUNCTION: RECORD SESSION + ACTIVITY ----------
function logActivity(action, details = "") {
  try {
    const sessionRef = ref(db, "userSessions/" + userId);
    update(sessionRef, {
      lastAction: action,
      lastDetails: details,
      lastActive: new Date().toLocaleString(),
      device: deviceInfo,
      currentPage: window.location.pathname,
    });

    // store individual logs under /userSessions
    const activityRef = push(ref(db, "userSessions/" + userId + "/activityLog"));
    set(activityRef, {
      action,
      details,
      timestamp: serverTimestamp(),
      page: window.location.pathname
    });
  } catch (e) {
    console.error("Session logActivity error:", e);
  }
}

// ---------- FUNCTION: RECORD AUTH-BASED ACTIVITY ----------
function getDeviceType() {
  const ua = navigator.userAgent;
  if (/Mobi|Android/i.test(ua)) return "Mobile";
  if (/Tablet|iPad/i.test(ua)) return "Tablet";
  return "Desktop";
}

function logActivityAuth(action, page) {
  try {
    const user = auth.currentUser;
    const uid =
      user?.uid || sessionStorage.getItem("currentUid") || "anonymous";

    const rec = {
      email: user?.email || "anonymous",
      uid,
      action: action || page || "page_view",
      page: page || window.location.pathname,
      timestamp: Date.now(),
      userAgent: navigator.userAgent || "Unknown",
      platform: navigator.platform || "Unknown",
      screen: `${screen.width}x${screen.height}`,
      deviceType: getDeviceType(),
      referrer: document.referrer || "Direct"
    };

    const node = ref(
      db,
      `userActivities/${uid}/${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 8)}`
    );
    set(node, rec).catch((e) => console.error("userActivities error:", e));
  } catch (e) {
    console.error("userActivities exception:", e);
  }
}

// ---------- PAGE + CLICK LOGGING ----------
window.addEventListener("load", () => {
  logActivity("Page Visit", document.title);
  logActivityAuth("page_load", window.location.pathname);
});

document.addEventListener("click", (e) => {
  const target = e.target.tagName;
  logActivity("Click", `Clicked on ${target}`);
  logActivityAuth("click", window.location.pathname);
});

window.addEventListener("beforeunload", () => {
  logActivity("Left Page", document.title);
  logActivityAuth("page_unload", window.location.pathname);
});

// ==========================================
// 4. SERVICE WORKER REGISTRATION
// ==========================================
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').then(reg => {
    console.log('Service Worker registered');
    reg.onupdatefound = () => {
      const newSW = reg.installing;
      newSW.onstatechange = () => {
        if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
          console.log('New content available, reloading...');
          window.location.reload();
        }
      };
    };
  }).catch(err => console.error('Service Worker registration failed:', err));
}

// ==========================================
// 5. ACCORDION LOGIC
// ==========================================
document.querySelectorAll('.accordion-header').forEach(header => {
  header.addEventListener('click', () => {
    const acc = header.parentElement;
    const open = acc.classList.contains('open');
    document.querySelectorAll('.accordion').forEach(a => a.classList.remove('open'));
    if (!open) acc.classList.add('open');
  });
});

// ==========================================
// 6. IMAGE SLIDER LOGIC
// ==========================================
const thumbnailBoxes = document.querySelectorAll('.thumb-box');
const mainImage = document.getElementById('mainDisplay');
let current = 0;

// Extra hidden slides (these won't appear in thumbnail row)
const extraSlides = [
  'https://raw.githubusercontent.com/svtzoneph/gallery/main/images/website/Trailer -Cover.jpg',
  'https://raw.githubusercontent.com/svtzoneph/gallery/main/images/website/new-tour.png',
  'https://raw.githubusercontent.com/svtzoneph/gallery/main/images/website/right-here.png',
  'https://raw.githubusercontent.com/svtzoneph/gallery/main/images/website/warning_gwangju.png'
];

// Only use the combined array for cycling images, thumbnails stay separate
const slideshowSources = [
  ...Array.from(thumbnailBoxes).map(box => box.querySelector('img').src),
  ...extraSlides
];

function switchImageByIndex(index) {
  if(!mainImage) return;
  const newSrc = slideshowSources[index];
  mainImage.classList.add('fade-out');
  setTimeout(() => {
    mainImage.src = newSrc;
    mainImage.classList.remove('fade-out');
  }, 300);

  // Only highlight thumbnails if it's one of the visible thumbs
  thumbnailBoxes.forEach(b => b.classList.remove('active'));
  if (index < thumbnailBoxes.length) {
    thumbnailBoxes[index].classList.add('active');
  }
}

setInterval(() => {
  if (slideshowSources.length > 0) {
      current = (current + 1) % slideshowSources.length;
      switchImageByIndex(current);
  }
}, 2000);

// Manual switch from visible thumbnail
function switchImage(box) {
  const img = box.querySelector('img');
  mainImage.classList.add('fade-out');
  setTimeout(() => {
    mainImage.src = img.src;
    mainImage.classList.remove('fade-out');
  }, 300);

  thumbnailBoxes.forEach(b => b.classList.remove('active'));
  box.classList.add('active');
  current = slideshowSources.indexOf(img.src); // will keep cycling after this
}

// EXPOSE switchImage TO WINDOW (REQUIRED FOR ONCLICK IN HTML)
window.switchImage = switchImage;

// ==========================================
// 7. SIDEBAR LOGIC
// ==========================================
function toggleSidebar() {
  const sidebar = document.getElementById('mobileSidebar');
  sidebar.classList.toggle('open');
}
// EXPOSE toggleSidebar TO WINDOW
window.toggleSidebar = toggleSidebar;

// ==========================================
// 8. SCROLL HEADER LOGIC
// ==========================================
let lastScrollY = window.scrollY;
const scrollHeader = document.getElementById('scrollHeader');

window.addEventListener('scroll', () => {
  const currentScrollY = window.scrollY;

  if (currentScrollY > lastScrollY && currentScrollY > 50) {
    // Scroll Down → Hide header
    if(scrollHeader) scrollHeader.classList.add('hide');
  } else {
    // Scroll Up → Show header smoothly
    if(scrollHeader) scrollHeader.classList.remove('hide');
  }

  lastScrollY = currentScrollY;
});

// ==========================================
// 9. CATEGORY LINK FLASH LOGIC
// ==========================================
const categoryLinks = document.querySelectorAll('.category-link');

categoryLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault(); // prevent immediate jump

    // Remove flash class from all
    categoryLinks.forEach(l => l.classList.remove('flash'));

    // Add flash class to the clicked one
    link.classList.add('flash');

    // Remove it after a short delay (fade out effect)
    setTimeout(() => {
      link.classList.remove('flash');
      // Redirect after animation (if it's a real page)
      window.location.href = link.href;
    }, 800); // adjust delay to match transition
  });
});

// ==========================================
// 10. SIDEBAR WHEEL LOGIC
// ==========================================
const sidebarNav = document.querySelector('.sidebar-nav');
if(sidebarNav) {
    sidebarNav.addEventListener('wheel', function (e) {
    const isAtTop = sidebarNav.scrollTop === 0;
    const isAtBottom = sidebarNav.scrollHeight - sidebarNav.scrollTop === sidebarNav.clientHeight;

    if ((e.deltaY < 0 && isAtTop) || (e.deltaY > 0 && isAtBottom)) {
        e.preventDefault(); // Prevent page scroll when at the edges
    }
    }, { passive: false });
}

// ==========================================
// 11. MODAL LOGIC
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  const noticeModal = document.getElementById("noticeModal");
  const secondModal = document.getElementById("secondModal");

  // Check if modal has already been shown in this session
  if (!sessionStorage.getItem("modalShown")) {
    // Show the first modal automatically when page loads
    setTimeout(() => {
      if(noticeModal) {
          noticeModal.style.display = "flex";
          setTimeout(() => (noticeModal.style.opacity = "1"), 100);
      }
    }, 500); // delay for smooth load

    // Mark modal as shown
    sessionStorage.setItem("modalShown", "true");
  }

  // Function for "I Understand"
  window.showSecondModal = function() {
    if(noticeModal) noticeModal.style.opacity = "0";
    setTimeout(() => {
      if(noticeModal) noticeModal.style.display = "none";
      if(secondModal) {
          secondModal.style.display = "flex";
          setTimeout(() => (secondModal.style.opacity = "1"), 100);
      }
    }, 400);
  };

  // Function for "Close"
  window.closeSecondModal = function() {
    if(secondModal) secondModal.style.opacity = "0";
    setTimeout(() => { if(secondModal) secondModal.style.display = "none" }, 400);
  };
});

// ==========================================
// 12. ACCESS DENIED LOGIC
// ==========================================
const allowedPaths = [
  '/index.html',
  '/home.html',
  '/nanabnb.html',
  '/newtour.html',
  '/hxwfanconcert.html',
  '/svtholiday.html',
  '/arenatour.html',
  '/svtjapanconcert.html',
  '/touragain.html',
  '/gallery.html',
  '/profile.html',
  '/soon.html'
];

const currentPage = window.location.pathname;

// Check if user already has internalAccess flag
let hasInternalAccess = sessionStorage.getItem('internalAccess') === 'true';

// Check if user came from an allowed page
const referrer = document.referrer;
const refPath = referrer ? new URL(referrer).pathname : null;
const cameFromAllowedPage = refPath && allowedPaths.includes(refPath);

// Grant internalAccess if coming from allowed page
if (cameFromAllowedPage) {
  sessionStorage.setItem('internalAccess', 'true');
  hasInternalAccess = true;
}

// Allow access if user already has internalAccess or is on index page
const isIndexPage = currentPage.endsWith('index.html') || currentPage === '/';
if (!hasInternalAccess && !isIndexPage) {
  showAccessDeniedModal();
}

function showAccessDeniedModal() {
  const modal = document.createElement('div');
  modal.className = 'access-denied-modal';
  modal.innerHTML = `
    <strong>🚫 Access Denied</strong>
    <div>You cannot access this page directly.<br>
    Please go through the homepage or allowed sections.</div>
    <div id="redirectTimer">Redirecting in 3 seconds...</div>
    <button onclick="goBack()">Go Back</button>
  `;
  document.body.appendChild(modal);

  let countdown = 3;
  const timer = document.getElementById('redirectTimer');
  const interval = setInterval(() => {
    countdown--;
    timer.textContent = `Redirecting in ${countdown} seconds...`;
    if (countdown <= 0) {
      clearInterval(interval);
      window.location.href = "index.html";
    }
  }, 1000);
}

// EXPOSE goBack TO WINDOW
window.goBack = function() {
  window.history.back();
}
