// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDnc0EhRMKSAbkpJLSdkeGZA_J0nFf9CJs",
  authDomain: "pencatatan-pengeluaran-601c5.firebaseapp.com",
  projectId: "pencatatan-pengeluaran-601c5",
  storageBucket: "pencatatan-pengeluaran-601c5.firebasestorage.app",
  messagingSenderId: "600776423896",
  appId: "1:600776423896:web:9bd3c38c62a4211542daad",
  measurementId: "G-TNXCXQV8VQ"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);

// Ekspor auth dan db agar bisa dipakai di app.js
export const auth = getAuth(app);
export const db = getFirestore(app);
