# MASTER SPRINT PLANNING & STATUS TRACKER (20 MICRO-SPRINTS / 14 HARI)
## Sistem Informasi Pemesanan Jasa Fotografi & Manajemen Private Gallery Web
### Objek Studi: Iluxy Creative Padang
* **Pengembang / Mahasiswa**: Zackri Kurnia Amri (NIM: 2411082023)  
* **Program Studi**: D4 Teknologi Rekayasa Perangkat Lunak (TRPL), Jurusan TI, Politeknik Negeri Padang  
* **Dosen Pengampu**: Dwiny Meidelfi, S.KOM., M.CS. & Nurraudya Tuz Zahra, S.SI., M.C.S.(AI)  
* **Tumpukan Teknologi**: **Next.js 14 (JavaScript Murni / JSX)** + **React.js** + **Supabase (PostgreSQL, Auth, Storage, RLS)** + Tailwind CSS + Framer Motion  
* **Lokasi Source Code**: Folder `web/`  
* **Timeline Eksekusi**: **Akselerasi 2 Minggu (14 Hari: 13 November 2026 – 27 November 2026)**  

---

## 📊 DASHBOARD STATUS SPRINT (LIVE PROGRESS TRACKER)

| No | Sprint ID | Target Modul & Fitur | Hari | Bobot | Status | Nama Komentar Commit (Git) |
|:---:|:---|:---|:---:|:---:|:---:|:---|
| **01** | **Sprint 01** | Setup Next.js 14 JS, Tailwind & Supabase SDK | H-1 | 8 SP | 🟢 SELESAI | `chore: inisialisasi nextjs 14, tailwindcss dan supabase sdk` |
| **02** | **Sprint 02** | Skema 11 Tabel Relasional, RLS & Storage | H-1 | 13 SP | 🟢 SELESAI | `feat: implementasi ddl 11 tabel relasional 3nf, rls dan storage bucket` |
| **03** | **Sprint 03** | Design Tokens, Button Anim, 3D Card & Shimmer | H-2 | 13 SP | 🟢 SELESAI | `feat: implementasi design system dark luxury dan komponen micro interactions` |
| **04** | **Sprint 04** | Desktop Floating Pill Navbar (Scroll & Hover) | H-3 | 8 SP | 🟢 SELESAI | `feat: implementasi desktop floating pill navbar dengan dynamic scroll dan hover animation` |
| **05** | **Sprint 05** | Mobile Bottom Tab Bar, Liquid Blob & FAB | H-3 | 8 SP | 🟢 SELESAI | `feat: implementasi mobile bottom tab bar dengan liquid spring blob dan fab` |
| **06** | **Sprint 06** | Multi-Role Auth, Login, Register & Middleware | H-4 | 13 SP | 🎯 SIAP DIGAS | `feat: implementasi autentikasi multi-role registrasi klien dan route middleware` |
| **07** | **Sprint 07** | Katalog Publik, Portofolio & Filter Kategori | H-5 | 8 SP | ⏳ Antrean | `feat: implementasi halaman katalog publik dan filter kategori dinamis` |
| **08** | **Sprint 08** | Detail Paket Layanan & Admin CRUD Layanan | H-5 | 13 SP | ⏳ Antrean | `feat: implementasi detail spesifikasi paket dan dashboard admin crud layanan` |
| **09** | **Sprint 09** | Kalender Slot & PostgreSQL Anti Double-Booking | H-6 | 13 SP | ⏳ Antrean | `feat: implementasi kalender ketersediaan slot dan fungsi anti double booking` |
| **10** | **Sprint 10** | Multi-Step Booking Wizard & Kode Order | H-7 | 13 SP | ⏳ Antrean | `feat: implementasi multi-step booking wizard dan invoice code generator` |
| **11** | **Sprint 11** | Riwayat Booking Klien & Aturan Batal H-3 | H-7 | 8 SP | ⏳ Antrean | `feat: implementasi dashboard riwayat booking klien dan validasi pembatalan h-3` |
| **12** | **Sprint 12** | Digital Invoicing DP/Pelunasan & Salin Rekening | H-8 | 8 SP | ⏳ Antrean | `feat: implementasi digital invoicing engine dp dan pelunasan serta salin rekening` |
| **13** | **Sprint 13** | Dropzone Upload Struk Bukti Transfer | H-9 | 8 SP | ⏳ Antrean | `feat: implementasi dropzone upload bukti transfer dan kompresi gambar` |
| **14** | **Sprint 14** | Admin Verifikasi Pembayaran & Penugasan Kru | H-9 | 13 SP | ⏳ Antrean | `feat: implementasi panel admin verifikasi pembayaran dan penugasan kru fotografer` |
| **15** | **Sprint 15** | Admin Mass Upload & Watermark Hak Cipta | H-10 | 13 SP | ⏳ Antrean | `feat: implementasi chunked mass upload foto galeri dan auto watermark engine` |
| **16** | **Sprint 16** | Gerbang Private Gallery PIN 6-Digit (OTP Shake) | H-11 | 8 SP | ⏳ Antrean | `feat: implementasi gerbang akses private gallery pin 6 digit dan masonry layout` |
| **17** | **Sprint 17** | Kurasi Proofing, Quota Counter & Retouch | H-12 | 13 SP | ⏳ Antrean | `feat: implementasi kurasi foto proofing cetak album dan catatan retouch` |
| **18** | **Sprint 18** | Gated Master ZIP (Syarat Lunas 100%) | H-13 | 13 SP | ⏳ Antrean | `feat: implementasi gated master zip download dengan expiring token 48 jam` |
| **19** | **Sprint 19** | Dashboard Analitik Omzet & Direktori Klien | H-13 | 13 SP | ⏳ Antrean | `feat: implementasi dashboard analitik omzet studio dan direktori pelanggan` |
| **20** | **Sprint 20** | Full Pentest, Testing 17 FR & Kesiapan Sidang | H-14 | 8 SP | ⏳ Antrean | `test: full penetration testing 17 fr, audit lighthouse dan final deployment` |
| **TOTAL** | **20 Sprints** | **17 FR + 11 Tabel + OWASP Defense** | **14 Hari**| **220 SP** | **5 / 20 SELESAI (25%)** | **SIAP LANJUT KE SPRINT 06** |

