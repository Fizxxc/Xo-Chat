// public/chat.js
import { auth, db, ref, push, onChildAdded } from './firebase.js';

const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const messagesDiv = document.getElementById('messages');
const chatTitle = document.getElementById('chatTitle');
const backBtn = document.getElementById('backBtn');

let currentUser;
let chatWith = localStorage.getItem('chatWith');
let chatWithName = localStorage.getItem('chatWithName');

auth.onAuthStateChanged(user => {
  if (!user) return (window.location.href = 'login.html');
  currentUser = user;
  initChat();
});

function initChat() {
  if (chatWith) {
    chatTitle.textContent = chatWithName;
    listenMessages(`private/${currentUser.uid}_${chatWith}`);
  } else {
    chatTitle.textContent = "XO Public";
    listenMessages("public");
  }
}

function listenMessages(path) {
  const chatRef = ref(db, `chats/${path}`);
  onChildAdded(chatRef, (snapshot) => {
    const msg = snapshot.val();
    const div = document.createElement('div');
    div.className = msg.sender === currentUser.uid ? 'text-right my-2' : 'text-left my-2';
    div.innerHTML = `
      <div class='inline-block bg-blue-600 text-white px-4 py-2 rounded-lg shadow'>
        <div class='text-xs text-gray-200 mb-1'>${msg.senderName || 'Anon'}</div>
        <div>${msg.text}</div>
        <div class='text-xs text-gray-300 mt-1 text-right'>${new Date(msg.timestamp).toLocaleTimeString()}</div>
      </div>
    `;
    messagesDiv.appendChild(div);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });
}

sendBtn.onclick = () => {
  const text = messageInput.value.trim();
  if (!text) return;
  const path = chatWith ? `private/${currentUser.uid}_${chatWith}` : 'public';
  const chatRef = ref(db, `chats/${path}`);
  push(chatRef, {
    text,
    sender: currentUser.uid,
    senderName: currentUser.email,
    timestamp: Date.now()
  });
  messageInput.value = '';
};

backBtn.onclick = () => {
  localStorage.removeItem('chatWith');
  localStorage.removeItem('chatWithName');
  window.location.href = 'index.html';
};
