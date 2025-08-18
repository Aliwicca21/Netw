// login.js
import { auth } from './firebase-config.js';
import { signInWithEmailAndPassword } from "firebase/auth";

document.getElementById("login-btn").addEventListener("click", async () => {
  const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;
      try {
          await signInWithEmailAndPassword(auth, email, password);
              window.location.href = "profile.html";
                } catch (e) {
                    alert(e.message);
                      }
                      });