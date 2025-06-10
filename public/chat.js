// chat.js
import { auth, db } from "./firebase-config.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.9.0/firebase-auth.js";
import {
  ref,
  onChildAdded,
  push,
  set,
  update,
  get,
  child,
  onValue
} from "https://www.gstatic.com/firebasejs/11.9.0/firebase-database.js";

let currentUser = null;
let userMap = {};

const chatBox = document.getElementById("chatBox");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const userList = document.getElementById("userList");
const statusLabel = document.getElementById("status");

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  currentUser = user;

  // Tandai online
  update(ref(db, "users/" + user.uid), { online: true });

  // Load data user untuk mention dan role
  onValue(ref(db, "users"), (snapshot) => {
    userMap = snapshot.val() || {};
    updateUserList();
  });

  // Load chat
  onChildAdded(ref(db, "messages"), (snapshot) => {
    const msg = snapshot.val();
    const sender = userMap[msg.uid]?.username || "Unknown";
    const role = userMap[msg.uid]?.role === "admin" ? `<span class="text-red-500 text-xs">(Admin)</span>` : "";
    const mentionClass = msg.text.includes(`@${userMap[user.uid]?.username}`) ? "bg-yellow-100" : "";

    const isPrivate = msg.to && msg.to === user.uid;

    if (!msg.to || isPrivate || msg.uid === user.uid) {
      chatBox.innerHTML += `
        <div class="p-2 ${mentionClass}">
          <strong>${sender}</strong> ${role}: ${msg.text}
        </div>
      `;
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  });
});

// Kirim pesan
sendBtn.addEventListener("click", async () => {
  const text = messageInput.value.trim();
  if (!text) return;

  let messageData = {
    uid: currentUser.uid,
    text,
    timestamp: Date.now()
  };

  // Deteksi private chat: /pm @username pesan
  if (text.startsWith("/pm @")) {
    const split = text.split(" ");
    const targetUsername = split[1]?.replace("@", "");
    const target = Object.entries(userMap).find(([, u]) => u.username === targetUsername);

    if (target) {
      const [targetUid] = target;
      messageData.to = targetUid;
      messageData.text = split.slice(2).join(" ");
    }
  }

  await push(ref(db, "messages"), messageData);
  messageInput.value = "";
});

// Logout
document.getElementById("logoutBtn").addEventListener("click", async () => {
  await update(ref(db, "users/" + currentUser.uid), { online: false });
  await signOut(auth);
  location.href = "index.html";
});

// Tampilkan daftar user
function updateUserList() {
  userList.innerHTML = "";
  for (const [uid, user] of Object.entries(userMap)) {
    const online = user.online ? "🟢" : "⚪";
    userList.innerHTML += `<div>@${user.username} ${online}</div>`;
  }
}