---

## 2. DETAIL PROGRESS & AUDIT TIAP SPRINT

---

### MINGGU 1: FONDASI, NAVIGASI, KATALOG & BOOKING ENGINE

#### SPRINT 01: Setup Next.js 14 (JavaScript Murni), Tailwind CSS & Supabase SDK
* **Status**: 🟢 **SELESAI & TERVERIFIKASI [x]**
* **Target Waktu**: Hari 1 | **Story Points**: 8 SP
* 💬 **Nama Komentar Commit (Git)**: `git commit -m "chore: inisialisasi nextjs 14, tailwindcss dan supabase sdk"`
* **Bukti Deliverable di Folder `web/`**:
  - [x] Project Next.js 14 App Router (JavaScript murni / JSX) terinisialisasi.
  - [x] Dependensi terpasang di `web/package.json`: `@supabase/supabase-js`, `@supabase/ssr`, `framer-motion`, `lucide-react`, `clsx`, `tailwind-merge`, `recharts`, `browser-image-compression`, `canvas-confetti`.
  - [x] Environment terpasang di `web/.env.local` terhubung ke Supabase project `cpoxikforoqmtyglcbnr`.
  - [x] Client helper Supabase siap pakai di `web/lib/supabase/client.js` dan `web/lib/supabase/server.js`.
  - [x] Helper fungsi formatting IDR & tanggal di `web/lib/utils.js`.
