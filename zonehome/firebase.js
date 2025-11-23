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
