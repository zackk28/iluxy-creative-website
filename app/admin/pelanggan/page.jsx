import React, { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAdminCustomersDirectory } from "@/lib/actions/admin";
import AdminCustomersClient from "@/components/admin/AdminCustomersClient";

export const metadata = {
  title: "Direktori Pelanggan — Admin Studio Iluxy Creative",
  description: "Daftar direktori pelanggan studio, riwayat sesi pemotretan, dan akumulasi omzet per klien.",
};

async function AdminCustomersContent() {
  await connection();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/admin/pelanggan");
  }

  const role = user.user_metadata?.role;
  if (role !== "ADMIN") {
    redirect("/dashboard");
  }

  const customers = await getAdminCustomersDirectory();

  return <AdminCustomersClient initialCustomers={customers || []} />;
}

export default function AdminCustomersPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-6xl mx-auto px-4 py-16 text-center text-xs text-neutral-400">
          Memuat direktori data pelanggan...
        </div>
      }
    >
      <AdminCustomersContent />
    </Suspense>
  );
}