* **🛡️ Hacker Pentest Audit**: Lolos audit isolasi secret key. `SUPABASE_SERVICE_ROLE_KEY` tidak bocor ke client bundle.

---

#### SPRINT 02: DDL 11 Tabel Relasional 3NF, Enums, Indeks & RLS Supabase
* **Status**: 🟢 **SELESAI & TERVERIFIKASI [x]**
* **Target Waktu**: Hari 1 | **Story Points**: 13 SP
* 💬 **Nama Komentar Commit (Git)**: `git commit -m "feat: implementasi ddl 11 tabel relasional 3nf, rls dan storage bucket"`
* **Bukti Deliverable di Folder `web/`**:
  - [x] File DDL basis data fisik PostgreSQL di `web/supabase_schema.sql` (dan di root folder).
  - [x] 6 Custom ENUM: `user_role`, `booking_status`, `invoice_status`, `payment_type`, `payment_status`, `gallery_status`.
  - [x] 11 Tabel Relasional 3NF: `users`, `customers`, `package_categories`, `packages`, `bookings`, `crew_assignments`, `invoices`, `payments`, `galleries`, `media_assets`, `proofing_selections`, `master_downloads`.
  - [x] Stored Procedure: `check_slot_availability(p_date, p_start, p_end)` untuk anti-double booking.
  - [x] 4 Storage Buckets: `payment-proofs`, `gallery-watermarked`, `gallery-originals`, `master-zips`.
  - [x] Row Level Security (RLS) diaktifkan pada seluruh tabel.
* **🛡️ Hacker Pentest Audit**: RLS policies menjamin klien tidak dapat melakukan cross-tenant injection.

---

#### SPRINT 03: Design System, Dark Luxury & Komponen Micro-Interactions (`.jsx`)
* **Status**: 🟢 **SELESAI & TERVERIFIKASI [x]**
* **Target Waktu**: Hari 2 | **Story Points**: 13 SP
* 💬 **Nama Komentar Commit (Git)**: `git commit -m "feat: implementasi design system dark luxury dan komponen micro interactions"`
* **Bukti Deliverable di Folder `web/`**:
  - [x] Palet Dark Luxury Studio (`#0A0A0E`, aksen amber `#F59E0B`, dark scrollbar) terpasang di `web/app/globals.css`.
  - [x] `web/components/ui/AnimatedButton.jsx` (Magnetic hover, tap scale 0.96, spinner morphing).
  - [x] `web/components/ui/InteractiveCard.jsx` (3D tilt tracking mouse kursor & border glow).
  - [x] `web/components/ui/SkeletonShimmer.jsx` (Animasi shimmer gradient & preset card skeleton).
* **🛡️ Hacker Pentest Audit**: Tombol menerapkan DOM disabled saat loading, mencegah spam double-submit.

---

#### SPRINT 04: Desktop Floating Pill Navbar dengan Dynamic Scroll Morphing (`.jsx`)
* **Status**: 🟢 **SELESAI & TERVERIFIKASI [x]**
* **Target Waktu**: Hari 3 | **Story Points**: 8 SP
* 💬 **Nama Komentar Commit (Git)**: `git commit -m "feat: implementasi desktop floating pill navbar dengan dynamic scroll dan hover animation"`
* **Bukti Deliverable di Folder `web/`**:
  - [x] `web/components/shared/DesktopNavbar.jsx` melayang di `top-6` desktop.
  - [x] Efek Frosted Glassmorphism (`backdrop-blur-xl bg-neutral-900/75 border border-white/10`).
  - [x] Dynamic Scroll Morphing: Otomatis menciut menjadi kapsul ringkas saat `window.scrollY > 40px`.
  - [x] Indikator aktif tab pegas Framer Motion (`layoutId="desktop-active-pill"`).
  - [x] Animasi Interaktif Kursor: Magnetic sliding hover pill (`layoutId="navbar-hover-pill"`), micro-tilt ikon, cursor spotlight glow, dan shimmering Book Slot button.
