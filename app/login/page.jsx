"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle, 
  Shield, 
  UserCheck, 
  Sparkles 
} from "lucide-react";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { loginUser } from "@/lib/actions/auth";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "";

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    if (redirectTo) {
      formData.set("redirectTo", redirectTo);
    }

    try {
      const result = await loginUser(formData);

      if (result?.error) {
        setErrorMessage(result.error);
        setIsLoading(false);
        return;
      }

      if (result?.success) {
        // Redirect to target or role-based dashboard
        router.push(result.redirectTo || (result.role === "ADMIN" ? "/admin/dashboard" : "/dashboard"));
        router.refresh();
      }
    } catch (err) {
      setErrorMessage("Gagal memproses login. Silakan periksa koneksi Anda.");
      setIsLoading(false);
    }
  };

  const handleQuickDemo = (role) => {
    if (role === "admin") {
      setEmailInput("admin@iluxycreative.com");
      setPasswordInput("Admin123!");
    } else {
      setEmailInput("klien@iluxycreative.com");
      setPasswordInput("Klien123!");
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
              Masuk ke Akun
            </h1>
            <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
              Autentikasi Multi-Role untuk Pelanggan & Tim Studio Iluxy Creative Padang.
            </p>
          </div>

          {/* Feedback Error Message */}
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                Alamat Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-950/60 border border-white/10 text-white placeholder-neutral-600 text-xs focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40 transition-colors"
                />
              </div>
            </div>

            {/* Kata Sandi */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                  Kata Sandi
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Masukkan kata sandi"
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

            {/* Submit Button */}
            <div className="pt-2">
              <AnimatedButton
                variant="primary"
                type="submit"
                isLoading={isLoading}
                className="w-full py-3 text-xs tracking-wider uppercase font-bold"
              >
                <span>Masuk Sekarang</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </AnimatedButton>
            </div>
          </form>

          {/* Quick Preset Demo Selector */}
          <div className="mt-6 pt-5 border-t border-white/5">
            <span className="block text-[10px] uppercase tracking-wider text-neutral-400 font-semibold mb-2.5 text-center">
              Akses Cepat Pengujian Sidang (Demo Helper)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo("client")}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-800/60 hover:bg-neutral-800 border border-white/5 text-[11px] text-neutral-300 hover:text-white transition-colors cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Preset Klien</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo("admin")}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-800/60 hover:bg-neutral-800 border border-white/5 text-[11px] text-neutral-300 hover:text-white transition-colors cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>Preset Admin</span>
              </button>
            </div>
          </div>

          {/* Footer Navigation */}
          <div className="mt-6 pt-4 border-t border-white/5 text-center">
            <p className="text-xs text-neutral-400">
              Belum memiliki akun klien?{" "}
              <Link
                href="/register"
                className="font-semibold text-amber-400 hover:text-amber-300 underline underline-offset-4 transition-colors"
              >
                Daftar sekarang
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center text-xs text-neutral-400">Memuat halaman masuk...</div>}>
      <LoginForm />
    </Suspense>
  );
}
