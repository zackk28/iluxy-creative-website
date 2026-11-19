"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, KeyRound, AlertCircle, Sparkles, Loader2, ArrowRight } from "lucide-react";
import { verifyGalleryPin } from "@/lib/actions/gallery";

export default function PinGateModal({ slug, galleryTitle = "Private Gallery", onUnlock }) {
  const [pinDigits, setPinDigits] = useState(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [shake, setShake] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);

  const inputRefs = useRef([]);

  useEffect(() => {
    // Auto focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  function handleDigitChange(index, value) {
    if (!/^\d*$/.test(value)) return; // Hanya angka

    const newDigits = [...pinDigits];
    newDigits[index] = value.slice(-1); // Ambil 1 digit terakhir
    setPinDigits(newDigits);
    setErrorMessage("");

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto submit jika 6 digit terisi
    if (value && index === 5 && newDigits.every((d) => d !== "")) {
      executeVerify(newDigits.join(""));
    }
  }

  function handleKeyDown(index, e) {
    if (e.key === "Backspace" && !pinDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e) {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split("");
      setPinDigits(digits);
      inputRefs.current[5]?.focus();
      executeVerify(pastedData);
    }
  }

  async function executeVerify(pinCode) {
    setIsVerifying(true);
    setErrorMessage("");

    try {
      const res = await verifyGalleryPin(slug, pinCode);

      if (!res.success) {
        setErrorMessage(res.error || "PIN yang dimasukkan salah.");
        setShake(true);
        setAttemptCount((prev) => prev + 1);
        setTimeout(() => setShake(false), 500);
        // Clear digits
        setPinDigits(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      } else {
        onUnlock(pinCode);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Terjadi gangguan saat memverifikasi PIN.");
    } finally {
      setIsVerifying(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
      <motion.div
        animate={{ x: shake ? [-14, 14, -10, 10, -5, 5, 0] : 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-md rounded-3xl bg-neutral-900 border border-white/10 p-7 sm:p-8 shadow-2xl shadow-black text-center space-y-6"
      >
        {/* Lock Icon Aura */}
        <div className="relative mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-neutral-950 shadow-xl shadow-amber-500/25">
          <KeyRound className="w-8 h-8" />
          <span className="absolute inset-0 rounded-2xl bg-amber-400/30 blur-md scale-110 pointer-events-none" />
        </div>

        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 inline-block mb-2">
            Akses Terproteksi PIN 6-Digit
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white">{galleryTitle}</h2>
          <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
            Masukkan PIN 6 digit yang dikirimkan oleh studio Iluxy Creative untuk membuka galeri foto privat Anda.
          </p>
        </div>

        {/* 6-DIGIT OTP INPUTS */}
        <div className="flex justify-center gap-2 sm:gap-3 py-2" onPaste={handlePaste}>
          {pinDigits.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => (inputRefs.current[idx] = el)}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleDigitChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className={`w-11 h-13 sm:w-12 sm:h-14 rounded-2xl text-center text-xl sm:text-2xl font-black bg-neutral-950 border transition-all focus:outline-none ${
                digit
                  ? "border-amber-400 text-amber-300 bg-amber-500/5 shadow-[0_0_12px_rgba(245,158,11,0.2)]"
                  : "border-white/15 text-white focus:border-amber-400 focus:bg-neutral-950"
              }`}
            />
          ))}
        </div>

        {/* Error / Attempt Message */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {attemptCount > 0 && attemptCount < 5 && (
          <p className="text-[11px] text-neutral-500">
            Percobaan salah: {attemptCount} dari batas 5 kali sebelum terkunci sementara.
          </p>
        )}

        {/* Submit Action */}
        <button
          type="button"
          disabled={isVerifying || pinDigits.some((d) => d === "")}
          onClick={() => executeVerify(pinDigits.join(""))}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 disabled:opacity-50 disabled:cursor-not-allowed text-neutral-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all cursor-pointer"
        >
          {isVerifying ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Memvalidasi PIN...</span>
            </>
          ) : (
            <>
              <span>Buka Akses Galeri Privat</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <p className="text-[11px] text-neutral-500 italic">
          Lupa PIN atau belum menerima kode akses? Hubungi admin studio via WhatsApp: 0895-3360-75846.
        </p>
      </motion.div>
    </div>
  );
}
