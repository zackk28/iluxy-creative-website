import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { getInvoiceById } from "@/lib/actions/booking";
import InvoiceDetailClient from "@/components/invoice/InvoiceDetailClient";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const invoice = await getInvoiceById(id);
  return {
    title: invoice
      ? `Invoice ${invoice.invoice_number} | Iluxy Creative Padang`
      : "Invoice Tagihan | Iluxy Creative",
    description: "Lembar tagihan resmi pemesanan jasa fotografi Iluxy Creative Studio Padang.",
  };
}

function InvoiceSkeleton() {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-pulse">
      <div className="h-6 w-48 bg-neutral-900 rounded-xl" />
      <div className="h-[520px] bg-neutral-900/60 rounded-3xl border border-white/5" />
    </div>
  );
}

async function InvoiceContent({ params }) {
  await connection();
  const { id } = await params;
  const invoice = await getInvoiceById(id);

  if (!invoice) {
    notFound();
  }

  return <InvoiceDetailClient invoice={invoice} />;
}

export default function InvoicePage({ params }) {
  return (
    <main className="min-h-screen bg-[#0A0A0E] text-neutral-100 pt-28 pb-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-amber-500/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="relative z-10">
        <Suspense fallback={<InvoiceSkeleton />}>
          <InvoiceContent params={params} />
        </Suspense>
      </div>
    </main>
  );
}
