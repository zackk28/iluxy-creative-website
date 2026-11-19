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

## 🔑 Akun Uji Coba Demo Sidang (Demo Accounts)

Untuk pengujian lancar pada saat demonstrasi sidang skripsi / proyek akhir:

| Peran (Role) | Email Login | Password | Hak Akses Utama |
|:---|:---|:---|:---|
| **Studio Administrator** | `admin@iluxycreative.com` | `Admin123!` | `/admin/dashboard`, verifikasi DP, kru foto, upload watermark, analitik omzet |
| **Klien Terdaftar** | `klien@iluxycreative.com` | `Klien123!` | `/dashboard`, booking slot, invoice digital, private gallery PIN, proofing |
| **Akses Galeri Privat** | Slug: `/galeri/wedding-siti-fajar` | **PIN**: `123456` | Gerbang PIN 6-digit, kurasi album, gated master ZIP download |

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

### [25 - 27 November 2026] - Private Gallery, Proofing Album, Watermark Engine & Analitik Omzet (Sprint 4: PBI-15 s/d PBI-20 - 100% TUNTAS)
* `feat`: Implementasi gerbang otorisasi Private Gallery berbasis PIN 6-digit dengan animasi OTP shake di `app/galeri/[slug]/page.jsx`, `components/gallery/PinGateModal.jsx`, dan `lib/actions/gallery.js` (PBI-16 / FR-09).
* `feat`: Pembuatan tampilan Masonry Pinterest-style galeri foto ber-watermark dengan responsive multi-column layout, lightbox zoom layar penuh, dan status kurasi (PBI-16 / FR-09).
* `feat`: Implementasi fitur kurasi proofing foto album cetak dengan batas kuota kupon paket, input catatan retouch personal, dan tombol finalisasi kurasi terkunci (PBI-17 / FR-10).
* `feat`: Pembuatan mesin unduh Gated Master ZIP beresolusi tinggi dengan syarat mutlak invoice lunas 100% dan expiring token keamanan 48 jam di `components/gallery/GalleryMasonryView.jsx` (PBI-18 / FR-11).
* `feat`: Pembuatan modul admin Mass Upload & Auto-Watermark Engine di `app/admin/galeri/page.jsx` dan `components/admin/AdminGalleryManagerClient.jsx` dengan burning watermark otomatis via HTML5 Canvas (PBI-15 / FR-16).
* `feat`: Implementasi dashboard analitik omzet studio dengan visualisasi grafik interaktif Recharts (`AdminAnalyticsChart.jsx`) dan pemantauan paket terlaris di `app/admin/dashboard/page.jsx` (PBI-19 / FR-17).
* `feat`: Pembuatan direktori database pelanggan di `app/admin/pelanggan/page.jsx` dan `components/admin/AdminCustomersClient.jsx` dengan integrasi tautan WhatsApp 1-klik dan riwayat nominal transaksi (PBI-19 / FR-03 & FR-13).
* `feat`: Pembuatan halaman portal pencarian galeri privat publik di `app/galeri-privat/page.jsx` dan `components/gallery/PrivateGalleryEntryClient.jsx` (FR-09).
* `test`: Pengujian penetrasi keamanan 17 FR (anti-tampering, IDOR prevention, SQL injection sanitization, MIME-type enforcement), database seed script `demo_seed.sql`, dan verifikasi build produksi lolos 100% (`npm run build` sukses 18/18 rute) (PBI-20).

### [21 November 2026] - Booking Engine, Anti Double-Booking & Invoicing Finansial (Sprint 3: PBI-09 s/d PBI-14)
* `feat`: Implementasi kalender anti-bentrok `components/booking/BookingCalendar.jsx` terhubung ke Stored Procedure PostgreSQL `check_slot_availability(p_date, p_start, p_end)`.
* `feat`: Pembuatan multi-step booking wizard di `app/booking/page.jsx` dan `components/booking/BookingWizardClient.jsx` (tahapan: Paket, Tanggal/Jam, Lokasi Studio/Outdoor, Kontak Pemesan, Ringkasan Biaya & Kebijakan H-3).
* `feat`: Pembuatan Server Action transaksi pemesanan di `lib/actions/booking.js` dengan kalkulasi harga server-side anti-tampering, generator kode booking `IX-YYYYMMDD-XXXX`, dan invoice `INV-YYYYMMDD-XXXX`.
* `feat`: Implementasi riwayat pesanan klien di `components/dashboard/ClientBookingsList.jsx` terintegrasi langsung ke `app/dashboard/page.jsx` dengan tombol pembatalan mandiri beraturan H-3 `(session_date - NOW() >= 3 hari)`.
* `feat`: Pembuatan mesin digital invoicing di `app/invoice/[id]/page.jsx` dan `components/invoice/InvoiceDetailClient.jsx` dengan rincian DP, sisa tagihan, batas bayar 24 jam, fitur salin nomor rekening bank studio (Bank Nagari & BCA), dan opsi cetak invoice.
* `feat`: Implementasi modal dropzone bukti transfer di `components/payment/PaymentUploadModal.jsx` dan Server Action upload di `lib/actions/payments.js` dengan validasi MIME-type gambar dan batas file 5 MB.
* `feat`: Pembuatan modul admin verifikasi pembayaran dan penugasan kru fotografer di `app/admin/verifikasi/page.jsx` dan `components/admin/AdminVerificationClient.jsx` (pratinjau struk full-screen, aksi verifikasi sah/tolak, dan manajemen kru di `lib/actions/crew.js`).

### [20 November 2026] - Detail Spesifikasi Paket & Dashboard Admin CRUD Layanan (Sprint 08)
* `feat`: Implementasi halaman spesifikasi paket dinamis di `app/katalog/[slug]/page.jsx` dengan breadcrumbs navigasi, breakdown DP vs pelunasan, fasilitas output foto, dan klausul kebijakan pembatalan H-3.
* `feat`: Pembuatan dashboard admin kelola paket di `app/admin/paket/page.jsx` dan komponen `components/admin/AdminPackagesClient.jsx` (modal formulir tambah/edit, toggle status aktif, dan proteksi soft-delete).
* `feat`: Pembuatan Server Actions di `lib/actions/packages.js` dengan verifikasi hak akses role `ADMIN` dan validasi server-side constraint harga (`price > 0`, `dp_amount > 0`).
* `fix`: Optimalisasi Next.js 16 Partial Prerendering (PPR) dengan pembungkusan komponen client navigasi (`DesktopNavbar`, `MobileBottomBar`) ke dalam batas `<Suspense>`.

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
