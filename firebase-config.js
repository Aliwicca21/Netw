// js/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBGFMZtSytIPzF4XYLyA34DpF5q_k-UPL8",
  authDomain: "fir-dba4c.firebaseapp.com",
  projectId: "fir-dba4c",
  storageBucket: "fir-dba4c.firebasestorage.app",
  messagingSenderId: "160255207915",
  appId: "1:160255207915:web:ce8e69d43f62daf476d1ae",
  measurementId: "G-GYPNMR85G2"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);
