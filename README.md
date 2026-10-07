# 💰 Hematly - Aplikasi Pencatatan Pengeluaran Harian

Aplikasi web modern, responsif, dan berbasis real-time untuk mencatat dan merekapitulasi pengeluaran harian menggunakan **HTML5, Vanilla CSS3, Vanilla JavaScript (ES Modules)**, serta didukung oleh **Firebase Authentication** dan **Cloud Firestore**.

---

## 📁 Struktur File & Direktori

```text
expense-tracker/
├── index.html            # Antarmuka SPA (Login, Register, Dashboard, Modals)
├── style.css             # Desain modern, responsif, glassmorphism & dark-theme
├── firebase-config.js    # Konfigurasi & inisialisasi Firebase Modular SDK (CDN)
├── app.js                # Logika otentikasi, CRUD Firestore, filter & auto-summing
└── README.md             # Panduan setup & deployment
```

---

## 🚀 Panduan Setup Firebase (Wajib Sebelum Dijalankan)

### Langkah 1: Buat Proyek di Firebase Console
1. Buka [Firebase Console](https://console.firebase.google.com/) dan login dengan akun Google Anda.
2. Klik **"Add project"** / **"Tambahkan project"**, beri nama proyek (misal: `hematly-app`).
3. Matikan atau aktifkan Google Analytics (opsional), lalu klik **Create project**.

### Langkah 2: Aktifkan Firebase Authentication
1. Pada menu navigasi sebelah kiri, klik **Build** > **Authentication** > **Get started**.
2. Pada tab **Sign-in method**, pilih **Email/Password**.
3. Aktifkan toggle **Email/Password** (toggle pertama saja), lalu klik **Save**.

### Langkah 3: Buat Cloud Firestore Database
1. Pada menu sebelah kiri, klik **Build** > **Firestore Database** > **Create database**.
2. Pilih lokasi server terdekat (contoh: `asia-southeast2` untuk Jakarta atau `asia-southeast1` untuk Singapore).
3. Pilih **Start in test mode** atau **production mode**, lalu klik **Next** / **Create**.
4. Buka tab **Rules** pada Firestore dan ganti aturannya dengan aturan keamanan berikut (agar tiap user hanya bisa mengakses datanya sendiri):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Setiap pengguna hanya bisa membaca dan mengubah data pengeluaran miliknya sendiri
    match /users/{userId}/expenses/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```
5. Klik **Publish**.

### Langkah 4: Daftarkan Web App & Ambil Konfigurasi
1. Klik ikon ⚙️ (**Project settings**) di samping menu *Project Overview*.
2. Pada tab **General**, scroll ke bawah sampai bagian **Your apps**, lalu klik ikon Web (`</>`).
3. Beri nama aplikasi web (misal: `Hematly Web`), lalu klik **Register app**.
4. Salin objek `firebaseConfig` yang tampil di layar.

### Langkah 5: Masukkan Config ke dalam `firebase-config.js`
Buka file `firebase-config.js` dan ganti bagian berikut:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "hematly-app.firebaseapp.com",
  projectId: "hematly-app",
  storageBucket: "hematly-app.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef..."
};
```

---

## 🌐 Cara Deploy ke GitHub Pages

Aplikasi ini menggunakan modul JavaScript standar tanpa build tools yang rumit, sehingga **100% siap langsung di-deploy ke GitHub Pages**.

### 1. Inisialisasi Git Lokal
Buka terminal / Command Prompt pada folder `expense-tracker`:

```bash
cd "C:\Users\Daffa Putra\.gemini\antigravity-ide\scratch\expense-tracker"
git init
git add .
git commit -m "feat: inisialisasi aplikasi expense tracker hematly"
```

### 2. Hubungkan ke Repository GitHub
1. Buat repository baru di [GitHub](https://github.com/new) (misal bernama: `expense-tracker`).
2. Jalankan perintah berikut di terminal:

```bash
git branch -M main
git remote add origin https://github.com/USERNAME_ANDA/expense-tracker.git
git push -u origin main
```

### 3. Aktifkan GitHub Pages
1. Buka halaman repository Anda di GitHub.
2. Masuk ke menu **Settings** > **Pages** (di sidebar kiri).
3. Di bawah **Build and deployment** > **Source**, pilih **Deploy from a branch**.
4. Pilih branch **`main`** dan folder **`/ (root)`**, lalu klik **Save**.
5. Tunggu 1-2 menit, URL publik aplikasi Anda akan muncul (contoh: `https://USERNAME_ANDA.github.io/expense-tracker/`).

---

## ✨ Fitur Unggulan
- 🔒 **Private & Secure Auth**: Login dan registrasi terisolasi per akun user via Firebase Auth.
- ⚡ **Real-Time Auto Sync**: Menggunakan Firestore snapshot listener untuk update instan tanpa reload halaman.
- 📊 **Auto-Summing & Analytics**: Rekapitulasi otomatis berdasarkan periode (Hari Ini, Minggu Ini, Bulan Ini, Tahun Ini, dan Semua Waktu), rata-rata per transaksi, dan visualisasi distribusi kategori.
- 📱 **Mobile-First & 100% Responsive**: Dilengkapi tombol aksi cepat (FAB), custom date/currency input, dan layout adaptif untuk semua perangkat.
