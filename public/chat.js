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

import { firebaseConfig } from './firebase-config.js';

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// Element references
const chatBox = document.getElementById("chatBox");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userList = document.getElementById("userList");
const userListMobile = document.getElementById("userListMobile");

// Mobile drawer
const menuToggle = document.getElementById("menuToggle");
const mobileDrawer = document.getElementById("mobileDrawer");

// Drawer toggle
menuToggle?.addEventListener("click", () => {
  mobileDrawer.classList.toggle("translate-x-full");
});

// Klik luar drawer untuk menutup
window.addEventListener("click", (e) => {
  if (!mobileDrawer.contains(e.target) && !menuToggle.contains(e.target)) {
    mobileDrawer.classList.add("translate-x-full");
  }
});

// Cek login
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "index.html";
  } else {
    const uid = user.uid;
    const userRef = ref(db, `users/${uid}`);
    set(userRef, {
      email: user.email,
      uid,
      online: true,
      username: localStorage.getItem("username") || user.email.split("@")[0]
    });

    // Kirim pesan
    sendBtn.addEventListener("click", () => {
      const message = messageInput.value.trim();
      if (message !== "") {
        push(ref(db, "messages"), {
          text: message,
          sender: uid,
          username: localStorage.getItem("username") || user.email.split("@")[0],
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

    // Tampilkan pesan baru
    const messagesRef = ref(db, "messages");
    onChildAdded(messagesRef, (snapshot) => {
      const data = snapshot.val();
      const messageEl = document.createElement("div");
      messageEl.className = "mb-2";
      const isSelf = data.sender === uid;

      messageEl.innerHTML = `
        <div class="p-2 rounded ${isSelf ? 'bg-purple-600 text-white ml-auto text-right' : 'bg-white text-black'} max-w-[80%]">
          <strong>${data.username}</strong><br/>${data.text}
        </div>
      `;
      chatBox.appendChild(messageEl);
      chatBox.scrollTop = chatBox.scrollHeight;
    });

    // Update daftar user online
    const usersRef = ref(db, "users");
    onValue(usersRef, (snapshot) => {
      const users = snapshot.val();
      userList.innerHTML = "";
      userListMobile.innerHTML = "";
      for (const key in users) {
        const u = users[key];
        if (u.online) {
          const item = `<div class="text-white">${u.username}</div>`;
          userList.innerHTML += item;
          userListMobile.innerHTML += item;
        }
      }
    });
  }
});
