/**
 * HEMATLY - EXPENSE TRACKER MAIN APPLICATION LOGIC
 */

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

import { auth, db } from "./firebase-config.js";

// ==================== STATE MANAGEMENT ====================
let currentUser = null;
let unsubscribeFirestore = null;
let allTransactions = [];
let currentFilter = "month"; // default: 'month'
let searchQuery = "";
let itemToDeleteId = null;

// Category Metadata (Colors & Icons)
const CATEGORY_META = {
  Makan: { icon: "🍔", tagClass: "cat-makan", color: "#f97316" },
  Minum: { icon: "☕", tagClass: "cat-minum", color: "#0ea5e9" },
  Jajanan: { icon: "🍩", tagClass: "cat-jajanan", color: "#ec4899" },
  Bensin: { icon: "⛽", tagClass: "cat-bensin", color: "#eab308" },
  Rokok: { icon: "🚬", tagClass: "cat-rokok", color: "#ef4444" },
  Lainnya: { icon: "📦", tagClass: "cat-lainnya", color: "#8b5cf6" }
};

// ==================== DOM ELEMENTS ====================
const authView = document.getElementById("auth-view");
const dashboardView = document.getElementById("dashboard-view");
const toastContainer = document.getElementById("toast-container");

// Auth Form Elements
const tabLoginBtn = document.getElementById("tab-login-btn");
const tabRegisterBtn = document.getElementById("tab-register-btn");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const userDisplayName = document.getElementById("user-display-name");
const btnLogout = document.getElementById("btn-logout");

// Dashboard Elements
const totalAmountEl = document.getElementById("total-amount");
const activeFilterBadge = document.getElementById("active-filter-badge");
const transactionCountLabel = document.getElementById("transaction-count-label");
const avgAmountEl = document.getElementById("avg-amount");
const topCategoryEl = document.getElementById("top-category");
const breakdownListEl = document.getElementById("breakdown-list");
const breakdownPeriodTitle = document.getElementById("breakdown-period-title");

// Filter Buttons
const filterButtons = document.querySelectorAll(".filter-btn");
const searchInput = document.getElementById("search-input");

// Transaction List Elements
const expenseItemsContainer = document.getElementById("expense-items");
const loadingState = document.getElementById("loading-state");
const emptyState = document.getElementById("empty-state");

// Modal Elements
const expenseModal = document.getElementById("expense-modal");
const btnOpenModal = document.getElementById("btn-open-modal");
const fabAdd = document.getElementById("fab-add");
const btnCloseModal = document.getElementById("btn-close-modal");
const btnCancelModal = document.getElementById("btn-cancel-modal");
const expenseForm = document.getElementById("expense-form");
const expenseAmountInput = document.getElementById("expense-amount");
const amountFormattedHint = document.getElementById("amount-formatted-hint");
const expenseDateInput = document.getElementById("expense-date");
const expenseCategoryInput = document.getElementById("expense-category");
const customCategoryGroup = document.getElementById("custom-category-group");
const customCategoryInput = document.getElementById("expense-category-custom");
const expenseNotesInput = document.getElementById("expense-notes");

// Delete Modal Elements
const deleteModal = document.getElementById("delete-modal");
const btnCancelDelete = document.getElementById("btn-cancel-delete");
const btnConfirmDelete = document.getElementById("btn-confirm-delete");

// ==================== HELPER FUNCTIONS ====================

/**
 * Format number to Indonesian Rupiah (IDR)
 */
function formatIDR(value) {
  const number = Number(value) || 0;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(number);
}

/**
 * Format standard YYYY-MM-DD to Indonesian Date String
 */
function formatDisplayDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString + "T00:00:00");
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(date);
}

/**
 * Display Toast Notification
 */
