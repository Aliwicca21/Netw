// profile.js
import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, updateDoc, increment, serverTimestamp, Timestamp } from "firebase/firestore";

let currentUid = null;
let currentUserDoc = null;

onAuthStateChanged(auth, async user => {
  if(!user){ window.location.href = "login.html"; return; }
  currentUid = user.uid;
  await loadProfile();
  renderPayPalButtons(); // بعد تحميل البيانات نرسم الأزرار
});

async function loadProfile(){
  const snap = await getDoc(doc(db, "users", currentUid));
  if(!snap.exists()){ return; }
  currentUserDoc = snap.data();

  // بيانات المستخدم
  document.getElementById("user-name").textContent   = currentUserDoc.name ?? "—";
  document.getElementById("user-email").textContent  = currentUserDoc.email ?? "—";
  document.getElementById("user-phone").textContent  = currentUserDoc.phone ?? "—";
  document.getElementById("user-birth").textContent  = currentUserDoc.birth ?? "—";
  document.getElementById("user-balance").textContent = Number(currentUserDoc.balance ?? 0).toString();

  // الاشتراك
  const sub = currentUserDoc.subscription ?? {};
  const active = !!sub.active;
  document.getElementById("sub-status").textContent = active ? "مفعل" : "غير مفعل";
  document.getElementById("sub-plan").textContent   = sub.plan ?? "—";
  const exp = sub.expiresAt?.seconds ? new Date(sub.expiresAt.seconds*1000) : null;
  document.getElementById("sub-expires").textContent = exp ? exp.toLocaleDateString() : "—";
}

// تسجيل الخروج
document.getElementById("logout-btn").addEventListener("click", async ()=>{
  await signOut(auth);
  window.location.href = "login.html";
});

// إلغاء تفعيل الاشتراك (لا يُلغي الدفع في باي بال؛ يوقفه عندنا فقط)
document.getElementById("cancel-sub").addEventListener("click", async ()=>{
  await updateDoc(doc(db,"users",currentUid), {
    subscription: {
      active:false,
      plan:null,
      startedAt:null,
      expiresAt:null,
      lastPaymentId:null,
      renewed:false
    }
  });
  await loadProfile();
  alert("تم إلغاء تفعيل الاشتراك في النظام.");
});

/* ======== PayPal Integration ======== */
// ملاحظة: غيّر الأسعار والخطط كما تريد
function renderPayPalButtons(){
  // زر شحن 5$
  if (document.getElementById("paypal-topup-5")) {
    paypal.Buttons({
      style: { layout: "vertical" },
      createOrder: (data, actions) => actions.order.create({
        purchase_units: [{ amount: { value: "5.00" }, description:"Topup $5" }]
      }),
      onApprove: async (data, actions) => {
        const order = await actions.order.capture();
        await updateDoc(doc(db,"users",currentUid), { balance: increment(5) });
        await logTransaction("topup", 5, order?.id);
        await loadProfile();
        alert("تم شحن 5$ بنجاح!");
      }
    }).render("#paypal-topup-5");
  }

  // زر شحن 10$
  if (document.getElementById("paypal-topup-10")) {
    paypal.Buttons({
      style: { layout: "vertical" },
      createOrder: (data, actions) => actions.order.create({
        purchase_units: [{ amount: { value: "10.00" }, description:"Topup $10" }]
      }),
      onApprove: async (data, actions) => {
        const order = await actions.order.capture();
        await updateDoc(doc(db,"users",currentUid), { balance: increment(10) });
        await logTransaction("topup", 10, order?.id);
        await loadProfile();
        alert("تم شحن 10$ بنجاح!");
      }
    }).render("#paypal-topup-10");
  }

  // اشتراك شهري 4.99$
  if (document.getElementById("paypal-sub-monthly")) {
    paypal.Buttons({
      style: { layout: "vertical" },
      createOrder: (data, actions) => actions.order.create({
        purchase_units: [{ amount: { value: "4.99" }, description:"Monthly Subscription" }]
      }),
      onApprove: async (data, actions) => {
        const order = await actions.order.capture();
        const start = new Date();
        const expires = new Date();
        expires.setDate(start.getDate() + 30); // 30 يوم

        await updateDoc(doc(db,"users",currentUid), {
          subscription: {
            active: true,
            plan: "monthly",
            startedAt: serverTimestamp(),
            expiresAt: Timestamp.fromDate(expires),
            lastPaymentId: order?.id ?? null,
            renewed: true
          }
        });

        await logTransaction("subscription_monthly", 4.99, order?.id);
        await loadProfile();
        alert("تم تفعيل الاشتراك الشهري!");
      }
    }).render("#paypal-sub-monthly");
  }

  // اشتراك سنوي 49.99$
  if (document.getElementById("paypal-sub-yearly")) {
    paypal.Buttons({
      style: { layout: "vertical" },
      createOrder: (data, actions) => actions.order.create({
        purchase_units: [{ amount: { value: "49.99" }, description:"Yearly Subscription" }]
      }),
      onApprove: async (data, actions) => {
        const order = await actions.order.capture();
        const start = new Date();
        const expires = new Date();
        expires.setDate(start.getDate() + 365);

        await updateDoc(doc(db,"users",currentUid), {
          subscription: {
            active: true,
            plan: "yearly",
            startedAt: serverTimestamp(),
            expiresAt: Timestamp.fromDate(expires),
            lastPaymentId: order?.id ?? null,
            renewed: true
          }
        });

        await logTransaction("subscription_yearly", 49.99, order?.id);
        await loadProfile();
        alert("تم تفعيل الاشتراك السنوي!");
      }
    }).render("#paypal-sub-yearly");
  }
}

// حفظ سجل عمليات الدفع لكل مستخدم (اختياري لكنه مفيد)
async function logTransaction(type, amount, paypalOrderId){
  // ننشئ Subcollection اسمها transactions
  const { doc, collection, addDoc } = await import("firebase/firestore");
  const colRef = (await import("firebase/firestore")).collection;
  const add = (await import("firebase/firestore")).addDoc;

  // نضيف وثيقة جديدة في users/{uid}/transactions
  await add(colRef(doc(db, "users", currentUid), "transactions"), {
    type, amount, paypalOrderId: paypalOrderId ?? null, createdAt: serverTimestamp()
  });
}