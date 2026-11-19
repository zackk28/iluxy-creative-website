"use client";

import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { TrendingUp } from "lucide-react";

const emptySubscribe = () => () => {};
function useMounted() {
  return React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

const formatRupiah = (val) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val || 0);
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 rounded-xl bg-neutral-900/95 border border-amber-500/30 backdrop-blur-xl shadow-2xl text-xs">
        <div className="font-bold text-neutral-200 mb-1">{label}</div>
        <div className="text-amber-400 font-extrabold flex items-center gap-1.5">
          <span>Omzet:</span>
          <span>{formatRupiah(payload[0].value)}</span>
        </div>
        {payload[0].payload.bookings !== undefined && (
          <div className="text-neutral-400 text-[11px] mt-0.5">
            Pesanan: {payload[0].payload.bookings} Sesi Pemotretan
          </div>
        )}
      </div>
    );
  }
  return null;
};

export default function AdminAnalyticsChart({ data = [], topPackages = [] }) {
  const mounted = useMounted();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Kolom 1-2: Grafik Tren Omzet */}
      <div className="lg:col-span-2 p-6 rounded-3xl bg-neutral-900/60 border border-white/10 backdrop-blur-xl flex flex-col justify-between">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  FR-17 Analitik Omzet
                </span>
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  +18.4% vs Bulan Lalu
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">
                Tren Pendapatan Kotor Studio
              </h3>
            </div>
            <div className="text-xs text-neutral-400 font-medium">
              Periode 6 Bulan Berjalan
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.05)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    stroke="#737373"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#737373"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `Rp${val / 1000000}jt`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#F59E0B"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#revenueGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-neutral-600">
                Memuat visual grafik...
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-neutral-400">
          <span>* Dihitung otomatis dari pembayaran DP & Pelunasan terverifikasi di kas studio.</span>
        </div>
      </div>

      {/* Kolom 3: Paket Terlaris (Leaderboard) */}
      <div className="p-6 rounded-3xl bg-neutral-900/60 border border-white/10 backdrop-blur-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              FR-03 & FR-17
            </span>
          </div>
          <h3 className="text-lg font-bold text-white mb-4">
            Paket Paling Laris
          </h3>

          <div className="space-y-3">
            {topPackages.map((pkg, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-neutral-950/60 border border-white/5 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs ${
                      idx === 0
                        ? "bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20"
                        : idx === 1
                        ? "bg-neutral-700 text-white"
                        : "bg-neutral-800 text-neutral-400"
                    }`}
                  >
                    #{idx + 1}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white line-clamp-1">
                      {pkg.name}
                    </h4>
                    <span className="text-[10px] text-neutral-400">
                      Permintaan Klien Tinggi
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-extrabold text-amber-400">
                    {pkg.count} Sesi
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-white/5 text-[11px] text-neutral-500 text-center">
          Pembaruan real-time berdasarkan pesanan terdaftar
        </div>
      </div>
    </div>
  );
}