function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;

  const iconName = type === "success" ? "check-circle" : type === "error" ? "alert-circle" : "info";

  toast.innerHTML = `
    <div class="toast-icon">
      <i data-lucide="${iconName}"></i>
    </div>
    <span class="toast-message">${message}</span>
  `;

  toastContainer.appendChild(toast);
  if (window.lucide) window.lucide.createIcons();

  setTimeout(() => {
    toast.style.animation = "slideOut 0.3s ease-in forwards";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

/**
 * Set default date picker to today
 */
function resetDatePicker() {
  const today = new Date().toISOString().split("T")[0];
  expenseDateInput.value = today;
}

// ==================== AUTHENTICATION HANDLING ====================

// Switch Tabs (Login / Register)
tabLoginBtn.addEventListener("click", () => {
  tabLoginBtn.classList.add("active");
  tabRegisterBtn.classList.remove("active");
  loginForm.classList.add("active");
  registerForm.classList.remove("active");
});

tabRegisterBtn.addEventListener("click", () => {
  tabRegisterBtn.classList.add("active");
  tabLoginBtn.classList.remove("active");
  registerForm.classList.add("active");
  loginForm.classList.remove("active");
});

// Password Visibility Toggle
document.querySelectorAll(".btn-toggle-pwd").forEach(btn => {
  btn.addEventListener("click", () => {
    const targetId = btn.getAttribute("data-target");
    const input = document.getElementById(targetId);
    if (input.type === "password") {
      input.type = "text";
      btn.innerHTML = `<i data-lucide="eye-off"></i>`;
    } else {
      input.type = "password";
      btn.innerHTML = `<i data-lucide="eye"></i>`;
    }
    if (window.lucide) window.lucide.createIcons();
  });
});

// Handle Login Submission
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;
  const submitBtn = document.getElementById("login-submit-btn");

  try {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span>Memproses...</span>`;
    await signInWithEmailAndPassword(auth, email, password);
    showToast("Berhasil masuk! Selamat datang kembali.", "success");
    loginForm.reset();
  } catch (err) {
    console.error("Login Error:", err);
    let msg = "Gagal masuk. Periksa kembali email dan kata sandi.";
    if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
      msg = "Email atau kata sandi tidak sesuai.";
    } else if (err.code === "auth/too-many-requests") {
      msg = "Terlalu banyak percobaan. Silakan coba beberapa saat lagi.";
    }
    showToast(msg, "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = `<span class="btn-text">Masuk Sekarang</span><i data-lucide="arrow-right"></i>`;
    if (window.lucide) window.lucide.createIcons();
  }
});

// Handle Register Submission
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("reg-name").value.trim();
  const email = document.getElementById("reg-email").value.trim();
  const password = document.getElementById("reg-password").value;
  const submitBtn = document.getElementById("register-submit-btn");

  try {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span>Mendaftarkan...</span>`;
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update user display name
    await updateProfile(userCredential.user, { displayName: name });
    
    showToast("Akun berhasil dibuat! Selamat datang di Hematly.", "success");
    registerForm.reset();
  } catch (err) {
    console.error("Register Error:", err);
    let msg = "Gagal membuat akun.";
    if (err.code === "auth/email-already-in-use") {
      msg = "Email ini sudah terdaftar. Silakan login.";
    } else if (err.code === "auth/weak-password") {
      msg = "Kata sandi terlalu lemah. Gunakan minimal 6 karakter.";
    }
    showToast(msg, "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = `<span class="btn-text">Buat Akun Baru</span><i data-lucide="user-plus"></i>`;
    if (window.lucide) window.lucide.createIcons();
  }
});

// Handle Logout
btnLogout.addEventListener("click", async () => {
  try {
    if (unsubscribeFirestore) {
      unsubscribeFirestore();
      unsubscribeFirestore = null;
    }
    await signOut(auth);
    showToast("Anda telah keluar dari akun.", "info");
  } catch (err) {
    showToast("Gagal logout: " + err.message, "error");
  }
});

// Real-time Auth State Listener (Private Route Guard)
onAuthStateChanged(auth, (user) => {
  currentUser = user;
  if (user) {
    authView.classList.add("hidden");
    dashboardView.classList.remove("hidden");
    userDisplayName.textContent = user.displayName || user.email.split("@")[0];
    initFirestoreListener(user.uid);
  } else {
    dashboardView.classList.add("hidden");
    authView.classList.remove("hidden");
    allTransactions = [];
  }
  if (window.lucide) window.lucide.createIcons();
});

// ==================== FIRESTORE REAL-TIME LISTENER ====================

function initFirestoreListener(uid) {
  loadingState.classList.remove("hidden");
  emptyState.classList.add("hidden");
  expenseItemsContainer.innerHTML = "";

  const userExpensesRef = collection(db, "users", uid, "expenses");
  const q = query(userExpensesRef, orderBy("date", "desc"));

  if (unsubscribeFirestore) unsubscribeFirestore();

  unsubscribeFirestore = onSnapshot(
    q,
    (snapshot) => {
      loadingState.classList.add("hidden");
      allTransactions = [];

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        allTransactions.push({
          id: docSnap.id,
          amount: Number(data.amount) || 0,
          category: data.category || "Lainnya",
          date: data.date,
          notes: data.notes || "",
          createdAt: data.createdAt
        });
      });

      applyFilterAndRender();
    },
    (error) => {
      loadingState.classList.add("hidden");
      console.error("Firestore Error:", error);
      showToast("Gagal memuat data dari Firestore: " + error.message, "error");
    }
  );
}

