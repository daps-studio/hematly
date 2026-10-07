/**
 * FIREBASE CONFIGURATION & INITIALIZATION (Modular SDK v10)
 * Ganti nilai di bawah ini dengan konfigurasi dari Firebase Console proyek Anda:
 * Firebase Console -> Project Settings -> General -> Your apps -> Web app
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";


const firebaseConfig = {
  apiKey: "AIzaSyB-xxxxxxxxxxxxxxxxxxx",
  authDomain: "pencatatan-pengeluaran-601c5.firebaseapp.com",
  projectId: "pencatatan-pengeluaran-601c5",
  storageBucket: "pencatatan-pengeluaran-601c5.appspot.com",
  messagingSenderId: "600776423896",
  appId: "1:600776423896:web:9bd3c38c62a4211542daad"
};

// Inisialisasi Firebase App
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { 
  auth, 
  db, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp 
};