* **🛡️ Hacker Pentest Audit**: Sanitasi link internal native Next.js, aman dari open redirect.

---

#### SPRINT 05: Mobile Bottom Tab Bar, Liquid Spring Blob & Glowing FAB (`.jsx`)
* **Status**: 🟢 **SELESAI & TERVERIFIKASI [x]**
* **Target Waktu**: Hari 3 | **Story Points**: 8 SP
* 💬 **Nama Komentar Commit (Git)**: `git commit -m "feat: implementasi mobile bottom tab bar dengan liquid spring blob dan fab"`
* **Bukti Deliverable di Folder `web/`**:
  - [x] `web/components/shared/MobileBottomBar.jsx` menempel ergonomis di bawah layar ponsel (`bottom-4`).
  - [x] Indikator tab aktif cairan meluncur (*Liquid Spring Blob*).
  - [x] Floating Action Button (FAB) "Book Slot" berdenyut emas di sisi atas kanan bar mobile.
  - [x] Halaman utama `web/app/page.js` dan layout terhubung sempurna, `next build` 100% SUKSES!
* **🛡️ Hacker Pentest Audit**: Debounce navigasi aman dari benturan multi-tap.

---

#### SPRINT 06: Supabase Multi-Role Auth, Registrasi Klien & Middleware (FR-01, FR-02)
* **Status**: 🎯 **TARGET BERIKUTNYA — SIAP DIGAS! [ ]**
* **Target Waktu**: Hari 4 | **Story Points**: 13 SP
* 💬 **Nama Komentar Commit (Git)**: `git commit -m "feat: implementasi autentikasi multi-role registrasi klien dan route middleware"`
* **Ketertelusuran**: **FR-01** (Login), **FR-02** (Registrasi Klien) | Tabel `users`, `customers`
* **Task Teknis yang Akan Dibuat**:
  1. Halaman Registrasi Klien di `web/app/register/page.jsx`: Input Nama, Email, WhatsApp, Password. Server action `supabase.auth.signUp()`.
  2. Halaman Login Multi-Role di `web/app/login/page.jsx`: Login email/password dengan auto-redirect Klien vs Admin.
  3. Session Gatekeeper di `web/middleware.js`: Memverifikasi token JWT Supabase dan memblokir akses rute `/admin/*` dari klien biasa.
* **🛡️ Hacker Pentest Audit**: Uji coba pemalsuan JWT role, proteksi rate-limiting brute force password, dan validasi email.

---

#### SPRINT 07: Showcase Katalog Publik & Filter Kategori Dinamis (FR-04 Part 1)
* **Status**: ⏳ Antrean [ ]
* **Target Waktu**: Hari 5 | **Story Points**: 8 SP
* 💬 **Nama Komentar Commit (Git)**: `git commit -m "feat: implementasi halaman katalog publik dan filter kategori dinamis"`
* **Ketertelusuran**: **FR-04** (Katalog Paket) | Tabel `packages`, `package_categories`
* **Task Teknis**: Halaman `web/app/katalog/page.jsx` dengan tab filter interaktif dan card 3D tilt.
* **🛡️ Hacker Pentest Audit**: Parameterized query ORM kebal dari SQL Injection pada query filter.

---

#### SPRINT 08: Detail Spesifikasi Paket & Dashboard Admin CRUD Layanan (FR-04 Part 2, FR-12)
* **Status**: ⏳ Antrean [ ]
* **Target Waktu**: Hari 5 | **Story Points**: 13 SP
* 💬 **Nama Komentar Commit (Git)**: `git commit -m "feat: implementasi detail spesifikasi paket dan dashboard admin crud layanan"`
* **Ketertelusuran**: **FR-04** (Detail Paket), **FR-12** (Admin Kelola Paket) | Tabel `packages`
* **Task Teknis**: `web/app/katalog/[slug]/page.jsx` dan panel admin di `web/app/admin/paket/page.jsx`.
* **🛡️ Hacker Pentest Audit**: Validasi server-side constraint harga $> 0$ dan RLS hanya admin yang bisa edit/hapus.