// ==================== FILTER & AUTO-SUM LOGIC ====================

function getFilteredData() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = String(now.getMonth() + 1).padStart(2, "0");
  const todayStr = `${currentYear}-${currentMonth}-${String(now.getDate()).padStart(2, "0")}`;

  const dayOfWeek = now.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() + diffToMonday);
  const startOfWeekStr = startOfWeek.toISOString().split("T")[0];

  return allTransactions.filter((item) => {
    let matchesTime = true;
    if (currentFilter === "today") {
      matchesTime = item.date === todayStr;
    } else if (currentFilter === "week") {
      matchesTime = item.date >= startOfWeekStr && item.date <= todayStr;
    } else if (currentFilter === "month") {
      matchesTime = item.date.startsWith(`${currentYear}-${currentMonth}`);
    } else if (currentFilter === "year") {
      matchesTime = item.date.startsWith(`${currentYear}`);
    } else if (currentFilter === "all") {
      matchesTime = true;
    }

    let matchesSearch = true;
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      matchesSearch =
        item.category.toLowerCase().includes(q) ||
        (item.notes && item.notes.toLowerCase().includes(q));
    }

    return matchesTime && matchesSearch;
  });
}

function applyFilterAndRender() {
  const filteredData = getFilteredData();

  const totalAmount = filteredData.reduce((sum, item) => sum + item.amount, 0);
  const totalCount = filteredData.length;
  const avgAmount = totalCount > 0 ? Math.round(totalAmount / totalCount) : 0;

  const categoryTotals = {};
  filteredData.forEach((item) => {
    categoryTotals[item.category] = (categoryTotals[item.category] || 0) + item.amount;
  });

  let topCategoryName = "-";
  let topCategoryMax = 0;
  for (const [cat, val] of Object.entries(categoryTotals)) {
    if (val > topCategoryMax) {
      topCategoryMax = val;
      topCategoryName = cat;
    }
  }

  totalAmountEl.textContent = formatIDR(totalAmount);
  transactionCountLabel.textContent = `${totalCount} transaksi tercatat`;
  avgAmountEl.textContent = formatIDR(avgAmount);
  topCategoryEl.textContent = topCategoryName !== "-" ? `${topCategoryName} (${formatIDR(topCategoryMax)})` : "-";

  const filterLabels = {
    today: "Hari Ini",
    week: "Minggu Ini",
    month: "Bulan Ini",
    year: "Tahun Ini",
    all: "Semua Waktu"
  };
  activeFilterBadge.textContent = filterLabels[currentFilter];
  breakdownPeriodTitle.textContent = filterLabels[currentFilter];

  renderCategoryBreakdown(categoryTotals, totalAmount);
  renderTransactionList(filteredData);
}

function renderCategoryBreakdown(categoryTotals, totalAmount) {
  breakdownListEl.innerHTML = "";
  const categories = Object.keys(categoryTotals);

  if (totalAmount === 0) {
    breakdownListEl.innerHTML = `<p style="font-size: 0.8rem; color: var(--text-muted); text-align: center; padding: 6px 0;">Belum ada data pada filter ini.</p>`;
    return;
  }

  const sortedCategories = categories
    .filter(cat => categoryTotals[cat] > 0)
    .sort((a, b) => (categoryTotals[b] || 0) - (categoryTotals[a] || 0));

  sortedCategories.forEach(cat => {
    const amount = categoryTotals[cat] || 0;
    const percentage = ((amount / totalAmount) * 100).toFixed(1);
    const meta = CATEGORY_META[cat] || { icon: "📦", color: "#8b5cf6" };

    const itemEl = document.createElement("div");
    itemEl.className = "breakdown-item";
    itemEl.innerHTML = `
      <div class="breakdown-meta">
        <span>${meta.icon} ${escapeHTML(cat)} (${percentage}%)</span>
        <span style="color: ${meta.color};">${formatIDR(amount)}</span>
      </div>
      <div class="breakdown-bar-bg">
        <div class="breakdown-bar-fill" style="width: ${percentage}%; background-color: ${meta.color};"></div>
      </div>
    `;
    breakdownListEl.appendChild(itemEl);
  });
}

