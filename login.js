import { auth } from "./firebase-config.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    alert("تم تسجيل الدخول بنجاح ✅");
    window.location.href = "profile.html"; // يوديك صفحة البروفايل
  } catch (error) {
    alert("خطأ: " + error.message);
  }
});
