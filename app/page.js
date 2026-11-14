"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Sparkles, 
  Calendar, 
  ShieldCheck, 
  Lock, 
  Download, 
  ArrowRight, 
  Camera, 
  CheckCircle2, 
  Star,
  Clock,
  Layers
} from "lucide-react";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { InteractiveCard } from "@/components/ui/InteractiveCard";
import { SkeletonShimmer, PackageCardSkeleton } from "@/components/ui/SkeletonShimmer";
import { formatRupiah } from "@/lib/utils";

const featuredPackages = [
  {
    id: "pkg-1",
    name: "Wedding Intim Bronze",
    category: "Wedding & Akad",
    price: 2500000,
    dp: 750000,
    duration: 4,
    retouchCount: 25,
    cover: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
    features: [
      "1 Lead Photographer & 1 Assistant",
      "25 Foto Retouch Cetak Album",
      "Album Kolase 20x30 Box Eksklusif",
      "Master File High-Res di Private Gallery",
    ],
  },
  {
    id: "pkg-2",
    name: "Wedding Royale Gold",
    category: "Wedding & Akad",
    price: 5000000,
    dp: 1500000,
    duration: 8,
    retouchCount: 50,
    isPopular: true,
    cover: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80",
    features: [
      "2 Photographers & 1 Videographer Teaser",
      "50 Foto Retouch Cetak Album",
      "2 Album Kolase 20x30 Kulit Mewah",
      "Cetak Frame Kanvas Pembesar 40x60",
    ],
  },
  {
    id: "pkg-3",
    name: "Prewedding Sunset Padang",
    category: "Prewedding Outdoor",
    price: 1800000,
    dp: 500000,
    duration: 4,
    retouchCount: 20,
    cover: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80",
    features: [
      "1 Photographer & Lighting Assistant",
      "2 Lokasi Outdoor (Pantai / Bukittinggi)",
      "20 Foto Retouch Halus",
      "1 Cetak Frame Pembesar 30x40",
    ],
  },
];

