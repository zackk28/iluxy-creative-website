import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getGalleryBySlug,
  getGalleryMediaAssets,
  getProofingSelections,
} from "@/lib/actions/gallery";
import GalleryAccessClient from "@/components/gallery/GalleryAccessClient";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const gallery = await getGalleryBySlug(slug);

  if (!gallery) {
    return {
      title: "Galeri Tidak Ditemukan — Iluxy Creative",
    };
  }

  return {
    title: `${gallery.title} | Private Gallery Iluxy Creative Padang`,
    description: `Akses galeri foto privat ber-PIN untuk sesi pemotretan ${gallery.title} di Iluxy Creative Studio Padang.`,
  };
}

function GallerySkeleton() {
  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-pulse p-4">
      <div className="h-44 bg-neutral-900/60 rounded-3xl border border-white/5" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="h-64 bg-neutral-900/40 rounded-2xl" />
        <div className="h-80 bg-neutral-900/40 rounded-2xl" />
        <div className="h-72 bg-neutral-900/40 rounded-2xl" />
        <div className="h-64 bg-neutral-900/40 rounded-2xl" />
      </div>
    </div>
  );
}

async function GalleryContent({ params }) {
  await connection();
  const { slug } = await params;
  const gallery = await getGalleryBySlug(slug);

  if (!gallery) {
    notFound();
  }

  const [mediaAssets, selections] = await Promise.all([
    getGalleryMediaAssets(gallery.id),
    getProofingSelections(gallery.id),
  ]);

  // Cek apakah user adalah admin (admin tidak perlu masukkan PIN)
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdmin = user?.user_metadata?.role === "ADMIN";

  return (
    <GalleryAccessClient
      gallery={gallery}
      mediaAssets={mediaAssets}
      initialSelections={selections}
      isPreUnlocked={isAdmin}
    />
  );
}

export default function GalleryPage({ params }) {
  return (
    <main className="min-h-screen bg-[#0A0A0E] text-neutral-100 pt-24 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/4 right-1/4 w-[600px] h-[350px] bg-amber-500/5 blur-[140px] pointer-events-none rounded-full" />

      <Suspense fallback={<GallerySkeleton />}>
        <GalleryContent params={params} />
      </Suspense>
    </main>
  );
}
