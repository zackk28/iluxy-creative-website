# Iluxy Creative — Sistem Informasi Booking & Private Gallery Web

Sistem Informasi Pemesanan Jasa Fotografi, Videografi, dan Manajemen Private Gallery Berbasis Web pada **Iluxy Creative Padang**.

Dikembangkan sebagai Proyek Perangkat Lunak Terintegrasi (D4 Teknologi Rekayasa Perangkat Lunak, Jurusan Teknologi Informasi, Politeknik Negeri Padang).

---

## 🛠️ Tech Stack & Arsitektur

* **Framework**: [Next.js](https://nextjs.org) (App Router, JavaScript/JSX)
* **Styling & UI**: [Tailwind CSS](https://tailwindcss.com), [Framer Motion](https://www.framer.com/motion/) (Micro-interactions & Animasi), [Lucide React](https://lucide.dev)
* **Backend as a Service (BaaS)**: [Supabase](https://supabase.com) (PostgreSQL 3NF, Row-Level Security / RLS, Auth, Storage Buckets)
* **Visualisasi & Utility**: [Recharts](https://recharts.org), `canvas-confetti`, `browser-image-compression`

---

## 🚀 Memulai Proyek (Getting Started)

### 1. Prasyarat
Pastikan telah menginstal [Node.js](https://nodejs.org/) (versi LTS yang direkomendasikan).

### 2. Instalasi Dependensi
Jalankan perintah instalasi paket:
```bash
npm install
```

### 3. Konfigurasi Environment
Pastikan file `.env.local` telah terisi kredensial Supabase proyek:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Menjalankan Server Pengembangan
```bash
npm run dev
```
Buka browser di [http://localhost:3000](http://localhost:3000) untuk melihat aplikasi berjalan.

---

## 📌 Standar Konvensi Pesan Commit (Git Commit Conventions)

Setiap pengembang yang berkontribusi pada repositori ini **wajib** menggunakan format pesan commit terstandarisasi untuk mempermudah pelacakan histori, review kode, dan audit sprint:

### Format Penulisan:
```
<kategori>: <indikasi pesan commit / dampak>
```

### Tabel Klasifikasi Kategori:

| Kategori | Indikasi Pesan Commit / Dampak |
| :--- | :--- |
| **`feat`** | Penambahan fitur baru |
| **`fix`** | Perbaikan bug |
| **`refactor`** | Perubahan struktur tanpa ubah fungsi |
| **`docs`** | Perubahan dokumentasi |
| **`test`** | Tambahan / modifikasi testing |
| **`chore`** | Pembaruan minor (config, dependensi, dsb.) |

### Contoh Penggunaan:
```bash
git commit -m "feat: Membuat halaman login"
git commit -m "fix: Memperbaiki error pada view dashboard"
git commit -m "feat: Menambahkan animasi sliding hover dan cursor spotlight pada DesktopNavbar"
git commit -m "docs: Update sprint planning dan panduan commit convention"
git commit -m "chore: Konfigurasi Tailwind CSS dan update package-lock"
```

---

## 📋 Log Riwayat Pembaruan Proyek (Changelog / Update Log)

> [!TIP]
> **Petunjuk Update**: Setiap kali melakukan push atau menyelesaikan sprint/fitur baru, tambahkan catatan perubahan di bagian paling atas riwayat di bawah ini menggunakan kategori commit yang relevan (`feat`, `fix`, `refactor`, `docs`, `test`, `chore`).

### [20 November 2026] - Showcase Katalog Publik & Filter Kategori Dinamis (Sprint 07)
* `feat`: Implementasi halaman katalog publik di `app/katalog/page.jsx` terintegrasi langsung dengan Supabase PostgreSQL.
* `feat`: Pembuatan komponen `components/katalog/KatalogView.jsx` dengan fitur live search kata kunci, tab filter kategori dinamis, dan sorting harga/durasi.
* `feat`: Tampilan kartu paket fotografi interaktif (`InteractiveCard`) dengan efek 3D tilt kursor, spesifikasi jam sesi, kuota retouch, dan breakdown DP.
* `feat`: Penambahan empty state responsif saat paket tidak ditemukan dan banner direct konsultasi WhatsApp studio.

### [15 November 2026] - Autentikasi Multi-Role & Route Middleware (Sprint 06)
* `feat`: Implementasi autentikasi Supabase multi-role (Klien vs Admin) dan helper server action di `lib/actions/auth.js`.
* `feat`: Pembuatan halaman registrasi klien baru di `app/register/page.jsx` dengan validasi nomor WhatsApp dan konfirmasi kata sandi.
* `feat`: Pembuatan halaman login multi-role di `app/login/page.jsx` dengan preset demo instan (Klien/Admin) untuk kebutuhan sidang.
* `feat`: Implementasi `middleware.js` & `lib/supabase/middleware.js` untuk proteksi rute otomatis (`/admin/*` dan `/dashboard/*`) berbasis JWT token.
* `feat`: Pembuatan antarmuka dashboard klien terproteksi (`app/dashboard/`) dan dashboard studio admin (`app/admin/dashboard/`) sesuai standar Suspense streaming Next.js 16.

### [15 November 2026] - Upgrade Animasi Navigasi & Standarisasi Git
* `feat`: Menambahkan animasi magnetic sliding hover pill (`layoutId="navbar-hover-pill"`) pada `DesktopNavbar.jsx`.
* `feat`: Menambahkan efek real-time cursor spotlight glow mengikuti pergerakan kursor mouse.
* `feat`: Menambahkan animasi mikro pada icon menu (micro-tilt dan hover scale) serta logo avatar `IX`.
* `feat`: Menambahkan continuous shimmer light beam dan efek scale-tap pada tombol "Book Slot".
* `docs`: Mengintegrasikan tabel standar konvensi commit pada `SPRINT_PLANNING_20_ILUXY_CREATIVE.md`.
* `docs`: Memperbarui `README.md` dengan dokumentasi proyek, aturan commit, dan log pembaruan berkala.

### [14 November 2026] - Fondasi Navigasi & Komponen UI (Sprint 03 - 05)
* `feat`: Implementasi `DesktopNavbar.jsx` dengan dynamic scroll morphing (kapsul menciut saat scroll).
* `feat`: Implementasi `MobileBottomBar.jsx` dengan liquid spring blob dan floating action button (FAB).
* `feat`: Pembuatan komponen UI interaktif: `AnimatedButton.jsx`, `InteractiveCard.jsx` (3D tilt), dan `SkeletonShimmer.jsx`.
* `style`: Konfigurasi design tokens Dark Luxury Studio (`#0A0A0E`, aksen amber emas `#F59E0B`, custom scrollbar).

### [13 November 2026] - Setup Basis Data & Fondasi Awal (Sprint 01 - 02)
* `chore`: Inisialisasi proyek Next.js 14 App Router (JavaScript/JSX) dan konfigurasi Tailwind CSS.
* `feat`: Pembuatan skema DDL 11 tabel relasional 3NF, ENUMs, dan Stored Procedure anti-double booking di `supabase_schema.sql`.
* `feat`: Konfigurasi Row-Level Security (RLS) dan 4 bucket penyimpanan Supabase Storage.
* `chore`: Integrasi Supabase client & server helper di `lib/supabase/`.
