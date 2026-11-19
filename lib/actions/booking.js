"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Helper: Generate Random Unique Suffix
 */
function generateCodeSuffix() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * 1. Ambil Semua Paket Aktif untuk Wizard Booking
 */
export async function getActivePackagesForBooking() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("packages")
    .select("id, name, slug, price, dp_amount, duration_hours, max_photos_retouch, description, features, cover_image_url, category_id, package_categories(id, name, slug)")
    .eq("is_active", true)
    .order("price", { ascending: true });

  if (error) {
    console.error("Gagal mengambil paket aktif:", error);
    return [];
  }

  return data || [];
}

/**
 * 2. Ambil Slot Waktu yang Sudah Terpesona pada Tanggal Tertentu
 */
export async function getBookedSlotsForDate(sessionDate) {
  if (!sessionDate) return [];

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("bookings")
    .select("start_time, end_time, status")
    .eq("session_date", sessionDate)
    .neq("status", "CANCELLED");

  if (error) {
    console.error("Gagal mengambil slot terpesan:", error);
    return [];
  }

  return data || [];
}

/**
 * 3. Validasi Ketersediaan Slot (Anti Double-Booking Engine)
 */
export async function checkSlotAvailability(sessionDate, startTime, endTime) {
  if (!sessionDate || !startTime || !endTime) {
    return { available: false, error: "Parameter tanggal dan jam sesi tidak lengkap." };
  }

  const supabase = await createClient();

  // Prioritas 1: Gunakan PostgreSQL Stored Procedure check_slot_availability
  try {
    const { data: isAvailable, error: rpcError } = await supabase.rpc(
      "check_slot_availability",
      {
        p_date: sessionDate,
        p_start: startTime,
        p_end: endTime,
      }
    );

    if (!rpcError && typeof isAvailable === "boolean") {
      return { available: isAvailable };
    }
  } catch (err) {
    console.warn("RPC check_slot_availability fallback ke query langsung:", err);
  }

  // Fallback 2: Direct query PostgreSQL jika function belum di-deploy
  const { data: overlapping, error } = await supabase
    .from("bookings")
    .select("id")
    .eq("session_date", sessionDate)
    .neq("status", "CANCELLED")
    .lt("start_time", endTime)
    .gt("end_time", startTime);

  if (error) {
    console.error("Error cek bentrok slot:", error);
    return { available: false, error: "Gagal memverifikasi ketersediaan jadwal." };
  }

  const available = !overlapping || overlapping.length === 0;
  return { available };
}

/**
 * 4. Buat Reservasi Pemesanan Baru & Terbitkan Tagihan Digital (PBI-09 & PBI-10)
 */
