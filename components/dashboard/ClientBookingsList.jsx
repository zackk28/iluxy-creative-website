"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  MapPin,
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ChevronRight,
  Loader2,
  Trash2,
} from "lucide-react";
import AnimatedButton from "@/components/ui/AnimatedButton";
import { cancelBooking } from "@/lib/actions/booking";

function formatRupiah(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

export default function ClientBookingsList({ bookings = [] }) {
  const router = useRouter();
  const [cancellingBookingId, setCancellingBookingId] = useState(null);
  const [cancelModalBooking, setCancelModalBooking] = useState(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  async function handleConfirmCancel() {
    if (!cancelModalBooking) return;
    setActionError("");
    setActionSuccess("");
    setCancellingBookingId(cancelModalBooking.id);

    try {
      const result = await cancelBooking(cancelModalBooking.id, cancellationReason);

      if (result.error) {
        setActionError(result.error);
        setCancellingBookingId(null);
        return;
      }

      setActionSuccess(result.message);
      setCancellingBookingId(null);
      setTimeout(() => {
        setCancelModalBooking(null);
        setCancellationReason("");
        setActionSuccess("");
        router.refresh();
      }, 1500);
    } catch (err) {
      console.error("Gagal membatalkan pesanan:", err);
      setActionError("Terjadi kesalahan sistem saat memproses pembatalan.");
      setCancellingBookingId(null);
    }
  }

  if (bookings.length === 0) {
    return (
      <div className="p-8 sm:p-12 rounded-3xl bg-neutral-900/40 border border-white/5 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
          <Calendar className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">Belum Ada Riwayat Pemesanan Sesi</h3>
          <p className="text-xs text-neutral-400 max-w-md mx-auto mt-1 leading-relaxed">
            Anda belum pernah memesan jadwal sesi foto. Pilih paket impian dan amankan slot waktu terbaik Anda sekarang.
          </p>
        </div>
        <Link href="/booking" className="inline-block pt-2">
          <AnimatedButton variant="primary" className="py-2.5 px-6 text-xs uppercase font-extrabold tracking-wider">
            <span>Pesan Sesi Foto Pertama</span>
          </AnimatedButton>
        </Link>
      </div>
    );
  }

  const statusBadges = {
    PENDING_DP: { label: "Menunggu DP", color: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
    CONFIRMED: { label: "Jadwal Terkonfirmasi", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
    COMPLETED: { label: "Selesai", color: "bg-neutral-800 text-neutral-300 border-white/10" },
    CANCELLED: { label: "Dibatalkan", color: "bg-rose-500/15 text-rose-400 border-rose-500/30" },
  };

  return (
    <div className="space-y-4">
      {bookings.map((item) => {
        const sessionDateObj = new Date(item.session_date);
        sessionDateObj.setHours(0, 0, 0, 0);

        const diffTime = sessionDateObj.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const canCancel = diffDays >= 3 && item.status !== "CANCELLED" && item.status !== "COMPLETED";

        const badge = statusBadges[item.status] || statusBadges.PENDING_DP;
        const invoiceData = Array.isArray(item.invoices) ? item.invoices[0] : item.invoices;

        return (
          <div
            key={item.id}
            className="p-5 sm:p-6 rounded-3xl bg-neutral-900/60 border border-white/5 hover:border-white/10 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            {/* Metadata Pesanan */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-bold text-amber-400">{item.booking_code}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.color}`}>
                  {badge.label}
                </span>
                {item.location_type === "STUDIO" ? (
                  <span className="px-2 py-0.5 rounded-full bg-neutral-800 text-[10px] font-semibold text-neutral-300">
                    Studio Indoor
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-neutral-800 text-[10px] font-semibold text-neutral-300">
                    Outdoor
                  </span>
                )}
              </div>

              <h4 className="text-base font-bold text-white">{item.packages?.name || "Paket Sesi Foto"}</h4>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-neutral-400">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {sessionDateObj.toLocaleDateString("id-ID", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </span>

                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {item.start_time?.substring(0, 5)} - {item.end_time?.substring(0, 5)} WIB
                  </span>
                </span>

                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span className="max-w-xs truncate">{item.venue_address}</span>
                </span>
              </div>
            </div>

            {/* Aksi Invoice & Pembatalan H-3 */}
            <div className="flex flex-wrap items-center gap-2 self-start md:self-auto border-t md:border-t-0 border-white/5 pt-3 md:pt-0">
              {invoiceData && (
                <Link
                  href={`/invoice/${invoiceData.id}`}
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-amber-300 hover:text-white flex items-center gap-1.5 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Lembar Invoice</span>
                </Link>
              )}

              {canCancel ? (
                <button
                  type="button"
                  onClick={() => setCancelModalBooking(item)}
                  className="px-3 py-2 rounded-xl bg-rose-950/30 hover:bg-rose-900/40 border border-rose-500/20 text-xs font-semibold text-rose-300 hover:text-rose-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Batalkan (H-{diffDays})</span>
                </button>
              ) : item.status !== "CANCELLED" && item.status !== "COMPLETED" ? (
                <span
                  title="Jadwal tersisa kurang dari 3 hari. Pembatalan otomatis terkunci sesuai kebijakan studio."
                  className="px-3 py-1.5 rounded-xl bg-neutral-950 border border-white/5 text-[11px] text-neutral-500 flex items-center gap-1 cursor-help"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-neutral-600" />
                  <span>Terkunci (H-{diffDays})</span>
                </span>
              ) : null}
            </div>
          </div>
        );
      })}

      {/* MODAL KONFIRMASI PEMBATALAN H-3 */}
      {cancelModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl bg-neutral-900 border border-white/10 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Batalkan Pesanan Sesi?</h3>
                <p className="text-xs text-neutral-400">Kode: {cancelModalBooking.booking_code}</p>
              </div>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              Jadwal sesi Anda masih memenuhi ketentuan minimal <strong>H-3</strong> dari hari pelaksanaan. Setelah
              dibatalkan, slot jam ini akan dibuka kembali untuk pelanggan lain.
            </p>

            {actionError && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs">
                {actionError}
              </div>
            )}

            {actionSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs">
                {actionSuccess}
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block mb-1.5">
                Alasan Pembatalan (Opsional)
              </label>
              <textarea
                rows={2}
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="Contoh: Perubahan agenda acara keluarga..."
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalBooking(null)}
                disabled={Boolean(cancellingBookingId)}
                className="px-4 py-2 rounded-xl bg-neutral-800 text-xs font-bold text-neutral-300 hover:text-white transition-colors cursor-pointer"
              >
                Kembali
              </button>

              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={Boolean(cancellingBookingId)}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {cancellingBookingId ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>{cancellingBookingId ? "Membatalkan..." : "Ya, Batalkan Jadwal"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