function renderTransactionList(transactions) {
  expenseItemsContainer.innerHTML = "";

  if (transactions.length === 0) {
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");

  transactions.forEach((item) => {
    const meta = CATEGORY_META[item.category] || { icon: "📦", tagClass: "cat-lainnya", color: "#8b5cf6" };
    const el = document.createElement("div");
    el.className = "expense-item";
    el.innerHTML = `
      <div class="item-left">
        <div class="category-icon-pill" style="background: rgba(255,255,255,0.06); border: 1px solid ${meta.color}40;">
          ${meta.icon}
        </div>
        <div class="item-details">
          <div class="item-title">
            <span>${escapeHTML(item.category)}</span>
            <span class="item-category-tag" style="background: ${meta.color}20; color: ${meta.color};">${escapeHTML(item.category)}</span>
          </div>
          ${item.notes ? `<span class="item-note">${escapeHTML(item.notes)}</span>` : ""}
          <span class="item-date"><i data-lucide="calendar" style="width:12px; height:12px; display:inline-block; vertical-align:middle;"></i> ${formatDisplayDate(item.date)}</span>
        </div>
      </div>
      <div class="item-right">
        <span class="item-amount">- ${formatIDR(item.amount)}</span>
        <button class="btn-item-delete" data-id="${item.id}" title="Hapus Pengeluaran" aria-label="Hapus">
          <i data-lucide="trash-2"></i>
        </button>
      </div>
    `;

    el.querySelector(".btn-item-delete").addEventListener("click", () => {
      openDeleteModal(item.id);
    });

    expenseItemsContainer.appendChild(el);
  });

  if (window.lucide) window.lucide.createIcons();
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

// ==================== FILTER EVENT HANDLERS ====================

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.getAttribute("data-period");
    applyFilterAndRender();
  });
});

searchInput.addEventListener("input", (e) => {
  searchQuery = e.target.value;
  applyFilterAndRender();
});

// ==================== MODAL & TRANSACTION INPUT ====================

function toggleCustomCategory() {
  const isOther = expenseCategoryInput.value === "Lainnya";
  customCategoryGroup.classList.toggle("hidden", !isOther);
  customCategoryInput.required = isOther;
  if (isOther) customCategoryInput.focus();
}

expenseCategoryInput.addEventListener("change", toggleCustomCategory);

function openExpenseModal() {
  expenseForm.reset();
  toggleCustomCategory();
  resetDatePicker();
  amountFormattedHint.textContent = "Masukkan jumlah rupiah";
  expenseModal.classList.remove("hidden");
  expenseAmountInput.focus();
}

function closeExpenseModal() {
  expenseModal.classList.add("hidden");
}

btnOpenModal.addEventListener("click", openExpenseModal);
fabAdd.addEventListener("click", openExpenseModal);
btnCloseModal.addEventListener("click", closeExpenseModal);
btnCancelModal.addEventListener("click", closeExpenseModal);

expenseModal.addEventListener("click", (e) => {
  if (e.target === expenseModal) closeExpenseModal();
});

expenseAmountInput.addEventListener("input", (e) => {
  const rawValue = e.target.value.replace(/\D/g, "");
  if (!rawValue) {
    e.target.value = "";
    amountFormattedHint.textContent = "Masukkan jumlah rupiah";
    return;
  }
  const numericValue = parseInt(rawValue, 10);
  e.target.value = new Intl.NumberFormat("id-ID").format(numericValue);
  amountFormattedHint.textContent = `Terbaca: ${formatIDR(numericValue)}`;
});

expenseForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!currentUser) return;

  const rawAmount = expenseAmountInput.value.replace(/\D/g, "");
  const amount = parseInt(rawAmount, 10);
  let category = expenseCategoryInput.value;
  const date = expenseDateInput.value;
  const notes = expenseNotesInput.value.trim();
  const saveBtn = document.getElementById("btn-save-expense");

  if (!amount || amount <= 0) {
    showToast("Nominal pengeluaran harus lebih dari Rp 0", "error");
    expenseAmountInput.focus();
    return;
  }

  if (!category) {
    showToast("Silakan pilih kategori pengeluaran", "error");
    expenseCategoryInput.focus();
    return;
  }

  if (category === "Lainnya") {
    const custom = customCategoryInput.value.trim().replace(/\s+/g, " ").slice(0, 30);
    if (!custom) {
      showToast("Tulis kategori pengeluaranmu", "error");
      customCategoryInput.focus();
      return;
    }
    // Jika sama dengan kategori bawaan (mis. "makan"), pakai nama bakunya
    const builtIn = Object.keys(CATEGORY_META).find(
      (k) => k !== "Lainnya" && k.toLowerCase() === custom.toLowerCase()
    );
    category = builtIn || custom;
  }

  if (!date) {
    showToast("Silakan pilih tanggal transaksi", "error");
    return;
  }

  const resetSaveBtn = () => {
    saveBtn.disabled = false;
    saveBtn.innerHTML = `<i data-lucide="check"></i><span>Simpan Transaksi</span>`;
    if (window.lucide) window.lucide.createIcons();
  };

  saveBtn.disabled = true;
  saveBtn.innerHTML = `<span>Menyimpan...</span>`;

  try {
    const userExpensesRef = collection(db, "users", currentUser.uid, "expenses");

    // Batas waktu 10 detik supaya tombol tidak menggantung selamanya
    // (biasanya terjadi jika Firestore belum dibuat / koneksi terblokir).
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("TIMEOUT")), 10000)
    );

    await Promise.race([
      addDoc(userExpensesRef, {
        amount: Number(amount),
        category: category,
        date: date,
        notes: notes,
        createdAt: serverTimestamp()
      }),
      timeout
    ]);

    showToast("Pengeluaran berhasil dicatat!", "success");
    closeExpenseModal();
  } catch (err) {
    console.error("Save Error:", err);
    if (err.message === "TIMEOUT") {
      showToast("Server tidak merespons. Periksa koneksi internet atau pengaturan Firestore (database & rules).", "error");
    } else if (err.code === "permission-denied") {
      showToast("Akses ditolak oleh Firestore Rules. Periksa aturan keamanan database.", "error");
    } else {
      showToast("Gagal menyimpan transaksi: " + err.message, "error");
    }
  } finally {
    resetSaveBtn();
  }
});

// ==================== DELETE MODAL HANDLERS ====================

function openDeleteModal(docId) {
  itemToDeleteId = docId;
  deleteModal.classList.remove("hidden");
}

function closeDeleteModal() {
  itemToDeleteId = null;
  deleteModal.classList.add("hidden");
}

btnCancelDelete.addEventListener("click", closeDeleteModal);
deleteModal.addEventListener("click", (e) => {
  if (e.target === deleteModal) closeDeleteModal();
});

btnConfirmDelete.addEventListener("click", async () => {
  if (!currentUser || !itemToDeleteId) return;

  try {
    btnConfirmDelete.disabled = true;
    btnConfirmDelete.innerHTML = `<span>Menghapus...</span>`;

    const docRef = doc(db, "users", currentUser.uid, "expenses", itemToDeleteId);
    await deleteDoc(docRef);

    showToast("Catatan pengeluaran berhasil dihapus.", "info");
    closeDeleteModal();
  } catch (err) {
    console.error("Delete Error:", err);
    showToast("Gagal menghapus: " + err.message, "error");
  } finally {
    btnConfirmDelete.disabled = false;
    btnConfirmDelete.innerHTML = `<i data-lucide="trash-2"></i> Hapus`;
    if (window.lucide) window.lucide.createIcons();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  if (window.lucide) window.lucide.createIcons();
  resetDatePicker();
});

// ==================== PWA: SERVICE WORKER ====================
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch((err) => console.warn("SW gagal didaftarkan:", err));
  });
}
