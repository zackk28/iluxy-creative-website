import React, { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import AdminPackagesClient from "@/components/admin/AdminPackagesClient";

export const metadata = {
  title: "Kelola Paket Layanan — Admin Studio Iluxy Creative",
  description: "Manajemen data paket fotografi, tarif harga, ketentuan DP, dan fasilitas album.",
};

async function AdminPackagesContent() {
  await connection();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/admin/paket");
  }

  const role = user.user_metadata?.role;
  if (role !== "ADMIN") {
    redirect("/dashboard");
  }

  const [{ data: categories }, { data: packages }] = await Promise.all([
    supabase
      .from("package_categories")
      .select("*")
      .order("display_order", { ascending: true }),
    supabase
      .from("packages")
      .select("*, package_categories(id, name, slug)")
      .order("created_at", { ascending: false }),
  ]);

  return (
    <AdminPackagesClient
      initialPackages={packages || []}
      categories={categories || []}
    />
  );
}

export default function AdminPackagesPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-6xl mx-auto px-4 py-16 text-center text-xs text-neutral-400">
          Memuat data manajemen paket studio...
        </div>
      }
    >
      <AdminPackagesContent />
    </Suspense>
  );
}
