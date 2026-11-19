"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Sparkles, 
  Clock, 
  Camera, 
  CheckCircle2, 
  ArrowRight, 
  SlidersHorizontal, 
  X, 
  Layers, 
  MessageCircle,
  HelpCircle
} from "lucide-react";
import { InteractiveCard } from "@/components/ui/InteractiveCard";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { formatRupiah } from "@/lib/utils";

export default function KatalogView({ initialPackages = [], initialCategories = [] }) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");

  // Filter & Sorting Logic
  const filteredPackages = useMemo(() => {
    return initialPackages
      .filter((pkg) => {
        // Filter Kategori
        const matchesCategory =
          selectedCategory === "all" ||
          pkg.package_categories?.slug === selectedCategory ||
          pkg.category_id?.toString() === selectedCategory;

        // Filter Pencarian Teks
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !query ||
          pkg.name.toLowerCase().includes(query) ||
          pkg.description?.toLowerCase().includes(query) ||
          pkg.package_categories?.name?.toLowerCase().includes(query) ||
          pkg.features?.some((f) => f.toLowerCase().includes(query));

        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        if (sortBy === "duration-desc") return b.duration_hours - a.duration_hours;
        return 0; // Default order
      });
  }, [initialPackages, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="relative pb-16">
      {/* 1. HERO SECTION KATALOG */}
      <section className="relative text-center max-w-4xl mx-auto px-4 pt-6 pb-12">
        {/* Ambient Top Glow */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-amber-500/10 blur-[130px] rounded-full" />

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900/90 border border-amber-500/30 text-amber-300 text-xs font-semibold shadow-lg shadow-amber-500/10 mb-5"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Koleksi Paket Layanan Studio & Outdoor</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight"
        >
          Abadikan Tiap Momen dengan{" "}
          <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent">
            Estetika Sinematik
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-4 text-xs sm:text-sm text-neutral-400 max-w-2xl mx-auto leading-relaxed"
        >
          Pilihan paket dokumentasi profesional di Kota Padang & Sumatera Barat. Transparansi fasilitas, sistem booking anti double-booking, dan akses file beresolusi penuh di Private Gallery berproteksi PIN.
        </motion.p>
      </section>

      {/* 2. CONTROLS: SEARCH & CATEGORY FILTER */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-10">
        <div className="p-4 sm:p-5 rounded-3xl bg-neutral-900/60 border border-white/10 backdrop-blur-xl shadow-xl space-y-4">
          {/* Row 1: Search Input & Sort Selector */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama paket, lokasi outdoor, atau fasilitas album..."
                className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-neutral-950/70 border border-white/10 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort Selector */}
            <div className="relative sm:w-56">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 rounded-2xl bg-neutral-950/70 border border-white/10 text-neutral-300 text-xs focus:outline-none focus:border-amber-500/50 cursor-pointer appearance-none"
              >
                <option value="default">Urutkan: Rekomendasi</option>
                <option value="price-asc">Harga: Terendah ke Tertinggi</option>
                <option value="price-desc">Harga: Tertinggi ke Terendah</option>
                <option value="duration-desc">Durasi: Paling Lama</option>
              </select>
            </div>
          </div>

          {/* Row 2: Category Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`relative px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors duration-200 cursor-pointer ${
                selectedCategory === "all" ? "text-neutral-950 font-bold" : "text-neutral-400 hover:text-white"
              }`}
            >
              {selectedCategory === "all" && (
                <motion.div
                  layoutId="category-active-pill"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 shadow-md shadow-amber-500/30"
                  transition={{ type: "spring", stiffness: 400, damping: 28 }}
                />
              )}
              <span className="relative z-10">Semua Paket</span>
            </button>

            {initialCategories.map((cat) => {
              const isActive = selectedCategory === cat.slug;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`relative px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors duration-200 cursor-pointer ${
                    isActive ? "text-neutral-950 font-bold" : "text-neutral-400 hover:text-white"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="category-active-pill"
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 shadow-md shadow-amber-500/30"
                      transition={{ type: "spring", stiffness: 400, damping: 28 }}
                    />
                  )}
                  <span className="relative z-10">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Counter Info */}
        <div className="mt-4 flex items-center justify-between text-xs text-neutral-400 px-2">
          <span>
            Menampilkan <strong className="text-white">{filteredPackages.length}</strong> dari {initialPackages.length} paket
          </span>
          {(searchQuery || selectedCategory !== "all") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="text-amber-400 hover:underline cursor-pointer"
            >
              Reset Filter
            </button>
          )}
        </div>
      </section>

      {/* 3. GRID SHOWCASE PAKET */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        {filteredPackages.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16 px-4 rounded-3xl bg-neutral-900/30 border border-white/5">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 mb-4">
              <Camera className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white">Paket Tidak Ditemukan</h3>
            <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
              Tidak ada paket fotografi yang cocok dengan kata kunci atau filter yang Anda pilih.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="mt-5 px-4 py-2 text-xs font-bold rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white transition-colors"
            >
              Tampilkan Semua Paket
            </button>
          </div>
        ) : (
          /* Cards Grid */
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {filteredPackages.map((pkg) => (
                <motion.div
                  key={pkg.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <InteractiveCard className="h-full flex flex-col justify-between">
                    <div>
                      {/* Image Preview with Category Badge */}
                      <div className="relative h-52 w-full rounded-xl overflow-hidden mb-4 bg-neutral-800 group/img">
                        <img
                          src={pkg.cover_image_url || "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80"}
                          alt={pkg.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                        {/* Gradient Bottom Shadow */}
                        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent pointer-events-none" />

                        {/* Category Pill Tag */}
                        <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-neutral-950/80 backdrop-blur-md text-amber-300 font-semibold text-[11px] border border-white/10">
                          {pkg.package_categories?.name || "Fotografi"}
                        </div>

                        {/* Highlight Badge */}
                        {pkg.price >= 5000000 && (
                          <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-amber-500 text-neutral-950 font-black text-[10px] uppercase tracking-wider shadow-md">
                            Royale Premiere
                          </div>
                        )}
                      </div>

                      {/* Title & Description */}
                      <h2 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                        {pkg.name}
                      </h2>
                      <p className="text-xs text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                        {pkg.description}
                      </p>

                      {/* Specs Badges */}
                      <div className="flex items-center gap-3 text-xs text-neutral-300 mt-3 pt-3 border-t border-white/10">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span>{pkg.duration_hours} Jam Sesi</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Camera className="w-3.5 h-3.5 text-amber-400" />
                          <span>{pkg.max_photos_retouch} Retouch</span>
                        </span>
                      </div>

                      {/* Key Features List */}
                      <ul className="mt-4 space-y-2 text-xs text-neutral-300">
                        {pkg.features?.slice(0, 4).map((feat, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span className="line-clamp-1">{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Price Footer & Action */}
                    <div className="pt-5 mt-5 border-t border-white/10">
                      <div className="flex items-baseline justify-between mb-4">
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold block">
                            Investasi Layanan
                          </span>
                          <span className="text-xl font-black text-white">
                            {formatRupiah(pkg.price)}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold block">
                            Minimal DP
                          </span>
                          <span className="text-xs font-bold text-amber-400">
                            {formatRupiah(pkg.dp_amount)}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <Link href={`/katalog/${pkg.slug}`} className="w-full">
                          <button
                            type="button"
                            className="w-full py-2.5 px-3 rounded-xl bg-neutral-800/80 hover:bg-neutral-800 border border-white/10 text-xs font-semibold text-neutral-200 hover:text-white transition-colors cursor-pointer"
                          >
                            Detail Paket
                          </button>
                        </Link>

                        <Link href={`/booking?package=${pkg.id}`} className="w-full">
                          <AnimatedButton
                            variant="primary"
                            className="w-full py-2.5 text-xs font-bold"
                          >
                            <span>Pesan Slot</span>
                            <ArrowRight className="w-3.5 h-3.5 ml-1" />
                          </AnimatedButton>
                        </Link>
                      </div>
                    </div>
                  </InteractiveCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </section>

      {/* 4. CUSTOM INQUIRY / WHATSAPP BANNER */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 mt-16">
        <div className="relative overflow-hidden rounded-3xl bg-neutral-900/60 border border-amber-500/20 p-6 sm:p-8 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center sm:text-left">
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400">
              Konsultasi Khusus
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-white">
              Punya Konsep Pemotretan Unik atau Custom Budget?
            </h3>
            <p className="text-xs text-neutral-400 max-w-lg leading-relaxed">
              Tim kreatif Iluxy siap mendiskusikan konsep visual di luar paket standar untuk kebutuhan wedding luar kota, commercial brand, dan album khusus.
            </p>
          </div>

          <a
            href="https://wa.me/62895336075846?text=Halo%20Iluxy%20Creative,%20saya%20ingin%20konsultasi%20paket%20fotografi"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0"
          >
            <AnimatedButton variant="primary" className="px-5 py-3 text-xs font-bold">
              <MessageCircle className="w-4 h-4 mr-1.5" />
              <span>Chat WhatsApp Studio</span>
            </AnimatedButton>
          </a>
        </div>
      </section>
    </div>
  );
}
