// public/auth.js
import {
  auth,
  db,
  ref,
  set,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged
} from './firebase.js';

const email = document.getElementById('email');
const password = document.getElementById('password');

const loginBtn = document.getElementById('loginBtn');
if (loginBtn) {
  loginBtn.onclick = () => {
    signInWithEmailAndPassword(auth, email.value, password.value)
      .then(() => window.location.href = 'index.html')
      .catch(err => alert(err.message));
  };
}

const registerBtn = document.getElementById('registerBtn');
if (registerBtn) {
  registerBtn.onclick = () => {
    createUserWithEmailAndPassword(auth, email.value, password.value)
      .then(cred => {
        return set(ref(db, `users/${cred.user.uid}`), {
          email: email.value
        });
      })
      .then(() => window.location.href = 'index.html')
      .catch(err => alert(err.message));
  };
}
