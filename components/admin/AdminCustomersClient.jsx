"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Users, 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  CreditCard, 
  ArrowLeft,
  ExternalLink,
  MessageCircle,
  UserCheck
} from "lucide-react";

export default function AdminCustomersClient({ initialCustomers = [] }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCustomers = initialCustomers.filter((c) => {
    const term = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term) ||
      c.phone.toLowerCase().includes(term) ||
      c.city.toLowerCase().includes(term)
    );
  });

  const formatRupiah = (val) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const totalLifetimeSpent = initialCustomers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-semibold mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Panel Utama</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Direktori Data Pelanggan Studio
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            FR-03 & FR-13: Riwayat pemesanan pelanggan, kontak WhatsApp, domisili, dan akumulasi transaksi.
          </p>
        </div>
      </div>

      {/* KPI Cards Pelanggan */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="p-5 rounded-2xl bg-neutral-900/40 border border-white/5">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium">Total Klien Terdaftar</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {initialCustomers.length} Pelanggan
          </div>
          <p className="text-[11px] text-emerald-400 mt-1">Akun aktif terverifikasi</p>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900/40 border border-white/5">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium">Total Sesi Pemotretan</span>
            <Calendar className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {initialCustomers.reduce((sum, c) => sum + c.totalBookings, 0)} Booking
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">Kumulatif seluruh klien</p>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900/40 border border-white/5">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium">Total Omzet Pelanggan (Lunas)</span>
            <CreditCard className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">
            {formatRupiah(totalLifetimeSpent)}
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">Lifetime customer value</p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative mb-6">
        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Cari pelanggan berdasarkan nama, nomor HP, email, atau kota..."
          className="w-full pl-11 pr-4 py-3 rounded-2xl bg-neutral-900/60 border border-white/10 text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-amber-400 transition-colors"
        />
      </div>

      {/* Daftar Pelanggan */}
      {filteredCustomers.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-neutral-900/40 border border-white/5">
          <Users className="w-10 h-10 text-neutral-600 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-white mb-1">Tidak Ada Data Pelanggan Ditemukan</h3>
          <p className="text-xs text-neutral-400">
            Coba sesuaikan kata kunci pencarian Anda.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCustomers.map((c) => {
            const cleanPhone = c.phone.replace(/\D/g, "");
            const waNumber = cleanPhone.startsWith("0")
              ? "62" + cleanPhone.slice(1)
              : cleanPhone;

            return (
              <div
                key={c.id}
                className="p-5 rounded-3xl bg-neutral-900/60 border border-white/10 hover:border-amber-500/30 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      {c.avatarUrl ? (
                        <div className="w-12 h-12 rounded-2xl overflow-hidden border border-amber-500/30 relative">
                          <Image
                            src={c.avatarUrl}
                            alt={c.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-neutral-800 to-neutral-700 border border-white/10 flex items-center justify-center font-bold text-sm text-amber-400">
                          {c.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h3 className="text-sm font-bold text-white line-clamp-1">
                          {c.name}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-neutral-400 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                          <span>{c.city}</span>
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-neutral-800 text-neutral-300 border border-white/5">
                      {c.totalBookings} Booking
                    </span>
                  </div>

                  {/* Detail Kontak & Transaksi */}
                  <div className="p-3.5 rounded-2xl bg-neutral-950/60 border border-white/5 space-y-2 text-xs mb-4">
                    <div className="flex items-center justify-between text-neutral-300">
                      <span className="flex items-center gap-1.5 text-neutral-400">
                        <Mail className="w-3.5 h-3.5" /> Email:
                      </span>
                      <span className="font-mono text-neutral-200">{c.email}</span>
                    </div>

                    <div className="flex items-center justify-between text-neutral-300">
                      <span className="flex items-center gap-1.5 text-neutral-400">
                        <Phone className="w-3.5 h-3.5" /> WhatsApp:
                      </span>
                      <span className="font-mono text-neutral-200">{c.phone}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-white/5">
                      <span className="text-neutral-400">Total Belanja Lunas:</span>
                      <span className="font-bold text-amber-400">{formatRupiah(c.totalSpent)}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                  <a
                    href={`https://wa.me/${waNumber}?text=Halo%20${encodeURIComponent(
                      c.name
                    )},%20kami%20dari%20studio%20Iluxy%20Creative%20Padang...`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Hubungi WA</span>
                  </a>

                  <Link
                    href={`/admin/verifikasi`}
                    className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Cek Booking</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
