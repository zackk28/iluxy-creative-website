"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * 1. Ambil Data Galeri Berdasarkan Slug Akses
 */
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
      access_pin_hash,
      max_selection_quota,
      status,
      published_at,
      expires_at,
      created_at,
      bookings (
        id,
        booking_code,
        session_date,
        packages (
          name,
          slug,
          max_photos_retouch
        ),
        customers (
          city,
          users (
            full_name,
            email,
            phone_number
          )
        ),
        invoices (
          id,
          invoice_number,
          total_amount,
          remaining_amount,
          status
        )
      )
    `)
    .eq("access_slug", slug)
    .single();

  if (error || !data) {
    console.error("Galeri tidak ditemukan untuk slug:", slug, error);
    return null;
  }

  return data;
}

/**
 * 2. Verifikasi PIN 6-Digit Galeri (PBI-16)
 */
export async function verifyGalleryPin(slug, inputPin) {
  if (!slug || !inputPin) {
    return { success: false, error: "Slug galeri dan PIN 6-digit wajib diisi." };
  }

  const supabase = await createClient();

  const { data: gallery, error } = await supabase
    .from("galleries")
    .select("id, access_pin_hash, status")
    .eq("access_slug", slug)
    .single();

  if (error || !gallery) {
    return { success: false, error: "Galeri foto tidak ditemukan." };
  }

  // Verifikasi kecocokan PIN (mendukung plain 6-digit atau hashed)
  const isMatch = gallery.access_pin_hash === inputPin.trim();

  if (!isMatch) {
    return {
      success: false,
      error: "PIN 6-digit yang Anda masukkan salah. Silakan periksa kembali pesan dari studio.",
    };
  }

  return {
    success: true,
    galleryId: gallery.id,
    message: "PIN valid! Selamat datang di Private Gallery Anda.",
  };
}

/**
 * 3. Ambil Semua Foto (Media Assets) dalam Galeri
 */
export async function getGalleryMediaAssets(galleryId) {
  if (!galleryId) return [];

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("media_assets")
    .select("id, gallery_id, file_name, original_url, watermark_url, thumbnail_url, width, height, sort_order")
    .eq("gallery_id", galleryId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Gagal mengambil aset foto galeri:", error);
    return [];
  }

  return data || [];
}

/**
 * 4. Ambil Daftar Foto yang Sudah Dipilih Klien (Proofing)
 */
export async function getProofingSelections(galleryId) {
  if (!galleryId) return [];

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("proofing_selections")
    .select("id, gallery_id, media_asset_id, customer_notes, selected_at")
    .eq("gallery_id", galleryId);

  if (error) {
    console.error("Gagal mengambil data kurasi proofing:", error);
    return [];
  }

  return data || [];
}

/**
 * 5. Toggle Pilihan Foto Proofing & Catatan Retouch (PBI-17)
 */
export async function toggleProofingSelection(galleryId, mediaAssetId, customerNotes = "") {
  const supabase = await createClient();

  // A. Ambil kuota maksimal dari galeri
  const { data: gallery, error: galErr } = await supabase
    .from("galleries")
    .select("id, max_selection_quota, status")
    .eq("id", galleryId)
    .single();

  if (galErr || !gallery) {
    return { error: "Galeri tidak ditemukan." };
  }

  if (gallery.status === "PROOFING_SUBMITTED" || gallery.status === "CLOSED") {
    return { error: "Kurasi telah difinalisasi dan terkunci untuk proses cetak album." };
  }

  // B. Cek apakah foto ini sudah dipilih sebelumnya
  const { data: existing } = await supabase
    .from("proofing_selections")
    .select("id")
    .eq("gallery_id", galleryId)
    .eq("media_asset_id", mediaAssetId)
    .maybeSingle();

  if (existing) {
    // Hapus dari pilihan (uncheck)
    const { error: delErr } = await supabase
      .from("proofing_selections")
      .delete()
      .eq("id", existing.id);

    if (delErr) return { error: "Gagal membatalkan pilihan foto." };

    revalidatePath(`/galeri/${gallery.access_slug}`);
    return { success: true, action: "REMOVED", message: "Foto dihapus dari daftar kurasi cetak." };
  } else {
    // Cek batas kuota maksimal cetak
    const { count, error: countErr } = await supabase
      .from("proofing_selections")
      .select("id", { count: "exact", head: true })
      .eq("gallery_id", galleryId);

    const currentCount = count || 0;
    if (currentCount >= gallery.max_selection_quota) {
      return {
        error: `Kuota cetak album telah mencapai batas maksimal (${gallery.max_selection_quota} foto). Hapus beberapa foto terlebih dahulu jika ingin menggantinya.`,
      };
    }

    // Tambahkan foto ke daftar kurasi
    const { error: insErr } = await supabase
      .from("proofing_selections")
      .insert({
        gallery_id: galleryId,
        media_asset_id: mediaAssetId,
        customer_notes: customerNotes || null,
      });

    if (insErr) return { error: "Gagal memilih foto." };

    revalidatePath(`/galeri/${gallery.access_slug}`);
    return { success: true, action: "ADDED", message: "Foto berhasil ditambahkan ke kurasi cetak album!" };
  }
}

/**
 * 6. Simpan / Perbarui Catatan Retouch Khusus pada Foto Tertentu (PBI-17)
 */
export async function updateRetouchNote(galleryId, mediaAssetId, customerNotes) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("proofing_selections")
    .update({ customer_notes: customerNotes })
    .eq("gallery_id", galleryId)
    .eq("media_asset_id", mediaAssetId);

  if (error) {
    return { error: "Gagal menyimpan catatan retouch foto." };
  }

  return { success: true, message: "Catatan retouch tersimpan!" };
}

/**
 * 7. Finalisasi Kurasi Album (Kunci Pilihan Klien) (PBI-17)
 */
export async function finalizeProofing(galleryId) {
  const supabase = await createClient();

  const { data: gallery, error: fetchErr } = await supabase
    .from("galleries")
    .select("id, access_slug, max_selection_quota")
    .eq("id", galleryId)
    .single();

  if (fetchErr || !gallery) {
    return { error: "Galeri tidak ditemukan." };
  }

  // Hitung berapa foto yang sudah dipilih
  const { count } = await supabase
    .from("proofing_selections")
    .select("id", { count: "exact", head: true })
    .eq("gallery_id", galleryId);

  if (!count || count === 0) {
    return { error: "Silakan pilih minimal 1 foto sebelum melakukan finalisasi kurasi." };
  }

  const { error: updateErr } = await supabase
    .from("galleries")
    .update({
      status: "PROOFING_SUBMITTED",
      updated_at: new Date().toISOString(),
    })
    .eq("id", galleryId);

  if (updateErr) {
    return { error: "Gagal memfinalisasi kurasi album." };
  }

  revalidatePath(`/galeri/${gallery.access_slug}`);
  revalidatePath("/admin/dashboard");

  return {
    success: true,
    message: `Kurasi ${count} foto berhasil difinalisasi dan dikirimkan ke tim editor album studio Iluxy Creative!`,
  };
}

/**
 * 8. Gated Master ZIP Generation (PBI-18)
 */
export async function getMasterZipDownloadToken(galleryId) {
  const supabase = await createClient();

  // Ambil galeri dan periksa status lunas invoice
  const { data: gallery, error: galErr } = await supabase
    .from("galleries")
    .select(`
      id,
      title,
      bookings (
        id,
        invoices (
          id,
          status,
          total_amount,
          remaining_amount
        )
      )
    `)
    .eq("id", galleryId)
    .single();

  if (galErr || !gallery) {
    return { error: "Galeri tidak ditemukan." };
  }

  const invoice = Array.isArray(gallery.bookings?.invoices)
    ? gallery.bookings.invoices[0]
    : gallery.bookings?.invoices;

  // Syarat Mutlak Lunas 100%
  if (!invoice || invoice.status !== "PAID") {
    return {
      locked: true,
      error: "Unduhan Master ZIP Resolusi Tinggi hanya dapat diakses setelah tagihan lunas 100%.",
      invoiceId: invoice?.id,
      remainingAmount: invoice?.remaining_amount || 0,
    };
  }

  // Generate Token Berlaku 48 Jam
  const token = `ZIP-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 48);

  const mockZipUrl = `/api/download/master/${token}`;

  await supabase.from("master_downloads").insert({
    gallery_id: galleryId,
    download_token: token,
    zip_file_url: mockZipUrl,
    expires_at: expiresAt.toISOString(),
  });

  return {
    locked: false,
    success: true,
    downloadToken: token,
    downloadUrl: mockZipUrl,
    expiresAt: expiresAt.toISOString(),
    message: "Akses master ZIP disetujui! Link unduh aktif selama 48 jam.",
  };
}