export default function HomePage() {
  const [showSkeletonDemo, setShowSkeletonDemo] = useState(false);
  const [buttonLoadingDemo, setButtonLoadingDemo] = useState(false);

  const handleSimulateBooking = () => {
    setButtonLoadingDemo(true);
    setTimeout(() => {
      setButtonLoadingDemo(false);
      alert("Simulasi checkout berhasil! Tombol bertransisi mulus tanpa double-submit.");
    }, 1800);
  };

  return (
    <div className="relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-gradient-to-b from-amber-500/15 via-amber-500/5 to-transparent blur-[120px] rounded-full" />

      {/* 1. HERO SECTION */}
      <section className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-16 md:pt-16 md:pb-24 text-center">
        {/* Status Pill Badge */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-900/90 border border-amber-500/30 text-amber-300 text-xs font-semibold shadow-lg shadow-amber-500/10 mb-6 backdrop-blur-md"
        >
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span>Sistem Informasi Booking & Private Gallery Web</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.15]"
        >
          Abadikan Setiap Detik Berharga Bersama{" "}
          <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent">
            Iluxy Creative
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-base sm:text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed"
        >
          Studio fotografi & visual storyteller profesional di Kota Padang. Pemesanan jadwal instan anti-double booking,
          ruang kurasi foto berproteksi PIN 6 digit, dan unduhan file master beresolusi tinggi.
        </motion.p>

        {/* CTA Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-4"
        >
          <Link href="/booking">
            <AnimatedButton variant="primary" className="text-base px-7 py-3.5">
              <span>Jadwalkan Sesi Sekarang</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </AnimatedButton>
          </Link>

          <Link href="/katalog">
            <AnimatedButton variant="secondary" className="text-base px-6 py-3.5">
              <Camera className="w-4 h-4 mr-1 text-amber-400" />
              <span>Lihat Katalog Paket</span>
            </AnimatedButton>
          </Link>
        </motion.div>
      </section>

      {/* 2. PILLAR VALUE HIGHLIGHTS (4 KEUNGGULAN SISTEM) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 border-y border-white/5 bg-neutral-950/40">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start gap-3.5 p-4 rounded-xl bg-neutral-900/40 border border-white/5">
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Anti Double-Booking</h3>
              <p className="text-xs text-neutral-400 mt-1">Penguncian konkurensi PostgreSQL menjamin slot waktu Anda aman.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-xl bg-neutral-900/40 border border-white/5">
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Private Gallery PIN</h3>
              <p className="text-xs text-neutral-400 mt-1">Akses galeri eksklusif hanya untuk Anda dengan PIN 6 digit unik.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-xl bg-neutral-900/40 border border-white/5">
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Kurasi Album Instan</h3>
              <p className="text-xs text-neutral-400 mt-1">Pilih foto favorit cetak album dan sisipkan catatan retouch per foto.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-xl bg-neutral-900/40 border border-white/5">
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Master ZIP Full Res</h3>
              <p className="text-xs text-neutral-400 mt-1">Unduh seluruh arsip foto original tanpa kompresi setelah pelunasan.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SHOWCASE KATALOG PAKET UNGGULAN (3D TILT CARDS) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 uppercase tracking-widest mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Paket Paling Diminati</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
              Pilihan Layanan Fotografi Profesional
            </h2>
          </div>

          {/* Micro-interaction controls for demo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSkeletonDemo(!showSkeletonDemo)}
              className="text-xs px-3.5 py-2 rounded-lg border border-white/10 hover:border-amber-500/40 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            >
              {showSkeletonDemo ? "Tampilkan Paket Asli" : "Simulasi Loading Skeleton"}
            </button>
            <Link
              href="/katalog"
              className="text-xs font-bold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 transition-colors"
            >
              <span>Lihat Semua Paket</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Grid Showcase */}
        {showSkeletonDemo ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <PackageCardSkeleton />
            <PackageCardSkeleton />
            <PackageCardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredPackages.map((pkg) => (
              <InteractiveCard key={pkg.id} className="flex flex-col justify-between">
                <div>
                  {/* Image Cover */}
                  <div className="relative h-48 w-full rounded-xl overflow-hidden mb-4 bg-neutral-800">
                    <img
                      src={pkg.cover}
                      alt={pkg.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    {pkg.isPopular && (
                      <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-amber-500 text-neutral-950 font-black text-[10px] uppercase tracking-wider shadow-md">
                        Terpopuler
                      </div>
                    )}
                    <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-neutral-950/80 backdrop-blur-md text-amber-300 font-semibold text-xs border border-white/10">
                      {pkg.category}
                    </div>
                  </div>

                  {/* Header Title & Specs */}
                  <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
                    {pkg.name}
                  </h3>

                  <div className="flex items-center gap-4 text-xs text-neutral-400 mt-2 pb-3 border-b border-white/10">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      {pkg.duration} Jam Sesi
                    </span>
                    <span className="flex items-center gap-1">
                      <Camera className="w-3.5 h-3.5 text-amber-400" />
                      {pkg.retouchCount} Foto Retouch
                    </span>
                  </div>

                  {/* Features List */}
                  <ul className="mt-4 space-y-2 text-xs text-neutral-300">
                    {pkg.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Footer Price & Booking CTA */}
                <div className="pt-6 mt-4 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-neutral-400 block">Total Investasi</span>
                    <span className="text-lg font-black text-white">{formatRupiah(pkg.price)}</span>
                  </div>

                  <Link href={`/booking?package=${pkg.id}`}>
                    <AnimatedButton variant="primary" className="text-xs px-4 py-2">
                      <span>Pilih Paket</span>
                    </AnimatedButton>
                  </Link>
                </div>
              </InteractiveCard>
            ))}
          </div>
        )}
      </section>

      {/* 4. INTERACTIVE MICRO-INTERACTIONS TEST SECTION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12 mb-16 rounded-3xl bg-neutral-900/50 border border-white/10 text-center">
        <h3 className="text-xl font-bold text-white mb-2">Simulasi Keamanan & Anti Double-Submit</h3>
        <p className="text-xs text-neutral-400 max-w-lg mx-auto mb-6">
          Uji coba komponen tombol micro-interaction dengan proteksi klik ganda saat proses komunikasi transaksi.
        </p>
        <AnimatedButton
          variant="primary"
          isLoading={buttonLoadingDemo}
          onClick={handleSimulateBooking}
          className="px-6 py-3"
        >
          <span>Klik Uji Coba Tombol Async (Simulasi DP)</span>
        </AnimatedButton>
      </section>

      {/* 5. FOOTER */}
      <footer className="border-t border-white/5 py-8 text-center text-xs text-neutral-500">
        <p>© 2026 Iluxy Creative Padang — Sistem Informasi Booking & Private Gallery</p>
        <p className="mt-1">D4 Teknologi Rekayasa Perangkat Lunak | Politeknik Negeri Padang</p>
      </footer>
    </div>
  );
}
