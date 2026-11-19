"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Helper: Validasi sesi apakah pengguna memiliki peran ADMIN
 */
async function verifyAdminSession(supabase) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { authorized: false, error: "Silakan login terlebih dahulu." };
  }

  const role = user.user_metadata?.role;
  if (role !== "ADMIN") {
    return { authorized: false, error: "Akses ditolak: Hanya Administrator yang berhak mengelola paket." };
  }

  return { authorized: true, user };
}

/**
 * 1. Ambil Detail Paket Berdasarkan Slug (Publik)
 */
export async function getPackageBySlug(slug) {
  if (!slug) return null;

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("packages")
    .select("*, package_categories(id, name, slug, description)")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

/**
 * 2. Tambah Paket Layanan Baru (Admin Only)
 */
export async function createPackage(formData) {
  const supabase = await createClient();
  const authCheck = await verifyAdminSession(supabase);
  if (!authCheck.authorized) {
    return { error: authCheck.error };
  }

  const name = formData.get("name")?.trim();
  const category_id = parseInt(formData.get("category_id"), 10);
  const price = parseFloat(formData.get("price"));
  const dp_amount = parseFloat(formData.get("dp_amount"));
  const duration_hours = parseInt(formData.get("duration_hours"), 10);
  const max_photos_retouch = parseInt(formData.get("max_photos_retouch"), 10) || 20;
  const description = formData.get("description")?.trim() || "";
  const cover_image_url = formData.get("cover_image_url")?.trim() || "";
  const featuresRaw = formData.get("features") || "";

  // Validasi Input Server-Side
  if (!name || isNaN(category_id) || isNaN(price) || isNaN(dp_amount) || isNaN(duration_hours)) {
    return { error: "Semua kolom wajib diisi dengan format yang benar." };
  }

  if (price <= 0 || dp_amount <= 0 || duration_hours <= 0) {
    return { error: "Harga, DP, dan durasi sesi harus lebih besar dari 0." };
  }

  if (dp_amount > price) {
    return { error: "Uang muka (DP) tidak boleh lebih besar dari total harga paket." };
  }

  // Parse features array
  const features = featuresRaw
    .split("\n")
    .map((f) => f.trim())
    .filter(Boolean);

  // Buat Slug Unik
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
  const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;

  const { data, error } = await supabase.from("packages").insert({
    name,
    slug,
    category_id,
    price,
    dp_amount,
    duration_hours,
    max_photos_retouch,
    description,
    features,
    cover_image_url: cover_image_url || "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
    is_active: true,
  }).select().single();

  if (error) {
    return { error: `Gagal menyimpan paket: ${error.message}` };
  }

  revalidatePath("/katalog");
  revalidatePath("/admin/paket");

  return { success: true, package: data };
}

/**
 * 3. Update Paket Layanan (Admin Only)
 */
export async function updatePackage(packageId, formData) {
  const supabase = await createClient();
  const authCheck = await verifyAdminSession(supabase);
  if (!authCheck.authorized) {
    return { error: authCheck.error };
  }

  const name = formData.get("name")?.trim();
  const category_id = parseInt(formData.get("category_id"), 10);
  const price = parseFloat(formData.get("price"));
  const dp_amount = parseFloat(formData.get("dp_amount"));
  const duration_hours = parseInt(formData.get("duration_hours"), 10);
  const max_photos_retouch = parseInt(formData.get("max_photos_retouch"), 10) || 20;
  const description = formData.get("description")?.trim() || "";
  const cover_image_url = formData.get("cover_image_url")?.trim() || "";
  const featuresRaw = formData.get("features") || "";

  if (!name || isNaN(category_id) || isNaN(price) || isNaN(dp_amount) || isNaN(duration_hours)) {
    return { error: "Semua kolom wajib diisi dengan format yang benar." };
  }

  if (price <= 0 || dp_amount <= 0 || duration_hours <= 0) {
    return { error: "Harga, DP, dan durasi sesi harus lebih besar dari 0." };
  }

  const features = featuresRaw
    .split("\n")
    .map((f) => f.trim())
    .filter(Boolean);

  const { error } = await supabase
    .from("packages")
    .update({
      name,
      category_id,
      price,
      dp_amount,
      duration_hours,
      max_photos_retouch,
      description,
      features,
      cover_image_url,
      updated_at: new Date().toISOString(),
    })
    .eq("id", packageId);

  if (error) {
    return { error: `Gagal memperbarui paket: ${error.message}` };
  }

  revalidatePath("/katalog");
  revalidatePath("/admin/paket");

  return { success: true };
}

/**
 * 4. Toggle Status Aktif / Nonaktif Paket (Admin Only)
 */
export async function togglePackageStatus(packageId, nextStatus) {
  const supabase = await createClient();
  const authCheck = await verifyAdminSession(supabase);
  if (!authCheck.authorized) {
    return { error: authCheck.error };
  }

  const { error } = await supabase
    .from("packages")
    .update({ is_active: nextStatus, updated_at: new Date().toISOString() })
    .eq("id", packageId);

  if (error) {
    return { error: `Gagal mengubah status paket: ${error.message}` };
  }

  revalidatePath("/katalog");
  revalidatePath("/admin/paket");

  return { success: true };
}

/**
 * 5. Hapus Paket Layanan (Admin Only)
 */
export async function deletePackage(packageId) {
  const supabase = await createClient();
  const authCheck = await verifyAdminSession(supabase);
  if (!authCheck.authorized) {
    return { error: authCheck.error };
  }

  const { error } = await supabase
    .from("packages")
    .delete()
    .eq("id", packageId);

  if (error) {
    return { error: `Gagal menghapus paket: ${error.message}` };
  }

  revalidatePath("/katalog");
  revalidatePath("/admin/paket");

  return { success: true };
}
