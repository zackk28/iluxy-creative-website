"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles 
} from "lucide-react";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { registerClient } from "@/lib/actions/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successInfo, setSuccessInfo] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessInfo(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const result = await registerClient(formData);

      if (result?.error) {
        setErrorMessage(result.error);
        setIsLoading(false);
        return;
      }

      if (result?.success) {
        setSuccessInfo(result);
        if (!result.needsEmailConfirmation) {
          setTimeout(() => {
            router.push("/dashboard");
          }, 1500);
        }
      }
    } catch (err) {
      setErrorMessage("Terjadi kesalahan sistem. Silakan coba kembali.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center px-4 py-8">
      {/* Background Ambient Glow */}
      <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-[500px] h-[350px] bg-gradient-to-b from-amber-500/15 via-amber-500/5 to-transparent blur-[120px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Card Wrapper */}
        <div className="bg-neutral-900/70 border border-white/10 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80">
          {/* Header Identity */}
          <div className="text-center mb-6">
            <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-200 flex items-center justify-center text-neutral-950 font-black text-sm shadow-md shadow-amber-500/30 group-hover:scale-105 transition-transform">
                IX
              </div>
              <span className="font-bold tracking-wider text-base bg-gradient-to-r from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent">
                ILUXY CREATIVE
              </span>
            </Link>

            <h1 className="text-2xl font-bold text-white tracking-tight">
              Registrasi Akun Klien
            </h1>
            <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
              Daftar akun untuk booking jadwal sesi foto dan kurasi file di Private Gallery.
            </p>
          </div>

          {/* Feedback Messages */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 flex items-start gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs leading-relaxed"
            >
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </motion.div>
          )}

          {successInfo && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/35 text-amber-200 text-xs leading-relaxed"
            >
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">{successInfo.message}</p>
                {successInfo.needsEmailConfirmation ? (
                  <p className="text-[11px] text-amber-300/90 mt-1">
                    Silakan buka tautan pada email Anda untuk mengaktifkan akun, lalu login.
                  </p>
                ) : (
                  <p className="text-[11px] text-amber-300/90 mt-1">
                    Mengalihkan Anda ke Dashboard Klien...
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nama Lengkap */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                Nama Lengkap
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="full_name"
                  required
                  placeholder="Contoh: Zackri Kurnia"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-950/60 border border-white/10 text-white placeholder-neutral-600 text-xs focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40 transition-colors"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                Email Aktif
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="nama@email.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-950/60 border border-white/10 text-white placeholder-neutral-600 text-xs focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40 transition-colors"
                />
              </div>
            </div>

            {/* Nomor WhatsApp */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                Nomor WhatsApp
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  name="phone_number"
                  required
                  placeholder="081234567890"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-950/60 border border-white/10 text-white placeholder-neutral-600 text-xs focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40 transition-colors"
                />
              </div>
            </div>

            {/* Kata Sandi */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  minLength={6}
                  placeholder="Minimal 6 karakter"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-neutral-950/60 border border-white/10 text-white placeholder-neutral-600 text-xs focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-500 hover:text-neutral-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Konfirmasi Kata Sandi */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                Konfirmasi Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirm_password"
                  required
                  minLength={6}
                  placeholder="Ulangi kata sandi"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-950/60 border border-white/10 text-white placeholder-neutral-600 text-xs focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40 transition-colors"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <AnimatedButton
                variant="primary"
                type="submit"
                isLoading={isLoading}
                className="w-full py-3 text-xs tracking-wider uppercase font-bold"
              >
                <span>Daftar Akun Klien</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </AnimatedButton>
            </div>
          </form>

          {/* Footer Navigation */}
          <div className="mt-6 pt-4 border-t border-white/5 text-center">
            <p className="text-xs text-neutral-400">
              Sudah memiliki akun?{" "}
              <Link
                href="/login"
                className="font-semibold text-amber-400 hover:text-amber-300 underline underline-offset-4 transition-colors"
              >
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