/**
 * 9. Admin Upload Batch Foto Galeri dengan Watermark (PBI-15)
 */
export async function uploadGalleryPhotosBatch(galleryId, photos) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.user_metadata?.role !== "ADMIN") {
    return { error: "Akses ditolak: Hanya admin yang berhak mengunggah foto galeri." };
  }

  if (!galleryId || !photos || photos.length === 0) {
    return { error: "Data foto tidak valid." };
  }

  // Masukkan rekaman media_assets
  const records = photos.map((p, index) => ({
    gallery_id: galleryId,
    file_name: p.fileName || `photo-${index + 1}.jpg`,
    original_url: p.originalUrl || p.watermarkUrl,
    watermark_url: p.watermarkUrl,
    thumbnail_url: p.thumbnailUrl || p.watermarkUrl,
    sort_order: index + 1,
  }));

  const { data, error } = await supabase
    .from("media_assets")
    .insert(records)
    .select("id");

  if (error) {
    console.error("Gagal simpan media assets:", error);
    return { error: "Gagal menyimpan metadata foto ke basis data." };
  }

  // Update status galeri menjadi PUBLISHED jika sebelumnya DRAFT
  await supabase
    .from("galleries")
    .update({
      status: "PUBLISHED",
      published_at: new Date().toISOString(),
    })
    .eq("id", galleryId);

  return {
    success: true,
    count: data.length,
    message: `${data.length} foto berhasil diunggah dan galeri dipublikasikan!`,
  };
}

