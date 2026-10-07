// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// 1. Tambahkan import untuk Auth dan Firestore
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile 
} from "firebase/auth";
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
} from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDnc0EhRMKSAbkpJLSdkeGZA_J0nFf9CJs", //[cite: 7]
  authDomain: "pencatatan-pengeluaran-601c5.firebaseapp.com", //[cite: 7]
  projectId: "pencatatan-pengeluaran-601c5", //[cite: 7]
  storageBucket: "pencatatan-pengeluaran-601c5.firebasestorage.app", //[cite: 7]
  messagingSenderId: "600776423896", //[cite: 7]
  appId: "1:600776423896:web:9bd3c38c62a4211542daad", //[cite: 7]
  measurementId: "G-TNXCXQV8VQ" //[cite: 7]
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// 2. Inisialisasi Auth dan Firestore
const auth = getAuth(app);
const db = getFirestore(app);

// 3. Export semuanya dengan benar
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