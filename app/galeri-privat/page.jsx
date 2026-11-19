import React, { Suspense } from "react";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import PrivateGalleryEntryClient from "@/components/gallery/PrivateGalleryEntryClient";

export const metadata = {
  title: "Akses Private Gallery & Kurasi Album | Iluxy Creative Padang",
  description:
    "Buka gerbang galeri foto privat ber-PIN untuk kurasi foto cetak album dan unduh arsip master resolusi tinggi Iluxy Creative Studio Padang.",
};

async function PrivateGalleryEntryServer() {
  await connection();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userGalleries = [];
  if (user) {
    const { data, error } = await supabase
      .from("galleries")
      .select(`
        id,
        title,
        access_slug,
        status,
        bookings (
          booking_code,
          packages (
            name
          ),
          customers (
            user_id
          )
        )
      `);

    if (!error && data) {
      // Filter galleries milik user yang sedang aktif
      userGalleries = data.filter((g) => g.bookings?.customers?.user_id === user.id);
    }
  }

  return (
    <PrivateGalleryEntryClient
      userGalleries={userGalleries}
      isLoggedIn={Boolean(user)}
    />
  );
}

export default function PrivateGalleryPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0E] text-neutral-100 pt-28 pb-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[650px] h-[350px] bg-amber-500/5 blur-[140px] pointer-events-none rounded-full" />

      <div className="relative z-10">
        <Suspense fallback={<div className="text-center py-24 text-xs text-neutral-400">Memuat akses galeri...</div>}>
          <PrivateGalleryEntryServer />
        </Suspense>
      </div>
    </main>
  );
}
