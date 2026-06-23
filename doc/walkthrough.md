# System Walkthrough: Employee Leave Management System

Aplikasi Manajemen Cuti Karyawan telah di-*upgrade* secara masif untuk memenuhi standar industri riil, dengan dukungan keamanan (RBAC), kenyamanan pengguna, dan skalabilitas data. Berikut adalah panduan arsitektur dan fitur terbaru.

## 🚀 Fitur Baru & Peningkatan

### 1. 🛡️ Keamanan & Role-Based Access Control (RBAC)
Sistem sekarang memiliki dua jenis Role yang ketat: **ADMIN** dan **EMPLOYEE**.
*   **Akses Admin**:
    *   Bisa mengakses seluruh menu, termasuk pengelolaan Employee (`/employees`).
    *   Bisa menyetujui (`Approve`) atau menolak (`Reject`) cuti dari seluruh karyawan.
    *   Melihat *Dashboard Overview* yang menampilkan grafik komposisi status cuti.
*   **Akses Employee**:
    *   Hanya bisa melihat halamannya sendiri (`/profile` dan `/leave`).
    *   Jika mencoba mengakses halaman Admin, akan langsung di-redirect (dilindungi oleh `AuthGuard`).
    *   Hanya bisa mengajukan cuti atas namanya sendiri.

> **Data Login Simulasi:** Saat pertama kali dijalankan, sistem akan membuatkan satu akun Admin default:
> *   **Email:** `admin@company.com`
> *   **Password:** `password123` *(Semua password simulasi ini dapat digunakan untuk login)*

### 2. 📅 Kalender Cuti (Calendar View)
Menambahkan halaman baru `/leave/calendar` yang menyediakan tampilan kalender per bulan.
*   Hanya menampilkan cuti yang berstatus **APPROVED**.
*   Admin dapat dengan mudah melihat siapa saja yang sedang tidak ada di kantor pada tanggal-tanggal tertentu, sangat berguna untuk mencegah bentrokan jadwal cuti.

### 3. 📊 Dashboard Admin & Data Visualisasi
Dashboard `/dashboard` sekarang terintegrasi dengan **Recharts** untuk visualisasi data interaktif:
*   **Bar Chart**: Menampilkan perbandingan jumlah cuti Pending, Approved, dan Rejected.
*   **Pie Chart**: Menampilkan distribusi tipe cuti (Annual, Sick, Unpaid, dsb).

### 4. 🗃️ Fitur Export CSV
Pada halaman `/employees` dan `/leave`, telah ditambahkan tombol **Export CSV**. Manajemen kini bisa mendownload data langsung dalam format spreadsheet (`.csv`) hanya dengan satu klik.

### 5. 🌗 UX: Dark Mode / Light Mode
Aplikasi ini sudah sepenuhnya mendukung Mode Gelap. Pengguna bisa mengganti tema melalui *Theme Toggle* berikon matahari/bulan yang terletak di navigasi atas.

### 6. 💼 Saldo Cuti & Tipe Cuti
Setiap karyawan sekarang memiliki **Leave Balance** (Saldo Cuti), default 12 hari/tahun.
*   Tersedia berbagai jenis cuti: `Annual`, `Sick`, `Maternity`, `Unpaid`, `Important`.
*   Jika cuti bertipe `Annual` disetujui (Approved), saldo cuti karyawan akan **berkurang otomatis** sesuai durasi hari cuti.

### 7. 👤 Profile Page
Halaman `/profile` memungkinkan pengguna melihat informasi pribadi mereka dan visualisasi sisa *Leave Balance* mereka dalam bentuk grafik lingkar.

---

## 🛠️ Arsitektur Keamanan Tambahan
*   **Content Security Policy (CSP)**: Sudah dikonfigurasikan di `next.config.ts` bersama dengan header keamanan lainnya (X-Frame-Options, Referrer-Policy).
*   **XSS Protection**: Semua input pada kolom "Reason" di *Leave Request* disanitasi menggunakan `DOMPurify` sebelum disimpan, mencegah injeksi skrip berbahaya (XSS).
*   **Strict TypeScript**: Kode sudah *fully-typed* dan tidak lagi menggunakan tipe `any`, meminimalisir potensi runtime error.

## 🏃 Cara Menjalankan

Masuk ke folder project dan mulai server dev:
```bash
cd employee-leave-system
npm run dev
```

Buka `http://localhost:3000` di browser Anda. Semua state disimpan dengan aman di LocalStorage browser Anda.
