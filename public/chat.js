import { auth, db } from '/firebase-config.js';
import { ref, onValue } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-database.js";

let currentUserUID = null;
let currentUserRole = "user";

// Cek login user
auth.onAuthStateChanged(user => {
  if (user) {
    currentUserUID = user.uid;

    const userRef = ref(db, `users/${user.uid}`);
    onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      currentUserRole = data?.role || "user";

      if (currentUserRole === "admin") {
        showAdminControls();
      }
    });
  }
});

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
