import { auth, db } from './firebase-config.js';
import {
  ref, set, push, onChildAdded, serverTimestamp,
  onValue, update
} from "https://www.gstatic.com/firebasejs/11.9.0/firebase-database.js";

let currentUserUID = null;
let currentUserName = "";
let currentUserRole = "user";

const chatBox = document.getElementById("chatBox");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const userList = document.getElementById("userList");
const logoutBtn = document.getElementById("logoutBtn");

// Cek login
auth.onAuthStateChanged(user => {
  if (user) {
    currentUserUID = user.uid;

    const userRef = ref(db, `users/${user.uid}`);
    update(userRef, { online: true });

    window.addEventListener('beforeunload', () => {
      update(userRef, { online: false });
    });

    onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      currentUserName = data?.username || "Anonim";
      currentUserRole = data?.role || "user";

      if (currentUserRole === "admin") {
        showAdminControls();
      }
    });

    loadMessages();
    loadOnlineUsers();
  } else {
    window.location.href = "/"; // Redirect jika belum login
  }
});

// Fungsi mengirim pesan
sendBtn.addEventListener("click", () => {
  const text = messageInput.value.trim();
  if (!text) return;

  const messagesRef = ref(db, "messages");
  push(messagesRef, {
    uid: currentUserUID,
    username: currentUserName,
    role: currentUserRole,
    text,
    timestamp: serverTimestamp()
  });

  messageInput.value = "";

  // Jika mengandung @bot, panggil AI
  if (text.toLowerCase().includes("@bot")) {
    handleBotQuestion(text);
  }
});

// Fungsi handle pertanyaan ke bot
async function handleBotQuestion(messageText) {
  const prompt = messageText.replace(/@bot/gi, "").trim();
  if (!prompt) return;

  try {
    const response = await fetch("/api/ask-bot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: prompt }),
    });

    const data = await response.json();
    const reply = data.reply || "Maaf, saya tidak bisa menjawab.";

    const messagesRef = ref(db, "messages");
    push(messagesRef, {
      uid: "xoai-bot",
      username: "XO AI Bot 🤖",
      role: "bot",
      text: reply,
      timestamp: serverTimestamp()
    });
  } catch (err) {
    console.error("Bot error:", err.message);
  }
}

// Load pesan
function loadMessages() {
  const messagesRef = ref(db, "messages");
  onChildAdded(messagesRef, (snapshot) => {
    const msg = snapshot.val();
    const bubble = document.createElement("div");

    const isCurrentUser = msg.uid === currentUserUID;
    const isBot = msg.role === "bot";

    bubble.className = `mb-2 flex ${isCurrentUser ? "justify-end" : "justify-start"}`;

    const bubbleContent = document.createElement("div");
    bubbleContent.className = `
      max-w-xs px-3 py-2 rounded-lg text-sm 
      ${isCurrentUser 
        ? "bg-violet-600 text-white rounded-br-none" 
        : isBot 
          ? "bg-gray-700 text-white rounded-bl-none" 
          : "bg-violet-200 text-black rounded-bl-none"}
    `;

    // Highlight jika ada mention
    if (msg.text.includes(`@${currentUserName}`)) {
      bubbleContent.classList.add("ring", "ring-yellow-400");
    }

    bubbleContent.innerHTML = `
      <div class="font-semibold text-xs mb-1">${msg.username}</div>
      <div>${msg.text}</div>
    `;

    bubble.appendChild(bubbleContent);
    chatBox.appendChild(bubble);
    chatBox.scrollTop = chatBox.scrollHeight;

    // Jika pesan dari admin dan mengandung kata perhatian
    if (msg.role === "admin" && msg.text.toLowerCase().includes("perhatian")) {
      alert(`🔔 Pesan penting dari admin:\n${msg.text}`);
    }
  });
}


// Tampilkan pengguna online
function loadOnlineUsers() {
  const usersRef = ref(db, "users");
  onValue(usersRef, (snapshot) => {
    userList.innerHTML = "";
    snapshot.forEach(child => {
      const user = child.val();
      if (user.online) {
        const li = document.createElement("div");
        li.className = "flex items-center gap-2";
        li.innerHTML = `<span class="text-green-500">●</span> ${user.username}`;
        userList.appendChild(li);
      }
    });
  });
}

// Logout
logoutBtn.addEventListener("click", () => {
  if (currentUserUID) {
    update(ref(db, `users/${currentUserUID}`), { online: false });
  }
  auth.signOut().then(() => {
    window.location.href = "/";
  });
});

// Admin panel
function showAdminControls() {
  const adminPanel = document.createElement("div");
  adminPanel.innerHTML = `
    <div class="p-3 border-t mt-4 bg-gray-100 rounded">
      <h3 class="text-sm font-bold mb-2">🛠 Admin Panel</h3>
      <button onclick="alert('fitur ban user nanti')" class="bg-red-500 text-white px-3 py-1 rounded">Ban User</button>
    </div>
  `;
  document.body.appendChild(adminPanel);
}

// Tombol refresh
function createRefreshButton() {
  const btn = document.createElement("button");
  btn.textContent = "🔄 Refresh Chat";
  btn.className = "fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded shadow-lg z-50";
  btn.onclick = () => window.location.reload();
  document.body.appendChild(btn);
}

createRefreshButton();
