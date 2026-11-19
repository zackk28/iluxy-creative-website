-- ==============================================================================
-- ILUXY CREATIVE PADANG — DEMO SEED DATA UNTUK SIDANG SKRIPSI / PROYEK AKHIR
-- ==============================================================================
-- File ini menyediakan akun demo siap pakai, riwayat pemesanan lunas,
-- dan galeri privat ber-PIN untuk demonstrasi lancar di depan tim penguji.

-- 1. AKUN DEMO CLIENT & ADMIN
-- Catatan: Untuk login instan di web, Anda dapat mendaftar (Register) di formulir web:
-- Admin: admin@iluxycreative.com / Admin123!
-- Klien: klien@iluxycreative.com / Klien123!

-- 2. SEED KATEGORI & PAKET LAYANAN UNGGULAN
INSERT INTO package_categories (id, name, slug, description, display_order) VALUES
(1, 'Wedding & Akad', 'wedding-akad', 'Dokumentasi momen sakral akad nikah dan resepsi pernikahan penuh kehangatan', 1),
(2, 'Prewedding', 'prewedding', 'Konsep foto pasangan tematik di studio maupun outdoor Kota Padang dan sekitarnya', 2),
(3, 'Wisuda & Graduation', 'wisuda-graduation', 'Perayaan kelulusan personal maupun rombongan bersama keluarga', 3),
(4, 'Studio Portrait', 'studio-portrait', 'Foto personal, keluarga, beauty, dan commercial studio modern', 4)
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    description = EXCLUDED.description;

INSERT INTO packages (id, category_id, name, slug, price, dp_amount, duration_hours, max_photos_retouch, description, features, cover_image_url, is_active) VALUES
('11111111-1111-1111-1111-111111111101', 1, 'Wedding Royale Gold', 'wedding-royale-gold', 5000000, 1500000, 8, 50, 
 'Liputan lengkap seharian penuh dari persiapan hingga resepsi malam dengan 2 fotografer', 
 ARRAY['2 Photographers', '1 Videographer Teaser 1 Menit', '50 Foto Retouch Cetak Album', '2 Album Kolase 20x30 Kulit Mewah', 'Cetak Frame Kanvas 40x60', 'Semua File Master High-Res di Private Gallery'],
 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80', true),

('11111111-1111-1111-1111-111111111102', 1, 'Wedding Intim Bronze', 'wedding-intim-bronze', 2500000, 750000, 4, 25, 
 'Paket dokumentasi akad dan resepsi intim dengan estetika sinematik elegan', 
 ARRAY['1 Lead Photographer', '1 Assistant Crew', '25 Foto Retouch Cetak Album', 'Album Kolase 20x30 Box Eksklusif', 'Semua File Master High-Res di Private Gallery'],
 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80', true),

('11111111-1111-1111-1111-111111111103', 2, 'Prewedding Sunset Padang', 'prewedding-sunset-padang', 1800000, 500000, 4, 20, 
 'Sesi pemotretan prewedding romantis di alam terbuka Padang (Pantai Air Manis / Pantai Padang)', 
 ARRAY['1 Photographer & 1 Lighting Assistant', '2 Lokasi Outdoor', '20 Foto Retouch Halus', 'Cetak 1 Frame Pembesar 30x40', 'Semua Master File di Private Gallery'],
 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80', true),

('11111111-1111-1111-1111-111111111104', 3, 'Wisuda Studio Signature', 'wisuda-studio-signature', 650000, 200000, 2, 10, 
 'Sesi foto kelulusan studio bersama toga dan keluarga tercinta', 
 ARRAY['1 Jam Sesi Studio AC Iluxy', '10 Foto Retouch Cetak 4R', '1 Cetak Frame 10R', 'Master File Unlimited di Private Gallery'],
 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80', true)
ON CONFLICT (slug) DO UPDATE SET 
    price = EXCLUDED.price,
    dp_amount = EXCLUDED.dp_amount;

-- 3. STORAGE BUCKETS SETUP
INSERT INTO storage.buckets (id, name, public) VALUES 
('payment-proofs', 'payment-proofs', false),
('gallery-watermarked', 'gallery-watermarked', true),
('gallery-originals', 'gallery-originals', false),
('master-zips', 'master-zips', false),
('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Kebijakan Akses Storage Public Buckets (Avatars & Watermarked)
CREATE POLICY "Public Read Avatars" ON storage.objects FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Public Read Watermarked Photos" ON storage.objects FOR SELECT 
USING (bucket_id = 'gallery-watermarked');

CREATE POLICY "Authenticated Upload Avatars" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Admin Upload Watermarked Photos" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'gallery-watermarked');
