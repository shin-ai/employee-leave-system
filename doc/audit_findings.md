# Audit Temuan & Rekomendasi Perbaikan

Hasil audit lengkap dari seluruh codebase Employee Leave System.

---

## 🐛 Bug / Data Integrity Issues

### 1. Hapus Employee Tidak Membersihkan Leave Request-nya
**File:** `src/services/employee-storage.ts` → `deleteEmployee()`
**Masalah:** Saat Admin menghapus seorang Employee, leave request milik employee tersebut **tetap ada** di sistem. Ini menyebabkan:
- Tabel Leave Request menampilkan "Unknown Employee"
- Dashboard statistik menjadi tidak akurat
- Calendar menampilkan nama yang sudah tidak ada

**Solusi:** Cascade delete — hapus juga semua leave request milik employee yang dihapus.

---

### 2. Duplikasi Pengajuan Cuti di Tanggal yang Sama
**File:** `src/services/leave-storage.ts` → `createLeaveRequest()`
**Masalah:** Employee bisa mengajukan cuti **beberapa kali** untuk tanggal yang sama. Tidak ada validasi overlap untuk diri sendiri.

**Solusi:** Tambahkan pengecekan — jika employee sudah punya leave request (PENDING atau APPROVED) di tanggal yang bersinggungan, tolak pengajuan baru.

---

### 3. Admin Bisa Menghapus Dirinya Sendiri
**File:** `src/components/employee/EmployeeTable.tsx`
**Masalah:** Tombol Delete tetap muncul untuk akun Admin yang sedang login. Jika Admin menghapus dirinya sendiri, sesi menjadi invalid dan aplikasi error.

**Solusi:** Sembunyikan/disable tombol Delete untuk employee yang sedang login.

---

## 🔧 Fitur yang Bisa Diperbaiki

### 4. Employee Tidak Bisa Cancel Cuti Sendiri
**Masalah:** Setelah submit, Employee tidak punya cara untuk **membatalkan** leave request yang masih berstatus PENDING.

**Solusi:** Tambahkan tombol "Cancel" di tabel Leave Request untuk status PENDING milik Employee sendiri.

---

### 5. Link Calendar Tidak Ada di Navbar
**File:** `src/components/shared/Navbar.tsx`
**Masalah:** Halaman `/leave/calendar` sudah ada, tapi tidak ada link navigasinya di Navbar. User hanya bisa mengaksesnya melalui tombol di halaman Leave list.

**Solusi:** Tambahkan sub-link "Calendar" di bawah "Leave Requests" di Navbar, atau tambahkan sebagai item navigasi terpisah.

---

### 6. Route Calendar Belum Ada di Constants
**File:** `src/constants/index.ts`
**Masalah:** `ROUTES.LEAVE_CALENDAR` belum didefinisikan, padahal halaman `/leave/calendar` sudah ada. Juga route `/profile` belum ada.

**Solusi:** Tambahkan `LEAVE_CALENDAR: "/leave/calendar"` dan `PROFILE: "/profile"` ke constants.

---

### 7. Dashboard Employee View Kurang Informatif
**File:** `src/components/dashboard/DashboardGrid.tsx`
**Masalah:** Saat login sebagai Employee (bukan Admin), Dashboard hanya menampilkan 3 angka statistik (Pending/Approved/Rejected) **tanpa** info sisa cuti dan chart. Kurang berguna.

**Solusi:** Untuk Employee view, tampilkan juga:
- Card **Sisa Cuti** (Leave Balance)
- List **Cuti Saya yang Mendatang** (upcoming leaves)

---

### 8. Profile Page Tidak Ada Link di Navigation Mobile
**File:** `src/components/shared/Navbar.tsx`  
**Status:** ✅ Sudah ada di mobile menu, tapi sebaiknya posisinya lebih jelas (bukan hanya ikon di desktop).

---

## 🆕 Fitur yang Bisa Ditambahkan

### 9. Notifikasi Badge untuk Pending Requests
**Masalah:** Admin tidak tahu ada berapa leave request baru yang menunggu persetujuan tanpa membuka halaman Leave Requests.

**Solusi:** Tambahkan badge angka di ikon "Leave Requests" di Navbar yang menampilkan jumlah PENDING.

---

### 10. Riwayat Cuti di Halaman Detail Employee
**Masalah:** Saat ini tidak ada cara melihat riwayat cuti lengkap per karyawan. Admin harus filter manual di tabel.

**Solusi:** Klik nama Employee di tabel → halaman detail menampilkan profil + riwayat cuti mereka.

---

### 11. Konfirmasi Sebelum Meninggalkan Form yang Belum Disimpan
**Masalah:** Jika user sedang mengisi form (Employee/Leave) lalu menekan Back atau navigasi ke halaman lain, data yang sudah diisi **hilang** tanpa peringatan.

**Solusi:** Tambahkan `beforeunload` event atau React Router prompt untuk memperingatkan user.

---

### 12. Data Export/Import (Backup & Restore)
**Masalah:** Semua data ada di LocalStorage browser. Jika user clear browser data, **semua hilang** tanpa backup.

**Solusi:** Tombol "Export Data" (download seluruh LocalStorage sebagai JSON) dan "Import Data" (restore dari file JSON) di halaman Settings/Profile.

---

## 📊 Ringkasan Prioritas

| # | Temuan | Tipe | Prioritas |
|---|--------|------|-----------|
| 1 | Cascade delete leave saat hapus employee | 🐛 Bug | **Tinggi** |
| 2 | Cegah duplikasi cuti di tanggal yang sama | 🐛 Bug | **Tinggi** |
| 3 | Cegah admin hapus diri sendiri | 🐛 Bug | **Tinggi** |
| 4 | Employee bisa cancel cuti PENDING sendiri | 🔧 Perbaikan | **Tinggi** |
| 5 | Link Calendar di Navbar | 🔧 Perbaikan | **Sedang** |
| 6 | Tambah route constants | 🔧 Perbaikan | **Sedang** |
| 7 | Dashboard Employee: sisa cuti + upcoming leaves | 🔧 Perbaikan | **Sedang** |
| 8 | Profile link lebih visible | 🔧 Perbaikan | **Rendah** |
| 9 | Notifikasi badge PENDING | 🆕 Fitur Baru | **Sedang** |
| 10 | Riwayat cuti per employee | 🆕 Fitur Baru | **Rendah** |
| 11 | Konfirmasi unsaved form | 🆕 Fitur Baru | **Rendah** |
| 12 | Data export/import backup | 🆕 Fitur Baru | **Rendah** |

---

Silakan klik **Proceed** jika ingin saya mengeksekusi perbaikan mulai dari prioritas **Tinggi** (Bug fixes #1-4) terlebih dahulu!
