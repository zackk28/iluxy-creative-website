"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Camera, CalendarDays, Images, User, Sparkles } from "lucide-react";

const navItems = [
  { label: "Katalog", href: "/katalog", icon: Camera },
  { label: "Jadwal", href: "/booking", icon: CalendarDays },
  { label: "Galeri", href: "/galeri-privat", icon: Images },
  { label: "Akun", href: "/dashboard", icon: User },
];

export default function MobileBottomBar() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-4 inset-x-4 z-50">
      <div className="bg-neutral-950/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-1.5 shadow-2xl shadow-black/90 flex items-center justify-around relative">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center justify-center py-2 px-3 rounded-2xl flex-1 transition-all"
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-active-blob"
                  className="absolute inset-0 bg-amber-500/15 rounded-2xl border border-amber-500/30"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <motion.div
                whileTap={{ scale: 0.85 }}
                className="relative z-10 flex flex-col items-center gap-1"
              >
                <Icon 
                  className={`w-5 h-5 transition-colors ${
                    isActive ? "text-amber-400" : "text-neutral-400"
                  }`} 
                />
                <span 
                  className={`text-[10px] font-medium tracking-tight ${
                    isActive ? "text-white font-semibold" : "text-neutral-400"
                  }`}
                >
                  {item.label}
                </span>
              </motion.div>
            </Link>
          );
        })}

        {/* Floating Quick Action Button on Mobile */}
        <Link
          href="/booking"
          className="absolute -top-5 right-6 w-11 h-11 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-neutral-950 shadow-lg shadow-amber-500/40 active:scale-90 transition-transform"
          aria-label="Pesan Slot Sesi"
        >
          <Sparkles className="w-5 h-5 animate-pulse" />
        </Link>
      </div>
    </nav>
  );
}
