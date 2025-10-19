// 🔒 auth-guard.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-auth.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-database.js";

// ✅ Firebase config (same as in login.html)
const firebaseConfig = {
  apiKey: "AIzaSyAs2S6iRhnYhmqNuF0QCCYu5NuzxHxIRv0",
  authDomain: "tvnstream-b4497.firebaseapp.com",
  databaseURL: "https://tvnstream-b4497-default-rtdb.firebaseio.com",
  projectId: "tvnstream-b4497",
  storageBucket: "tvnstream-b4497.appspot.com",
  messagingSenderId: "308384754214",
  appId: "1:308384754214:web:2938e76cd29b288f75d4e7"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// 🔹 Verify Access Function
export function verifyAccess() {
  const params = new URLSearchParams(window.location.search);
  const accessId = params.get("id");

  if (!accessId) {
    alert("Access denied ❌ Missing ID.");
    window.location.href = "login.html";
    return;
  }

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      alert("You must log in first.");
      window.location.href = "login.html";
      return;
    }

    const accessRef = ref(db, "accessIDs/" + user.uid);
    const snapshot = await get(accessRef);
    const data = snapshot.val();

    const now = Date.now();
    if (!data || data.accessId !== accessId || now - data.timestamp > 86400000) {
      alert("Access expired or invalid ❌");
      window.location.href = "login.html";
    } else {
      console.log("✅ Access verified for:", user.email);
    }
  });
}
