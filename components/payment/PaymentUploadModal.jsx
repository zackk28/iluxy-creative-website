"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloud,
  X,
  CheckCircle2,
  AlertCircle,
  FileText,
  Loader2,
  Building,
  User,
  CreditCard,
  Sparkles,
} from "lucide-react";
import AnimatedButton from "@/components/ui/AnimatedButton";
import { submitPaymentProof } from "@/lib/actions/payments";

function formatRupiah(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function PaymentUploadModal({
  isOpen,
  onClose,
  invoiceId,
  dpAmount = 0,
  remainingAmount = 0,
  invoiceStatus = "UNPAID",
  onSuccess,
}) {
  const [paymentType, setPaymentType] = useState(
    invoiceStatus === "PARTIALLY_PAID" ? "SETTLEMENT" : "DP"
  );
  const [bankName, setBankName] = useState("Bank Nagari (Studio)");
  const [senderAccountName, setSenderAccountName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  if (!isOpen) return null;

  const currentAmount = paymentType === "DP" ? dpAmount : remainingAmount;

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Format berkas harus berupa gambar (JPG, PNG, WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Ukuran file maksimal 5 MB.");
      return;
    }

    setErrorMessage("");
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMessage("");

    if (!selectedFile) {
      setErrorMessage("Silakan pilih foto struk / tangkapan layar bukti transfer m-banking.");
      return;
    }

    if (!senderAccountName || senderAccountName.trim().length < 2) {
      setErrorMessage("Nama pemilik rekening pengirim wajib diisi.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("invoiceId", invoiceId);
      formData.append("paymentType", paymentType);
      formData.append("amount", currentAmount.toString());
      formData.append("bankName", bankName);
      formData.append("senderAccountName", senderAccountName);
      formData.append("proofFile", selectedFile);

      const result = await submitPaymentProof(formData);

      if (result.error) {
        setErrorMessage(result.error);
        setIsSubmitting(false);
        return;
      }

      setSuccessMessage(result.message);
      setIsSubmitting(false);

      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      }
    } catch (err) {
      console.error("Gagal submit bukti bayar:", err);
      setErrorMessage("Terjadi kesalahan sistem saat mengunggah berkas.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg rounded-3xl bg-neutral-900 border border-white/10 p-6 sm:p-7 shadow-2xl shadow-black max-h-[90vh] overflow-y-auto space-y-6"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-wider">
            <CreditCard className="w-3 h-3" />
            <span>Konfirmasi Pembayaran</span>
          </div>
          <h3 className="text-xl font-black text-white">Unggah Struk Bukti Transfer</h3>
          <p className="text-xs text-neutral-400">
            Kirimkan foto struk ATM atau screenshot m-banking untuk verifikasi jadwal sesi pemotretan.
          </p>
        </div>

        {/* Success Banner */}
        {successMessage ? (
          <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Pilihan Tipe Pembayaran (DP vs Pelunasan) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block">
                Jenis Pembayaran
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentType("DP")}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    paymentType === "DP"
                      ? "bg-amber-500/15 border-amber-500/50 text-white"
                      : "bg-neutral-950/60 border-white/5 text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold text-amber-400 block">Uang Muka (DP)</span>
                  <span className="text-sm font-black">{formatRupiah(dpAmount)}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentType("SETTLEMENT")}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    paymentType === "SETTLEMENT"
                      ? "bg-amber-500/15 border-amber-500/50 text-white"
                      : "bg-neutral-950/60 border-white/5 text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold text-amber-400 block">Pelunasan</span>
                  <span className="text-sm font-black">{formatRupiah(remainingAmount)}</span>
                </button>
              </div>
            </div>

            {/* Bank Tujuan & Nama Pengirim */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block mb-1.5">
                  Bank Tujuan
                </label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  <option value="Bank Nagari (Studio)">Bank Nagari (7100.0201.8899)</option>
                  <option value="BCA (Studio)">BCA (8123.9012.3344)</option>
                  <option value="Bank Mandiri">Bank Mandiri (1110.0988.7766)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block mb-1.5">
                  Nama Rekening Pengirim <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={senderAccountName}
                  onChange={(e) => setSenderAccountName(e.target.value)}
                  placeholder="Contoh: Zackri Kurnia"
                  className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Dropzone Upload Gambar */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block">
                Foto Struk / Tangkapan Layar M-Banking <span className="text-rose-400">*</span>
              </label>

              <label className="relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-white/15 hover:border-amber-400/50 bg-neutral-950/60 hover:bg-neutral-950 transition-colors cursor-pointer group">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="sr-only"
                />

                {previewUrl ? (
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/10">
                    <Image
                      src={previewUrl}
                      alt="Pratinjau Struk"
                      fill
                      className="object-contain"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs font-bold text-white transition-opacity">
                      Klik untuk ganti foto
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="p-3 rounded-full bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Klik atau Tarik Berkas Gambar ke Sini</p>
                      <p className="text-[11px] text-neutral-500">Mendukung format JPG, PNG, WebP (Maks. 5 MB)</p>
                    </div>
                  </div>
                )}
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-300 transition-colors cursor-pointer"
              >
                Batal
              </button>

              <AnimatedButton
                variant="primary"
                type="submit"
                isLoading={isSubmitting}
                disabled={isSubmitting}
                className="py-2.5 px-6 text-xs uppercase font-extrabold tracking-wider"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                <span>{isSubmitting ? "Mengunggah..." : "Kirim Bukti Bayar"}</span>
              </AnimatedButton>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
