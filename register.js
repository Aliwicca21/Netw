// register.js
import { auth, db } from './firebase-config.js';
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

document.getElementById("register-btn").addEventListener("click", async () => {
  const name = document.getElementById("register-name").value.trim();
  const email = document.getElementById("register-email").value.trim();
  const password = document.getElementById("register-password").value;
  const phone = document.getElementById("register-phone").value.trim();
  const birth  = document.getElementById("register-birth").value;

  if(!name || !email || !password || !phone || !birth){
    return alert("من فضلك أكمل جميع الحقول.");
  }

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });

    await setDoc(doc(db, "users", cred.user.uid), {
      name, email, phone, birth,
      balance: 0,
      subscription: {
        active: false,
        plan: null,
        startedAt: null,
        expiresAt: null,
        lastPaymentId: null,
        renewed: false
      },
      createdAt: serverTimestamp()
    });

    alert("تم إنشاء الحساب بنجاح!");
    window.location.href = "login.html";
  } catch (e) {
    alert(e.message);
  }
});