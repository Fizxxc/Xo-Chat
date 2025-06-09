// index.js
import { auth, db } from "./firebase-config.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-auth.js";
import { ref, set } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-database.js";

// Event listener untuk tombol login
document.getElementById("loginBtn").addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    Swal.fire("Login Berhasil", result.user.email, "success").then(() => {
      location.href = "chat.html";
    });
  } catch (error) {
    Swal.fire("Login Gagal", error.message, "error");
  }
});

// Event listener untuk tombol register
document.getElementById("registerBtn").addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const username = document.getElementById("username").value;

  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const uid = result.user.uid;

    await set(ref(db, "users/" + uid), {
      email,
      username,
      role: "user",
      online: true
    });

    Swal.fire("Registrasi Berhasil", "Silakan login sekarang", "success");
  } catch (error) {
    Swal.fire("Registrasi Gagal", error.message, "error");
  }
});

// Cek jika sudah login
onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = "chat.html";
  }
});
