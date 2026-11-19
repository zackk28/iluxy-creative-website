"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar as CalendarIcon,
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
} from "lucide-react";
import { getBookedSlotsForDate } from "@/lib/actions/booking";

// Slot waktu standar studio Iluxy Creative Padang
const STUDIO_TIME_SLOTS = [
  { id: "slot-1", label: "Sesi Pagi", start: "09:00:00", end: "11:00:00", display: "09:00 - 11:00 WIB" },
  { id: "slot-2", label: "Sesi Siang 1", start: "11:00:00", end: "13:00:00", display: "11:00 - 13:00 WIB" },
  { id: "slot-3", label: "Sesi Siang 2", start: "14:00:00", end: "16:00:00", display: "14:00 - 16:00 WIB" },
  { id: "slot-4", label: "Sesi Sore", start: "16:00:00", end: "18:00:00", display: "16:00 - 18:00 WIB" },
  { id: "slot-5", label: "Sesi Malam", start: "19:30:00", end: "21:30:00", display: "19:30 - 21:30 WIB" },
];

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const DAY_NAMES = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export default function BookingCalendar({
  selectedDate,
  selectedSlot,
  onDateChange,
  onSlotChange,
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Default view bulan berdasarkan selectedDate atau bulan saat ini
  const initialDate = selectedDate ? new Date(selectedDate) : new Date();
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());

  const [bookedSlots, setBookedSlots] = useState([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  // Ambil daftar slot yang sudah terpesan saat selectedDate berubah
  useEffect(() => {
    let isMounted = true;

    async function fetchBooked() {
      if (!selectedDate) {
        setBookedSlots([]);
        return;
      }

      setIsLoadingSlots(true);
      try {
        const slots = await getBookedSlotsForDate(selectedDate);
        if (isMounted) {
          setBookedSlots(slots);
        }
      } catch (err) {
        console.error("Gagal load slot:", err);
      } finally {
        if (isMounted) setIsLoadingSlots(false);
      }
    }

    fetchBooked();

    return () => {
      isMounted = false;
    };
  }, [selectedDate]);

  // Navigasi Bulan
  function prevMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  }

  function nextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  }

  // Hitung matriks hari dalam bulan
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Helper formatting YYYY-MM-DD
  function formatDateString(year, month, day) {
    const m = String(month + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${year}-${m}-${d}`;
  }

  // Cek apakah slot waktu tertentu bentrok dengan jadwal yang sudah terpesan
  function isSlotBooked(slotStart, slotEnd) {
    if (!bookedSlots || bookedSlots.length === 0) return false;

    return bookedSlots.some((b) => {
      // Overlap: (StartA < EndB) and (EndA > StartB)
      return b.start_time < slotEnd && b.end_time > slotStart;
    });
  }

  return (
    <div className="space-y-6">
      {/* 1. HEADER KALENDER & NAVIGASI BULAN */}
      <div className="p-6 rounded-3xl bg-neutral-900/60 border border-white/10 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {MONTH_NAMES[currentMonth]} {currentYear}
              </h3>
              <p className="text-xs text-neutral-400">Pilih tanggal reservasi sesi pemotretan</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={prevMonth}
              className="p-2 rounded-xl bg-neutral-800/80 hover:bg-neutral-800 border border-white/5 text-neutral-300 hover:text-white transition-colors cursor-pointer"
              title="Bulan Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={nextMonth}
              className="p-2 rounded-xl bg-neutral-800/80 hover:bg-neutral-800 border border-white/5 text-neutral-300 hover:text-white transition-colors cursor-pointer"
              title="Bulan Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* NAMA HARI */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center">
          {DAY_NAMES.map((day, idx) => (
            <span
              key={idx}
              className={`text-[11px] font-semibold uppercase tracking-wider py-1 ${
                idx === 0 || idx === 6 ? "text-amber-400/80" : "text-neutral-500"
              }`}
            >
              {day}
            </span>
          ))}
        </div>

        {/* GRID TANGGAL */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {/* Slot Kosong Sebelum Tanggal 1 */}
          {Array.from({ length: firstDayIndex }).map((_, idx) => (
            <div key={`empty-${idx}`} className="aspect-square p-1" />
          ))}

          {/* Hari-hari dalam Bulan */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNumber = idx + 1;
            const dateStr = formatDateString(currentYear, currentMonth, dayNumber);
            const dateObj = new Date(currentYear, currentMonth, dayNumber);
            dateObj.setHours(0, 0, 0, 0);

            const isPast = dateObj < today;
            const isToday = dateObj.getTime() === today.getTime();
            const isSelected = selectedDate === dateStr;

            return (
              <button
                key={dateStr}
                type="button"
                disabled={isPast}
                onClick={() => {
                  onDateChange(dateStr);
                  onSlotChange(null); // Reset slot saat tanggal berganti
                }}
                className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center text-xs font-semibold transition-all cursor-pointer ${
                  isPast
                    ? "text-neutral-600 opacity-40 cursor-not-allowed"
                    : isSelected
                    ? "bg-gradient-to-tr from-amber-500 to-amber-300 text-neutral-950 font-black shadow-lg shadow-amber-500/30 scale-105 z-10"
                    : "text-neutral-200 hover:bg-white/10 hover:border-amber-500/30 border border-transparent"
                }`}
              >
                <span>{dayNumber}</span>
                {isToday && !isSelected && (
                  <span className="absolute bottom-1 w-1 h-1 rounded-full bg-amber-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. PILIHAN SLOT WAKTU (ANTI DOUBLE-BOOKING) */}
      <AnimatePresence mode="wait">
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="p-6 rounded-3xl bg-neutral-900/60 border border-white/10 backdrop-blur-xl space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <h4 className="text-sm font-bold text-white">
                  Pilihan Slot Waktu Studio ({new Date(selectedDate).toLocaleDateString("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })})
                </h4>
              </div>

              {isLoadingSlots && (
                <div className="flex items-center gap-1.5 text-xs text-amber-400">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Memeriksa ketersediaan slot...</span>
                </div>
              )}
            </div>

            {/* DAFTAR SLOT */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
              {STUDIO_TIME_SLOTS.map((slot) => {
                const booked = isSlotBooked(slot.start, slot.end);
                const isSelected =
                  selectedSlot &&
                  selectedSlot.start === slot.start &&
                  selectedSlot.end === slot.end;

                return (
                  <button
                    key={slot.id}
                    type="button"
                    disabled={booked || isLoadingSlots}
                    onClick={() => onSlotChange(slot)}
                    className={`relative p-3.5 rounded-2xl border text-left transition-all ${
                      booked
                        ? "bg-rose-950/20 border-rose-500/20 opacity-60 cursor-not-allowed"
                        : isSelected
                        ? "bg-amber-500/15 border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.2)] scale-[1.02] cursor-pointer"
                        : "bg-neutral-950/50 border-white/5 hover:border-amber-500/30 hover:bg-neutral-950/80 cursor-pointer"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                        {slot.label}
                      </span>
                      {booked ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          <AlertCircle className="w-2.5 h-2.5" />
                          Terisi (Booked)
                        </span>
                      ) : isSelected ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-200 border border-amber-500/40">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          Dipilih
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <Sparkles className="w-2.5 h-2.5" />
                          Tersedia
                        </span>
                      )}
                    </div>

                    <div className="text-sm font-bold text-white">{slot.display}</div>
                    <div className="text-[11px] text-neutral-400 mt-0.5">
                      Durasi standar 2 jam sesi
                    </div>
                  </button>
                );
              })}
            </div>

            <p className="text-[11px] text-neutral-500 italic pt-2">
              *Jadwal yang ditandai merah telah dipesan oleh klien lain dan dikunci secara otomatis oleh sistem anti-bentrok.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
