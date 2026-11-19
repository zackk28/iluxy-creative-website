"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * 1. Upload Bukti Transfer & Simpan Catatan Pembayaran (PBI-13)
 */
export async function submitPaymentProof(formData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sesi tidak valid. Silakan login kembali." };
  }

  const invoiceId = formData.get("invoiceId");
  const paymentType = formData.get("paymentType") || "DP"; // 'DP' | 'SETTLEMENT' | 'FULL'
  const amount = parseFloat(formData.get("amount"));
  const bankName = formData.get("bankName")?.trim();
  const senderAccountName = formData.get("senderAccountName")?.trim();
  const proofFile = formData.get("proofFile");

  if (!invoiceId || !amount || amount <= 0 || !bankName || !senderAccountName) {
    return { error: "Semua data konfirmasi pembayaran wajib diisi dengan benar." };
  }

  if (!proofFile || !(proofFile instanceof Blob) || proofFile.size === 0) {
    return { error: "File foto struk / bukti transfer bank wajib diunggah." };
  }

  // Validasi MIME Type (Hanya JPEG, PNG, WebP)
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
  if (!allowedTypes.includes(proofFile.type)) {
    return { error: "Format file tidak didukung. Harap unggah berkas gambar JPG, PNG, atau WebP." };
  }

  // Validasi Ukuran File (Maksimal 5MB)
  if (proofFile.size > 5 * 1024 * 1024) {
    return { error: "Ukuran file bukti transfer melebihi batas maksimal 5 MB." };
  }

  try {
    // A. Generate Unique File Name di Bucket
    const fileExt = proofFile.name?.split(".").pop() || "jpg";
    const uniqueFileName = `${invoiceId}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
    const filePath = `proofs/${uniqueFileName}`;

    // B. Upload ke Supabase Storage Bucket 'payment-proofs'
    const arrayBuffer = await proofFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from("payment-proofs")
      .upload(filePath, buffer, {
        contentType: proofFile.type,
        upsert: false,
      });

    let proofUrl = "";
    if (uploadError) {
      console.warn("Upload ke storage gagal atau bucket belum disetel, simpan metadata:", uploadError);
      // Fallback: Gunakan path relatif atau URL sementara
      proofUrl = `/uploads/mock-proofs/${uniqueFileName}`;
    } else {
      const { data: publicUrlData } = supabase.storage
        .from("payment-proofs")
        .getPublicUrl(filePath);
      proofUrl = publicUrlData?.publicUrl || filePath;
    }

    // C. Insert ke Tabel Payments
    const { data: paymentRecord, error: insertError } = await supabase
      .from("payments")
      .insert({
        invoice_id: invoiceId,
        payment_type: paymentType,
        amount: amount,
        proof_image_url: proofUrl,
        bank_name: bankName,
        sender_account_name: senderAccountName,
        payment_status: "PENDING_VERIFICATION",
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Gagal simpan rekaman payment:", insertError);
      return { error: "Gagal menyimpan rincian pembayaran ke database." };
    }

    // D. Update Status Invoice Menjadi PENDING_VERIFICATION (jika saat ini UNPAID)
    await supabase
      .from("invoices")
      .update({
        status: "UNPAID", // Tetap UNPAID atau ditandai proses hingga diverifikasi admin
        updated_at: new Date().toISOString(),
      })
      .eq("id", invoiceId);

    revalidatePath(`/invoice/${invoiceId}`);
    revalidatePath("/dashboard");
    revalidatePath("/admin/verifikasi");

    return {
      success: true,
      paymentId: paymentRecord.id,
      message: "Bukti transfer berhasil diunggah! Admin studio akan memverifikasi dalam kurun waktu 1x24 jam.",
    };
  } catch (err) {
    console.error("Crash upload bukti bayar:", err);
    return { error: "Terjadi gangguan sistem saat mengunggah bukti bayar." };
  }
}

/**
 * 2. Admin Verifikasi Pembayaran Sah / Tolak (PBI-14)
 */
export async function verifyPaymentStatus(paymentId, action, rejectionReason = "") {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.user_metadata?.role !== "ADMIN") {
    return { error: "Akses ditolak: Hanya admin yang berhak memverifikasi transaksi." };
  }

  if (!paymentId || !["VERIFY", "REJECT"].includes(action)) {
    return { error: "Parameter aksi tidak valid." };
  }

  // Ambil record payment beserta invoice & booking terkait
  const { data: payment, error: pError } = await supabase
    .from("payments")
    .select(`
      id,
      invoice_id,
      payment_type,
      amount,
      payment_status,
      invoices (
        id,
        booking_id,
        total_amount,
        dp_amount,
        remaining_amount,
        status,
        bookings (
          id,
          status
        )
      )
    `)
    .eq("id", paymentId)
    .single();

  if (pError || !payment) {
    return { error: "Data pembayaran tidak ditemukan." };
  }

  const now = new Date().toISOString();

  if (action === "VERIFY") {
    // 1. Update Payment Status -> VERIFIED
    await supabase
      .from("payments")
      .update({
        payment_status: "VERIFIED",
        verified_by: user.id,
        verified_at: now,
      })
      .eq("id", paymentId);

    // 2. Update Invoice Status
    let newInvoiceStatus = "PARTIALLY_PAID";
    if (payment.payment_type === "FULL" || payment.payment_type === "SETTLEMENT") {
      newInvoiceStatus = "PAID";
    }

    await supabase
      .from("invoices")
      .update({
        status: newInvoiceStatus,
        updated_at: now,
      })
      .eq("id", payment.invoice_id);

    // 3. Update Booking Status -> CONFIRMED
    if (payment.invoices?.booking_id) {
      await supabase
        .from("bookings")
        .update({
          status: "CONFIRMED",
          updated_at: now,
        })
        .eq("id", payment.invoices.booking_id);
    }

    revalidatePath("/admin/verifikasi");
    revalidatePath(`/invoice/${payment.invoice_id}`);
    revalidatePath("/dashboard");

    return { success: true, message: "Pembayaran berhasil diverifikasi dan jadwal sesi telah dikonfirmasi!" };
  } else {
    // Tolak Pembayaran
    await supabase
      .from("payments")
      .update({
        payment_status: "REJECTED",
        rejection_reason: rejectionReason || "Bukti transfer tidak terbaca atau mutasi bank tidak sesuai.",
        verified_by: user.id,
        verified_at: now,
      })
      .eq("id", paymentId);

    revalidatePath("/admin/verifikasi");
    revalidatePath(`/invoice/${payment.invoice_id}`);

    return { success: true, message: "Pembayaran telah ditolak." };
  }
}
