"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/**
 * Registrasi akun Klien baru ke Supabase Auth & Tabel Users
 */
export async function registerClient(formData) {
  const full_name = formData.get("full_name")?.trim();
  const email = formData.get("email")?.trim()?.toLowerCase();
  const phone_number = formData.get("phone_number")?.trim();
  const password = formData.get("password");
  const confirm_password = formData.get("confirm_password");

  // 1. Validasi Input Dasar
  if (!full_name || !email || !phone_number || !password) {
    return { error: "Semua field formulir wajib diisi." };
  }

  if (password.length < 6) {
    return { error: "Kata sandi minimal harus 6 karakter." };
  }

  if (password !== confirm_password) {
    return { error: "Konfirmasi kata sandi tidak cocok." };
  }

  const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,10}$/;
  if (!phoneRegex.test(phone_number.replace(/\s|-/g, ""))) {
    return { error: "Nomor WhatsApp tidak valid (contoh: 081234567890)." };
  }

  const supabase = await createClient();

  // 2. Registrasi Akun di Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name,
        phone_number,
        role: "CLIENT",
      },
    },
  });

  if (error) {
    if (error.message.includes("already registered") || error.message.includes("User already registered")) {
      return { error: "Email ini sudah terdaftar. Silakan login." };
    }
    return { error: error.message };
  }

  // 3. Sinkronisasi ke Tabel Relasional (public.users & public.customers)
  if (data?.user) {
    try {
      await supabase.from("users").insert({
        id: data.user.id,
        email,
        full_name,
        phone_number,
        role: "CLIENT",
      });

      await supabase.from("customers").insert({
        user_id: data.user.id,
        city: "Padang",
      });
    } catch (syncErr) {
      console.warn("Sinkronisasi database publik (opsional jika trigger aktif):", syncErr);
    }
  }

  // Jika membutuhkan konfirmasi email
  if (data?.user && !data?.session) {
    return {
      success: true,
      needsEmailConfirmation: true,
      message: "Pendaftaran berhasil! Silakan periksa inbox email Anda untuk verifikasi akun.",
    };
  }

  revalidatePath("/", "layout");
  return {
    success: true,
    needsEmailConfirmation: false,
    message: "Pendaftaran berhasil! Akun Anda telah aktif.",
  };
}

/**
 * Login Multi-Role (Klien atau Admin Studio)
 */
export async function loginUser(formData) {
  const email = formData.get("email")?.trim()?.toLowerCase();
  const password = formData.get("password");
  const redirectTo = formData.get("redirectTo") || "";

  if (!email || !password) {
    return { error: "Email dan kata sandi wajib diisi." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "Email atau kata sandi tidak valid. Silakan coba lagi." };
  }

  // Identifikasi peran (Role-based access)
  const role = data?.user?.user_metadata?.role || "CLIENT";

  revalidatePath("/", "layout");

  let destination = role === "ADMIN" ? "/admin/dashboard" : "/dashboard";
  if (redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//")) {
    destination = redirectTo;
  }

  return {
    success: true,
    role,
    redirectTo: destination,
  };
}

/**
 * Logout User & Hapus Session Token
 */
export async function logoutUser() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
