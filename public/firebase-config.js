<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Live Streaming Sepak Bola</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
  </head>
  <body class="bg-gray-900 text-white">
    <!-- Login/Register Page -->
    <div id="auth-section" class="min-h-screen flex items-center justify-center">
      <div class="bg-gray-800 p-8 rounded-xl shadow-md w-96">
        <h2 class="text-2xl font-bold mb-4 text-center">Masuk / Daftar</h2>
        <input type="email" id="email" placeholder="Email" class="w-full p-2 mb-3 rounded bg-gray-700 text-white" />
        <input type="password" id="password" placeholder="Password" class="w-full p-2 mb-3 rounded bg-gray-700 text-white" />
        <button onclick="login()" class="w-full bg-blue-600 hover:bg-blue-700 p-2 rounded mb-2">Masuk</button>
        <button onclick="register()" class="w-full bg-green-600 hover:bg-green-700 p-2 rounded">Daftar</button>
      </div>
    </div>

    <!-- Main App Section -->
    <div id="main-app" class="hidden">
      <div class="flex justify-between items-center p-4 bg-gray-800">
        <h1 class="text-xl font-bold">Streaming Bola Gratis</h1>
        <div>
          <button onclick="showProfile()" class="bg-blue-700 px-4 py-2 rounded">Profile</button>
          <button onclick="logout()" class="bg-red-700 px-4 py-2 rounded ml-2">Logout</button>
        </div>
      </div>
      <div class="p-4">
        <!-- Embed video stream -->
        <div class="aspect-w-16 aspect-h-9">
          <iframe src="https://www.youtube.com/embed/live_stream?channel=CHANNEL_ID" frameborder="0" allowfullscreen class="w-full h-96"></iframe>
        </div>
      </div>
    </div>

    <!-- Profile Modal -->
    <div id="profile-modal" class="fixed inset-0 bg-black bg-opacity-50 hidden justify-center items-center">
      <div class="bg-gray-800 p-6 rounded shadow-xl">
        <h2 class="text-xl mb-4">Informasi Akun</h2>
        <p id="user-email" class="mb-4"></p>
        <button onclick="closeProfile()" class="bg-blue-600 px-4 py-2 rounded">Tutup</button>
      </div>
    </div>

    <script type="module">
      import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-app.js";
      import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-analytics.js";
      import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-auth.js";

      const firebaseConfig = {
        apiKey: "AIzaSyBlNHkA1f-1GwBN0nBchMtIwEYUNLlq8FQ",
        authDomain: "e-commerce-a6fe2.firebaseapp.com",
        databaseURL: "https://e-commerce-a6fe2-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "e-commerce-a6fe2",
        storageBucket: "e-commerce-a6fe2.firebasestorage.app",
        messagingSenderId: "169688929056",
        appId: "1:169688929056:web:8d04f0b02c98fa77d1bd45",
        measurementId: "G-Q8FP7FQQHV"
      };

      const app = initializeApp(firebaseConfig);
      const analytics = getAnalytics(app);
      const auth = getAuth(app);

      const authSection = document.getElementById("auth-section");
      const mainApp = document.getElementById("main-app");
      const profileModal = document.getElementById("profile-modal");
      const userEmail = document.getElementById("user-email");

      onAuthStateChanged(auth, user => {
        if (user) {
          authSection.classList.add("hidden");
          mainApp.classList.remove("hidden");
        } else {
          authSection.classList.remove("hidden");
          mainApp.classList.add("hidden");
        }
      });

      window.login = () => {
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        signInWithEmailAndPassword(auth, email, password)
          .catch(error => alert(error.message));
      }

      window.register = () => {
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        createUserWithEmailAndPassword(auth, email, password)
          .catch(error => alert(error.message));
      }

      window.logout = () => {
        signOut(auth);
      }

      window.showProfile = () => {
        const user = auth.currentUser;
        if (user) {
          userEmail.textContent = `Email: ${user.email}`;
          profileModal.classList.remove("hidden");
          profileModal.classList.add("flex");
        }
      }

      window.closeProfile = () => {
        profileModal.classList.add("hidden");
        profileModal.classList.remove("flex");
      }
    </script>
  </body>
</html>
