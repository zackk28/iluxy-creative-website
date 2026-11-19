"use client";

import React from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export function AnimatedButton({
  variant = "primary",
  isLoading = false,
  children,
  className = "",
  disabled,
  onClick,
  ...props
}) {
  const baseStyles =
    "relative inline-flex items-center justify-center font-semibold text-sm rounded-xl overflow-hidden px-5 py-3 transition-colors select-none cursor-pointer";

  const variantStyles = {
    primary:
      "bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold shadow-lg shadow-amber-500/20 active:shadow-none",
    secondary:
      "bg-neutral-800 hover:bg-neutral-700 text-white border border-white/10",
    outline:
      "border border-amber-500/40 text-amber-400 hover:bg-amber-500/10",
    danger:
      "bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20",
    ghost:
      "text-neutral-300 hover:text-white hover:bg-white/5",
  };

  return (
    <motion.button
      whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.96 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${variantStyles[variant] || variantStyles.primary} ${
        disabled || isLoading ? "opacity-50 cursor-not-allowed pointer-events-none" : ""
      } ${className}`}
      {...props}
    >
      {/* Light sweep reflection */}
      <div className="absolute inset-0 -translate-x-full hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

      {isLoading ? (
        <span className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-current" />
          <span>Memproses...</span>
        </span>
      ) : (
        <span className="relative z-10 flex items-center gap-2">
          {children}
        </span>
      )}
    </motion.button>
  );
}

export default AnimatedButton;
