import React, { Suspense } from "react";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getActivePackagesForBooking } from "@/lib/actions/booking";
import BookingWizardClient from "@/components/booking/BookingWizardClient";
import { Calendar, Sparkles } from "lucide-react";

export const metadata = {
  title: "Reservasi Jadwal Pemotretan | Iluxy Creative Padang",
  description:
    "Pilih paket, tentukan tanggal dan jam sesi pemotretan Anda dengan sistem reservasi anti double-booking Iluxy Creative Studio Padang.",
};

function BookingLoadingSkeleton() {
  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-pulse">
      <div className="h-20 bg-neutral-900/60 rounded-3xl border border-white/5" />
      <div className="h-96 bg-neutral-900/40 rounded-3xl border border-white/5" />
    </div>
  );
}

async function BookingWizardServer() {
  await connection();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const packages = await getActivePackagesForBooking();

  return <BookingWizardClient packages={packages} currentUser={user} />;
}

export default function BookingPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0E] text-neutral-100 pt-28 pb-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-amber-500/5 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-5xl mx-auto relative z-10 space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Booking Wizard Sesi Foto</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
            Reservasi Jadwal{" "}
            <span className="bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 bg-clip-text text-transparent">
              Pemotretan
            </span>
          </h1>

          <p className="text-sm text-neutral-400 max-w-xl mx-auto leading-relaxed">
            Kunci tanggal dan jam sesi terbaik Anda. Sistem anti double-booking kami memastikan slot pemotretan Anda
            eksklusif dan terjadwal sempurna.
          </p>
        </div>

        {/* Wizard Client inside Suspense boundary */}
        <Suspense fallback={<BookingLoadingSkeleton />}>
          <BookingWizardServer />
        </Suspense>
      </div>
    </main>
  );
}