export async function createBookingOrder(payload) {
  const supabase = await createClient();

  // A. Verifikasi Autentikasi Pengguna
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "Sesi Anda telah berakhir atau belum login. Silakan login terlebih dahulu untuk melakukan reservasi.",
      requireLogin: true,
    };
  }

  const {
    packageId,
    sessionDate,
    startTime,
    endTime,
    locationType = "STUDIO",
    venueAddress,
    notes,
    customerName,
    customerPhone,
    instagram,
  } = payload;

  // B. Validasi Field Mandatori
  if (!packageId || !sessionDate || !startTime || !endTime) {
    return { error: "Paket, tanggal sesi, dan jam pemotretan wajib dipilih." };
  }

  if (locationType === "OUTDOOR" && (!venueAddress || venueAddress.trim() === "")) {
    return { error: "Alamat lokasi acara outdoor wajib dicantumkan." };
  }

  // C. Dapatkan atau Buat Record Customer
  let customerId = null;
  const { data: existingCustomer } = await supabase
    .from("customers")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingCustomer) {
    customerId = existingCustomer.id;
  } else {
    const { data: newCustomer, error: custErr } = await supabase
      .from("customers")
      .insert({
        user_id: user.id,
        city: "Padang",
        address: venueAddress || "Padang",
      })
      .select("id")
      .single();

    if (custErr || !newCustomer) {
      console.error("Gagal sinkronisasi data pelanggan:", custErr);
      return { error: "Gagal menghubungkan profil pelanggan ke database." };
    }
    customerId = newCustomer.id;
  }

  // D. Hitung Harga Murni Server-Side (Cegah Client-Side Price Tampering)
  const { data: pkg, error: pkgErr } = await supabase
    .from("packages")
    .select("id, name, price, dp_amount, duration_hours, is_active")
    .eq("id", packageId)
    .single();

  if (pkgErr || !pkg || !pkg.is_active) {
    return { error: "Paket layanan tidak ditemukan atau sedang dinonaktifkan." };
  }

  const totalAmount = parseFloat(pkg.price);
  const dpAmount = parseFloat(pkg.dp_amount);
  const remainingAmount = totalAmount - dpAmount;

  // E. Anti Double-Booking Concurrency Check
  const availability = await checkSlotAvailability(sessionDate, startTime, endTime);
  if (!availability.available) {
    return {
      error:
        "Maaf, slot waktu pada tanggal dan jam tersebut baru saja dipesan oleh pelanggan lain. Silakan pilih jam atau tanggal lain.",
    };
  }

  // F. Format Kode Unik Booking & Invoice
  const now = new Date();
  const dateStr =
    now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0");
  const randomSuffix = generateCodeSuffix();

  const bookingCode = `IX-${dateStr}-${randomSuffix}`;
  const invoiceNumber = `INV-${dateStr}-${randomSuffix}`;

  const studioDefaultAddress = "Studio Iluxy Creative, Jl. Veteran No. 42B, Padang Barat, Kota Padang";
  const finalAddress = locationType === "STUDIO" ? studioDefaultAddress : venueAddress;
  const combinedNotes = [
    customerName ? `Pemesan: ${customerName}` : null,
    customerPhone ? `WA: ${customerPhone}` : null,
    instagram ? `IG: ${instagram}` : null,
    notes ? `Catatan: ${notes}` : null,
  ]
    .filter(Boolean)
    .join(" | ");

  // G. Insert Transaksi ke Tabel Bookings
  const { data: booking, error: bookingErr } = await supabase
    .from("bookings")
    .insert({
      booking_code: bookingCode,
      customer_id: customerId,
      package_id: pkg.id,
      session_date: sessionDate,
      start_time: startTime,
      end_time: endTime,
      location_type: locationType,
      venue_address: finalAddress,
      notes: combinedNotes,
      status: "PENDING_DP",
    })
    .select("id, booking_code")
    .single();

  if (bookingErr || !booking) {
    console.error("Gagal membuat booking:", bookingErr);
    return { error: "Gagal menyimpan jadwal pesanan. Silakan coba kembali." };
  }

  // H. Penerbitan Tagihan Digital di Tabel Invoices (Batas Bayar DP 24 Jam)
  const dueDate = new Date();
  dueDate.setHours(dueDate.getHours() + 24);

  const { data: invoice, error: invoiceErr } = await supabase
    .from("invoices")
    .insert({
      invoice_number: invoiceNumber,
      booking_id: booking.id,
      total_amount: totalAmount,
      dp_amount: dpAmount,
      remaining_amount: remainingAmount,
      status: "UNPAID",
      due_date: dueDate.toISOString(),
    })
    .select("id, invoice_number")
    .single();

  if (invoiceErr || !invoice) {
    console.error("Gagal menerbitkan invoice:", invoiceErr);
    // Rollback manual jika invoice gagal
    await supabase.from("bookings").delete().eq("id", booking.id);
    return { error: "Gagal menerbitkan lembar tagihan digital." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/admin/dashboard");

  return {
    success: true,
    bookingId: booking.id,
    bookingCode: booking.booking_code,
    invoiceId: invoice.id,
    invoiceNumber: invoice.invoice_number,
    message: "Reservasi berhasil diajukan! Mengalihkan ke lembar tagihan...",
  };
}

/**
 * 5. Ambil Detail Tagihan Invoice (PBI-12)
 */
export async function getInvoiceById(invoiceId) {
  if (!invoiceId) return null;

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("invoices")
    .select(`
      id,
      invoice_number,
      total_amount,
      dp_amount,
      remaining_amount,
      status,
      due_date,
      created_at,
      bookings (
        id,
        booking_code,
        session_date,
        start_time,
        end_time,
        location_type,
        venue_address,
        notes,
        status,
        customers (
          id,
          city,
          address,
          users (
            id,
            full_name,
            email,
            phone_number
          )
        ),
        packages (
          id,
          name,
          slug,
          price,
          dp_amount,
          duration_hours,
          max_photos_retouch,
          package_categories (
            name
          )
        )
      )
    `)
    .eq("id", invoiceId)
    .single();

  if (error || !data) {
    console.error("Gagal mengambil data invoice:", error);
    return null;
  }

  return data;
}

/**
 * 6. Ambil Riwayat Booking Klien (PBI-11)
 */
export async function getUserBookings() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data: customer } = await supabase
    .from("customers")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!customer) return [];

  const { data, error } = await supabase
    .from("bookings")
    .select(`
      id,
      booking_code,
      session_date,
      start_time,
      end_time,
      location_type,
      venue_address,
      status,
      created_at,
      packages (
        name,
        price,
        cover_image_url,
        duration_hours
      ),
      invoices (
        id,
        invoice_number,
        status,
        total_amount,
        dp_amount,
        remaining_amount
      )
    `)
    .eq("customer_id", customer.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Gagal mengambil riwayat booking:", error);
    return [];
  }

  return data || [];
}