---

#### SPRINT 09: Kalender Ketersediaan Sesi & Anti Double-Booking Engine (FR-05 Part 1)
* **Status**: ⏳ Antrean [ ]
* **Target Waktu**: Hari 6 | **Story Points**: 13 SP
* 💬 **Nama Komentar Commit (Git)**: `git commit -m "feat: implementasi kalender ketersediaan slot dan fungsi anti double booking"`
* **Ketertelusuran**: **FR-05** (Cek Slot & Booking) | Tabel `bookings` | Sequence Diagram SD-01
* **Task Teknis**: Komponen kalender `web/components/booking/BookingCalendar.jsx` terhubung ke stored function PostgreSQL `check_slot_availability`.
* **🛡️ Hacker Pentest Audit**: Row-locking PostgreSQL mematikan celah race-condition serbuan booking bersamaan.

---

#### SPRINT 10: Multi-Step Booking Wizard & Order Generation (FR-05 Part 2)
* **Status**: ⏳ Antrean [ ]
* **Target Waktu**: Hari 7 | **Story Points**: 13 SP
* 💬 **Nama Komentar Commit (Git)**: `git commit -m "feat: implementasi multi-step booking wizard dan invoice code generator"`
* **Ketertelusuran**: **FR-05** (Pengajuan Booking) | Tabel `bookings`, `invoices`
* **Task Teknis**: Wizard pemesanan 4 tahap di `web/app/booking/page.jsx` dan generate invoice status `UNPAID`.
* **🛡️ Hacker Pentest Audit**: Kalkulasi DP dihitung murni di server side (anti tampering payload).

---

#### SPRINT 11: Dashboard Riwayat Booking Klien & Aturan Pembatalan H-3 (FR-06, FR-07)
* **Status**: ⏳ Antrean [ ]
* **Target Waktu**: Hari 7 | **Story Points**: 8 SP
* 💬 **Nama Komentar Commit (Git)**: `git commit -m "feat: implementasi dashboard riwayat booking klien dan validasi pembatalan h-3"`
* **Ketertelusuran**: **FR-06** (Riwayat), **FR-07** (Batal H-3) | Sequence Diagram SD-05
* **Task Teknis**: `web/app/dashboard/riwayat/page.jsx` dengan validasi server waktu `NOW() - session_date >= 3`.
* **🛡️ Hacker Pentest Audit**: Penolakan pembatalan pada H-2 / H-1 dan pemblokiran IDOR pembatalan akun orang lain.

---

### MINGGU 2: FINANSIAL, PRIVATE GALLERY, PROOFING & SIDANG

#### SPRINT 12: Digital Invoicing Engine (DP & Sisa Pelunasan) & Salin Rekening (FR-08 Part 1)
* **Status**: ⏳ Antrean [ ]
* **Target Waktu**: Hari 8 | **Story Points**: 8 SP
* 💬 **Nama Komentar Commit (Git)**: `git commit -m "feat: implementasi digital invoicing engine dp dan pelunasan serta salin rekening"`
* **Ketertelusuran**: **FR-08** (Tagihan Invoice) | Tabel `invoices`
* **Task Teknis**: Halaman `web/app/invoice/[id]/page.jsx`, rincian biaya DP & pelunasan, tombol 1-click copy rekening.
* **🛡️ Hacker Pentest Audit**: IDOR protection memastikan invoice hanya dapat dibaca oleh pemilik sah dan admin.

---

