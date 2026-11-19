-- ==============================================================================
-- SISTEM INFORMASI BOOKING & PRIVATE GALLERY WEB - ILUXY CREATIVE PADANG
-- PostgreSQL DDL Schema for Supabase (11 Tables 3NF, Enums, RLS & Stored Procedures)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUM TYPES
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('CLIENT', 'ADMIN');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE booking_status AS ENUM ('PENDING_DP', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE invoice_status AS ENUM ('UNPAID', 'PARTIALLY_PAID', 'PAID', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE payment_type AS ENUM ('DP', 'FULL_PAYMENT', 'REMAINING');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('PENDING_VERIFICATION', 'VERIFIED', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE gallery_status AS ENUM ('DRAFT', 'PUBLISHED', 'PROOFING_SUBMITTED', 'CLOSED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3. TABEL USERS & PELANGGAN
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    role user_role DEFAULT 'CLIENT',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    instagram_handle TEXT,
    address TEXT,
    city TEXT DEFAULT 'Padang',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. KATALOG & PAKET LAYANAN
CREATE TABLE IF NOT EXISTS package_categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id INT REFERENCES package_categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    price DECIMAL(12,2) NOT NULL CHECK (price > 0),
    dp_amount DECIMAL(12,2) NOT NULL CHECK (dp_amount > 0),
    duration_hours INT NOT NULL CHECK (duration_hours > 0),
    max_photos_retouch INT NOT NULL DEFAULT 20 CHECK (max_photos_retouch > 0),
    description TEXT,
    features TEXT[] DEFAULT '{}',
    cover_image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. BOOKING & PENUGASAN KRU
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_code TEXT UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    package_id UUID REFERENCES packages(id),
    session_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location_type TEXT NOT NULL DEFAULT 'STUDIO', -- 'STUDIO' | 'OUTDOOR'
    venue_address TEXT NOT NULL,
    notes TEXT,
    status booking_status DEFAULT 'PENDING_DP',
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (start_time < end_time)
);

CREATE TABLE IF NOT EXISTS crew_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    crew_name TEXT NOT NULL,
    role_title TEXT NOT NULL, -- 'Lead Photographer', 'Videographer', 'Assistant'
    contact_number TEXT,
    assigned_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. INVOICE & TRANSAKSI PEMBAYARAN
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number TEXT UNIQUE NOT NULL,
    booking_id UUID UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
    total_amount DECIMAL(12,2) NOT NULL CHECK (total_amount > 0),
    dp_amount DECIMAL(12,2) NOT NULL CHECK (dp_amount > 0),
    remaining_amount DECIMAL(12,2) NOT NULL CHECK (remaining_amount >= 0),
    status invoice_status DEFAULT 'UNPAID',
    due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    payment_type payment_type NOT NULL,
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    proof_image_url TEXT NOT NULL,
    payment_status payment_status DEFAULT 'PENDING_VERIFICATION',
    bank_name TEXT NOT NULL,
    sender_account_name TEXT NOT NULL,
    rejection_reason TEXT,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PRIVATE GALLERY, PROOFING & MASTER DOWNLOAD
CREATE TABLE IF NOT EXISTS galleries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    access_slug TEXT UNIQUE NOT NULL,
    access_pin_hash TEXT NOT NULL,
    max_selection_quota INT NOT NULL DEFAULT 20 CHECK (max_selection_quota > 0),
    status gallery_status DEFAULT 'DRAFT',
    published_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS media_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gallery_id UUID REFERENCES galleries(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    original_url TEXT NOT NULL,
    watermark_url TEXT NOT NULL,
    thumbnail_url TEXT NOT NULL,
    file_size_bytes BIGINT,
    width INT,
    height INT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS proofing_selections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gallery_id UUID REFERENCES galleries(id) ON DELETE CASCADE,
    media_asset_id UUID REFERENCES media_assets(id) ON DELETE CASCADE,
    customer_notes TEXT,
    selected_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(gallery_id, media_asset_id)
);

CREATE TABLE IF NOT EXISTS master_downloads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gallery_id UUID REFERENCES galleries(id) ON DELETE CASCADE,
    download_token TEXT UNIQUE NOT NULL,
    zip_file_url TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    download_count INT DEFAULT 0,
    max_downloads INT DEFAULT 5,
    last_downloaded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. INDEXES UNTUK PERFORMA TINGGI
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(session_date);
CREATE INDEX IF NOT EXISTS idx_bookings_code ON bookings(booking_code);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_galleries_slug ON galleries(access_slug);
CREATE INDEX IF NOT EXISTS idx_media_gallery ON media_assets(gallery_id);
CREATE INDEX IF NOT EXISTS idx_proofing_gallery ON proofing_selections(gallery_id);

-- 9. STORED PROCEDURE: ANTI DOUBLE-BOOKING CONCURRENCY LOCK
CREATE OR REPLACE FUNCTION check_slot_availability(p_date DATE, p_start TIME, p_end TIME)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN NOT EXISTS (
        SELECT 1 FROM bookings
        WHERE session_date = p_date
          AND status NOT IN ('CANCELLED')
          AND (start_time, end_time) OVERLAPS (p_start, p_end)
    );
END;
$$ LANGUAGE plpgsql;

-- 10. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE proofing_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_downloads ENABLE ROW LEVEL SECURITY;

-- Helper function: is_admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid() AND role = 'ADMIN'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Public read for categories & active packages
CREATE POLICY "Public Read Categories" ON package_categories FOR SELECT USING (true);
CREATE POLICY "Public Read Active Packages" ON packages FOR SELECT USING (is_active = true);
CREATE POLICY "Admin Full Packages" ON packages FOR ALL USING (is_admin());
CREATE POLICY "Admin Full Categories" ON package_categories FOR ALL USING (is_admin());

-- Users & Customers
CREATE POLICY "User Self Access" ON users FOR SELECT USING (auth.uid() = id OR is_admin());
CREATE POLICY "User Self Insert" ON users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "User Self Update" ON users FOR UPDATE USING (auth.uid() = id OR is_admin());
CREATE POLICY "Customer Self Access" ON customers FOR SELECT USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "Customer Self Insert" ON customers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Customer Self Update" ON customers FOR UPDATE USING (auth.uid() = user_id OR is_admin());

-- Bookings
CREATE POLICY "Customer View Own Bookings" ON bookings FOR SELECT 
USING (customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid()) OR is_admin());
CREATE POLICY "Customer Insert Booking" ON bookings FOR INSERT 
WITH CHECK (customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid()) OR is_admin());
CREATE POLICY "Admin Manage Bookings" ON bookings FOR ALL USING (is_admin());

-- Invoices & Payments
CREATE POLICY "Customer View Own Invoices" ON invoices FOR SELECT 
USING (booking_id IN (SELECT b.id FROM bookings b JOIN customers c ON b.customer_id = c.id WHERE c.user_id = auth.uid()) OR is_admin());
CREATE POLICY "Customer View Own Payments" ON payments FOR SELECT 
USING (invoice_id IN (SELECT i.id FROM invoices i JOIN bookings b ON i.booking_id = b.id JOIN customers c ON b.customer_id = c.id WHERE c.user_id = auth.uid()) OR is_admin());
CREATE POLICY "Customer Insert Payment" ON payments FOR INSERT 
WITH CHECK (invoice_id IN (SELECT i.id FROM invoices i JOIN bookings b ON i.booking_id = b.id JOIN customers c ON b.customer_id = c.id WHERE c.user_id = auth.uid()) OR is_admin());
CREATE POLICY "Admin Manage Payments" ON payments FOR ALL USING (is_admin());

-- Galleries & Proofing
CREATE POLICY "Public Read Published Galleries" ON galleries FOR SELECT USING (status != 'DRAFT' OR is_admin());
CREATE POLICY "Media Assets Read" ON media_assets FOR SELECT USING (true);
CREATE POLICY "Customer Proofing Access" ON proofing_selections FOR ALL USING (true);
CREATE POLICY "Master Downloads Access" ON master_downloads FOR SELECT USING (true);

-- Grant privileges to anon and authenticated roles
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

-- 11. STORAGE BUCKETS
INSERT INTO storage.buckets (id, name, public) VALUES 
('payment-proofs', 'payment-proofs', false),
('gallery-watermarked', 'gallery-watermarked', true),
('gallery-originals', 'gallery-originals', false),
('master-zips', 'master-zips', false)
ON CONFLICT (id) DO NOTHING;

-- 12. SEED DATA KATALOG (ILUXY CREATIVE INITIAL PACKAGES)
INSERT INTO package_categories (id, name, slug, description, display_order) VALUES
(1, 'Wedding & Akad', 'wedding-akad', 'Dokumentasi momen sakral akad nikah dan resepsi pernikahan penuh kehangatan', 1),
(2, 'Prewedding', 'prewedding', 'Konsep foto pasangan tematik di studio maupun outdoor Kota Padang dan sekitarnya', 2),
(3, 'Wisuda & Graduation', 'wisuda-graduation', 'Perayaan kelulusan personal maupun rombongan bersama keluarga', 3),
(4, 'Studio Portrait', 'studio-portrait', 'Foto personal, keluarga, beauty, dan commercial studio modern', 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO packages (category_id, name, slug, price, dp_amount, duration_hours, max_photos_retouch, description, features, cover_image_url) VALUES
(1, 'Wedding Intim Bronze', 'wedding-intim-bronze', 2500000, 750000, 4, 25, 'Paket dokumentasi akad dan resepsi intim dengan estetika sinematik elegan', 
 ARRAY['1 Lead Photographer', '1 Assistant Crew', '25 Foto Retouch Cetak Album', 'Album Kolase 20x30 Box Eksklusif', 'Semua File Master High-Res di Private Gallery', 'Flashdisk Master ZIP'],
 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80'),
(1, 'Wedding Royale Gold', 'wedding-royale-gold', 5000000, 1500000, 8, 50, 'Liputan lengkap seharian penuh dari persiapan hingga resepsi malam dengan 2 fotografer', 
 ARRAY['2 Photographers', '1 Videographer Teaser 1 Menit', '50 Foto Retouch Cetak Album', '2 Album Kolase 20x30 Kulit Mewah', 'Cetak Frame Kanvas 40x60', 'Semua File Master High-Res di Private Gallery'],
 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80'),
(2, 'Prewedding Sunset Padang', 'prewedding-sunset-padang', 1800000, 500000, 4, 20, 'Sesi pemotretan prewedding romantis di alam terbuka Padang (Pantai / Bukit)', 
 ARRAY['1 Photographer & 1 Lighting Assistant', '2 Lokasi Outdoor', '20 Foto Retouch Halus', 'Cetak 1 Frame Pembesar 30x40', 'Semua Master File di Private Gallery'],
 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80'),
(3, 'Wisuda Studio Signature', 'wisuda-studio-signature', 650000, 200000, 2, 10, 'Sesi foto kelulusan studio bersama toga dan keluarga tercinta', 
 ARRAY['1 Jam Sesi Studio AC Iluxy', '10 Foto Retouch Cetak 4R', '1 Cetak Frame 10R', 'Master File Unlimited di Private Gallery'],
 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (slug) DO NOTHING;
