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
    if (error.message.includes("Email logins are disabled") || error.status === 422) {
      return {
        error: "Supabase Auth Error: Email logins are disabled. Harap aktifkan Email Provider di Dashboard Supabase (Authentication -> Providers -> Email -> Enable).",
      };
    }
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

/**
 * Update Foto Profil Pelanggan (Avatar) di Tabel Customers & Users
 */
export async function updateProfileAvatar(formData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sesi Anda tidak valid. Silakan login kembali." };
  }

  const avatarFile = formData.get("avatarFile");
  if (!avatarFile || !(avatarFile instanceof Blob) || avatarFile.size === 0) {
    return { error: "Silakan pilih berkas foto profil yang ingin diunggah." };
  }

  if (avatarFile.size > 3 * 1024 * 1024) {
    return { error: "Ukuran foto profil melebihi batas maksimal 3 MB." };
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
  if (!allowedTypes.includes(avatarFile.type)) {
    return { error: "Format gambar harus berupa JPG, PNG, atau WebP." };
  }

  try {
    const ext = avatarFile.name?.split(".").pop() || "jpg";
    const fileName = `${user.id}-${Date.now()}.${ext}`;
    const filePath = `avatars/${fileName}`;

    const arrayBuffer = await avatarFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadErr } = await supabase.storage
      .from("avatars")
      .upload(filePath, buffer, {
        contentType: avatarFile.type,
        upsert: true,
      });

    let publicUrl = "";
    if (uploadErr) {
      console.warn("Storage upload fallback ke data URI:", uploadErr);
      const base64 = buffer.toString("base64");
      publicUrl = `data:${avatarFile.type};base64,${base64}`;
    } else {
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
      publicUrl = urlData?.publicUrl || filePath;
    }

    // Update tabel customers
    await supabase
      .from("customers")
      .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
      .eq("user_id", user.id);

    // Update tabel users
    await supabase
      .from("users")
      .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
      .eq("id", user.id);

    // Update user metadata di Supabase Auth
    await supabase.auth.updateUser({
      data: { avatar_url: publicUrl },
    });

    revalidatePath("/", "layout");
    revalidatePath("/dashboard");

    return {
      success: true,
      avatarUrl: publicUrl,
      message: "Foto profil berhasil diperbarui!",
    };
  } catch (err) {
    console.error("Gagal update foto profil:", err);
    return { error: "Terjadi gangguan sistem saat memperbarui foto profil." };
  }
}