#### SPRINT 13: Dropzone Upload Struk Pembayaran & Supabase Storage (FR-08 Part 2)
* **Status**: ⏳ Antrean [ ]
* **Target Waktu**: Hari 9 | **Story Points**: 8 SP
* 💬 **Nama Komentar Commit (Git)**: `git commit -m "feat: implementasi dropzone upload bukti transfer dan kompresi gambar"`
* **Ketertelusuran**: **FR-08** (Unggah Bukti Transfer) | Tabel `payments`, Storage `payment-proofs`
* **Task Teknis**: `web/components/payment/PaymentUploadModal.jsx`, kompresi client-side, dan simpan di bucket privat.
* **🛡️ Hacker Pentest Audit**: Validasi MIME-type riil (blokir shell script & SVG XSS) serta rename UUID acak.

---

#### SPRINT 14: Panel Admin Verifikasi Pembayaran & Penugasan Kru (FR-14, FR-15)
* **Status**: ⏳ Antrean [ ]
* **Target Waktu**: Hari 9 | **Story Points**: 13 SP
* 💬 **Nama Komentar Commit (Git)**: `git commit -m "feat: implementasi panel admin verifikasi pembayaran dan penugasan kru fotografer"`
* **Ketertelusuran**: **FR-14** (Kru), **FR-15** (Verifikasi Pembayaran) | Tabel `payments`, `crew_assignments`
* **Task Teknis**: `web/app/admin/verifikasi/page.jsx` split screen pratinjau bukti transfer dan penugasan fotografer.
* **🛡️ Hacker Pentest Audit**: Proteksi CSRF Server Actions; aksi verifikasi hanya valid dengan token admin.

---

#### SPRINT 15: Admin Chunked Mass Photo Upload & Auto-Watermark Engine (FR-16)
* **Status**: ⏳ Antrean [ ]
* **Target Waktu**: Hari 10 | **Story Points**: 13 SP
* 💬 **Nama Komentar Commit (Git)**: `git commit -m "feat: implementasi chunked mass upload foto galeri dan auto watermark engine"`
* **Ketertelusuran**: **FR-16** (Admin Upload Galeri) | Tabel `galleries`, `media_assets`
* **Task Teknis**: `web/app/admin/galeri/upload/[bookingId]/page.jsx`, upload batch 50-200 foto, dan stempel watermark.
* **🛡️ Hacker Pentest Audit**: Stripping metadata EXIF GPS privat klien dan limitasi ukuran file (anti storage exhaustion).

---

#### SPRINT 16: Gerbang Akses Private Gallery PIN 6-Digit & Masonry Grid Layout (FR-09)
* **Status**: ⏳ Antrean [ ]
* **Target Waktu**: Hari 11 | **Story Points**: 8 SP
* 💬 **Nama Komentar Commit (Git)**: `git commit -m "feat: implementasi gerbang akses private gallery pin 6 digit dan masonry layout"`
* **Ketertelusuran**: **FR-09** (Akses Private Gallery PIN) | Tabel `galleries` | Sequence Diagram SD-03
* **Task Teknis**: `web/components/gallery/PinGateModal.jsx` (OTP 6 digit shake on error) & `web/app/galeri/[slug]/page.jsx`.
* **🛡️ Hacker Pentest Audit**: Rate limit lockout setelah 5x salah PIN dan isolasi file original di bucket terkunci.

---

#### SPRINT 17: Kurasi Foto Cetak Album (Proofing), Quota Counter & Retouch Notes (FR-10)
* **Status**: ⏳ Antrean [ ]
* **Target Waktu**: Hari 12 | **Story Points**: 13 SP
* 💬 **Nama Komentar Commit (Git)**: `git commit -m "feat: implementasi kurasi foto proofing cetak album dan catatan retouch"`
* **Ketertelusuran**: **FR-10** (Kurasi Foto Proofing) | Tabel `proofing_selections`
* **Task Teknis**: `web/components/gallery/ProofingToolbar.jsx` (Counter kuota floating), modal catatan retouch, dan finalisasi.
* **🛡️ Hacker Pentest Audit**: Server-side count validation (menolak seleksi melebihi kuota paket) & sanitasi XSS catatan.

