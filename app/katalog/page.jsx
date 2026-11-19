import React, { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import KatalogView from "@/components/katalog/KatalogView";
import { PackageCardSkeleton } from "@/components/ui/SkeletonShimmer";

export const metadata = {
  title: "Katalog Paket Layanan — Iluxy Creative Padang",
  description:
    "Daftar paket fotografi & videografi profesional (Wedding, Prewedding, Wisuda, Studio Portrait) di Iluxy Creative Padang dengan fasilitas lengkap dan harga transparan.",
};

async function KatalogContent() {
  const supabase = await createClient();

  const [{ data: categories }, { data: packages }] = await Promise.all([
    supabase
      .from("package_categories")
      .select("*")
      .order("display_order", { ascending: true }),
    supabase
      .from("packages")
      .select("*, package_categories(id, name, slug)")
      .eq("is_active", true)
      .order("price", { ascending: true }),
  ]);

  return (
    <KatalogView
      initialPackages={packages || []}
      initialCategories={categories || []}
    />
  );
}

export default function KatalogPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <div className="h-8 w-48 bg-neutral-800/60 rounded-xl mb-8 animate-pulse mx-auto" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <PackageCardSkeleton />
            <PackageCardSkeleton />
            <PackageCardSkeleton />
          </div>
        </div>
      }
    >
      <KatalogContent />
    </Suspense>
  );
}
