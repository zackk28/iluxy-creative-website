"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Calendar,
  MapPin,
  User,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Clock,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Building2,
  Trees,
  Loader2,
  LogIn,
} from "lucide-react";
import BookingCalendar from "./BookingCalendar";
import AnimatedButton from "@/components/ui/AnimatedButton";
import { createBookingOrder } from "@/lib/actions/booking";

function formatRupiah(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

const STEPS = [
  { id: 1, label: "Paket", icon: Camera },
  { id: 2, label: "Jadwal", icon: Calendar },
  { id: 3, label: "Lokasi", icon: MapPin },
  { id: 4, label: "Kontak", icon: User },
  { id: 5, label: "Ringkasan", icon: CheckCircle2 },
];

export default function BookingWizardClient({ packages = [], currentUser = null }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedPackageId = searchParams.get("package");

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Form State (dengan inisialisasi paket awal dari URL parameter)
  const [selectedPackage, setSelectedPackage] = useState(() => {
    if (preselectedPackageId && packages.length > 0) {
      return packages.find((p) => p.id === preselectedPackageId) || packages[0] || null;
    }
    return packages[0] || null;
  });
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [locationType, setLocationType] = useState("STUDIO");
  const [venueAddress, setVenueAddress] = useState("");
  const [customerName, setCustomerName] = useState(currentUser?.user_metadata?.full_name || "");
  const [customerPhone, setCustomerPhone] = useState(currentUser?.user_metadata?.phone_number || "");
  const [instagram, setInstagram] = useState("");
  const [notes, setNotes] = useState("");
  const [agreePolicy, setAgreePolicy] = useState(false);

  // Validasi Step Selanjutnya
  function handleNextStep() {
    setErrorMessage("");

    if (currentStep === 1) {
      if (!selectedPackage) {
        setErrorMessage("Silakan pilih salah satu paket layanan terlebih dahulu.");
        return;
      }
    }

    if (currentStep === 2) {
      if (!selectedDate) {
        setErrorMessage("Silakan pilih tanggal sesi pemotretan pada kalender.");
        return;
      }
      if (!selectedSlot) {
        setErrorMessage("Silakan pilih jam sesi pemotretan yang masih tersedia.");
        return;
      }
    }

    if (currentStep === 3) {
      if (locationType === "OUTDOOR" && (!venueAddress || venueAddress.trim().length < 5)) {
        setErrorMessage("Silakan masukkan alamat lengkap atau nama gedung/venue acara outdoor.");
        return;
      }
    }

    if (currentStep === 4) {
      if (!customerName || customerName.trim().length < 2) {
        setErrorMessage("Nama lengkap pemesan wajib diisi.");
        return;
      }
      if (!customerPhone || customerPhone.trim().length < 8) {
        setErrorMessage("Nomor WhatsApp aktif wajib dicantumkan.");
        return;
      }
    }

    setCurrentStep((prev) => Math.min(prev + 1, 5));
    window.scrollTo({ top: 120, behavior: "smooth" });
  }

  function handlePrevStep() {
    setErrorMessage("");
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 120, behavior: "smooth" });
  }

  // Submit Final Booking Order
  async function handleSubmitOrder() {
    setErrorMessage("");

    if (!agreePolicy) {
      setErrorMessage("Anda wajib menyetujui kebijakan booking dan aturan pembatalan H-3.");
      return;
    }

    if (!currentUser) {
      setErrorMessage("Silakan login terlebih dahulu untuk menyimpan pesanan ke akun Anda.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        packageId: selectedPackage.id,
        sessionDate: selectedDate,
        startTime: selectedSlot.start,
        endTime: selectedSlot.end,
        locationType,
        venueAddress: locationType === "STUDIO" ? "Studio Iluxy Creative, Padang" : venueAddress,
        notes,
        customerName,
        customerPhone,
        instagram,
      };

      const result = await createBookingOrder(payload);

      if (result.error) {
        setErrorMessage(result.error);
        setIsSubmitting(false);
        return;
      }

      if (result.success && result.invoiceId) {
        router.push(`/invoice/${result.invoiceId}`);
      }
    } catch (err) {
      console.error("Gagal submit order:", err);
      setErrorMessage("Terjadi kesalahan saat memproses pesanan. Silakan coba kembali.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {/* 1. PROGRESS WIZARD STEPPER */}
      <div className="p-4 sm:p-6 rounded-3xl bg-neutral-900/60 border border-white/10 backdrop-blur-xl">
        <div className="flex items-center justify-between relative">
          {/* Connecting Line */}
          <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-neutral-800 -z-0" />
          <div
            className="absolute left-6 top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-500 -z-0"
            style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 90}%` }}
          />

          {STEPS.map((step) => {
            const Icon = step.icon;
            const isDone = currentStep > step.id;
            const isCurrent = currentStep === step.id;

            return (
              <div
                key={step.id}
                className="relative z-10 flex flex-col items-center gap-2 cursor-default"
              >
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-300 ${
                    isDone
                      ? "bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/30"
                      : isCurrent
                      ? "bg-neutral-950 border-2 border-amber-400 text-amber-400 shadow-xl shadow-amber-500/20 scale-110"
                      : "bg-neutral-900 border border-white/10 text-neutral-500"
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-4 h-4 sm:w-5 sm:h-5" />}
                </div>
                <span
                  className={`text-[10px] sm:text-xs font-semibold tracking-wider uppercase transition-colors ${
                    isCurrent ? "text-amber-400" : isDone ? "text-neutral-200" : "text-neutral-600"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ERROR BANNER */}
      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
          <div className="flex-1">
            <p className="font-semibold">{errorMessage}</p>
            {!currentUser && (
              <Link
                href={`/login?redirect=/booking${selectedPackage ? `?package=${selectedPackage.id}` : ""}`}
                className="inline-flex items-center gap-1.5 mt-2 font-bold text-amber-400 hover:text-amber-300 underline"
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk Sekarang ke Akun Saya</span>
              </Link>
            )}
          </div>
        </motion.div>
      )}

      {/* 2. DYNAMIC STEP PANELS */}
      <div className="relative min-h-[420px]">
        {/* STEP 1: PILIH PAKET */}
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xl font-black text-white">Langkah 1: Pilih Paket Fotografi</h3>
                <p className="text-xs text-neutral-400">
                  Tentukan paket pemotretan yang sesuai dengan kebutuhan momen istimewa Anda.
                </p>
              </div>
              <Link
                href="/katalog"
                className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
              >
                <span>Lihat Detail di Katalog</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {packages.map((pkg) => {
                const isSelected = selectedPackage?.id === pkg.id;

                return (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedPackage(pkg)}
                    className={`relative p-5 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "bg-neutral-900/90 border-amber-500 shadow-2xl shadow-amber-500/20 scale-[1.02]"
                        : "bg-neutral-900/40 border-white/5 hover:border-amber-500/30 hover:bg-neutral-900/70"
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-amber-500 text-neutral-950 font-black text-[10px] tracking-wider uppercase shadow-md shadow-amber-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Terpilih
                      </span>
                    )}

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
                        {pkg.package_categories?.name || "Fotografi"}
                      </span>
                      <h4 className="text-base font-bold text-white mb-2">{pkg.name}</h4>
                      <p className="text-xs text-neutral-400 line-clamp-2 mb-4 leading-relaxed">
                        {pkg.description || "Layanan fotografi premium dari Iluxy Creative Padang."}
                      </p>

                      <div className="space-y-1.5 text-xs text-neutral-300 border-t border-white/5 pt-3 mb-4">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span>Durasi: {pkg.duration_hours} Jam Sesi</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>{pkg.max_photos_retouch} Foto Retouch & Private Gallery</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-white/10 pt-4 mt-auto">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="text-[10px] text-neutral-500 block">Total Investasi</span>
                          <span className="text-lg font-black text-white">{formatRupiah(pkg.price)}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-neutral-500 block">DP Minimal</span>
                          <span className="text-xs font-bold text-amber-400">{formatRupiah(pkg.dp_amount)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* STEP 2: KALENDER & JAM SESI */}
        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-xl font-black text-white">Langkah 2: Pilih Tanggal & Slot Sesi</h3>
              <p className="text-xs text-neutral-400">
                Pilih tanggal dan jam pemotretan. Sistem kalender cerdas akan mencegah jadwal yang bentrok.
              </p>
            </div>

            <BookingCalendar
              selectedDate={selectedDate}
              selectedSlot={selectedSlot}
              onDateChange={setSelectedDate}
              onSlotChange={setSelectedSlot}
            />
          </motion.div>
        )}

        {/* STEP 3: LOKASI & VENUE */}
        {currentStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-xl font-black text-white">Langkah 3: Lokasi Pemotretan</h3>
              <p className="text-xs text-neutral-400">
                Tentukan apakah sesi dilakukan di Studio Iluxy Creative Padang atau lokasi outdoor pilihan Anda.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option Studio */}
              <button
                type="button"
                onClick={() => setLocationType("STUDIO")}
                className={`p-6 rounded-3xl border text-left transition-all cursor-pointer ${
                  locationType === "STUDIO"
                    ? "bg-neutral-900/90 border-amber-500 shadow-xl shadow-amber-500/15"
                    : "bg-neutral-900/40 border-white/5 hover:border-amber-500/30"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400">
                    <Building2 className="w-6 h-6" />
                  </div>
                  {locationType === "STUDIO" && (
                    <span className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
                  )}
                </div>
                <h4 className="text-base font-bold text-white mb-1">Studio Indoor Iluxy Creative</h4>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Pemotretan di studio foto dengan lighting profesional, pilihan backdrop premium, dan AC.
                </p>
                <div className="mt-4 p-3 rounded-xl bg-neutral-950/60 border border-white/5 text-xs text-neutral-300">
                  📍 Jl. Veteran No. 42B, Padang Barat, Kota Padang
                </div>
              </button>

              {/* Option Outdoor */}
              <button
                type="button"
                onClick={() => setLocationType("OUTDOOR")}
                className={`p-6 rounded-3xl border text-left transition-all cursor-pointer ${
                  locationType === "OUTDOOR"
                    ? "bg-neutral-900/90 border-amber-500 shadow-xl shadow-amber-500/15"
                    : "bg-neutral-900/40 border-white/5 hover:border-amber-500/30"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400">
                    <Trees className="w-6 h-6" />
                  </div>
                  {locationType === "OUTDOOR" && (
                    <span className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
                  )}
                </div>
                <h4 className="text-base font-bold text-white mb-1">Outdoor / On-Location Venue</h4>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Pemotretan di gedung resepsi pernikahan, cafe, pantai, hotel, atau lokasi pilihan Anda di Padang & sekitarnya.
                </p>
                <div className="mt-4 p-3 rounded-xl bg-neutral-950/60 border border-white/5 text-xs text-amber-400">
                  🚗 Tim kru fotografer akan meluncur ke lokasi Anda.
                </div>
              </button>
            </div>

            {/* Input Alamat Outdoor */}
            {locationType === "OUTDOOR" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="p-6 rounded-3xl bg-neutral-900/60 border border-white/10 space-y-3"
              >
                <label className="text-xs font-bold text-white uppercase tracking-wider block">
                  Alamat Lengkap Venue Acara <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={3}
                  value={venueAddress}
                  onChange={(e) => setVenueAddress(e.target.value)}
                  placeholder="Contoh: Gedung Bagindo Aziz Chan Youth Center Padang, atau Hotel Pangeran Beach Padang Room Grand Ballroom..."
                  className="w-full px-4 py-3 rounded-2xl bg-neutral-950/80 border border-white/10 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </motion.div>
            )}
          </motion.div>
        )}

        {/* STEP 4: KONTAK PEMESAN */}
        {currentStep === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-xl font-black text-white">Langkah 4: Data Pemesan & Catatan Acara</h3>
              <p className="text-xs text-neutral-400">
                Informasi kontak untuk koordinasi kru studio sebelum hari pemotretan.
              </p>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900/60 border border-white/10 backdrop-blur-xl space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block mb-2">
                    Nama Lengkap Pemesan <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Contoh: Zackri Kurnia Amri"
                    className="w-full px-4 py-3 rounded-2xl bg-neutral-950/80 border border-white/10 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block mb-2">
                    Nomor WhatsApp Aktif <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full px-4 py-3 rounded-2xl bg-neutral-950/80 border border-white/10 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block mb-2">
                    Akun Instagram (Opsional)
                  </label>
                  <input
                    type="text"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="Contoh: @zackrikurnia"
                    className="w-full px-4 py-3 rounded-2xl bg-neutral-950/80 border border-white/10 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block mb-2">
                    Catatan Konsep / Kostum
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Contoh: Tema adat Minang modern, butuh 2 kru fotografer"
                    className="w-full px-4 py-3 rounded-2xl bg-neutral-950/80 border border-white/10 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 5: RINGKASAN & KONFIRMASI */}
        {currentStep === 5 && selectedPackage && selectedSlot && (
          <motion.div
            key="step5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-xl font-black text-white">Langkah 5: Konfirmasi Pemesanan & Lembar Tagihan</h3>
              <p className="text-xs text-neutral-400">
                Periksa kembali ringkasan pesanan sebelum menerbitkan lembar tagihan resmi.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Kolom Kiri: Rincian Pesanan */}
              <div className="lg:col-span-7 space-y-4">
                <div className="p-6 rounded-3xl bg-neutral-900/60 border border-white/10 backdrop-blur-xl space-y-4">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/5 pb-3">
                    <Camera className="w-4 h-4 text-amber-400" />
                    <span>Paket & Jadwal Sesi Terpilih</span>
                  </h4>

                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-neutral-400">Nama Layanan:</span>
                      <span className="font-bold text-white text-right">{selectedPackage.name}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-neutral-400">Tanggal Pemotretan:</span>
                      <span className="font-semibold text-amber-400 text-right">
                        {new Date(selectedDate).toLocaleDateString("id-ID", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-neutral-400">Waktu / Slot Jam:</span>
                      <span className="font-semibold text-white text-right">{selectedSlot.display}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-neutral-400">Tipe Lokasi:</span>
                      <span className="font-semibold text-white text-right">
                        {locationType === "STUDIO" ? "Studio Iluxy Creative Padang" : "Outdoor / On Location"}
                      </span>
                    </div>

                    {locationType === "OUTDOOR" && (
                      <div className="flex justify-between py-1 border-b border-white/5">
                        <span className="text-neutral-400">Alamat Venue:</span>
                        <span className="font-medium text-neutral-300 text-right max-w-xs">{venueAddress}</span>
                      </div>
                    )}

                    <div className="flex justify-between py-1">
                      <span className="text-neutral-400">Kontak Pemesan:</span>
                      <span className="font-semibold text-white text-right">
                        {customerName} ({customerPhone})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Kebijakan H-3 */}
                <div className="p-5 rounded-3xl bg-neutral-900/40 border border-white/5 text-xs text-neutral-400 space-y-2.5">
                  <div className="flex items-center gap-2 text-white font-bold">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>Kebijakan Pembatalan H-3 Studio</span>
                  </div>
                  <p className="leading-relaxed">
                    Sesuai standar operasional Iluxy Creative, pengajuan pembatalan atau perubahan jadwal sesi hanya
                    dapat diproses minimal <strong>3 hari (H-3)</strong> sebelum tanggal pelaksanaan acara.
                  </p>
                </div>
              </div>

              {/* Kolom Kanan: Rincian Biaya & Tombol Submit */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-6 rounded-3xl bg-neutral-900/90 border border-amber-500/30 backdrop-blur-2xl shadow-2xl shadow-amber-500/10 space-y-5">
                  <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                    Rincian Pembayaran
                  </h4>

                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between items-center text-neutral-300">
                      <span>Total Investasi Paket</span>
                      <span className="text-base font-black text-white">
                        {formatRupiah(selectedPackage.price)}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-amber-400">Uang Muka (DP) Wajib</span>
                        <span className="text-base font-black text-amber-400">
                          {formatRupiah(selectedPackage.dp_amount)}
                        </span>
                      </div>
                      <p className="text-[10px] text-amber-300/80">
                        Batas transfer DP: 24 jam setelah invoice diterbitkan.
                      </p>
                    </div>

                    <div className="flex justify-between items-center text-neutral-400 pt-1">
                      <span>Sisa Pelunasan</span>
                      <span className="font-semibold text-white">
                        {formatRupiah(selectedPackage.price - selectedPackage.dp_amount)}
                      </span>
                    </div>
                  </div>

                  {/* Checkbox Persetujuan */}
                  <label className="flex items-start gap-2.5 pt-2 text-xs text-neutral-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreePolicy}
                      onChange={(e) => setAgreePolicy(e.target.checked)}
                      className="mt-0.5 rounded border-white/20 text-amber-500 focus:ring-amber-400 bg-neutral-950"
                    />
                    <span>
                      Saya menyetujui jadwal yang dipilih dan memahami kebijakan studio mengenai pembayaran DP serta
                      aturan pembatalan H-3.
                    </span>
                  </label>

                  {/* Tombol Terbitkan Invoice */}
                  <div className="pt-2">
                    <AnimatedButton
                      variant="primary"
                      onClick={handleSubmitOrder}
                      disabled={isSubmitting || !agreePolicy}
                      isLoading={isSubmitting}
                      className="w-full py-3.5 text-xs uppercase font-extrabold tracking-wider shadow-lg shadow-amber-500/30"
                    >
                      <Sparkles className="w-4 h-4 mr-1.5" />
                      <span>{isSubmitting ? "Menerbitkan Invoice..." : "Konfirmasi & Terbitkan Invoice"}</span>
                    </AnimatedButton>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* 3. STEPPER CONTROLS (SEBELUMNYA / SELANJUTNYA) */}
      <div className="flex items-center justify-between border-t border-white/5 pt-6">
        {currentStep > 1 ? (
          <button
            type="button"
            onClick={handlePrevStep}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-white/10 text-xs font-bold text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Sebelumnya</span>
          </button>
        ) : (
          <div />
        )}

        {currentStep < 5 && (
          <button
            type="button"
            onClick={handleNextStep}
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-neutral-950 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-amber-500/25 transition-all cursor-pointer"
          >
            <span>Lanjutkan</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
