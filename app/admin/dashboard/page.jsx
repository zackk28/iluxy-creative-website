import React, { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logoutUser } from "@/lib/actions/auth";
import { getAdminAnalyticsSummary } from "@/lib/actions/admin";
import AdminAnalyticsChart from "@/components/admin/AdminAnalyticsChart";
import { 
  ShieldAlert, 
  CheckCircle, 
  Clock, 
  UploadCloud, 
  Layers, 
  Users, 
  LogOut, 
  Sparkles, 
  TrendingUp,
  CreditCard,
  ArrowRight,
  FolderLock,
  Contact
} from "lucide-react";

export const metadata = {
  title: "Admin Studio Dashboard — Iluxy Creative",
  description: "Panel kendali operasional studio, omzet transaksi, kurasi album, dan kru fotografi.",
};

async function AdminDashboardContent() {
  await connection();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/admin/dashboard");
  }

  const role = user.user_metadata?.role || "CLIENT";
  if (role !== "ADMIN") {
    // Klien biasa diarahkan ke dashboard klien
    redirect("/dashboard");
  }

  const fullName = user.user_metadata?.full_name || "Admin Studio";
  const email = user.email;

  // Ambil Data Analitik Real-time
  const analytics = await getAdminAnalyticsSummary();

  const formatRupiah = (val) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      {/* Top Banner Studio Admin */}
      <div className="relative overflow-hidden rounded-3xl bg-neutral-900/80 border border-amber-500/30 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl shadow-amber-500/5 mb-8">
        <div className="pointer-events-none absolute -top-24 right-0 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-neutral-950 font-black text-2xl shadow-lg shadow-amber-500/40">
              AD
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs uppercase font-extrabold tracking-widest px-3 py-1 rounded-full bg-amber-500 text-neutral-950 shadow-md">
                  Studio Administrator
                </span>
                <span className="text-[11px] text-amber-300 font-medium">
                  Hak Akses Penuh (FR-01 s/d FR-17)
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                Panel Manajemen — {fullName}
              </h1>
              <p className="text-xs text-neutral-400 mt-0.5">
                {email} • Wilayah Kerja: Iluxy Creative Studio Padang
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
              <span>Keluar Sesi Admin</span>
            </button>
          </form>
        </div>
      </div>

      {/* Ringkasan Status Studio (KPI Mini Widgets) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-5 rounded-2xl bg-neutral-900/40 border border-white/5">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium">Omzet Kotor Terverifikasi</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-400">
            {formatRupiah(analytics?.totalRevenue)}
          </div>
          <p className="text-[11px] text-emerald-400 mt-1">Akumulasi transaksi sukses</p>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900/40 border border-white/5">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium">Antrean Verifikasi DP</span>
            <CreditCard className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {analytics?.pendingPaymentsCount || 0} Bukti
          </div>
          <p className="text-[11px] text-amber-400/80 mt-1">Perlu dicek manual oleh admin</p>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900/40 border border-white/5">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium">Sesi Terkonfirmasi</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {analytics?.confirmedBookingsCount || 0} Sesi Foto
          </div>
          <p className="text-[11px] text-emerald-400 mt-1">Kru & Fotografer terkonfirmasi</p>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900/40 border border-white/5">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium">Total Pesanan Masuk</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {analytics?.totalBookingsCount || 0} Booking
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">Basis data aktif Supabase</p>
        </div>
      </div>

      {/* FR-17 Analitik Omzet & Grafik Recharts */}
      {analytics && (
        <AdminAnalyticsChart
          data={analytics.chartData}
          topPackages={analytics.topPackages}
        />
      )}

      {/* Navigasi Modul Admin */}
      <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-400 mb-4">
        Modul Operasional Studio
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Modul 1: Verifikasi Pembayaran & Kru */}
        <Link
          href="/admin/verifikasi"
          className="group p-6 rounded-2xl bg-neutral-900/50 border border-white/5 hover:border-amber-500/30 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-1 group-hover:text-amber-400 transition-colors">
              Verifikasi DP & Kru
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed mb-4">
              Cek keabsahan bukti transfer bank Nagari/BCA dan tugaskan fotografer/asisten sesi.
            </p>
          </div>
          <span className="text-[11px] font-semibold text-amber-400 flex items-center gap-1">
            <span>Buka Verifikasi</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </span>
        </Link>

        {/* Modul 2: Mass Upload & Watermark (PBI-15) */}
        <Link
          href="/admin/galeri"
          className="group p-6 rounded-2xl bg-neutral-900/50 border border-white/5 hover:border-amber-500/30 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-1 group-hover:text-amber-400 transition-colors">
              Galeri & Watermark
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed mb-4">
              Buat gerbang PIN 6-digit galeri privat, upload massal, dan auto-watermark Iluxy.
            </p>
          </div>
          <span className="text-[11px] font-semibold text-amber-400 flex items-center gap-1">
            <span>Buka Galeri Manager</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </span>
        </Link>

        {/* Modul 3: Manajemen Paket */}
        <Link
          href="/admin/paket"
          className="group p-6 rounded-2xl bg-neutral-900/50 border border-white/5 hover:border-amber-500/30 transition-all flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors mb-1">
              Paket & Harga
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed mb-4">
              Ubah tarif paket foto (Wedding, Wisuda, Portrait), ketentuan DP, dan kuota retouch album.
            </p>
          </div>
          <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            <span>Buka Manajemen Paket</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>

        {/* Modul 4: Direktori Pelanggan (PBI-19) */}
        <Link
          href="/admin/pelanggan"
          className="group p-6 rounded-2xl bg-neutral-900/50 border border-white/5 hover:border-amber-500/30 transition-all flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
              <Contact className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors mb-1">
              Direktori Pelanggan
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed mb-4">
              Database kontak klien studio, WhatsApp 1-klik, domisili, dan total akumulasi transaksi.
            </p>
          </div>
          <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            <span>Buka Direktori Klien</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-6xl mx-auto px-4 py-16 text-center text-xs text-neutral-400">
          Memuat panel administrator...
        </div>
      }
    >
      <AdminDashboardContent />
    </Suspense>
  );
}
