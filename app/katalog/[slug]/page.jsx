import React, { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { getPackageBySlug } from "@/lib/actions/packages";
import { formatRupiah } from "@/lib/utils";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { 
  Clock, 
  Camera, 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Calendar, 
  HelpCircle, 
  MessageCircle,
  Lock,
  Layers
} from "lucide-react";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const pkg = await getPackageBySlug(slug);

  if (!pkg) {
    return {
      title: "Paket Tidak Ditemukan — Iluxy Creative",
    };
  }

  return {
    title: `${pkg.name} — Katalog Layanan Iluxy Creative Padang`,
    description: pkg.description || `Rincian spesifikasi paket foto ${pkg.name} di Iluxy Creative Padang.`,
  };
}

async function PackageDetailContent({ params }) {
  await connection();
  const { slug } = await params;
  const pkg = await getPackageBySlug(slug);

  if (!pkg) {
    notFound();
  }

  const remainingPayment = Math.max(0, pkg.price - pkg.dp_amount);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* 1. BREADCRUMB & BACK NAVIGATION */}
      <div className="flex items-center gap-2 text-xs text-neutral-400 mb-6">
        <Link href="/" className="hover:text-amber-400 transition-colors">
          Beranda
        </Link>
        <span>/</span>
        <Link href="/katalog" className="hover:text-amber-400 transition-colors">
          Katalog
        </Link>
        <span>/</span>
        <span className="text-white font-medium truncate max-w-xs">{pkg.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* 2. LEFT / MAIN COLUMN (RINCIAN SPESIFIKASI & FASILITAS) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          {/* Main Cover Image */}
          <div className="relative h-72 sm:h-96 w-full rounded-3xl overflow-hidden bg-neutral-900 border border-white/10 shadow-2xl">
            <img
              src={pkg.cover_image_url || "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80"}
              alt={pkg.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent pointer-events-none" />

            <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-neutral-950/80 backdrop-blur-md text-amber-300 font-bold text-xs border border-white/10">
                {pkg.package_categories?.name || "Fotografi"}
              </span>

              {pkg.price >= 5000000 && (
                <span className="px-3 py-1 rounded-full bg-amber-500 text-neutral-950 font-black text-xs uppercase tracking-wider shadow-lg">
                  Paket Terpopuler
                </span>
              )}
            </div>
          </div>

          {/* Title & Description */}
          <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900/60 border border-white/10 backdrop-blur-xl space-y-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 block mb-1">
                Spesifikasi Layanan Resmi
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {pkg.name}
              </h1>
            </div>

            <p className="text-sm text-neutral-300 leading-relaxed">
              {pkg.description || "Layanan dokumentasi visual eksklusif dengan peralatan studio sinematik dan fotografer profesional bersertifikat."}
            </p>

            {/* Quick Specs Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3">
              <div className="p-3.5 rounded-2xl bg-neutral-950/60 border border-white/5 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase text-neutral-500 font-bold block">Durasi Sesi</span>
                  <span className="text-xs font-bold text-white">{pkg.duration_hours} Jam Sesi</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-neutral-950/60 border border-white/5 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase text-neutral-500 font-bold block">Foto Retouch</span>
                  <span className="text-xs font-bold text-white">{pkg.max_photos_retouch} Cetak Album</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-neutral-950/60 border border-white/5 flex items-center gap-3 col-span-2 sm:col-span-1">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase text-neutral-500 font-bold block">Private Gallery</span>
                  <span className="text-xs font-bold text-white">PIN 6-Digit</span>
                </div>
              </div>
            </div>
          </div>

          {/* Fasilitas & Benefit Detail */}
          <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900/60 border border-white/10 backdrop-blur-xl">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Fasilitas & Output yang Anda Dapatkan</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pkg.features && pkg.features.length > 0 ? (
                pkg.features.map((feat, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2.5 p-3 rounded-xl bg-neutral-950/40 border border-white/5 text-xs text-neutral-200"
                  >
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-neutral-500">Tidak ada rincian fasilitas tambahan.</p>
              )}
            </div>
          </div>

          {/* Syarat Ketentuan & Kebijakan H-3 */}
          <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900/40 border border-white/5 text-xs text-neutral-400 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Ketentuan Booking & Kebijakan Studio</span>
            </h3>
            <ul className="space-y-1.5 list-disc pl-4 leading-relaxed">
              <li>Slot waktu Anda dikunci resmi setelah pembayaran DP diverifikasi oleh admin studio.</li>
              <li>Sistem menerapkan <strong className="text-amber-300">kebijakan pembatalan H-3</strong>: Pengajuan pembatalan atau perubahan tanggal sesi hanya dapat dilakukan minimal 3 hari sebelum jadwal pemotretan.</li>
              <li>Seluruh file master resolusi tinggi (.ZIP) dapat diunduh tanpa kompresi setelah pelunasan 100%.</li>
            </ul>
          </div>
        </div>

        {/* 3. RIGHT COLUMN (STICKY SUMMARY CARD & BOOKING CTA) */}
        <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24 space-y-6">
          <div className="p-6 sm:p-7 rounded-3xl bg-neutral-900/80 border border-amber-500/30 backdrop-blur-2xl shadow-2xl shadow-amber-500/10 space-y-6">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block mb-1">
                Total Investasi Paket
              </span>
              <div className="text-3xl font-black text-white">
                {formatRupiah(pkg.price)}
              </div>
              <p className="text-[11px] text-neutral-400 mt-1">
                Sudah termasuk kru fotografer, lighting studio, dan kurasi private gallery.
              </p>
            </div>

            {/* Rincian Pembayaran */}
            <div className="p-4 rounded-2xl bg-neutral-950/70 border border-white/5 space-y-2.5 text-xs">
              <div className="flex justify-between items-center text-neutral-300">
                <span>Uang Muka (DP) Minimal</span>
                <span className="font-bold text-amber-400">{formatRupiah(pkg.dp_amount)}</span>
              </div>
              <div className="flex justify-between items-center text-neutral-400 border-t border-white/5 pt-2">
                <span>Sisa Pelunasan</span>
                <span className="font-semibold text-white">{formatRupiah(remainingPayment)}</span>
              </div>
              <div className="text-[10px] text-neutral-500 italic pt-1">
                *Sisa tagihan dapat dilunasi sebelum file master diunduh.
              </div>
            </div>

            {/* Booking Actions */}
            <div className="space-y-3 pt-2">
              <Link href={`/booking?package=${pkg.id}`} className="block w-full">
                <AnimatedButton
                  variant="primary"
                  className="w-full py-3.5 text-xs uppercase font-extrabold tracking-wider shadow-lg shadow-amber-500/30"
                >
                  <Calendar className="w-4 h-4 mr-1.5" />
                  <span>Kunci Jadwal Sesi Sekarang</span>
                </AnimatedButton>
              </Link>

              <a
                href={`https://wa.me/62895336075846?text=Halo%20Iluxy%20Creative,%20saya%20ingin%20tanya%20detail%20paket%20${encodeURIComponent(pkg.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full"
              >
                <button
                  type="button"
                  className="w-full py-3 px-4 rounded-xl bg-neutral-800/80 hover:bg-neutral-800 border border-white/10 text-xs font-bold text-neutral-300 hover:text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>Konsultasi WhatsApp Studio</span>
                </button>
              </a>
            </div>

            {/* Jaminan Layanan */}
            <div className="pt-3 border-t border-white/5 space-y-2 text-[11px] text-neutral-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Anti Double-Booking Terkunci Database</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Private Gallery Terproteksi PIN 6-Digit</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PackageDetailPage({ params }) {
  return (
    <Suspense
      fallback={
        <div className="max-w-6xl mx-auto px-4 py-16 text-center text-xs text-neutral-400">
          Memuat spesifikasi detail paket...
        </div>
      }
    >
      <PackageDetailContent params={params} />
    </Suspense>
  );
}
