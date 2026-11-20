# 🛡️ DOKUMEN RENCANA PERBAIKAN KEAMANAN & PENTEST REMEDIATION
## Sistem Informasi Pemesanan Jasa Fotografi & Private Gallery Web (Iluxy Creative Padang)
### Standar Rujukan: OWASP Top 10 (2021) & NIST Special Publication 800-115

* **Pengembang / Mahasiswa**: Zackri Kurnia Amri (NIM: 2411082023)  
* **Program Studi**: D4 Teknologi Rekayasa Perangkat Lunak (TRPL), Politeknik Negeri Padang  
* **Target Rilis**: Kesiapan Sidang Proyek Akhir / Deployment Produksi Vercel  
* **Tanggal Audit**: 20 November 2026  
* **Status Keseluruhan**: **10 Temuan Teridentifikasi** (3 Critical, 3 High, 2 Medium, 2 Low)

---

## 1. MATRIKS RINGKASAN TEMUAN & STATUS PERBAIKAN

| ID | Kerentanan / Celah Keamanan | Severity | Kategori OWASP | File Target Perbaikan | Prioritas |
|:---:|:---|:---:|:---:|:---|:---:|
| **SEC-01** | Privilege Escalation Klien $\rightarrow$ Admin via Writable `user_metadata` & RLS Update | 🔴 Critical | A01: Broken Access Control | [supabase_schema.sql](file:///d:/Kuliah/Semester%205/Progres%20Proyek/web/supabase_schema.sql#L247) & [lib/supabase/middleware.js](file:///d:/Kuliah/Semester%205/Progres%20Proyek/web/lib/supabase/middleware.js#L48) | P1 - Segera |
| **SEC-02** | Data Leakage PIN Galeri & Link Foto Asli pada Payload SSR Next.js | 🔴 Critical | A01: Broken Access Control | [lib/actions/gallery.js](file:///d:/Kuliah/Semester%205/Progres%20Proyek/web/lib/actions/gallery.js#L21) & [app/galeri/[slug]/page.jsx](file:///d:/Kuliah/Semester%205/Progres%20Proyek/web/app/galeri/%5Bslug%5D/page.jsx#L45) | P1 - Segera |
| **SEC-03** | RLS `proofing_selections` & `master_downloads` Terbuka Publik (`USING true`) | 🔴 Critical | A01: Broken Access Control | [supabase_schema.sql](file:///d:/Kuliah/Semester%205/Progres%20Proyek/web/supabase_schema.sql#L271-L272) | P1 - Segera |
| **SEC-04** | Kebijakan RLS `invoices` Hilang (Gagal Menerbitkan Invoice saat Booking) | 🟠 High | A05: Security Misconfiguration | [supabase_schema.sql](file:///d:/Kuliah/Semester%205/Progres%20Proyek/web/supabase_schema.sql#L260) | P1 - Segera |
| **SEC-05** | Race Condition (TOCTOU) Double-Booking pada Kalender Sesi | 🟠 High | A04: Insecure Design | [supabase_schema.sql](file:///d:/Kuliah/Semester%205/Progres%20Proyek/web/supabase_schema.sql#L86) & [lib/actions/booking.js](file:///d:/Kuliah/Semester%205/Progres%20Proyek/web/lib/actions/booking.js#L132) | P2 - Tinggi |
| **SEC-06** | Kredensial Akun Demo Tertanam Hardcoded di Bundle Client | 🟠 High | A07: Auth Failures | [app/login/page.jsx](file:///d:/Kuliah/Semester%205/Progres%20Proyek/web/app/login/page.jsx#L62-L70) | P2 - Tinggi |
| **SEC-07** | Validasi MIME-Type Upload File Tanpa Pengecekan Magic Bytes | 🟡 Medium | A04: Insecure Design | [lib/actions/payments.js](file:///d:/Kuliah/Semester%205/Progres%20Proyek/web/lib/actions/payments.js#L35) & [lib/actions/auth.js](file:///d:/Kuliah/Semester%205/Progres%20Proyek/web/lib/actions/auth.js#L166) | P2 - Tinggi |
| **SEC-08** | Tidak Ada Security Headers (Clickjacking & MIME-Sniffing Risk) | 🟡 Medium | A05: Security Misconfiguration | [next.config.mjs](file:///d:/Kuliah/Semester%205/Progres%20Proyek/web/next.config.mjs) | P2 - Tinggi |
| **SEC-09** | Open Redirect Partial Bypass via Backslash (`/\\`) pada Login | 🔵 Low | A01: Broken Access Control | [lib/actions/auth.js](file:///d:/Kuliah/Semester%205/Progres%20Proyek/web/lib/actions/auth.js#L123) | P3 - Sedang |
| **SEC-10** | Timezone Skew (WIB vs UTC) pada Validasi Pembatalan H-3 | 🔵 Low | Business Logic Flaw | [lib/actions/booking.js](file:///d:/Kuliah/Semester%205/Progres%20Proyek/web/lib/actions/booking.js#L448-L455) | P3 - Sedang |

---

## 2. DETAIL PERBAIKAN & PANDUAN IMPLEMENTASI

### 📍 BAGIAN A: PERBAIKAN DATABASE SUPABASE (SQL MIGRATION)
> Jalankan seluruh skrip SQL ini langsung di **SQL Editor Supabase** Anda untuk menyelesaikan temuan **SEC-01, SEC-03, SEC-04, dan SEC-05** sekaligus.

```sql
-- ==============================================================================
-- PATCH KEAMANAN SUPABASE ILUXY CREATIVE (SEC-01, SEC-03, SEC-04, SEC-05)
-- ==============================================================================

-- 1. [SEC-01] TRIGGER ANTI-PRIVILEGE ESCALATION
-- Mencegah user biasa mengubah kolom role di tabel public.users
CREATE OR REPLACE FUNCTION prevent_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.role IS DISTINCT FROM OLD.role AND NOT is_admin() THEN
        RAISE EXCEPTION 'Akses Ditolak: Pengguna tidak berwenang memodifikasi hak akses role.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_role_escalation ON users;
CREATE TRIGGER trg_prevent_role_escalation
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION prevent_role_escalation();


-- 2. [SEC-04] PERBAIKAN RLS TABEL INVOICES
-- Izinkan pelanggan yang memiliki booking menerbitkan invoice, dan admin mengelola invoice
DROP POLICY IF EXISTS "Customer Insert Invoice" ON invoices;
CREATE POLICY "Customer Insert Invoice" ON invoices FOR INSERT 
WITH CHECK (
    booking_id IN (
        SELECT b.id FROM bookings b
        JOIN customers c ON b.customer_id = c.id
        WHERE c.user_id = auth.uid()
    ) OR is_admin()
);

DROP POLICY IF EXISTS "Admin Manage Invoices" ON invoices;
CREATE POLICY "Admin Manage Invoices" ON invoices FOR ALL USING (is_admin());


-- 3. [SEC-03] PERBAIKAN RLS PROOFING_SELECTIONS & MASTER_DOWNLOADS
-- Menutup policy terbuka "USING (true)"
DROP POLICY IF EXISTS "Customer Proofing Access" ON proofing_selections;
CREATE POLICY "Owner Proofing Access" ON proofing_selections FOR ALL 
USING (
    gallery_id IN (
        SELECT g.id FROM galleries g
        JOIN bookings b ON g.booking_id = b.id
        JOIN customers c ON b.customer_id = c.id
        WHERE c.user_id = auth.uid()
    ) OR is_admin()
);

DROP POLICY IF EXISTS "Master Downloads Access" ON master_downloads;
CREATE POLICY "Owner Master Downloads Access" ON master_downloads FOR SELECT 
USING (
    gallery_id IN (
        SELECT g.id FROM galleries g
        JOIN bookings b ON g.booking_id = b.id
        JOIN customers c ON b.customer_id = c.id
        JOIN invoices i ON i.booking_id = b.id
        WHERE c.user_id = auth.uid() AND i.status = 'PAID'
    ) OR is_admin()
);

-- 4. [SEC-05] POSTGRESQL EXCLUSION CONSTRAINT ANTI DOUBLE-BOOKING
-- Mengunci jadwal di level database PostgreSQL agar tidak ada dua booking yang tumpang tindih
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE bookings DROP CONSTRAINT IF EXISTS no_overlapping_bookings;
ALTER TABLE bookings 
ADD CONSTRAINT no_overlapping_bookings 
EXCLUDE USING gist (
    session_date WITH =,
    tsrange(('2000-01-01 ' || start_time)::timestamp, ('2000-01-01 ' || end_time)::timestamp) WITH &&
) WHERE (status NOT IN ('CANCELLED'));
```

---

### 📍 BAGIAN B: PERBAIKAN NEXT.JS SERVER COMPONENTS & DATA LEAKAGE (SEC-02)

#### 1. Perbaikan [lib/actions/gallery.js](file:///d:/Kuliah/Semester%205/Progres%20Proyek/web/lib/actions/gallery.js)
Hapus kolom `access_pin_hash` dari query informasi galeri publik:

```javascript
// Ganti fungsi getGalleryBySlug agar tidak membocorkan access_pin_hash
export async function getGalleryBySlug(slug) {
  if (!slug) return null;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("galleries")
    .select(`
      id,
      booking_id,
      title,
      access_slug,
      -- access_pin_hash DIHAPUS DARI SELECT (Cegah Leakage ke Client Props)
      max_selection_quota,
      status,
      published_at,
      bookings (
        id,
        booking_code,
        session_date,
        packages ( name, slug, max_photos_retouch ),
        customers ( users ( full_name ) ),
        invoices ( id, status, remaining_amount )
      )
    `)
    .eq("access_slug", slug)
    .single();

  return data || null;
}
```

#### 2. Perbaikan [lib/actions/gallery.js](file:///d:/Kuliah/Semester%205/Progres%20Proyek/web/lib/actions/gallery.js#L104)
Hapus `original_url` dari daftar foto galeri pra-lunas (klien hanya boleh menerima `watermark_url` dan `thumbnail_url`):

```javascript
export async function getGalleryMediaAssets(galleryId) {
  if (!galleryId) return [];
  const supabase = await createClient();

  // HANYA ambil watermark_url dan thumbnail_url untuk preview publik
  const { data, error } = await supabase
    .from("media_assets")
    .select("id, gallery_id, file_name, watermark_url, thumbnail_url, width, height, sort_order")
    .eq("gallery_id", galleryId)
    .order("sort_order", { ascending: true });

  return data || [];
}
```

---

### 📍 BAGIAN C: HARDENING UPLOAD FILE DENGAN MAGIC BYTES (SEC-07)

Di file [lib/actions/payments.js](file:///d:/Kuliah/Semester%205/Progres%20Proyek/web/lib/actions/payments.js) dan [lib/actions/auth.js](file:///d:/Kuliah/Semester%205/Progres%20Proyek/web/lib/actions/auth.js), tambahkan fungsi verifikasi biner (*magic bytes*):

```javascript
function validateImageMagicBytes(buffer) {
  if (!buffer || buffer.length < 4) return false;
  const headerHex = buffer.toString("hex", 0, 4);

  // JPEG / JPG: FF D8 FF
  const isJpeg = headerHex.startsWith("ffd8ff");
  // PNG: 89 50 4E 47
  const isPng = headerHex === "89504e47";
  // WebP: RIFF .... WEBP
  const isWebp = buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP";

  return isJpeg || isPng || isWebp;
}

// Gunakan pada saat membaca arrayBuffer file yang diunggah:
const arrayBuffer = await proofFile.arrayBuffer();
const buffer = Buffer.from(arrayBuffer);

if (!validateImageMagicBytes(buffer)) {
  return { error: "Keamanan: Berkas yang diunggah bukan file gambar biner yang valid (JPG/PNG/WebP)." };
}
```

---

### 📍 BAGIAN D: HTTP SECURITY HEADERS DI [next.config.mjs](file:///d:/Kuliah/Semester%205/Progres%20Proyek/web/next.config.mjs) (SEC-08)

Tambahkan header standar OWASP untuk mencegah *Clickjacking*, *MIME Sniffing*, dan membatasi izin sensor:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
```

---

### 📍 BAGIAN E: TIMEZONE & SANITASI REDIRECT (SEC-09 & SEC-10)

#### 1. Cegah Open Redirect di [lib/actions/auth.js:123](file:///d:/Kuliah/Semester%205/Progres%20Proyek/web/lib/actions/auth.js#L123)
```javascript
// Validasi ketat: Wajib diawali '/' dan tidak mengandung '//' maupun '\\'
const isSafeRedirect = 
  redirectTo && 
  redirectTo.startsWith("/") && 
  !redirectTo.startsWith("//") && 
  !redirectTo.includes("\\");

let destination = role === "ADMIN" ? "/admin/dashboard" : "/dashboard";
if (isSafeRedirect) {
  destination = redirectTo;
}
```

#### 2. Zona Waktu WIB (Asia/Jakarta) pada Pembatalan H-3 di [lib/actions/booking.js:449](file:///d:/Kuliah/Semester%205/Progres%20Proyek/web/lib/actions/booking.js#L449)
```javascript
// Konversi waktu sekarang ke WIB (UTC+7)
const nowJakartaStr = new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" });
const today = new Date(nowJakartaStr);
today.setHours(0, 0, 0, 0);

const sessionDateObj = new Date(booking.session_date);
sessionDateObj.setHours(0, 0, 0, 0);

const diffTime = sessionDateObj.getTime() - today.getTime();
const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
```

---

## 3. CHECKLIST EKSEKUSI PERBAIKAN

- [ ] **Langkah 1**: Salin dan jalankan skrip SQL di **Bagian A** pada Supabase SQL Editor.
- [ ] **Langkah 2**: Perbarui fungsi `getGalleryBySlug` dan `getGalleryMediaAssets` di `lib/actions/gallery.js`.
- [ ] **Langkah 3**: Tambahkan validasi `validateImageMagicBytes` di `lib/actions/payments.js` dan `lib/actions/auth.js`.
- [ ] **Langkah 4**: Perbarui `next.config.mjs` dengan Security Headers.
- [ ] **Langkah 5**: Perbarui sanitasi redirect dan timezone WIB pada Server Actions.
- [ ] **Langkah 6**: Jalankan `npm run lint` dan `npm run build` untuk memverifikasi zero-error.
- [ ] **Langkah 7**: Lakukan commit dengan pesan konvensi:
  ```bash
  git add .
  git commit -m "fix(security): implementasi patch rls supabase, proteksi pin leakage, exclusion constraint dan security headers"
  ```

---

## 4. METODOLOGI & ALAT PENGUJIAN SIDANG
Lampirkan hasil pengujian ini pada laporan Tugas Akhir Bab 4 (Pengujian):
1. **Supabase Security Advisor**: Konfirmasi `0 Vulnerabilities / Issues` pada panel Advisor.
2. **Postman / Burp Suite**: Uji pengiriman payload update role `ADMIN` pada user biasa dan buktikan penolakan `403 / Error`.
3. **Lighthouse Audit**: Buktikan skor *Best Practices* $\ge 95$ berkat security headers yang terpasang.
4. **Inspect Network Browser**: Buktikan `access_pin_hash` dan `original_url` sudah tidak lagi bocor di payload HTML.
