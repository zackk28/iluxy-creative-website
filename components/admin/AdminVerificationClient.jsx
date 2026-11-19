"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  UserCheck,
  Calendar,
  CreditCard,
  Building,
  User,
  ShieldCheck,
  AlertCircle,
  FileText,
  Loader2,
  ChevronLeft,
  Search,
  Plus,
  Trash2,
} from "lucide-react";
import AnimatedButton from "@/components/ui/AnimatedButton";
import { verifyPaymentStatus } from "@/lib/actions/payments";
import { assignCrew, removeCrewAssignment } from "@/lib/actions/crew";

function formatRupiah(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

export default function AdminVerificationClient({ initialPayments = [] }) {
  const router = useRouter();
  const [filter, setFilter] = useState("PENDING_VERIFICATION");
  const [searchQuery, setSearchQuery] = useState("");
  const [previewImage, setPreviewImage] = useState(null);

  // Modal Penugasan Kru
  const [crewModalBooking, setCrewModalBooking] = useState(null);
  const [crewName, setCrewName] = useState("");
  const [roleTitle, setRoleTitle] = useState("Lead Photographer");
  const [contactNumber, setContactNumber] = useState("");

  const [loadingActionId, setLoadingActionId] = useState(null);
  const [actionMessage, setActionMessage] = useState("");

  const filteredPayments = initialPayments.filter((p) => {
    const matchesFilter = filter === "ALL" ? true : p.payment_status === filter;
    const inv = p.invoices;
    const booking = inv?.bookings;
    const clientName = booking?.customers?.users?.full_name || "";
    const invNumber = inv?.invoice_number || "";
    const bCode = booking?.booking_code || "";

    const matchesSearch =
      invNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sender_account_name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  async function handleVerify(paymentId) {
    setLoadingActionId(paymentId);
    setActionMessage("");

    try {
      const res = await verifyPaymentStatus(paymentId, "VERIFY");
      if (res.error) {
        alert(res.error);
      } else {
        setActionMessage(res.message);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingActionId(null);
    }
  }

  async function handleReject(paymentId) {
    const reason = prompt("Masukkan alasan penolakan bukti pembayaran:", "Struk tidak terbaca atau mutasi tidak cocok.");
    if (!reason) return;

    setLoadingActionId(paymentId);
    try {
      const res = await verifyPaymentStatus(paymentId, "REJECT", reason);
      if (res.error) {
        alert(res.error);
      } else {
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingActionId(null);
    }
  }

  async function handleAssignCrewSubmit(e) {
    e.preventDefault();
    if (!crewName || !crewModalBooking) return;

    setLoadingActionId("crew-submit");
    try {
      const formData = new FormData();
      formData.append("bookingId", crewModalBooking.id);
      formData.append("crewName", crewName);
      formData.append("roleTitle", roleTitle);
      formData.append("contactNumber", contactNumber);

      const res = await assignCrew(formData);
      if (res.error) {
        alert(res.error);
      } else {
        setCrewName("");
        setContactNumber("");
        setCrewModalBooking(null);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingActionId(null);
    }
  }

  async function handleRemoveCrew(assignmentId) {
    if (!confirm("Hapus penugasan kru ini dari jadwal?")) return;
    try {
      const res = await removeCrewAssignment(assignmentId);
      if (res.error) alert(res.error);
      else router.refresh();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-400 hover:text-white transition-colors mb-2"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Kembali ke Panel Admin</span>
          </Link>
          <h1 className="text-2xl font-black text-white">Verifikasi Pembayaran & Penugasan Kru</h1>
          <p className="text-xs text-neutral-400">
            Periksa struk transfer bank, konfirmasi pelunasan/DP, dan atur tim kru fotografer lapangan.
          </p>
        </div>

        {/* Filter Tab Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-neutral-900 border border-white/10 self-start sm:self-auto">
          {[
            { id: "PENDING_VERIFICATION", label: "Menunggu" },
            { id: "VERIFIED", label: "Terverifikasi" },
            { id: "REJECTED", label: "Ditolak" },
            { id: "ALL", label: "Semua" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filter === tab.id
                  ? "bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-neutral-500 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari nomor invoice, kode booking, atau nama pengirim..."
          className="w-full pl-11 pr-4 py-3 rounded-2xl bg-neutral-900/60 border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
        />
      </div>

      {/* DAFTAR TRANSAKSI PEMBAYARAN */}
      <div className="space-y-4">
        {filteredPayments.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-neutral-900/40 border border-white/5 text-neutral-400 text-xs">
            Tidak ada transaksi pembayaran yang cocok dengan filter.
          </div>
        ) : (
          filteredPayments.map((p) => {
            const inv = p.invoices;
            const booking = inv?.bookings;
            const client = booking?.customers?.users;
            const crewList = booking?.crew_assignments || [];
            const isPending = p.payment_status === "PENDING_VERIFICATION";

            return (
              <div
                key={p.id}
                className="p-6 rounded-3xl bg-neutral-900/60 border border-white/10 backdrop-blur-xl space-y-4"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/5 pb-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-amber-400">{inv?.invoice_number}</span>
                      <span className="font-mono text-[11px] text-neutral-400">({booking?.booking_code})</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          p.payment_status === "VERIFIED"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : p.payment_status === "REJECTED"
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                            : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        }`}
                      >
                        {p.payment_status === "VERIFIED"
                          ? "Sah Terverifikasi"
                          : p.payment_status === "REJECTED"
                          ? "Ditolak"
                          : "Menunggu Verifikasi"}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-neutral-800 text-[10px] font-semibold text-neutral-300">
                        {p.payment_type === "DP" ? "Uang Muka (DP)" : "Pelunasan"}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white">
                      {client?.full_name || "Klien Iluxy Creative"} • {booking?.packages?.name}
                    </h3>
                    <p className="text-xs text-neutral-400">
                      WA: {client?.phone_number || "-"} • Rekening Pengirim:{" "}
                      <strong className="text-neutral-200">{p.sender_account_name}</strong> ({p.bank_name})
                    </p>
                  </div>

                  <div className="text-left lg:text-right">
                    <span className="text-[10px] uppercase font-bold text-neutral-500 block">Nominal Transfer</span>
                    <span className="text-xl font-black text-white">{formatRupiah(p.amount)}</span>
                  </div>
                </div>

                {/* Grid Rincian Sesi & Kru */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-neutral-950/60 border border-white/5 space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-amber-400 block">Jadwal Sesi Studio</span>
                    <div className="text-white font-semibold">
                      {booking?.session_date &&
                        new Date(booking.session_date).toLocaleDateString("id-ID", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                    </div>
                    <div className="text-neutral-400">
                      Pukul {booking?.start_time?.substring(0, 5)} - {booking?.end_time?.substring(0, 5)} WIB (
                      {booking?.location_type})
                    </div>
                    <div className="text-neutral-500 truncate">{booking?.venue_address}</div>
                  </div>

                  {/* Kru Fotografer Ditugaskan */}
                  <div className="p-4 rounded-2xl bg-neutral-950/60 border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-amber-400">Tim Kru Ditugaskan</span>
                      {booking && (
                        <button
                          type="button"
                          onClick={() => setCrewModalBooking(booking)}
                          className="text-[11px] font-bold text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Tugaskan Kru</span>
                        </button>
                      )}
                    </div>

                    {crewList.length === 0 ? (
                      <p className="text-neutral-500 italic text-[11px]">Belum ada kru yang ditugaskan ke sesi ini.</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {crewList.map((crew) => (
                          <div
                            key={crew.id}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-neutral-900 border border-white/10 text-neutral-200 text-[11px]"
                          >
                            <span className="font-bold text-amber-400">{crew.crew_name}</span>
                            <span className="text-neutral-500">({crew.role_title})</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveCrew(crew.id)}
                              className="text-neutral-500 hover:text-rose-400 ml-1 cursor-pointer"
                              title="Hapus penugasan"
                            >
                              <XCircle className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setPreviewImage(p.proof_image_url)}
                    className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Lihat Struk Bukti Transfer</span>
                  </button>

                  {isPending && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleReject(p.id)}
                        disabled={loadingActionId === p.id}
                        className="px-4 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 border border-rose-500/30 text-xs font-bold text-rose-300 transition-colors cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1 inline" />
                        Tolak
                      </button>

                      <AnimatedButton
                        variant="primary"
                        onClick={() => handleVerify(p.id)}
                        isLoading={loadingActionId === p.id}
                        disabled={Boolean(loadingActionId)}
                        className="py-2 px-5 text-xs uppercase font-extrabold tracking-wider"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        <span>Verifikasi Sah</span>
                      </AnimatedButton>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL PRATINJAU STRUK BUKTI TRANSFER */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md cursor-pointer"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-2xl max-h-[85vh] w-full rounded-3xl overflow-hidden bg-neutral-900 border border-white/20 p-2 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full h-[70vh]">
              <Image
                src={previewImage}
                alt="Struk Transfer"
                fill
                className="object-contain"
              />
            </div>
            <div className="p-3 text-center">
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="px-6 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-white transition-colors cursor-pointer"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PENUGASAN KRU */}
      {crewModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <form
            onSubmit={handleAssignCrewSubmit}
            className="w-full max-w-md rounded-3xl bg-neutral-900 border border-white/10 p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Penugasan Kru Fotografer</h3>
                <p className="text-xs text-neutral-400">Kode Booking: {crewModalBooking.booking_code}</p>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block mb-1.5">
                Nama Kru Fotografer / Kru <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={crewName}
                onChange={(e) => setCrewName(e.target.value)}
                placeholder="Contoh: Arif Pratama"
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block mb-1.5">
                  Peran / Tanggung Jawab
                </label>
                <select
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  <option value="Lead Photographer">Lead Photographer</option>
                  <option value="Videographer">Videographer</option>
                  <option value="Lighting Assistant">Lighting Assistant</option>
                  <option value="Digital Retoucher">Digital Retoucher</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block mb-1.5">
                  Nomor Kontak Kru
                </label>
                <input
                  type="tel"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="0812..."
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCrewModalBooking(null)}
                className="px-4 py-2 rounded-xl bg-neutral-800 text-xs font-bold text-neutral-300 hover:text-white transition-colors cursor-pointer"
              >
                Batal
              </button>

              <AnimatedButton
                variant="primary"
                type="submit"
                isLoading={loadingActionId === "crew-submit"}
                className="py-2 px-5 text-xs uppercase font-extrabold tracking-wider"
              >
                <span>Simpan Penugasan</span>
              </AnimatedButton>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
