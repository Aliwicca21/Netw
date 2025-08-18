import { auth, db } from "./firebase-config.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const phone = document.getElementById("phone").value;
  const birthdate = document.getElementById("birthdate").value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // حفظ بيانات إضافية في Firestore
    await setDoc(doc(db, "users", user.uid), {
      email,
      phone,
      birthdate,
      balance: 0,
      subscription: null
    });

    alert("تم إنشاء الحساب بنجاح ✅");
    window.location.href = "login.html";
  } catch (error) {
    alert("خطأ: " + error.message);
  }
});
