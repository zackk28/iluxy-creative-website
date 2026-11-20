"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Camera, 
  CalendarDays, 
  Images, 
  User, 
  Sparkles, 
  ShieldCheck,
  LayoutDashboard,
  CreditCard,
  UploadCloud,
  Layers,
  Users,
  ExternalLink
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function MobileBottomBar() {
  const pathname = usePathname();
  const [role, setRole] = useState("CLIENT");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.user_metadata?.role) {
        setRole(user.user_metadata.role);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setRole(session?.user?.user_metadata?.role || "CLIENT");
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const adminNavItems = [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Verifikasi", href: "/admin/verifikasi", icon: CreditCard },
    { label: "Galeri", href: "/admin/galeri", icon: UploadCloud },
    { label: "Paket", href: "/admin/paket", icon: Layers },
    { label: "Klien", href: "/admin/pelanggan", icon: Users },
  ];

  const clientNavItems = [
    { label: "Katalog", href: "/katalog", icon: Camera },
    { label: "Jadwal", href: "/booking", icon: CalendarDays },
    { label: "Galeri", href: "/galeri-privat", icon: Images },
    { label: "Akun", href: "/dashboard", icon: User },
  ];

  const navItems = role === "ADMIN" ? adminNavItems : clientNavItems;

  return (
    <nav className="md:hidden fixed bottom-4 inset-x-4 z-50">
      <div className="bg-neutral-950/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-1.5 shadow-2xl shadow-black/90 flex items-center justify-around relative">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center justify-center py-2 px-2.5 rounded-2xl flex-1 transition-all"
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
                  className={`text-[9px] font-medium tracking-tight line-clamp-1 ${
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
          href={role === "ADMIN" ? "/katalog" : "/booking"}
          className="absolute -top-5 right-6 w-11 h-11 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-neutral-950 shadow-lg shadow-amber-500/40 active:scale-90 transition-transform"
          aria-label={role === "ADMIN" ? "Lihat Web Publik" : "Pesan Slot Sesi"}
          title={role === "ADMIN" ? "Lihat Web Publik" : "Pesan Slot Sesi"}
        >
          {role === "ADMIN" ? (
            <ExternalLink className="w-5 h-5" />
          ) : (
            <Sparkles className="w-5 h-5 animate-pulse" />
          )}
        </Link>
      </div>
    </nav>
  );
}
