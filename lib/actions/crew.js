"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * 1. Tugaskan Kru ke Jadwal Booking (PBI-14 / FR-14)
 */
export async function assignCrew(formData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.user_metadata?.role !== "ADMIN") {
    return { error: "Akses ditolak: Hanya admin yang berhak menugaskan kru." };
  }

  const bookingId = formData.get("bookingId");
  const crewName = formData.get("crewName")?.trim();
  const roleTitle = formData.get("roleTitle")?.trim() || "Lead Photographer";
  const contactNumber = formData.get("contactNumber")?.trim();

  if (!bookingId || !crewName) {
    return { error: "ID booking dan nama kru fotografer wajib diisi." };
  }

  const { data, error } = await supabase
    .from("crew_assignments")
    .insert({
      booking_id: bookingId,
      crew_name: crewName,
      role_title: roleTitle,
      contact_number: contactNumber,
    })
    .select()
    .single();

  if (error) {
    console.error("Gagal menugaskan kru:", error);
    return { error: "Gagal menyimpan penugasan kru ke database." };
  }

  revalidatePath("/admin/verifikasi");
  revalidatePath("/admin/dashboard");

  return { success: true, message: `Kru ${crewName} (${roleTitle}) berhasil ditugaskan!` };
}

/**
 * 2. Hapus Penugasan Kru
 */
export async function removeCrewAssignment(assignmentId) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.user_metadata?.role !== "ADMIN") {
    return { error: "Akses ditolak: Hanya admin yang berhak mengelola kru." };
  }

  const { error } = await supabase
    .from("crew_assignments")
    .delete()
    .eq("id", assignmentId);

  if (error) {
    return { error: "Gagal menghapus penugasan kru." };
  }

  revalidatePath("/admin/verifikasi");
  return { success: true, message: "Penugasan kru berhasil dihapus." };
}

/**
 * 3. Ambil Semua Pembayaran Masuk untuk Verifikasi Admin
 */
export async function getAdminPaymentsList() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.user_metadata?.role !== "ADMIN") {
    return [];
  }

  const { data, error } = await supabase
    .from("payments")
    .select(`
      id,
      invoice_id,
      payment_type,
      amount,
      proof_image_url,
      payment_status,
      bank_name,
      sender_account_name,
      rejection_reason,
      created_at,
      invoices (
        id,
        invoice_number,
        total_amount,
        dp_amount,
        remaining_amount,
        status,
        bookings (
          id,
          booking_code,
          session_date,
          start_time,
          end_time,
          location_type,
          venue_address,
          status,
          crew_assignments (
            id,
            crew_name,
            role_title,
            contact_number
          ),
          customers (
            city,
            users (
              full_name,
              email,
              phone_number
            )
          ),
          packages (
            name,
            duration_hours
          )
        )
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Gagal mengambil data payments untuk admin:", error);
    return [];
  }

  return data || [];
}
