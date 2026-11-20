import React, { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logoutUser } from "@/lib/actions/auth";
import { getUserBookings } from "@/lib/actions/booking";
import ClientBookingsList from "@/components/dashboard/ClientBookingsList";
import CustomerAvatarUpload from "@/components/dashboard/CustomerAvatarUpload";
import { 
  User, 
  Calendar, 
  Images, 
  LogOut, 
  Sparkles, 
  Clock, 
  Camera, 
  ShieldCheck, 
  ArrowRight,
  BookmarkCheck
} from "lucide-react";

async function DashboardContent() {
  await connection();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const fullName = user.user_metadata?.full_name || "Pelanggan Terhormat";
  const email = user.email;
  const phoneNumber = user.user_metadata?.phone_number || "-";
  const role = user.user_metadata?.role || "CLIENT";

  // Jika akun adalah ADMIN, arahkan langsung ke Panel Manajemen Studio Admin
  if (role === "ADMIN") {
    redirect("/admin/dashboard");
  }

  const [{ data: customer }, bookings] = await Promise.all([
    supabase
      .from("customers")
      .select("avatar_url")
      .eq("user_id", user.id)
      .maybeSingle(),
    getUserBookings(),
  ]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      {/* Header Profile Greeting */}
      <div className="relative overflow-hidden rounded-3xl bg-neutral-900/70 border border-white/10 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl mb-8">
        <div className="pointer-events-none absolute -top-24 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <CustomerAvatarUpload
              currentAvatarUrl={customer?.avatar_url || user.user_metadata?.avatar_url}
              fullName={fullName}
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300">
                  {role === "ADMIN" ? "Studio Administrator" : "Klien Terdaftar"}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Sesi Aktif
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                Halo, {fullName}!
              </h1>
              <p className="text-xs text-neutral-400 mt-0.5">
                {email} • WhatsApp: {phoneNumber}
              </p>
            </div>
          </div>

          {/* Logout Action */}
          <form action={logoutUser}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-800/80 hover:bg-neutral-800 border border-white/10 hover:border-rose-500/30 text-xs font-semibold text-neutral-300 hover:text-rose-400 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar Sesi</span>
            </button>
          </form>
        </div>
      </div>

      {/* Grid Menu Aksi Cepat */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Reservasi Baru */}
        <Link
          href="/booking"
          className="group relative flex flex-col justify-between p-6 rounded-2xl bg-neutral-900/50 hover:bg-neutral-900/80 border border-white/5 hover:border-amber-500/30 transition-all duration-300 shadow-lg"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
              Pesan Jadwal Sesi Baru
            </h3>
            <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
              Pilih paket fotografi impian dan kunci tanggal slot Anda dengan sistem anti double-booking.
            </p>
          </div>
          <div className="mt-6 flex items-center gap-1 text-xs font-semibold text-amber-400">
            <span>Pesan Sekarang</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Card 2: Private Gallery PIN */}
        <Link
          href="/galeri-privat"
          className="group relative flex flex-col justify-between p-6 rounded-2xl bg-neutral-900/50 hover:bg-neutral-900/80 border border-white/5 hover:border-amber-500/30 transition-all duration-300 shadow-lg"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
              <Images className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
              Akses Private Gallery
            </h3>
            <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
              Masukkan PIN 6 digit unik dari studio untuk melihat, proofing cetak album, dan mengunduh file master.
            </p>
          </div>
          <div className="mt-6 flex items-center gap-1 text-xs font-semibold text-amber-400">
            <span>Buka Galeri</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Card 3: Katalog Layanan */}
        <Link
          href="/katalog"
          className="group relative flex flex-col justify-between p-6 rounded-2xl bg-neutral-900/50 hover:bg-neutral-900/80 border border-white/5 hover:border-amber-500/30 transition-all duration-300 shadow-lg"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
              <Camera className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
              Eksplorasi Katalog Paket
            </h3>
            <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
              Lihat spesifikasi teknis, harga transparan, durasi jam sesi, dan bonus album cetak Iluxy Creative.
            </p>
          </div>
          <div className="mt-6 flex items-center gap-1 text-xs font-semibold text-amber-400">
            <span>Lihat Paket</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Section Riwayat Pesanan & Jadwal Klien (PBI-11) */}
      <div className="mt-12 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <BookmarkCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Riwayat Pemesanan & Status Sesi</h2>
              <p className="text-xs text-neutral-400">
                Pantau konfirmasi jadwal, lembar invoice tagihan, dan kebijakan pembatalan H-3.
              </p>
            </div>
          </div>

          <Link
            href="/booking"
            className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
          >
            <span>+ Pesan Sesi Baru</span>
          </Link>
        </div>

        <ClientBookingsList bookings={bookings} />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-5xl mx-auto px-4 py-16 text-center text-xs text-neutral-400">
          Memuat data akun klien...
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
