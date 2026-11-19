"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  CheckCircle2,
  Heart,
  MessageSquare,
  Download,
  Lock,
  Unlock,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Sparkles,
  AlertCircle,
  FileCheck,
  Send,
  Loader2,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import {
  toggleProofingSelection,
  updateRetouchNote,
  finalizeProofing,
  getMasterZipDownloadToken,
} from "@/lib/actions/gallery";

export default function GalleryMasonryView({
  gallery,
  mediaAssets = [],
  initialSelections = [],
}) {
  const router = useRouter();

  // State Pilihan Proofing
  const [selections, setSelections] = useState(
    initialSelections.reduce((acc, curr) => {
      acc[curr.media_asset_id] = curr.customer_notes || "";
      return acc;
    }, {})
  );

  const [activeTab, setActiveTab] = useState("ALL"); // 'ALL' | 'SELECTED'
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [retouchModalPhoto, setRetouchModalPhoto] = useState(null);
  const [retouchText, setRetouchText] = useState("");

  // State Aksi & Gating
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [gatedZipModal, setGatedZipModal] = useState(null); // { locked: bool, ... }
  const [isGeneratingZip, setIsGeneratingZip] = useState(false);

  const maxQuota = gallery?.max_selection_quota || 20;
  const selectedCount = Object.keys(selections).length;
  const isProofingLocked =
    gallery?.status === "PROOFING_SUBMITTED" || gallery?.status === "CLOSED";

  const booking = gallery?.bookings;
  const invoice = Array.isArray(booking?.invoices) ? booking?.invoices[0] : booking?.invoices;

  // Filter foto berdasarkan tab
  const displayedPhotos = mediaAssets.filter((photo) => {
    if (activeTab === "SELECTED") {
      return selections[photo.id] !== undefined;
    }
    return true;
  });

  // Toggle Pilihan Foto untuk Album
  async function handleToggleSelect(photo) {
    if (isProofingLocked) return;
    setActionError("");

    const isCurrentlySelected = selections[photo.id] !== undefined;

    if (!isCurrentlySelected && selectedCount >= maxQuota) {
      setActionError(`Batas kuota album (${maxQuota} foto) telah terpenuhi.`);
      setTimeout(() => setActionError(""), 3500);
      return;
    }

    // Optimistic Update
    const newSelections = { ...selections };
    if (isCurrentlySelected) {
      delete newSelections[photo.id];
    } else {
      newSelections[photo.id] = "";
    }
    setSelections(newSelections);

    try {
      const res = await toggleProofingSelection(gallery.id, photo.id);
      if (res.error) {
        // Rollback
        setSelections(selections);
        setActionError(res.error);
        setTimeout(() => setActionError(""), 3500);
      }
    } catch (err) {
      console.error(err);
      setSelections(selections);
    }
  }

  // Buka Modal Catatan Retouch
  function openRetouchModal(photo, e) {
    if (e) e.stopPropagation();
    setRetouchModalPhoto(photo);
    setRetouchText(selections[photo.id] || "");
  }

  // Simpan Catatan Retouch
  async function handleSaveRetouch() {
    if (!retouchModalPhoto) return;

    const newSelections = {
      ...selections,
      [retouchModalPhoto.id]: retouchText,
    };
    setSelections(newSelections);

    try {
      await updateRetouchNote(gallery.id, retouchModalPhoto.id, retouchText);
      setRetouchModalPhoto(null);
    } catch (err) {
      console.error(err);
    }
  }

  // Finalisasi Kurasi Album
  async function handleFinalizeProofing() {
    if (selectedCount === 0) {
      alert("Pilih minimal 1 foto untuk album sebelum finalisasi.");
      return;
    }

    const confirmMsg = `Konfirmasi finalisasi kurasi ${selectedCount} foto pilihan? Pilihan akan dikunci dan dikirimkan ke tim editor album studio Iluxy Creative.`;
    if (!confirm(confirmMsg)) return;

    setIsFinalizing(true);
    setActionError("");

    try {
      const res = await finalizeProofing(gallery.id);
      if (res.error) {
        setActionError(res.error);
      } else {
        setActionSuccess(res.message);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      setActionError("Gagal memproses finalisasi kurasi.");
    } finally {
      setIsFinalizing(false);
    }
  }

  // Unduh Master ZIP (PBI-18 Gated)
  async function handleDownloadMasterZip() {
    setIsGeneratingZip(true);
    try {
      const res = await getMasterZipDownloadToken(gallery.id);
      setGatedZipModal(res);
    } catch (err) {
      console.error(err);
      alert("Gagal memverifikasi status pelunasan master ZIP.");
    } finally {
      setIsGeneratingZip(false);
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-32">
      {/* 1. GALLERY HEADER */}
      <div className="p-6 sm:p-10 rounded-3xl bg-neutral-900/80 border border-white/10 backdrop-blur-2xl shadow-2xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/10 pb-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400">
                Private Gallery Eksklusif
              </span>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                  gallery.status === "PROOFING_SUBMITTED"
                    ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                    : gallery.status === "PUBLISHED"
                    ? "bg-blue-500/15 text-blue-300 border-blue-500/30"
                    : "bg-neutral-800 text-neutral-300 border-white/10"
                }`}
              >
                {gallery.status === "PROOFING_SUBMITTED"
                  ? "Kurasi Album Difinalisasi"
                  : gallery.status === "PUBLISHED"
                  ? "Kurasi Dibuka"
                  : "Draft Studio"}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white">{gallery.title}</h1>

            <p className="text-xs text-neutral-400">
              Paket: <strong className="text-neutral-200">{booking?.packages?.name || "Fotografi"}</strong> •
              Kode Booking: <span className="font-mono text-amber-400">{booking?.booking_code}</span> • Total{" "}
              {mediaAssets.length} Foto Siap Kurasi
            </p>
          </div>

          {/* Action Download Master ZIP (Gated PBI-18) */}
          <div className="self-start lg:self-auto">
            <button
              type="button"
              onClick={handleDownloadMasterZip}
              disabled={isGeneratingZip}
              className="px-5 py-3 rounded-2xl bg-neutral-800 hover:bg-neutral-700 border border-white/10 hover:border-amber-500/30 text-xs font-bold text-white flex items-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              {isGeneratingZip ? (
                <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
              ) : invoice?.status === "PAID" ? (
                <Download className="w-4 h-4 text-emerald-400" />
              ) : (
                <Lock className="w-4 h-4 text-amber-400" />
              )}
              <span>{isGeneratingZip ? "Memeriksa Status..." : "Unduh Master ZIP Full-Res"}</span>
            </button>
          </div>
        </div>

        {/* Filter Tab & Kuota Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-neutral-950 border border-white/10 self-start">
            <button
              type="button"
              onClick={() => setActiveTab("ALL")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "ALL"
                  ? "bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Semua Foto ({mediaAssets.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("SELECTED")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "SELECTED"
                  ? "bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Heart className="w-3.5 h-3.5 fill-current" />
              <span>Foto Album Terpilih ({selectedCount})</span>
            </button>
          </div>

          {/* Quick Notice */}
          <div className="text-xs text-neutral-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>
              Seluruh foto diproteksi watermark studio. File original resolusi tinggi dapat diunduh setelah pelunasan.
            </span>
          </div>
        </div>

        {/* Global Action Banner */}
        {actionError && (
          <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{actionError}</span>
          </div>
        )}
        {actionSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{actionSuccess}</span>
          </div>
        )}
      </div>

      {/* 2. MASONRY GRID FOTO */}
      {displayedPhotos.length === 0 ? (
        <div className="p-16 text-center rounded-3xl bg-neutral-900/40 border border-white/5 text-neutral-400 text-xs">
          {activeTab === "SELECTED"
            ? "Belum ada foto yang ditandai untuk album. Klik tanda centang pada foto untuk memilih."
            : "Belum ada foto yang diunggah ke galeri ini."}
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
          {displayedPhotos.map((photo, index) => {
            const isSelected = selections[photo.id] !== undefined;
            const hasNote = Boolean(selections[photo.id]);

            return (
              <div
                key={photo.id}
                className={`group relative break-inside-avoid rounded-2xl overflow-hidden border transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? "border-amber-400 shadow-xl shadow-amber-500/20 scale-[1.01]"
                    : "border-white/10 hover:border-white/30"
                }`}
                onClick={() => setLightboxIndex(index)}
              >
                {/* Photo Display */}
                <div className="relative w-full aspect-[3/4] bg-neutral-950">
                  <img
                    src={photo.watermark_url || photo.original_url}
                    alt={photo.file_name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />

                  {/* Watermark Overlay Stamp */}
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-30 select-none">
                    <span className="text-white/60 font-black tracking-widest text-lg sm:text-xl uppercase rotate-[-30deg] border border-white/20 px-3 py-1 rounded-lg backdrop-blur-xs">
                      ILUXY CREATIVE
                    </span>
                  </div>

                  {/* Gradient Shadow Top & Bottom */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Top Floating Badge (Selection Checkbox) */}
                  <div className="absolute top-3 right-3 z-10">
                    <button
                      type="button"
                      disabled={isProofingLocked}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleSelect(photo);
                      }}
                      className={`p-2.5 rounded-full transition-all cursor-pointer ${
                        isSelected
                          ? "bg-amber-400 text-neutral-950 shadow-lg shadow-amber-500/50 scale-110"
                          : "bg-black/60 hover:bg-black/90 text-white/80 hover:text-white border border-white/20"
                      }`}
                      title={isSelected ? "Batalkan pilihan album" : "Pilih untuk dicetak ke album"}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Bottom Hover Toolbar */}
                  <div className="absolute bottom-3 inset-x-3 z-10 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[11px] font-mono text-neutral-300 truncate max-w-[140px]">
                      {photo.file_name}
                    </span>

                    {/* Tombol Catatan Retouch (jika terpilih) */}
                    {isSelected && !isProofingLocked && (
                      <button
                        type="button"
                        onClick={(e) => openRetouchModal(photo, e)}
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1 transition-all ${
                          hasNote
                            ? "bg-amber-500 text-neutral-950"
                            : "bg-neutral-800/80 hover:bg-neutral-800 text-neutral-200 border border-white/10"
                        }`}
                        title="Tulis catatan retouch foto"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>{hasNote ? "Catatan Ada" : "+ Catatan"}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. FLOATING PROOFING TOOLBAR (PBI-17) */}
      {!isProofingLocked && (
        <div className="fixed bottom-6 inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-40">
          <div className="p-3.5 sm:p-4 rounded-3xl bg-neutral-950/95 border border-amber-500/40 backdrop-blur-2xl shadow-2xl shadow-black flex flex-col sm:flex-row sm:items-center gap-4 min-w-[320px] sm:min-w-[500px]">
            <div className="flex-1 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-amber-400" />
                  <span>Kurasi Album Cetak</span>
                </span>
                <span className="font-mono font-bold text-amber-400">
                  {selectedCount} / {maxQuota} Foto
                </span>
              </div>
              {/* Progress Bar */}
              <div className="w-full h-1.5 rounded-full bg-neutral-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-300"
                  style={{ width: `${Math.min(100, (selectedCount / maxQuota) * 100)}%` }}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleFinalizeProofing}
              disabled={isFinalizing || selectedCount === 0}
              className="py-2.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 disabled:opacity-50 text-neutral-950 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/30 transition-all cursor-pointer"
            >
              {isFinalizing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Finalisasi Kurasi</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* 4. FULLSCREEN LIGHTBOX MODAL */}
      {lightboxIndex !== null && displayedPhotos[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/95 backdrop-blur-xl"
          onClick={() => setLightboxIndex(null)}
        >
          <div
            className="relative max-w-5xl max-h-[90vh] w-full flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Lightbox */}
            <button
              type="button"
              onClick={() => setLightboxIndex(null)}
              className="absolute -top-10 right-0 p-2 rounded-full bg-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Prev / Next Controls */}
            {lightboxIndex > 0 && (
              <button
                type="button"
                onClick={() => setLightboxIndex((prev) => prev - 1)}
                className="absolute left-2 sm:-left-12 top-1/2 -translate-y-1/2 p-3 rounded-full bg-neutral-900/80 hover:bg-neutral-800 border border-white/10 text-white transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            {lightboxIndex < displayedPhotos.length - 1 && (
              <button
                type="button"
                onClick={() => setLightboxIndex((prev) => prev + 1)}
                className="absolute right-2 sm:-right-12 top-1/2 -translate-y-1/2 p-3 rounded-full bg-neutral-900/80 hover:bg-neutral-800 border border-white/10 text-white transition-colors cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}

            {/* Image Stage */}
            <div className="relative max-h-[75vh] w-full flex items-center justify-center overflow-hidden rounded-2xl">
              <img
                src={
                  displayedPhotos[lightboxIndex].watermark_url ||
                  displayedPhotos[lightboxIndex].original_url
                }
                alt={displayedPhotos[lightboxIndex].file_name}
                className="max-h-[75vh] max-w-full object-contain rounded-2xl shadow-2xl"
              />
            </div>

            {/* Bottom Info & Selection Toggle in Lightbox */}
            <div className="w-full mt-4 flex items-center justify-between text-xs text-neutral-300 px-2">
              <span className="font-mono text-neutral-400">
                {displayedPhotos[lightboxIndex].file_name} ({lightboxIndex + 1} dari {displayedPhotos.length})
              </span>

              <button
                type="button"
                disabled={isProofingLocked}
                onClick={() => handleToggleSelect(displayedPhotos[lightboxIndex])}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  selections[displayedPhotos[lightboxIndex].id] !== undefined
                    ? "bg-amber-400 text-neutral-950 font-black shadow-lg shadow-amber-500/30"
                    : "bg-neutral-800 text-neutral-300 hover:text-white"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>
                  {selections[displayedPhotos[lightboxIndex].id] !== undefined
                    ? "Terpilih untuk Album"
                    : "Pilih Foto Ini"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL CATATAN RETOUCH (PBI-17) */}
      {retouchModalPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl bg-neutral-900 border border-white/10 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <MessageSquare className="w-4 h-4 text-amber-400" />
                <span>Catatan Khusus Retouch Foto</span>
              </div>
              <button
                type="button"
                onClick={() => setRetouchModalPhoto(null)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed">
              Tuliskan permintaan perbaikan visual spesifik untuk foto ini kepada tim editor Iluxy Creative.
            </p>

            <textarea
              rows={3}
              value={retouchText}
              onChange={(e) => setRetouchText(e.target.value)}
              placeholder="Contoh: Tolong haluskan noda jas di sebelah kiri dan naikkan saturasi warna gaun..."
              className="w-full px-3.5 py-2.5 rounded-2xl bg-neutral-950 border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRetouchModalPhoto(null)}
                className="px-4 py-2 rounded-xl bg-neutral-800 text-xs font-bold text-neutral-300 hover:text-white transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveRetouch}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
              >
                Simpan Catatan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL GATED MASTER ZIP (PBI-18) */}
      {gatedZipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl bg-neutral-900 border border-white/10 p-7 space-y-5 shadow-2xl">
            {gatedZipModal.locked ? (
              <>
                <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
                  <Lock className="w-7 h-7" />
                </div>
                <div className="text-center space-y-1">
                  <h3 className="text-lg font-black text-white">Unduhan Master ZIP Terkunci</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Arsip seluruh file original resolusi tinggi tanpa kompresi hanya dapat diunduh setelah
                    pelunasan tagihan 100% selesai diverifikasi.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-950 border border-white/5 space-y-2 text-xs">
                  <div className="flex justify-between text-neutral-300">
                    <span>Status Tagihan:</span>
                    <span className="font-bold text-amber-400">{invoice?.status || "UNPAID"}</span>
                  </div>
                  <div className="flex justify-between text-neutral-300">
                    <span>Sisa Pelunasan:</span>
                    <span className="font-bold text-white">
                      Rp {Number(gatedZipModal.remainingAmount || 0).toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setGatedZipModal(null)}
                    className="flex-1 py-2.5 rounded-xl bg-neutral-800 text-xs font-bold text-neutral-300 hover:text-white transition-colors cursor-pointer"
                  >
                    Tutup
                  </button>
                  {gatedZipModal.invoiceId && (
                    <Link
                      href={`/invoice/${gatedZipModal.invoiceId}`}
                      className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-black uppercase tracking-wider text-center transition-colors"
                    >
                      Buka Invoice
                    </Link>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
                  <Unlock className="w-7 h-7" />
                </div>
                <div className="text-center space-y-1">
                  <h3 className="text-lg font-black text-white">Akses Master ZIP Disetujui!</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Pembayaran Anda telah lunas 100%. Token unduhan aktif dan berlaku selama 48 jam ke depan.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-neutral-950 border border-emerald-500/30 text-xs text-emerald-300 space-y-1">
                  <div className="font-mono text-[11px] font-bold truncate">Token: {gatedZipModal.downloadToken}</div>
                  <div className="text-[10px] text-neutral-500">
                    Kedaluwarsa pada: {new Date(gatedZipModal.expiresAt).toLocaleString("id-ID")}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setGatedZipModal(null)}
                    className="py-2.5 px-4 rounded-xl bg-neutral-800 text-xs font-bold text-neutral-300 hover:text-white transition-colors cursor-pointer"
                  >
                    Selesai
                  </button>
                  <a
                    href={gatedZipModal.downloadUrl}
                    download
                    className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Unduh Sekarang (.ZIP)</span>
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
