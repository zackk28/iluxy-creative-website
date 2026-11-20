"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useMotionValue, useMotionTemplate } from "framer-motion";
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

const clientNavItems = [
  { label: "Katalog", href: "/katalog", icon: Camera },
  { label: "Jadwal", href: "/booking", icon: CalendarDays },
  { label: "Galeri Privat", href: "/galeri-privat", icon: Images },
  { label: "Akun Saya", href: "/dashboard", icon: User },
];

const adminNavItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Verifikasi & Kru", href: "/admin/verifikasi", icon: CreditCard },
  { label: "Galeri & Watermark", href: "/admin/galeri", icon: UploadCloud },
  { label: "Paket & Harga", href: "/admin/paket", icon: Layers },
  { label: "Pelanggan", href: "/admin/pelanggan", icon: Users },
];

export default function DesktopNavbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  // Ambil data sesi profil pengguna (avatar dan nama)
  useEffect(() => {
    const supabase = createClient();

    async function loadUserProfile() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setUserProfile(null);
          return;
        }

        // Ambil avatar_url dari tabel customers
        const { data: customer } = await supabase
          .from("customers")
          .select("avatar_url")
          .eq("user_id", user.id)
          .maybeSingle();

        const avatarUrl = customer?.avatar_url || user.user_metadata?.avatar_url || null;
        const fullName = user.user_metadata?.full_name || "Pelanggan";
        const initial = fullName.charAt(0).toUpperCase();
        const role = user.user_metadata?.role || "CLIENT";

        setUserProfile({
          id: user.id,
          fullName,
          avatarUrl,
          initial,
          role,
        });
      } catch (err) {
        console.warn("Gagal memuat avatar navbar:", err);
      }
    }

    loadUserProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadUserProfile();
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Dynamic mouse coordinates for ambient spotlight effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const spotlightBg = useMotionTemplate`radial-gradient(160px circle at ${mouseX}px ${mouseY}px, rgba(245, 158, 11, 0.15), transparent 80%)`;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isAdmin = userProfile?.role === "ADMIN";
  const currentNavItems = isAdmin ? adminNavItems : clientNavItems;

  const profileHref = userProfile
    ? isAdmin
      ? "/admin/dashboard"
      : "/dashboard"
    : "/";

  return (
    <header className="hidden md:block fixed top-6 inset-x-0 z-50 pointer-events-none">
      <div className="flex justify-center">
        <motion.nav
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          layout
          onMouseMove={handleMouseMove}
          className={`group/nav pointer-events-auto relative flex items-center gap-2 px-3 py-2 rounded-full border shadow-2xl backdrop-blur-2xl transition-all duration-300 ${
            isScrolled
              ? "bg-neutral-950/90 border-amber-500/25 shadow-[0_15px_35px_rgba(0,0,0,0.8),0_0_20px_rgba(245,158,11,0.12)]"
              : "bg-neutral-900/85 border-white/10 hover:border-amber-500/20 shadow-[0_15px_35px_rgba(0,0,0,0.7)]"
          }`}
        >
          {/* 1. Dynamic Cursor Spotlight Glow */}
          <div className="pointer-events-none absolute inset-0 rounded-full overflow-hidden">
            <motion.div
              className="absolute -inset-px rounded-full opacity-0 group-hover/nav:opacity-100 transition-opacity duration-300"
              style={{ background: spotlightBg }}
            />
          </div>

          {/* 2. Logo / Foto Profil Pengguna with Interactive Hover */}
          <Link
            href={profileHref}
            title={userProfile ? `Profil: ${userProfile.fullName} (${userProfile.role})` : "Studio Iluxy Creative"}
            className="group/logo relative z-10 flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-white/5 transition-colors"
          >
            <motion.div
              whileHover={{ scale: 1.1, rotate: userProfile?.avatarUrl ? 0 : 6 }}
              whileTap={{ scale: 0.94 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-200 flex items-center justify-center text-neutral-950 font-black text-xs shadow-md shadow-amber-500/30 group-hover/logo:shadow-amber-500/60 transition-shadow overflow-hidden border border-amber-300/40"
            >
              {userProfile?.avatarUrl ? (
                <img
                  src={userProfile.avatarUrl}
                  alt={userProfile.fullName || "Foto Profil"}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <span className="relative z-10">{userProfile?.initial || "IX"}</span>
              )}
              {/* Subtle pulsing aura on logo */}
              <span className="absolute inset-0 rounded-full bg-amber-400/30 blur-sm scale-110 opacity-0 group-hover/logo:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </motion.div>

            {/* Label ILUXY */}
            <span className="font-bold tracking-wider text-sm bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent group-hover/logo:from-amber-200 group-hover/logo:via-white group-hover/logo:to-amber-300 transition-all duration-300">
              ILUXY
            </span>

            {/* Badge Admin */}
            {isAdmin && (
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-neutral-950 shadow-md">
                ADMIN
              </span>
            )}
          </Link>

          {/* Divider */}
          <div className="relative z-10 h-5 w-px bg-white/10 mx-0.5" />

          {/* 3. Nav Links with Magnetic Sliding Hover Pill */}
          <div
            className="relative z-10 flex items-center gap-0.5"
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {currentNavItems.map((item, idx) => {
              const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && item.href !== "/dashboard" && pathname.startsWith(item.href));
              const isHovered = hoveredIndex === idx;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  className={`group/item relative px-3.5 py-2 text-xs uppercase tracking-wider font-semibold rounded-full transition-colors duration-200 ${
                    isActive
                      ? "text-amber-400"
                      : isHovered
                      ? "text-white"
                      : "text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  {/* Sliding Hover Indicator Pill */}
                  {isHovered && (
                    <motion.div
                      layoutId="navbar-hover-pill"
                      className="absolute inset-0 rounded-full bg-white/10 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.15)] backdrop-blur-sm"
                      transition={{
                        type: "spring",
                        stiffness: 420,
                        damping: 30,
                      }}
                    />
                  )}

                  {/* Active Page Pill */}
                  {isActive && !isHovered && (
                    <motion.div
                      layoutId="navbar-active-pill"
                      className="absolute inset-0 rounded-full bg-amber-500/10 border border-amber-500/25 backdrop-blur-sm"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}

                  {/* Item Content with micro-animated Icon */}
                  <span className="relative z-10 flex items-center gap-1.5">
                    <motion.span
                      animate={{
                        y: isHovered ? -2 : 0,
                        scale: isHovered ? 1.15 : 1,
                        rotate: isHovered ? 6 : 0,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 20,
                      }}
                      className="inline-flex items-center"
                    >
                      <Icon
                        className={`w-3.5 h-3.5 transition-colors duration-200 ${
                          isActive
                            ? "text-amber-400"
                            : isHovered
                            ? "text-amber-300"
                            : "text-neutral-400 group-hover/item:text-neutral-200"
                        }`}
                      />
                    </motion.span>
                    <span className="transition-transform duration-200 group-hover/item:translate-x-0.5">
                      {item.label}
                    </span>
                  </span>

                  {/* Glowing Active Dot Indicator */}
                  {isActive && (
                    <motion.span
                      layoutId="navbar-active-dot"
                      className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]"
                      transition={{
                        type: "spring",
                        stiffness: 350,
                        damping: 25,
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* 4. Quick Action Button (Khusus Admin: "Web Publik" | Khusus Klien: "Book Slot") */}
          <div className="relative z-10 pl-1">
            <motion.div
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 450, damping: 20 }}
            >
              {isAdmin ? (
                <Link
                  href="/katalog"
                  title="Lihat Tampilan Website Publik Klien"
                  className="group/cta relative inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-amber-300 hover:text-white bg-neutral-800/80 hover:bg-neutral-800 border border-amber-500/30 hover:border-amber-400/60 rounded-full transition-all duration-300 shadow-md shadow-amber-500/5"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-amber-400 group-hover/cta:scale-110 transition-transform" />
                  <span>Web Publik</span>
                </Link>
              ) : (
                <Link
                  href="/booking"
                  className="group/cta relative inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-neutral-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.35)] hover:shadow-[0_0_25px_rgba(245,158,11,0.6)] overflow-hidden transition-all duration-300"
                >
                  {/* Continuous Shimmer Light Beam */}
                  <motion.div
                    className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 pointer-events-none"
                    initial={{ x: "-180%" }}
                    animate={{ x: "280%" }}
                    transition={{
                      type: "tween",
                      repeat: Infinity,
                      duration: 2.8,
                      ease: "easeInOut",
                      repeatDelay: 1.2,
                    }}
                  />

                  {/* Sparkling Icon & Label */}
                  <span className="relative z-10 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 transition-transform duration-300 group-hover/cta:rotate-45 group-hover/cta:scale-125" />
                    <span>Book Slot</span>
                  </span>
                </Link>
              )}
            </motion.div>
          </div>
        </motion.nav>
      </div>
    </header>
  );
}

