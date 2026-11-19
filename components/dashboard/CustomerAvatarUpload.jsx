"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { Camera, Loader2, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { updateProfileAvatar } from "@/lib/actions/auth";

export default function CustomerAvatarUpload({ currentAvatarUrl, fullName = "Pelanggan" }) {
  const [avatarUrl, setAvatarUrl] = useState(currentAvatarUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const fileInputRef = useRef(null);

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Harap pilih berkas gambar (JPG, PNG, WebP).");
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setErrorMessage("Ukuran file foto maksimal 3 MB.");
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("avatarFile", file);

      const res = await updateProfileAvatar(formData);

      if (res.error) {
        setErrorMessage(res.error);
      } else if (res.success && res.avatarUrl) {
        setAvatarUrl(res.avatarUrl);
        setSuccessMessage("Foto profil berhasil diperbarui!");
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (err) {
      console.error("Gagal unggah avatar:", err);
      setErrorMessage("Gagal mengunggah foto profil.");
    } finally {
      setIsUploading(false);
    }
  }

  const initial = fullName.charAt(0).toUpperCase();

  return (
    <div className="relative group/avatar inline-block">
      {/* Container Foto Profil */}
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-200 flex items-center justify-center text-neutral-950 font-black text-2xl sm:text-3xl shadow-xl shadow-amber-500/20 overflow-hidden border-2 border-amber-300/60">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={fullName}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{initial}</span>
        )}

        {/* Loading Overlay */}
        {isUploading && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-amber-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        )}

        {/* Hover Camera Overlay */}
        {!isUploading && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Klik untuk ganti foto profil"
            className="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 flex flex-col items-center justify-center text-white text-[9px] font-bold transition-opacity cursor-pointer"
          >
            <Camera className="w-4 h-4 mb-0.5 text-amber-400" />
            <span>Ganti</span>
          </button>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="sr-only"
      />

      {/* Camera badge trigger on mobile / desktop */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        title="Ubah Foto Profil"
        className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-neutral-900 border border-amber-500/40 text-amber-400 hover:text-white hover:bg-neutral-800 shadow-md transition-all cursor-pointer"
      >
        <Camera className="w-3.5 h-3.5" />
      </button>

      {/* Toast Feedback */}
      {errorMessage && (
        <div className="absolute top-full left-0 mt-2 z-20 whitespace-nowrap px-3 py-1.5 rounded-xl bg-rose-950/90 border border-rose-500/30 text-rose-300 text-[11px] flex items-center gap-1 shadow-xl">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="absolute top-full left-0 mt-2 z-20 whitespace-nowrap px-3 py-1.5 rounded-xl bg-emerald-950/90 border border-emerald-500/30 text-emerald-300 text-[11px] flex items-center gap-1 shadow-xl">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{successMessage}</span>
        </div>
      )}
    </div>
  );
}
