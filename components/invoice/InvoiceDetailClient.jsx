"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  Copy,
  Check,
  Calendar,
  Clock,
  MapPin,
  Building,
  User,
  ShieldCheck,
  Printer,
  UploadCloud,
  ChevronLeft,
  Sparkles,
  AlertCircle,
  MessageCircle,
} from "lucide-react";
import AnimatedButton from "@/components/ui/AnimatedButton";
import PaymentUploadModal from "@/components/payment/PaymentUploadModal";

function formatRupiah(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

const BANK_ACCOUNTS = [
  {
    bank: "Bank Nagari",
    number: "710002018899",
    name: "ILUXY CREATIVE STUDIO",
    branch: "KCU Padang",
  },
  {
    bank: "BCA",
    number: "812390123344",
    name: "ZACKRI KURNIA AMRI",
    branch: "KCU Padang Sudirman",
  },
];

export default function InvoiceDetailClient({ invoice }) {
  const router = useRouter();
  const [copiedBank, setCopiedBank] = useState(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  if (!invoice) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-neutral-400">Invoice tidak ditemukan atau telah dihapus.</p>
        <Link href="/dashboard" className="text-amber-400 font-bold hover:underline">
          Kembali ke Dashboard Klien
        </Link>
      </div>
    );
  }

  const booking = invoice.bookings;
  const pkg = booking?.packages;
  const customer = booking?.customers;
  const user = customer?.users;

  function handleCopyAccount(accountNumber) {
    navigator.clipboard.writeText(accountNumber);
    setCopiedBank(accountNumber);
    setTimeout(() => setCopiedBank(null), 2500);
  }

  // Status Badge styling
  const statusConfig = {
    UNPAID: {
      label: "Belum Dibayar (Menunggu DP)",
      color: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    },
    PENDING_VERIFICATION: {
      label: "Menunggu Verifikasi Admin",
      color: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    },
    PARTIALLY_PAID: {
      label: "DP Terverifikasi (Terkonfirmasi)",
      color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    },
    PAID: {
      label: "LUNAS 100%",
      color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    },
    CANCELLED: {
      label: "Dibatalkan",
      color: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    },
  };

  const currentStatus = statusConfig[invoice.status] || statusConfig.UNPAID;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Top Navigation & Print Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Kembali ke Dashboard Klien</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-white/10 text-xs font-bold text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Invoice</span>
          </button>

          <a
            href={`https://wa.me/62895336075846?text=Halo%20Admin%20Iluxy%20Creative,%20saya%20konfirmasi%20invoice%20${encodeURIComponent(invoice.invoice_number)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-500/30 text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Bantuan WhatsApp</span>
          </a>
        </div>
      </div>

      {/* INVOICE CARD (PRINTABLE CONTAINER) */}
      <div className="p-6 sm:p-10 rounded-3xl bg-neutral-900/80 border border-white/10 backdrop-blur-2xl shadow-2xl space-y-8 print:bg-white print:text-black print:border-none print:shadow-none">
        {/* 1. Header Invoice */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-white/10 pb-6 print:border-black/20">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-neutral-950 font-black text-sm">
                IX
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white print:text-black">
                  ILUXY CREATIVE
                </h1>
                <p className="text-xs text-neutral-400 print:text-neutral-600">
                  Studio Fotografi, Videografi & Private Gallery Padang
                </p>
              </div>
            </div>
            <p className="text-[11px] text-neutral-500 mt-2 print:text-neutral-600">
              Jl. Veteran No. 42B, Padang Barat, Kota Padang, Sumatera Barat
            </p>
          </div>

          <div className="sm:text-right space-y-1.5">
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${currentStatus.color}`}
            >
              {currentStatus.label}
            </span>
            <div className="text-lg font-black text-white print:text-black">
              {invoice.invoice_number}
            </div>
            <div className="text-xs text-neutral-400 print:text-neutral-600">
              Tanggal Terbit:{" "}
              {new Date(invoice.created_at).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
            {invoice.due_date && (
              <div className="text-xs text-amber-400 print:text-amber-800 font-semibold">
                Batas Waktu Bayar:{" "}
                {new Date(invoice.due_date).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                WIB
              </div>
            )}
          </div>
        </div>

        {/* 2. Customer & Booking Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 print:text-neutral-600 block">
              Ditujukan Kepada Klien
            </span>
            <div className="text-sm font-bold text-white print:text-black">
              {user?.full_name || "Pelanggan Terhormat"}
            </div>
            <div className="text-neutral-300 print:text-neutral-800">{user?.email}</div>
            <div className="text-neutral-300 print:text-neutral-800">{user?.phone_number}</div>
            <div className="text-neutral-400 print:text-neutral-600">{customer?.city || "Padang"}</div>
          </div>

          <div className="space-y-2 sm:text-right">
            <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 print:text-neutral-600 block">
              Rincian Sesi Pemotretan
            </span>
            <div className="text-sm font-bold text-amber-400 print:text-black">
              {pkg?.name} ({pkg?.package_categories?.name})
            </div>
            <div className="text-neutral-300 print:text-neutral-800">
              {booking?.session_date &&
                new Date(booking.session_date).toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
            </div>
            <div className="text-neutral-300 print:text-neutral-800">
              Pukul {booking?.start_time?.substring(0, 5)} - {booking?.end_time?.substring(0, 5)} WIB
            </div>
            <div className="text-neutral-400 print:text-neutral-600">{booking?.venue_address}</div>
          </div>
        </div>

        {/* 3. Financial Breakdown Table */}
        <div className="border border-white/10 rounded-2xl overflow-hidden print:border-black/20">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-950/80 print:bg-neutral-100 text-neutral-400 print:text-black font-bold uppercase tracking-wider border-b border-white/10 print:border-black/20">
              <tr>
                <th className="p-3.5">Deskripsi Layanan & Fasilitas</th>
                <th className="p-3.5 text-center">Durasi</th>
                <th className="p-3.5 text-right">Jumlah Investasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 print:divide-black/10">
              <tr>
                <td className="p-3.5 text-white print:text-black font-semibold">
                  <div>{pkg?.name}</div>
                  <div className="text-[11px] text-neutral-400 font-normal">
                    Termasuk {pkg?.max_photos_retouch || 20} foto retouch album & private gallery digital.
                  </div>
                </td>
                <td className="p-3.5 text-center text-neutral-300 print:text-black">
                  {pkg?.duration_hours || 2} Jam
                </td>
                <td className="p-3.5 text-right font-bold text-white print:text-black">
                  {formatRupiah(invoice.total_amount)}
                </td>
              </tr>
            </tbody>
            <tfoot className="bg-neutral-950/50 print:bg-neutral-50 text-xs border-t border-white/10 print:border-black/20">
              <tr>
                <td colSpan={2} className="p-3 text-right font-semibold text-neutral-400 print:text-black">
                  Uang Muka (DP) Wajib Dibayar:
                </td>
                <td className="p-3 text-right font-black text-amber-400">
                  {formatRupiah(invoice.dp_amount)}
                </td>
              </tr>
              <tr>
                <td colSpan={2} className="p-3 text-right font-semibold text-neutral-400 print:text-black">
                  Sisa Tagihan Pelunasan:
                </td>
                <td className="p-3 text-right font-bold text-white print:text-black">
                  {formatRupiah(invoice.remaining_amount)}
                </td>
              </tr>
              <tr className="border-t border-white/10 font-bold text-sm">
                <td colSpan={2} className="p-3.5 text-right text-white print:text-black">
                  TOTAL BIAYA PAKET:
                </td>
                <td className="p-3.5 text-right text-white print:text-black">
                  {formatRupiah(invoice.total_amount)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* 4. Rekening Pembayaran Studio & Copy Button */}
        <div className="p-6 rounded-2xl bg-neutral-950/70 border border-white/10 space-y-4 print:border-black/20">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5" />
              <span>Rekening Resmi Studio Iluxy Creative Padang</span>
            </h4>
            <span className="text-[10px] text-neutral-500 print:hidden">Klik untuk menyalin nomor rekening</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {BANK_ACCOUNTS.map((b) => {
              const isCopied = copiedBank === b.number;

              return (
                <div
                  key={b.number}
                  className="p-3.5 rounded-xl bg-neutral-900 border border-white/5 flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-white print:text-black">{b.bank}</div>
                    <div className="text-sm font-mono font-black text-amber-400">{b.number}</div>
                    <div className="text-[10px] text-neutral-400">a.n {b.name}</div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopyAccount(b.number)}
                    className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer print:hidden"
                    title="Salin Nomor Rekening"
                  >
                    {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              );
            })}
          </div>

          <p className="text-[11px] text-neutral-400 leading-relaxed italic">
            *Harap mencantumkan nomor invoice <strong>{invoice.invoice_number}</strong> pada berita transfer bank, lalu unggah bukti transfer melalui tombol di bawah ini.
          </p>
        </div>

        {/* 5. Action Upload Bukti Bayar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10 pt-6 print:hidden">
          <div className="text-xs text-neutral-400">
            Status Pesanan:{" "}
            <span className="font-bold text-white">{booking?.status || "PENDING_DP"}</span>
          </div>

          <AnimatedButton
            variant="primary"
            onClick={() => setIsUploadOpen(true)}
            className="w-full sm:w-auto py-3.5 px-8 text-xs uppercase font-extrabold tracking-wider shadow-lg shadow-amber-500/30"
          >
            <UploadCloud className="w-4 h-4 mr-1.5" />
            <span>Unggah Bukti Pembayaran</span>
          </AnimatedButton>
        </div>
      </div>

      {/* MODAL UPLOAD BUKTI BAYAR */}
      <PaymentUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        invoiceId={invoice.id}
        dpAmount={invoice.dp_amount}
        remainingAmount={invoice.remaining_amount}
        invoiceStatus={invoice.status}
        onSuccess={() => {
          router.refresh();
        }}
      />
    </div>
  );
}
