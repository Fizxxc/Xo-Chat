// public/firebase.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js';
import { getDatabase, ref, push, onValue, onChildAdded, set } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';

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
const db = getDatabase(app);
const auth = getAuth(app);

export { db, auth, ref, push, onValue, onChildAdded, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut, set };
