import React, { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAdminPaymentsList } from "@/lib/actions/crew";
import AdminVerificationClient from "@/components/admin/AdminVerificationClient";

export const metadata = {
  title: "Verifikasi Pembayaran & Penugasan Kru | Admin Iluxy Creative",
  description: "Panel verifikasi transfer struk DP/pelunasan dan penugasan fotografer Iluxy Creative.",
};

function VerificationSkeleton() {
  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-pulse">
      <div className="h-10 w-64 bg-neutral-900 rounded-xl" />
      <div className="h-96 bg-neutral-900/60 rounded-3xl border border-white/5" />
    </div>
  );
}

async function VerificationContent() {
  await connection();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.user_metadata?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const payments = await getAdminPaymentsList();

  return <AdminVerificationClient initialPayments={payments} />;
}

export default function AdminVerificationPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0E] text-neutral-100 pt-28 pb-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Ambient Glow */}
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[300px] bg-amber-500/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-6xl mx-auto relative z-10">
        <Suspense fallback={<VerificationSkeleton />}>
          <VerificationContent />
        </Suspense>
      </div>
    </main>
  );
}
