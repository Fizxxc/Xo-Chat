import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  onChildAdded,
  set,
  onValue,
  serverTimestamp,
  remove,
} from "https://www.gstatic.com/firebasejs/11.9.0/firebase-database.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.9.0/firebase-auth.js";

import { firebaseConfig } from '/firebase-config.js';

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// DOM Elements
const chatBox = document.getElementById("chatBox");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userList = document.getElementById("userList");
const userListMobile = document.getElementById("userListMobile");
const menuToggle = document.getElementById("menuToggle");
const mobileDrawer = document.getElementById("mobileDrawer");

// Toggle drawer mobile
if (menuToggle && mobileDrawer) {
  menuToggle.addEventListener("click", () => {
    mobileDrawer.classList.toggle("translate-x-full");
  });

  window.addEventListener("click", (e) => {
    if (!mobileDrawer.contains(e.target) && !menuToggle.contains(e.target)) {
      mobileDrawer.classList.add("translate-x-full");
    }
  });
}

// Auth Check
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  const uid = user.uid;
  const username = localStorage.getItem("username") || user.email.split("@")[0];

  // Set user online status
  set(ref(db, `users/${uid}`), {
    uid,
    email: user.email,
    username,
    online: true
  });

  // Send message
  sendBtn.addEventListener("click", () => {
    const text = messageInput.value.trim();
    if (text) {
      push(ref(db, "messages"), {
        text,
        sender: uid,
        username,
        timestamp: Date.now()
      });
      messageInput.value = "";
    }
  });

  // Logout
  logoutBtn.addEventListener("click", () => {
    remove(ref(db, `users/${uid}`));
    signOut(auth).then(() => {
      window.location.href = "index.html";
    });
  });

  // Show messages
  const messagesRef = ref(db, "messages");
  onChildAdded(messagesRef, (snapshot) => {
    const data = snapshot.val();
    const isSelf = data.sender === uid;

    const msgEl = document.createElement("div");
    msgEl.className = `mb-2 flex ${isSelf ? 'justify-end' : 'justify-start'}`;
    msgEl.innerHTML = `
      <div class="p-2 rounded-lg ${isSelf ? 'bg-purple-600 text-white' : 'bg-white text-black'} max-w-[80%]">
        <strong>${data.username}</strong><br>${data.text}
      </div>`;
    chatBox.appendChild(msgEl);
    chatBox.scrollTop = chatBox.scrollHeight;
  });

  // Show online users
  const usersRef = ref(db, "users");
  onValue(usersRef, (snapshot) => {
    const users = snapshot.val();
    userList.innerHTML = "";
    userListMobile.innerHTML = "";

    for (const key in users) {
      const u = users[key];
      if (u.online) {
        const el = `<div class="px-2 py-1 rounded bg-purple-800">${u.username}</div>`;
        userList.innerHTML += el;
        userListMobile.innerHTML += el;
      }
    }
  });
});
