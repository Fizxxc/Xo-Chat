// chat.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-app.js";
import { getDatabase, ref, onValue, push, update, set, serverTimestamp, onDisconnect } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-database.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-auth.js";
import { firebaseConfig } from "./firebase-config.js";

// Init
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// Elemen
const chatBox = document.getElementById("chatBox");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userList = document.getElementById("userList");
const userListMobile = document.getElementById("userListMobile");

// Event auth
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "/"; // logout paksa
    return;
  }

  const uid = user.uid;
  const userRef = ref(db, `users/${uid}`);
  update(userRef, { online: true });

  // Offline auto update
  onDisconnect(userRef).update({ online: false });

  // Kirim pesan
  sendBtn.onclick = () => {
    const text = messageInput.value.trim();
    if (!text) return;

    const messageRef = ref(db, "messages");
    push(messageRef, {
      text,
      timestamp: serverTimestamp(),
      uid,
      username: user.displayName || "User",
    });
    messageInput.value = "";
  };

  // Ambil pesan real-time
  onValue(ref(db, "messages"), (snapshot) => {
    chatBox.innerHTML = "";
    snapshot.forEach((child) => {
      const { text, username } = child.val();
      const msg = document.createElement("div");
      msg.textContent = `${username}: ${text}`;
      msg.className = "mb-1";
      chatBox.appendChild(msg);
    });
    chatBox.scrollTop = chatBox.scrollHeight;
  });

  // Ambil pengguna online
  const usersRef = ref(db, "users");
  onValue(usersRef, (snap) => {
    userList.innerHTML = "";
    userListMobile.innerHTML = "";
    snap.forEach((child) => {
      const user = child.val();
      if (user.online) {
        const item = document.createElement("div");
        item.textContent = user.username || user.email;
        item.className = "text-white";
        userList.appendChild(item);

        const itemMobile = item.cloneNode(true);
        userListMobile.appendChild(itemMobile);
      }
    });
  });
});

// Logout
logoutBtn.onclick = () => {
  const user = auth.currentUser;
  if (user) {
    update(ref(db, `users/${user.uid}`), { online: false }).then(() => {
      signOut(auth).then(() => {
        window.location.href = "/";
      });
    });
  }
};