---

#### SPRINT 18: Gated Master ZIP Generation & Expiring Download Tokens (FR-11)
* **Status**: ⏳ Antrean [ ]
* **Target Waktu**: Hari 13 | **Story Points**: 13 SP
* 💬 **Nama Komentar Commit (Git)**: `git commit -m "feat: implementasi gated master zip download dengan expiring token 48 jam"`
* **Ketertelusuran**: **FR-11** (Unduh Master ZIP) | Tabel `master_downloads`, `invoices`
* **Task Teknis**: Gating status invoice `PAID`, generator token unduh 48 jam di `web/app/api/gallery/download/[token]/route.js`.
* **🛡️ Hacker Pentest Audit**: Pemblokiran mutlak download sebelum pelunasan 100% dan penolakan token basi.

---

#### SPRINT 19: Dashboard Analitik Eksekutif Studio & Direktori Pelanggan (FR-03, FR-13, FR-17)
* **Status**: ⏳ Antrean [ ]
* **Target Waktu**: Hari 13 | **Story Points**: 13 SP
* 💬 **Nama Komentar Commit (Git)**: `git commit -m "feat: implementasi dashboard analitik omzet studio dan direktori pelanggan"`
* **Ketertelusuran**: **FR-03** (Profil), **FR-13** (Direktori), **FR-17** (Dashboard Admin)
* **Task Teknis**: `web/app/admin/dashboard/page.jsx` grafik omzet Recharts dan `web/app/admin/pelanggan/page.jsx`.
* **🛡️ Hacker Pentest Audit**: Proteksi data pribadi PII pelanggan dan verifikasi bcrypt sandi lama saat ganti password.

---

#### SPRINT 20: Full Penetration Testing, Lighthouse Audit, Seeding & Kesiapan Sidang
* **Status**: ⏳ Antrean [ ]
* **Target Waktu**: Hari 14 | **Story Points**: 8 SP
* 💬 **Nama Komentar Commit (Git)**: `git commit -m "test: full penetration testing 17 fr, audit lighthouse dan final deployment"`
* **Fokus**: Final security sign-off, audit performa Google Lighthouse, dan penyiapan akun demonstrasi di depan dosen penguji.
* **Task Teknis**: Audit Lighthouse score $\ge 90$, seeding akun demo Admin & Klien, deployment Vercel Production.
* **🛡️ Hacker Pentest Audit**: Pengujian menyeluruh 17 FR, OWASP Top 10 pass 100%, Zero Bug Kritis.

---

## 3. STANDAR KONVENSI PESAN COMMIT (GIT COMMIT CONVENTIONS)

Untuk menjaga kerapian riwayat commit pada repository Git dan standarisasi pelacakan sprint antar anggota/pengembang, seluruh commit wajib mematuhi aturan konvensi berikut:

### Format Penulisan:
```
<kategori>: <indikasi pesan commit / dampak>
```

### Tabel Klasifikasi Kategori:

| Kategori | Indikasi Pesan Commit / Dampak |
| :--- | :--- |
| **feat** | Penambahan fitur baru |
| **fix** | Perbaikan bug |
| **refactor** | Perubahan struktur tanpa ubah fungsi |
| **docs** | Perubahan dokumentasi |
| **test** | Tambahan/modifikasi testing |
| **chore** | Pembaruan minor (config, dsb.) |

### Contoh Penggunaan:
* `feat: Membuat halaman login`
* `fix: Memperbaiki error pada view dashboard`
* `feat: Menambahkan animasi sliding hover dan cursor spotlight pada DesktopNavbar`
* `docs: Menambahkan standar konvensi commit pada sprint planning dan README`
* `chore: Pembaruan konfigurasi Tailwind CSS dan dependensi package.json`
* `refactor: Penyesuaian struktur komponen layout dan navigasi`

