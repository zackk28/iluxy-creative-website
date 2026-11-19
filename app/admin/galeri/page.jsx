import React, { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAdminGalleriesOverview } from "@/lib/actions/gallery";
import AdminGalleryManagerClient from "@/components/admin/AdminGalleryManagerClient";

export const metadata = {
  title: "Kelola Private Gallery & Watermark — Admin Iluxy Creative",
  description: "Manajemen gerbang PIN galeri foto privat klien, kurasi cetak album, dan auto-watermark engine.",
};

async function AdminGalleryContent() {
  await connection();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/admin/galeri");
  }

  const role = user.user_metadata?.role;
  if (role !== "ADMIN") {
    redirect("/dashboard");
  }

  const { galleries, unassignedBookings } = await getAdminGalleriesOverview();

  return (
    <AdminGalleryManagerClient
      initialGalleries={galleries || []}
      unassignedBookings={unassignedBookings || []}
    />
  );
}

export default function AdminGalleryPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-6xl mx-auto px-4 py-16 text-center text-xs text-neutral-400">
          Memuat modul manajemen galeri & watermark...
        </div>
      }
    >
      <AdminGalleryContent />
    </Suspense>
  );
}
