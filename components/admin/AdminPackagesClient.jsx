"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Power, 
  Clock, 
  Camera, 
  ArrowLeft, 
  ExternalLink, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  X,
  Layers
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { 
  createPackage, 
  updatePackage, 
  togglePackageStatus, 
  deletePackage 
} from "@/lib/actions/packages";

export default function AdminPackagesClient({ initialPackages = [], categories = [] }) {
  const router = useRouter();
  const [packages, setPackages] = useState(initialPackages);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleOpenCreateModal = () => {
    setEditingPackage(null);
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (pkg) => {
    setEditingPackage(pkg);
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    const formData = new FormData(e.currentTarget);

    try {
      let result;
      if (editingPackage) {
        result = await updatePackage(editingPackage.id, formData);
      } else {
        result = await createPackage(formData);
      }

      if (result?.error) {
        setErrorMsg(result.error);
        setIsLoading(false);
        return;
      }

      setSuccessMsg(editingPackage ? "Paket berhasil diperbarui!" : "Paket baru berhasil ditambahkan!");
      setIsModalOpen(false);
      router.refresh();
    } catch (err) {
      setErrorMsg("Terjadi kegagalan saat menyimpan data paket.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (pkg) => {
    const nextStatus = !pkg.is_active;
    try {
      const res = await togglePackageStatus(pkg.id, nextStatus);
      if (res?.error) {
        alert(res.error);
      } else {
        router.refresh();
      }
    } catch {
      alert("Gagal mengubah status paket.");
    }
  };

  const handleDelete = async (pkg) => {
    if (!confirm(`Yakin ingin menghapus paket "${pkg.name}" secara permanen?`)) {
      return;
    }

    try {
      const res = await deletePackage(pkg.id);
      if (res?.error) {
        alert(res.error);
      } else {
        router.refresh();
      }
    } catch {
      alert("Gagal menghapus paket.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* 1. HEADER & TOP CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-amber-400 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Dashboard Admin</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Manajemen Paket Layanan Fotografi
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Kelola spesifikasi teknis, harga investasi, uang muka (DP), dan kuota retouch cetak album.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Paket Baru</span>
        </button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg("")} className="text-emerald-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. TABLE / GRID DAFTAR PAKET */}
      <div className="space-y-4">
        {packages.length === 0 ? (
          <div className="text-center py-12 rounded-3xl bg-neutral-900/40 border border-white/5 text-neutral-400 text-xs">
            Belum ada paket layanan terdaftar. Klik tombol &quot;Tambah Paket Baru&quot; di atas.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`flex flex-col justify-between p-5 rounded-3xl border transition-all ${
                  pkg.is_active
                    ? "bg-neutral-900/70 border-white/10 shadow-xl"
                    : "bg-neutral-950/40 border-white/5 opacity-60"
                }`}
              >
                <div>
                  {/* Image & Status Tag */}
                  <div className="relative h-44 rounded-2xl overflow-hidden mb-4 bg-neutral-800">
                    <img
                      src={pkg.cover_image_url || "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80"}
                      alt={pkg.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-neutral-950/80 backdrop-blur-md text-amber-300 font-semibold text-[10px] border border-white/10">
                      {pkg.package_categories?.name || "Kategori"}
                    </div>
                    <div className="absolute top-3 right-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          pkg.is_active
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                            : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                        }`}
                      >
                        {pkg.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                    </div>
                  </div>

                  {/* Header Title */}
                  <h3 className="text-lg font-bold text-white line-clamp-1">{pkg.name}</h3>
                  <p className="text-xs text-neutral-400 line-clamp-2 mt-1">
                    {pkg.description || "Tidak ada deskripsi."}
                  </p>

                  {/* Key Stats */}
                  <div className="flex items-center gap-4 text-xs text-neutral-300 mt-3 pt-3 border-t border-white/10">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      {pkg.duration_hours} Jam
                    </span>
                    <span className="flex items-center gap-1">
                      <Camera className="w-3.5 h-3.5 text-amber-400" />
                      {pkg.max_photos_retouch} Retouch
                    </span>
                  </div>

                  {/* Price Breakdown */}
                  <div className="mt-4 p-3 rounded-2xl bg-neutral-950/60 border border-white/5 space-y-1 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-400 text-[11px]">Total Investasi:</span>
                      <span className="font-bold text-white">{formatRupiah(pkg.price)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-400 text-[11px]">Minimal DP:</span>
                      <span className="font-semibold text-amber-400">{formatRupiah(pkg.dp_amount)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(pkg)}
                      title={pkg.is_active ? "Nonaktifkan Paket" : "Aktifkan Paket"}
                      className={`p-2 rounded-xl border text-xs cursor-pointer transition-colors ${
                        pkg.is_active
                          ? "bg-neutral-800 border-white/10 text-neutral-300 hover:text-amber-400"
                          : "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                      }`}
                    >
                      <Power className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(pkg)}
                      title="Edit Spesifikasi Paket"
                      className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(pkg)}
                      title="Hapus Paket"
                      className="p-2 rounded-xl bg-neutral-800 hover:bg-rose-500/20 border border-white/10 text-neutral-300 hover:text-rose-400 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <Link
                    href={`/katalog/${pkg.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    <span>Pratinjau</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. MODAL TAMBAH / EDIT PAKET */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl my-8 p-6 sm:p-8 rounded-3xl bg-neutral-900 border border-white/15 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <h2 className="text-xl font-bold text-white">
                {editingPackage ? `Edit Paket: ${editingPackage.name}` : "Tambah Paket Layanan Baru"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nama Paket */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">
                    Nama Paket Layanan
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    defaultValue={editingPackage?.name || ""}
                    placeholder="Contoh: Wedding Intim Padang Platinum"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-white/10 text-white placeholder-neutral-600 text-xs focus:outline-none focus:border-amber-500/60"
                  />
                </div>

                {/* Kategori */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">
                    Kategori Layanan
                  </label>
                  <select
                    name="category_id"
                    required
                    defaultValue={editingPackage?.category_id || categories[0]?.id || 1}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500/60 cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* URL Cover Image */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">
                    URL Gambar Cover
                  </label>
                  <input
                    type="url"
                    name="cover_image_url"
                    defaultValue={editingPackage?.cover_image_url || ""}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-white/10 text-white placeholder-neutral-600 text-xs focus:outline-none focus:border-amber-500/60"
                  />
                </div>

                {/* Total Harga */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">
                    Total Investasi / Harga (IDR)
                  </label>
                  <input
                    type="number"
                    name="price"
                    required
                    min={1}
                    defaultValue={editingPackage?.price || ""}
                    placeholder="Contoh: 3500000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-white/10 text-white placeholder-neutral-600 text-xs focus:outline-none focus:border-amber-500/60"
                  />
                </div>

                {/* Minimal DP */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">
                    Uang Muka (DP) Minimal (IDR)
                  </label>
                  <input
                    type="number"
                    name="dp_amount"
                    required
                    min={1}
                    defaultValue={editingPackage?.dp_amount || ""}
                    placeholder="Contoh: 1000000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-white/10 text-white placeholder-neutral-600 text-xs focus:outline-none focus:border-amber-500/60"
                  />
                </div>

                {/* Durasi Sesi (Jam) */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">
                    Durasi Sesi (Jam)
                  </label>
                  <input
                    type="number"
                    name="duration_hours"
                    required
                    min={1}
                    defaultValue={editingPackage?.duration_hours || 4}
                    placeholder="Contoh: 4"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-white/10 text-white placeholder-neutral-600 text-xs focus:outline-none focus:border-amber-500/60"
                  />
                </div>

                {/* Foto Retouch */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">
                    Jumlah Foto Retouch Cetak
                  </label>
                  <input
                    type="number"
                    name="max_photos_retouch"
                    required
                    min={1}
                    defaultValue={editingPackage?.max_photos_retouch || 25}
                    placeholder="Contoh: 25"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-white/10 text-white placeholder-neutral-600 text-xs focus:outline-none focus:border-amber-500/60"
                  />
                </div>
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">
                  Deskripsi Singkat Paket
                </label>
                <textarea
                  name="description"
                  rows={2}
                  defaultValue={editingPackage?.description || ""}
                  placeholder="Ringkasan konsep dan target momen foto..."
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-white/10 text-white placeholder-neutral-600 text-xs focus:outline-none focus:border-amber-500/60"
                />
              </div>

              {/* Fasilitas (Features) */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">
                  Daftar Fasilitas & Benefit (1 Baris = 1 Fasilitas)
                </label>
                <textarea
                  name="features"
                  rows={4}
                  defaultValue={editingPackage?.features?.join("\n") || ""}
                  placeholder={"1 Lead Photographer & 1 Assistant\nAlbum Kolase 20x30 Box Eksklusif\nMaster File High-Res di Private Gallery"}
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-white/10 text-white placeholder-neutral-600 text-xs font-mono focus:outline-none focus:border-amber-500/60"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-300 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <AnimatedButton
                  variant="primary"
                  type="submit"
                  isLoading={isLoading}
                  className="px-6 py-2.5 text-xs font-bold"
                >
                  <span>{editingPackage ? "Simpan Perubahan" : "Terbitkan Paket"}</span>
                </AnimatedButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
