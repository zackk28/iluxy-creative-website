"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  KeyRound,
  ArrowRight,
  Images,
  Sparkles,
  ShieldCheck,
  Search,
  Calendar,
  AlertCircle,
  FolderLock,
} from "lucide-react";
import AnimatedButton from "@/components/ui/AnimatedButton";

export default function PrivateGalleryEntryClient({ userGalleries = [], isLoggedIn = false }) {
  const router = useRouter();
  const [accessSlug, setAccessSlug] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  function handleSearchSubmit(e) {
    e.preventDefault();
    setErrorMessage("");

    const cleaned = accessSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");

    if (!cleaned || cleaned.length < 3) {
      setErrorMessage("Silakan masukkan slug atau kode akses galeri yang valid.");
      return;
    }

    router.push(`/galeri/${cleaned}`);
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-10">
      {/* 1. HERO ENTRY BOX */}
      <div className="p-7 sm:p-12 rounded-3xl bg-neutral-900/80 border border-white/10 backdrop-blur-2xl shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-neutral-950 mx-auto shadow-xl shadow-amber-500/20">
          <FolderLock className="w-8 h-8" />
        </div>

        <div className="space-y-2 max-w-lg mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3" />
            <span>Gerbang Galeri Digital Ber-PIN</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Akses Private Gallery Anda
          </h1>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Masukkan tautan unik (*slug*) atau kode akses galeri yang diberikan oleh studio Iluxy Creative Padang.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSearchSubmit} className="max-w-md mx-auto space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={accessSlug}
              onChange={(e) => setAccessSlug(e.target.value)}
              placeholder="Contoh: wedding-zackri-sarah"
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-neutral-950 border border-white/10 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <AnimatedButton
            variant="primary"
            type="submit"
            className="w-full py-3.5 text-xs uppercase font-extrabold tracking-wider shadow-lg shadow-amber-500/30"
          >
            <span>Buka Gerbang Galeri</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </AnimatedButton>
        </form>

        <p className="text-[11px] text-neutral-500">
          Format URL langsung: <code className="text-amber-400">/galeri/nama-klien</code>
        </p>
      </div>

      {/* 2. DAFTAR GALERI PENGGUNA TERDAFTAR (JIKA LOGIN) */}
      {isLoggedIn && userGalleries.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Images className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Galeri Privat Akun Anda
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {userGalleries.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-3xl bg-neutral-900/60 border border-white/5 hover:border-amber-500/30 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-amber-400">
                      {item.bookings?.packages?.name || "Sesi Foto"}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300">
                      {item.status === "PROOFING_SUBMITTED" ? "Kurasi Dikirim" : "Aktif"}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-white">{item.title}</h4>
                  <p className="text-xs text-neutral-400">
                    Kode Booking: <span className="font-mono text-neutral-200">{item.bookings?.booking_code}</span>
                  </p>
                </div>

                <Link
                  href={`/galeri/${item.access_slug}`}
                  className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-amber-300 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Buka Galeri Foto</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. BANTUAN INFORMASI AKSES */}
      <div className="p-6 rounded-3xl bg-neutral-900/40 border border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-neutral-400">
        <div className="space-y-1.5">
          <div className="font-bold text-white flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            <span>1. Terima PIN Unik</span>
          </div>
          <p className="leading-relaxed">
            Setelah sesi pemotretan dan kurasi awal studio selesai, admin mengirimkan link dan PIN 6-digit via WhatsApp.
          </p>
        </div>

        <div className="space-y-1.5">
          <div className="font-bold text-white flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>2. Kurasi Cetak Album</span>
          </div>
          <p className="leading-relaxed">
            Tandai foto terbaik sesuai kuota paket dan sisipkan catatan permintaan retouch untuk tim editor studio.
          </p>
        </div>

        <div className="space-y-1.5">
          <div className="font-bold text-white flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>3. Unduh Master Resolusi Tinggi</span>
          </div>
          <p className="leading-relaxed">
            Setelah pelunasan 100% diverifikasi, seluruh file original tanpa kompresi dapat diunduh dalam file ZIP.
          </p>
        </div>
      </div>
    </div>
  );
}
