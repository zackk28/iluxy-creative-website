"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Camera, CalendarDays, Images, User, Sparkles } from "lucide-react";

const navItems = [
  { label: "Katalog", href: "/katalog", icon: Camera },
  { label: "Jadwal", href: "/booking", icon: CalendarDays },
  { label: "Galeri Privat", href: "/galeri-privat", icon: Images },
  { label: "Akun Saya", href: "/dashboard", icon: User },
];

export default function DesktopNavbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="hidden md:block fixed top-6 inset-x-0 z-50 pointer-events-none">
      <div className="flex justify-center">
        <motion.nav
          layout
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
          className={`pointer-events-auto flex items-center gap-1.5 px-3 py-2 rounded-full border border-white/10 shadow-2xl backdrop-blur-xl transition-all duration-300 ${
            isScrolled 
              ? "bg-neutral-950/85 border-amber-500/20 shadow-amber-500/5 py-1.5" 
              : "bg-neutral-900/75"
          }`}
        >
          {/* Logo Studio */}
          <Link 
            href="/" 
            className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-white/5 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-amber-200 flex items-center justify-center text-neutral-950 font-black text-sm shadow-md shadow-amber-500/30">
              IX
            </div>
            {!isScrolled && (
              <span className="font-bold tracking-wider text-sm bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent">
                ILUXY
              </span>
            )}
          </Link>

          <div className="h-5 w-px bg-white/10 mx-1" />

          {/* Nav Links */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative px-4 py-2 text-xs uppercase tracking-wider font-semibold rounded-full transition-colors text-neutral-300 hover:text-white"
                >
                  {isActive && (
                    <motion.div
                      layoutId="desktop-active-pill"
                      className="absolute inset-0 bg-white/10 rounded-full border border-white/20 backdrop-blur-md"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5" />
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Quick Action Button */}
          <div className="pl-1">
            <Link
              href="/booking"
              className="group relative inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-neutral-950 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 transition-transform group-hover:rotate-12" />
              <span>Book Slot</span>
            </Link>
          </div>
        </motion.nav>
      </div>
    </header>
  );
}
