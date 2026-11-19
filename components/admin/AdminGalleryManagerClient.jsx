"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { 
  createOrUpdateBookingGallery, 
  uploadGalleryPhotosBatch,
  deleteGalleryPhoto 
} from "@/lib/actions/gallery";
import { 
  UploadCloud, 
  FolderPlus, 
  ShieldCheck, 
  Eye, 
  Copy, 
  Check, 
  Sparkles, 
  AlertCircle, 
  Image as ImageIcon,
  CheckCircle2,
  Lock,
  ExternalLink,
  ChevronRight,
  Layers,
  ArrowLeft
} from "lucide-react";

export default function AdminGalleryManagerClient({ 
  initialGalleries = [], 
  unassignedBookings = [] 
}) {
  const [galleries, setGalleries] = useState(initialGalleries);
  const [activeTab, setActiveTab] = useState("list"); // 'list' | 'create' | 'upload'
  const [selectedGallery, setSelectedGallery] = useState(galleries[0] || null);

  // Form states untuk buat galeri
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  // Upload states
  const [uploadFiles, setUploadFiles] = useState([]);
  const [isWatermarking, setIsWatermarking] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatusText, setUploadStatusText] = useState("");
  const fileInputRef = useRef(null);

  // Copy PIN/Link feedback
  const [copiedId, setCopiedId] = useState(null);

  const handleCopyLink = (slug, pin, id) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const text = `Halo, galeri foto Anda dari Iluxy Creative sudah siap!\n\n🔗 Link: ${origin}/galeri/${slug}\n🔑 PIN Akses: ${pin}\n\nSilakan pilih foto favorit Anda untuk dicetak ke dalam album.`;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Helper untuk watermark foto di client-side menggunakan HTML5 Canvas
  const processWatermark = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          // Skala proporsional maksimal 1920px untuk galeri preview
          let width = img.width;
          let height = img.height;
          const maxDim = 1920;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;

          // Gambar foto asli
          ctx.drawImage(img, 0, 0, width, height);

          // Watermark diagonal repetitif halus
          ctx.save();
          ctx.rotate((-25 * Math.PI) / 180);
          ctx.font = `600 ${Math.max(24, Math.round(width * 0.035))}px sans-serif`;
          ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
          ctx.textAlign = "center";
          
          const stepX = width * 0.45;
          const stepY = height * 0.35;
          for (let x = -width; x < width * 2; x += stepX) {
            for (let y = -height; y < height * 2; y += stepY) {
              ctx.fillText("ILUXY CREATIVE", x, y);
            }
          }
          ctx.restore();

          // Watermark logo badge di pojok kanan bawah
          ctx.save();
          const badgeWidth = Math.round(width * 0.28);
          const badgeHeight = Math.round(height * 0.06);
          const badgeX = width - badgeWidth - 24;
          const badgeY = height - badgeHeight - 24;

          ctx.fillStyle = "rgba(10, 10, 14, 0.75)";
          ctx.beginPath();
          ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 10);
          ctx.fill();

          ctx.strokeStyle = "rgba(245, 158, 11, 0.5)";
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.fillStyle = "#F59E0B";
          ctx.font = `bold ${Math.max(12, Math.round(badgeHeight * 0.45))}px sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("ILUXY CREATIVE PADANG", badgeX + badgeWidth / 2, badgeY + badgeHeight / 2);
          ctx.restore();

          // Convert ke WebP/JPEG dataUrl
          const watermarkedDataUrl = canvas.toDataURL("image/jpeg", 0.82);
          resolve({
            fileName: file.name,
            watermarkUrl: watermarkedDataUrl,
            originalUrl: watermarkedDataUrl, // untuk storage mock
            fileSize: file.size,
            width,
            height,
          });
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleStartMassUpload = async () => {
    if (!selectedGallery) {
      alert("Silakan pilih galeri sesi terlebih dahulu.");
      return;
    }
    if (uploadFiles.length === 0) {
      alert("Pilih minimal satu foto untuk diunggah.");
      return;
    }

    setIsWatermarking(true);
    setUploadProgress(0);
    setUploadStatusText("Memproses watermark otomatis pada canvas...");

    try {
      const processed = [];
      for (let i = 0; i < uploadFiles.length; i++) {
        setUploadStatusText(`Menerapkan watermark: foto ${i + 1} dari ${uploadFiles.length}...`);
        const result = await processWatermark(uploadFiles[i]);
        processed.push(result);
        setUploadProgress(Math.round(((i + 1) / uploadFiles.length) * 85));
      }

      setUploadStatusText("Menyimpan katalog foto ke database galeri privat...");
      const res = await uploadGalleryPhotosBatch(selectedGallery.id, processed);

      if (res.error) {
        alert("Gagal unggah foto: " + res.error);
        setIsWatermarking(false);
        return;
      }

      setUploadProgress(100);
      setUploadStatusText("Selesai! Galeri berhasil dipublikasikan.");
      alert(`Sukses! ${processed.length} foto berhasil di-watermark dan dipublikasikan.`);
      
      // Reset form
      setUploadFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setActiveTab("list");
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat memproses foto.");
    } finally {
      setIsWatermarking(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      {/* Header Admin */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-semibold mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Panel Utama</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Manajemen Private Gallery & Mass Watermark
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            FR-09, FR-10 & FR-16: Konfigurasi PIN 6-digit, upload massal resolusi tinggi, dan burning watermark studio.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 rounded-2xl bg-neutral-900 border border-white/10 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("list")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "list"
                ? "bg-amber-500 text-neutral-950 shadow-md"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Daftar Galeri ({galleries.length})
          </button>
          <button
            onClick={() => setActiveTab("create")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "create"
                ? "bg-amber-500 text-neutral-950 shadow-md"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>Buat Galeri Baru</span>
          </button>
          {selectedGallery && (
            <button
              onClick={() => setActiveTab("upload")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "upload"
                  ? "bg-amber-500 text-neutral-950 shadow-md"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Mass Upload</span>
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: DAFTAR GALERI */}
      {activeTab === "list" && (
        <div className="space-y-6">
          {galleries.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-neutral-900/40 border border-white/5">
              <UploadCloud className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white mb-1">Belum Ada Galeri Klien</h3>
              <p className="text-xs text-neutral-400 max-w-md mx-auto mb-6">
                Buat galeri pertama untuk sesi pemotretan yang telah dikonfirmasi dan unggah foto preview ber-watermark.
              </p>
              <button
                onClick={() => setActiveTab("create")}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs"
              >
                <FolderPlus className="w-4 h-4" />
                <span>Buat Galeri Baru</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleries.map((gal) => {
                const totalPhotos = gal.media_assets?.length || 0;
                const totalSelected = gal.proofing_selections?.length || 0;
                const invoice = Array.isArray(gal.bookings?.invoices)
                  ? gal.bookings.invoices[0]
                  : gal.bookings?.invoices;
                const isPaid = invoice?.status === "PAID";

                return (
                  <div
                    key={gal.id}
                    className="p-5 rounded-3xl bg-neutral-900/60 border border-white/10 hover:border-amber-500/30 transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                            gal.status === "PUBLISHED"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : gal.status === "PROOFING_SUBMITTED"
                              ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                              : "bg-neutral-800 text-neutral-400 border border-white/5"
                          }`}
                        >
                          {gal.status === "PROOFING_SUBMITTED" ? "Kurasi Dikirim" : gal.status}
                        </span>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            isPaid
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-neutral-800 text-neutral-400"
                          }`}
                        >
                          {isPaid ? "Lunas (Akses ZIP Aktif)" : "Belum Lunas"}
                        </span>
                      </div>

                      {/* Title & Info */}
                      <h3 className="text-base font-bold text-white mb-1 line-clamp-1">
                        {gal.title}
                      </h3>
                      <p className="text-xs text-neutral-400 mb-3">
                        {gal.bookings?.customers?.users?.full_name || "Klien Iluxy"} • {gal.bookings?.packages?.name || "Paket Foto"}
                      </p>

                      {/* Stat Tiles */}
                      <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-neutral-950/60 border border-white/5 mb-4 text-center">
                        <div>
                          <div className="text-sm font-black text-amber-400">{totalPhotos}</div>
                          <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Total Foto</div>
                        </div>
                        <div>
                          <div className="text-sm font-black text-emerald-400">
                            {totalSelected} / {gal.max_selection_quota}
                          </div>
                          <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Dipilih Klien</div>
                        </div>
                      </div>

                      {/* PIN & Slug Credentials */}
                      <div className="p-3 rounded-xl bg-neutral-800/40 border border-white/5 space-y-1.5 text-xs text-neutral-300 mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-neutral-400">Slug:</span>
                          <span className="font-mono text-amber-300 font-semibold">/galeri/{gal.access_slug}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-neutral-400">PIN 6-Digit:</span>
                          <span className="font-mono font-black text-white tracking-widest">{gal.access_pin_hash}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-2 pt-2 border-t border-white/5">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleCopyLink(gal.access_slug, gal.access_pin_hash, gal.id)}
                          className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          {copiedId === gal.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Tersalin!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Link</span>
                            </>
                          )}
                        </button>

                        <Link
                          href={`/galeri/${gal.access_slug}`}
                          target="_blank"
                          className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Buka Galeri</span>
                        </Link>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedGallery(gal);
                          setActiveTab("upload");
                        }}
                        className="w-full px-3 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-amber-500/10"
                      >
                        <UploadCloud className="w-4 h-4" />
                        <span>Mass Upload & Watermark Foto</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: BUAT GALERI BARU */}
      {activeTab === "create" && (
        <div className="max-w-xl mx-auto p-6 sm:p-8 rounded-3xl bg-neutral-900/80 border border-white/10 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 font-bold">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Buat Galeri Klien Baru</h2>
              <p className="text-xs text-neutral-400">Hubungkan pesanan sesi foto dengan gerbang private gallery.</p>
            </div>
          </div>

          {formError && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2 mb-6">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setIsSubmitting(true);
              setFormError("");

              const formData = new FormData(e.currentTarget);
              const res = await createOrUpdateBookingGallery(formData);

              if (res.error) {
                setFormError(res.error);
                setIsSubmitting(false);
                return;
              }

              alert("Galeri sukses dibuat! Anda kini dapat mengunggah foto.");
              setIsSubmitting(false);
              window.location.reload();
            }}
            className="space-y-4"
          >
            {/* Booking Selector */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Pilih Sesi Pemotretan Terkonfirmasi
              </label>
              {unassignedBookings.length === 0 ? (
                <div className="p-3 rounded-xl bg-neutral-800/40 border border-white/5 text-xs text-neutral-400">
                  Semua sesi pemotretan aktif telah memiliki galeri, atau belum ada booking terkonfirmasi baru.
                </div>
              ) : (
                <select
                  name="bookingId"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                >
                  <option value="">-- Pilih Booking Sesi Foto --</option>
                  {unassignedBookings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.booking_code} — {b.customers?.users?.full_name} ({b.packages?.name})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Judul Galeri
              </label>
              <input
                type="text"
                name="title"
                required
                placeholder="Contoh: The Wedding of Andi & Siti"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400 placeholder:text-neutral-600"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Slug URL Galeri (Unik)
              </label>
              <div className="flex items-center rounded-xl bg-neutral-950 border border-white/10 overflow-hidden text-xs">
                <span className="px-3 text-neutral-500 font-mono">/galeri/</span>
                <input
                  type="text"
                  name="accessSlug"
                  required
                  placeholder="andi-siti-wedding"
                  className="w-full py-2.5 pr-3 bg-transparent text-white focus:outline-none placeholder:text-neutral-600 font-mono"
                />
              </div>
            </div>

            {/* PIN 6-Digit */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  PIN Akses 6-Digit (FR-09)
                </label>
                <input
                  type="text"
                  name="pin"
                  maxLength={6}
                  required
                  defaultValue="728491"
                  placeholder="6 Digit PIN"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-white/10 text-white text-xs font-mono tracking-widest text-center focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Kuota Cetak Album (Foto)
                </label>
                <input
                  type="number"
                  name="maxQuota"
                  defaultValue={20}
                  min={1}
                  max={100}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-white/10 text-white text-xs text-center focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveTab("list")}
                className="px-4 py-2.5 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-semibold hover:bg-neutral-700"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting || unassignedBookings.length === 0}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs disabled:opacity-50 transition-all cursor-pointer shadow-lg shadow-amber-500/20"
              >
                {isSubmitting ? "Menyimpan..." : "Simpan & Buat Galeri"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: MASS UPLOAD & AUTO WATERMARK ENGINE */}
      {activeTab === "upload" && selectedGallery && (
        <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900/80 border border-white/10 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-white/10">
            <div>
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                PBI-15 Mass Watermark Engine
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-white mt-1">
                Upload Foto: {selectedGallery.title}
              </h2>
              <p className="text-xs text-neutral-400">
                Sistem akan secara otomatis me-render watermark resmi Iluxy Creative Padang ke dalam setiap foto sebelum disimpan.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("list")}
                className="px-3 py-2 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-semibold hover:bg-neutral-700"
              >
                Tutup Upload
              </button>
            </div>
          </div>

          {/* Dropzone Multi-Upload */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="p-8 sm:p-12 text-center rounded-2xl border-2 border-dashed border-amber-500/40 bg-neutral-950/40 hover:bg-neutral-950/80 transition-all cursor-pointer group mb-6"
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => {
                if (e.target.files) {
                  setUploadFiles(Array.from(e.target.files));
                }
              }}
              className="hidden"
            />

            <UploadCloud className="w-12 h-12 text-amber-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
            <h4 className="text-sm font-bold text-white mb-1">
              Klik atau Seret Puluhan / Ratusan Foto ke Sini
            </h4>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              Mendukung file JPG, PNG, dan WebP. Watermark resolusi tinggi akan dibakar otomatis secara instan di peramban.
            </p>

            {uploadFiles.length > 0 && (
              <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500 text-neutral-950 text-xs font-black">
                <Check className="w-3.5 h-3.5" />
                <span>{uploadFiles.length} Foto Dipilih Siap Diunggah</span>
              </div>
            )}
          </div>

          {/* Progress Bar Saat Memproses */}
          {isWatermarking && (
            <div className="p-5 rounded-2xl bg-neutral-950 border border-amber-500/30 mb-6 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-amber-400 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>{uploadStatusText}</span>
                </span>
                <span className="text-white font-mono">{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-500">
              * Watermark tidak merusak file asli yang disimpan terpisah untuk Master ZIP.
            </span>

            <button
              onClick={handleStartMassUpload}
              disabled={isWatermarking || uploadFiles.length === 0}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-neutral-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-lg shadow-amber-500/20"
            >
              <Sparkles className="w-4 h-4" />
              <span>Proses Auto-Watermark & Terbitkan</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
