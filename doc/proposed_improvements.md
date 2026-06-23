# Proposed Improvements & Enhancements
*Sistem Manajemen Cuti Karyawan*

Berdasarkan analisis kebutuhan user dan manajemen, serta standar keamanan (best practices/DAST), berikut adalah usulan fitur tambahan dan perbaikan untuk aplikasi ini. **Silakan review usulan di bawah ini.** Anda dapat menyetujui seluruhnya, atau memilih bagian mana saja yang ingin diimplementasikan.

---

## 1. 🛡️ Security & DAST (Keamanan & Best Practices)
Meskipun aplikasi ini menggunakan LocalStorage (tanpa backend), kita dapat menerapkan simulasi keamanan standar industri:
*   **[SECURITY-1] Content Security Policy (CSP) & Security Headers**: Menambahkan header keamanan (XSS Protection, X-Frame-Options, Referrer-Policy) di konfigurasi `next.config.ts` untuk mencegah serangan XSS dan Clickjacking.
*   **[SECURITY-2] Role-Based Access Control (RBAC)**: Memisahkan hak akses menjadi 2 role: `Admin` dan `Employee`.
    *   *Employee* hanya bisa login, melihat profilnya sendiri, dan mengajukan cuti (hanya untuk dirinya).
    *   *Admin* bisa mengelola data semua karyawan dan menyetujui/menolak cuti.
*   **[SECURITY-3] Data Sanitization**: Menerapkan sanitasi input (misalnya pada field "Reason" di pengajuan cuti) menggunakan DOMPurify untuk perlindungan XSS.
*   **[SECURITY-4] Session Expiration**: Menambahkan waktu kedaluwarsa (expiry) pada sesi login di LocalStorage, sehingga user akan auto-logout jika sesi sudah terlalu lama.

## 2. 🚀 Core Features (Kebutuhan Management & User)
Penambahan fitur yang sangat berguna untuk operasional HR/Manajemen:
*   **[FEATURE-1] Leave Quota / Saldo Cuti**: Menambahkan sistem kuota cuti tahunan (misal: 12 hari/tahun) per karyawan. Pengajuan cuti akan divalidasi dengan sisa saldo. Jika disetujui, saldo akan berkurang.
*   **[FEATURE-2] Leave Types (Jenis Cuti)**: Menambahkan jenis cuti (Cuti Tahunan, Sakit, Melahirkan, Cuti Penting) di form pengajuan.
*   **[FEATURE-3] Export to CSV/Excel**: Menambahkan tombol "Export" di halaman list Karyawan dan list Cuti agar manajemen bisa mendownload laporan untuk direview.
*   **[FEATURE-4] Calendar View**: Menambahkan visualisasi berupa **Kalender** untuk melihat jadwal karyawan yang sedang cuti secara timeline.

## 3. 🎨 UX/UI & Utility Improvements
Perbaikan tampilan dan kenyamanan penggunaan:
*   **[UI-1] Dark Mode / Light Mode**: Mengintegrasikan `next-themes` untuk mendukung mode gelap/terang.
*   **[UI-2] Charts/Data Visualization**: Menambahkan grafik (Chart) di Dashboard menggunakan *Recharts* (misal: grafik status cuti atau trend per bulan).
*   **[UI-3] Sorting & Pagination**: Menambahkan fitur sorting dan pagination pada tabel Karyawan dan Cuti agar tetap rapi saat data bertambah banyak.
*   **[UI-4] Profile Page**: Halaman khusus untuk user yang sedang login agar dapat melihat detail dan sisa kuota cutinya.

---

## 📝 Keputusan Anda (Review Required)

Mohon berikan feedback Anda. Apakah Anda ingin:
1. **Mengeksekusi semua usulan** di atas?
2. **Mengeksekusi sebagian saja**? (Sebutkan kode/fitur mana saja, misal: *Terapkan Security-1, Security-2, dan Feature-1 saja*).
3. Jika ada tambahan ide lain yang belum masuk di list ini, silakan beri tahu saya.

> **Rekomendasi:** Untuk tahap awal, saya sangat merekomendasikan mengutamakan penerapan **RBAC (Security-2)**, **Saldo Cuti (Feature-1)**, dan **Export CSV (Feature-3)** karena fitur-fitur ini memberikan value bisnis yang langsung terasa.