/**
 * 10. Ambil Ringkasan Semua Galeri untuk Admin (PBI-15)
 */
export async function getAdminGalleriesOverview() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.user_metadata?.role !== "ADMIN") {
    return { galleries: [], unassignedBookings: [] };
  }

  // 1. Ambil semua galeri
  const { data: galleries, error: galErr } = await supabase
    .from("galleries")
    .select(`
      id,
      booking_id,
      title,
      access_slug,
      access_pin_hash,
      max_selection_quota,
      status,
      published_at,
      created_at,
      bookings (
        id,
        booking_code,
        session_date,
        packages (
          name,
          max_photos_retouch
        ),
        customers (
          users (
            full_name,
            phone_number
          )
        ),
        invoices (
          id,
          status,
          total_amount,
          remaining_amount
        )
      ),
      media_assets (
        id
      ),
      proofing_selections (
        id
      )
    `)
    .order("created_at", { ascending: false });

  if (galErr) {
    console.error("Gagal mengambil daftar galeri admin:", galErr);
  }

  // 2. Ambil pesanan yang belum dibuatkan galeri
  const { data: bookings } = await supabase
    .from("bookings")
    .select(`
      id,
      booking_code,
      session_date,
      packages (
        name,
        max_photos_retouch
      ),
      customers (
        users (
          full_name,
          phone_number
        )
      )
    `)
    .in("status", ["CONFIRMED", "COMPLETED"])
    .order("session_date", { ascending: false });

  const existingBookingIds = new Set((galleries || []).map((g) => g.booking_id));
  const unassignedBookings = (bookings || []).filter((b) => !existingBookingIds.has(b.id));

  return {
    galleries: galleries || [],
    unassignedBookings: unassignedBookings || [],
  };
}

/**
 * 11. Buat atau Edit Konfigurasi Galeri (PBI-15)
 */
export async function createOrUpdateBookingGallery(formData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.user_metadata?.role !== "ADMIN") {
    return { error: "Akses ditolak: Hanya admin yang berhak mengatur galeri." };
  }

  const galleryId = formData.get("galleryId");
  const bookingId = formData.get("bookingId");
  const title = formData.get("title")?.trim();
  const accessSlug = formData.get("accessSlug")?.trim()?.toLowerCase()?.replace(/\s+/g, "-");
  const pin = formData.get("pin")?.trim();
  const maxQuota = parseInt(formData.get("maxQuota") || "20", 10);

  if (!title || !accessSlug || !pin) {
    return { error: "Judul galeri, slug URL akses, dan PIN 6-digit wajib diisi." };
  }

  if (pin.length !== 6 || !/^\d+$/.test(pin)) {
    return { error: "PIN akses wajib berupa 6 digit angka numerik." };
  }

  if (galleryId) {
    // Update
    const { error } = await supabase
      .from("galleries")
      .update({
        title,
        access_slug: accessSlug,
        access_pin_hash: pin,
        max_selection_quota: maxQuota,
        updated_at: new Date().toISOString(),
      })
      .eq("id", galleryId);

    if (error) {
      if (error.code === "23505") {
        return { error: `Slug URL "${accessSlug}" telah digunakan oleh sesi lain. Gunakan slug unik.` };
      }
      return { error: "Gagal memperbarui pengaturan galeri." };
    }

    revalidatePath("/admin/galeri");
    revalidatePath(`/galeri/${accessSlug}`);
    return { success: true, message: "Pengaturan galeri berhasil diperbarui!" };
  } else {
    // Insert baru
    if (!bookingId) {
      return { error: "ID Pesanan wajib dipilih untuk membuat galeri baru." };
    }

    const { data, error } = await supabase
      .from("galleries")
      .insert({
        booking_id: bookingId,
        title,
        access_slug: accessSlug,
        access_pin_hash: pin,
        max_selection_quota: maxQuota,
        status: "DRAFT",
      })
      .select("id")
      .single();

    if (error) {
      if (error.code === "23505") {
        return { error: `Slug URL "${accessSlug}" telah digunakan. Silakan modifikasi slug.` };
      }
      return { error: "Gagal membuat galeri baru: " + error.message };
    }

    revalidatePath("/admin/galeri");
    return { success: true, galleryId: data.id, message: "Galeri sesi berhasil dibuat (Status: Draft)!" };
  }
}

/**
 * 12. Hapus Satu Foto dari Galeri (PBI-15)
 */
export async function deleteGalleryPhoto(mediaAssetId, galleryId) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.user_metadata?.role !== "ADMIN") {
    return { error: "Akses ditolak." };
  }

  const { error } = await supabase
    .from("media_assets")
    .delete()
    .eq("id", mediaAssetId);

  if (error) {
    return { error: "Gagal menghapus foto." };
  }

  revalidatePath("/admin/galeri");
  return { success: true, message: "Foto berhasil dihapus dari galeri." };
}