/**
 * 7. Pembatalan Booking dengan Validasi Ketat Kebijakan H-3 (PBI-11)
 */
export async function cancelBooking(bookingId, reason = "") {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sesi tidak valid. Silakan login kembali." };
  }

  // Ambil data booking & verifikasi IDOR (kepemilikan akun)
  const { data: booking, error: fetchErr } = await supabase
    .from("bookings")
    .select(`
      id,
      session_date,
      status,
      customer_id,
      customers (
        user_id
      )
    `)
    .eq("id", bookingId)
    .single();

  if (fetchErr || !booking) {
    return { error: "Pesanan booking tidak ditemukan." };
  }

  // Verifikasi IDOR: Klien hanya boleh membatalkan pesanan miliknya sendiri
  const role = user.user_metadata?.role;
  if (role !== "ADMIN" && booking.customers?.user_id !== user.id) {
    return { error: "Akses ditolak: Anda tidak memiliki wewenang membatalkan pesanan ini." };
  }

  if (booking.status === "CANCELLED") {
    return { error: "Pesanan ini sudah dibatalkan sebelumnya." };
  }

  // Validasi Rumus H-3: session_date - NOW() >= 3 hari
  const sessionDateObj = new Date(booking.session_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  sessionDateObj.setHours(0, 0, 0, 0);

  const diffTime = sessionDateObj.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 3 && role !== "ADMIN") {
    return {
      error: `Kebijakan H-3 Berlaku: Sesi Anda tersisa ${diffDays} hari lagi. Pembatalan mandiri hanya diizinkan minimal 3 hari sebelum tanggal sesi. Silakan hubungi admin studio via WhatsApp untuk konsultasi reschedule.`,
    };
  }

  // Update status booking menjadi CANCELLED
  const { error: updateErr } = await supabase
    .from("bookings")
    .update({
      status: "CANCELLED",
      cancellation_reason: reason || "Dibatalkan oleh klien via sistem.",
      updated_at: new Date().toISOString(),
    })
    .eq("id", bookingId);

  if (updateErr) {
    return { error: "Gagal memproses pembatalan di database." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/riwayat");
  return { success: true, message: "Pesanan berhasil dibatalkan." };
}
