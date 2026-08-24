"use client";

import React, { useEffect, useState } from "react";
import { useApp } from "@/lib/context/AppContext";
import { transactionService } from "@/services/transaction.service";
import { settingsService } from "@/services/settings.service";
import { authService } from "@/services/auth.service";
import { useToast } from "@/lib/context/ToastContext";
import {
  Category,
  Transaction,
  TransactionType,
  FinancialAccountType,
} from "@/types";
import { todayISO, ym } from "@/lib/utils";
import { CameraModal } from "@/components/common/CameraModal";
import { Icon } from "@/components/common/Icons";

export const TambahTransaksiView: React.FC = () => {
  const {
    currentUser,
    editingTxId,
    setEditingTxId,
    setRoute,
    setSelectedPeriod,
  } = useApp();
  const { showToast } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [userTransactions, setUserTransactions] = useState<Transaction[]>([]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  // Form State
  const [jenis, setJenis] = useState<TransactionType>("pemasukan");
  const [tanggal, setTanggal] = useState(todayISO());
  const [nominal, setNominal] = useState<string>("");
  const [kategori, setKategori] = useState<string>("");
  const [akunKeuangan, setAkunKeuangan] =
    useState<FinancialAccountType>("usaha");
  const [deskripsi, setDeskripsi] = useState<string>("");
  const [buktiData, setBuktiData] = useState<string | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      settingsService.getCategories(currentUser.id).then((cats) => {
        setCategories(cats);
      });
      transactionService.listByUser(currentUser.id).then((txs) => {
        setUserTransactions(txs);
      });
    }
  }, [currentUser]);

  // Load existing transaction when editing
  useEffect(() => {
    if (editingTxId && currentUser) {
      transactionService.getById(editingTxId).then((tx) => {
        if (tx) {
          setJenis(tx.jenis);
          setTanggal(tx.tanggal);
          setNominal(String(tx.nominal));
          setKategori(tx.kategori);
          setAkunKeuangan(tx.akunKeuangan);
          setDeskripsi(tx.deskripsi || "");
          setBuktiData(tx.bukti || null);
        }
      });
    }
  }, [editingTxId, currentUser]);

  const filteredCategories = categories.filter((c) => c.jenis === jenis);

  // Set default category when type changes if current category is invalid
  useEffect(() => {
    if (filteredCategories.length > 0) {
      if (!filteredCategories.some((c) => c.nama === kategori)) {
        setKategori(filteredCategories[0].nama);
      }
    }
  }, [jenis, filteredCategories, kategori]);

  const handlePickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!/^image\//.test(file.type)) {
      showToast("File harus berupa gambar (JPG/PNG/WEBP).", "error");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      showToast("Ukuran foto maksimal 2 MB.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setBuktiData(reader.result as string);
      showToast("Foto bukti berhasil dimuat.");
    };
    reader.readAsDataURL(file);
  };

  const handleResetForm = () => {
    setEditingTxId(null);
    setJenis("pemasukan");
    setTanggal(todayISO());
    setNominal("");
    setDeskripsi("");
    setBuktiData(null);
    setErrors({});
    showToast("Formulir direset.", "info");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const newErrors: Record<string, string> = {};

    if (!tanggal) {
      newErrors.tanggal = "Tanggal wajib diisi.";
    } else if (tanggal > todayISO()) {
      newErrors.tanggal = "Tanggal tidak boleh di masa depan.";
    }

    const num = Number(nominal);
    if (!nominal) {
      newErrors.nominal = "Nominal wajib diisi.";
    } else if (!isFinite(num) || num <= 0) {
      newErrors.nominal = "Nominal harus lebih dari 0.";
    } else if (num > 1e12) {
      newErrors.nominal = "Nominal terlalu besar.";
    }

    if (!kategori) {
      newErrors.kategori = "Kategori wajib dipilih.";
    }

    if (deskripsi.length > 140) {
      newErrors.deskripsi = "Deskripsi maksimal 140 karakter.";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      showToast("Periksa kembali data yang belum sesuai.", "error");
      return;
    }

    const subStatus = authService.getSubscriptionStatus(currentUser);

    try {
      setLoading(true);

      if (editingTxId) {
        await transactionService.update(editingTxId, {
          jenis,
          tanggal,
          nominal: num,
          kategori,
          akunKeuangan,
          deskripsi: deskripsi || kategori,
          bukti: buktiData,
        });
        setEditingTxId(null);
        showToast("Transaksi berhasil diperbarui.", "success");
        setRoute("riwayat");
        return;
      }

      // Check limits
      if (subStatus === "expired") {
        showToast(
          "Trial telah berakhir. Berlangganan untuk mencatat transaksi baru.",
          "error"
        );
        return;
      }
      if (subStatus === "trial" && userTransactions.length >= 100) {
        showToast("Batas 100 transaksi trial tercapai.", "error");
        return;
      }

      await transactionService.create({
        userId: currentUser.id,
        tanggal,
        jenis,
        kategori,
        nominal: num,
        akunKeuangan,
        deskripsi: deskripsi || kategori,
        bukti: buktiData,
      });

      setSelectedPeriod(ym(tanggal));
      showToast("Transaksi berhasil disimpan.", "success");
      setRoute("beranda");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Gagal menyimpan transaksi.";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const isEditing = Boolean(editingTxId);
  const subStatus = currentUser
    ? authService.getSubscriptionStatus(currentUser)
    : "expired";
  const overLimit = subStatus === "trial" && userTransactions.length >= 100;
  const isExpired = subStatus === "expired";

  return (
    <div>
      <p className="text-brand-muted text-sm -mt-1 mb-5">
        {isEditing
          ? "Ubah detail transaksi di bawah."
          : "Isi detail transaksi di bawah. Foto struk/nota opsional."}
      </p>

      {isExpired && (
        <div className="bg-gradient-to-r from-[#8d322f] to-brand-red text-white rounded-smarta-lg p-4 px-5 flex items-center justify-between gap-3 flex-wrap mb-4 shadow-smarta1">
          <div>
            <b className="text-[15px]">Trial berakhir</b>
            <p className="m-0 mt-0.5 text-[13px] opacity-90">
              Anda masih dapat melihat data, namun pencatatan baru memerlukan langganan aktif.
            </p>
          </div>
          <button
            onClick={() => setRoute("paket")}
            className="bg-brand-gold text-[#3a2c00] font-semibold text-sm px-5 py-2 rounded-full hover:bg-[#ffc93c] transition-all"
          >
            Berlangganan
          </button>
        </div>
      )}

      {overLimit && (
        <div className="bg-gradient-to-r from-brand-deep to-brand-green text-white rounded-smarta-lg p-4 px-5 flex items-center justify-between gap-3 flex-wrap mb-4 shadow-smarta1">
          <div>
            <b className="text-[15px]">Batas 100 transaksi trial tercapai</b>
            <p className="m-0 mt-0.5 text-[13px] opacity-90">
              Berlangganan untuk transaksi tidak terbatas.
            </p>
          </div>
          <button
            onClick={() => setRoute("paket")}
            className="bg-brand-gold text-[#3a2c00] font-semibold text-sm px-5 py-2 rounded-full hover:bg-[#ffc93c] transition-all"
          >
            Berlangganan
          </button>
        </div>
      )}

      <div className="bg-white rounded-smarta-lg p-6 sm:p-7 shadow-smarta1 border border-brand-line/40 max-w-[640px] mx-auto">
        <form onSubmit={handleSubmit} noValidate>
          {/* Seg Jenis */}
          <div className="mb-4">
            <label className="block font-semibold text-[13.5px] mb-1.5 text-[#111111]">
              Jenis Transaksi
            </label>
            <div className="flex gap-2 border border-brand-line rounded-full p-1 bg-white">
              <button
                type="button"
                onClick={() => setJenis("pemasukan")}
                className={`flex-1 py-2 px-3 rounded-full font-semibold text-sm transition-all cursor-pointer ${
                  jenis === "pemasukan"
                    ? "bg-[#E7F4EA] text-brand-green shadow-xs"
                    : "text-brand-muted hover:text-[#111111]"
                }`}
              >
                ↑ Pemasukan
              </button>
              <button
                type="button"
                onClick={() => setJenis("pengeluaran")}
                className={`flex-1 py-2 px-3 rounded-full font-semibold text-sm transition-all cursor-pointer ${
                  jenis === "pengeluaran"
                    ? "bg-[#FBEBEA] text-brand-red shadow-xs"
                    : "text-brand-muted hover:text-[#111111]"
                }`}
              >
                ↓ Pengeluaran
              </button>
            </div>
          </div>

          {/* Grid Tanggal & Nominal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-3.5">
            <div>
              <label className="block font-semibold text-[13.5px] mb-1.5 text-[#111111]">
                Tanggal
              </label>
              <input
                type="date"
                value={tanggal}
                max={todayISO()}
                onChange={(e) => {
                  setTanggal(e.target.value);
                  setErrors((prev) => ({ ...prev, tanggal: "" }));
                }}
                className={`w-full border rounded-smarta-md p-3 text-sm bg-white outline-none transition-all ${
                  errors.tanggal
                    ? "border-brand-red"
                    : "border-brand-line focus:border-brand-green"
                }`}
              />
              {errors.tanggal && (
                <div className="text-brand-red text-xs mt-1">{errors.tanggal}</div>
              )}
            </div>

            <div>
              <label className="block font-semibold text-[13.5px] mb-1.5 text-[#111111]">
                Nominal (Rp)
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={nominal}
                placeholder="0"
                onChange={(e) => {
                  setNominal(e.target.value);
                  setErrors((prev) => ({ ...prev, nominal: "" }));
                }}
                className={`w-full border rounded-smarta-md p-3 text-sm bg-white outline-none transition-all ${
                  errors.nominal
                    ? "border-brand-red"
                    : "border-brand-line focus:border-brand-green"
                }`}
              />
              {errors.nominal && (
                <div className="text-brand-red text-xs mt-1">{errors.nominal}</div>
              )}
            </div>
          </div>

          {/* Grid Kategori & Akun Keuangan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-3.5">
            <div>
              <label className="block font-semibold text-[13.5px] mb-1.5 text-[#111111]">
                Kategori
              </label>
              <select
                value={kategori}
                onChange={(e) => {
                  setKategori(e.target.value);
                  setErrors((prev) => ({ ...prev, kategori: "" }));
                }}
                className={`w-full border rounded-smarta-md p-3 text-sm bg-white outline-none transition-all ${
                  errors.kategori
                    ? "border-brand-red"
                    : "border-brand-line focus:border-brand-green"
                }`}
              >
                {filteredCategories.map((c) => (
                  <option key={c.id} value={c.nama}>
                    {c.nama}
                  </option>
                ))}
              </select>
              {errors.kategori && (
                <div className="text-brand-red text-xs mt-1">{errors.kategori}</div>
              )}
            </div>

            <div>
              <label className="block font-semibold text-[13.5px] mb-1.5 text-[#111111]">
                Akun Keuangan
              </label>
              <select
                value={akunKeuangan}
                onChange={(e) =>
                  setAkunKeuangan(e.target.value as FinancialAccountType)
                }
                className="w-full border border-brand-line rounded-smarta-md p-3 text-sm bg-white outline-none focus:border-brand-green transition-all"
              >
                <option value="usaha">Keuangan Usaha</option>
                <option value="pribadi">Keuangan Pribadi</option>
              </select>
              <p className="text-[11.5px] text-brand-muted mt-1">
                {akunKeuangan === "pribadi"
                  ? "Transaksi pribadi tidak masuk laporan laba rugi."
                  : "Masuk dalam laporan laba rugi usaha."}
              </p>
            </div>
          </div>

          {/* Deskripsi */}
          <div className="mb-4">
            <label className="block font-semibold text-[13.5px] mb-1.5 text-[#111111]">
              Deskripsi / Catatan{" "}
              <span className="text-brand-muted font-normal text-xs">(opsional)</span>
            </label>
            <input
              type="text"
              value={deskripsi}
              maxLength={140}
              placeholder="Contoh: Penjualan beras 5kg ke Bu Ani"
              onChange={(e) => {
                setDeskripsi(e.target.value);
                setErrors((prev) => ({ ...prev, deskripsi: "" }));
              }}
              className="w-full border border-brand-line rounded-smarta-md p-3 text-sm bg-white outline-none focus:border-brand-green transition-all"
            />
            {errors.deskripsi && (
              <div className="text-brand-red text-xs mt-1">{errors.deskripsi}</div>
            )}
          </div>

          {/* Foto Bukti Transaksi */}
          <div className="mb-5">
            <label className="block font-semibold text-[13.5px] mb-1.5 text-[#111111]">
              Foto Bukti Transaksi{" "}
              <span className="text-brand-muted font-normal text-xs">(opsional)</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <label className="border-2 border-dashed border-brand-line hover:border-brand-lime rounded-smarta-md p-4 text-center cursor-pointer bg-[#FBFBF5] hover:bg-[#F6F9F1] transition-all flex flex-col items-center justify-center">
                <Icon name="folder" size="sm" className="mb-1 text-brand-muted" />
                <span className="text-xs font-semibold text-brand-deep">
                  Upload dari Perangkat
                </span>
                <span className="text-[10.5px] text-brand-muted mt-0.5">
                  Maks. 2 MB (JPG/PNG)
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePickFile}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={() => setIsCameraOpen(true)}
                className="border-2 border-dashed border-brand-line hover:border-brand-lime rounded-smarta-md p-4 text-center cursor-pointer bg-[#FBFBF5] hover:bg-[#F6F9F1] transition-all flex flex-col items-center justify-center"
              >
                <Icon name="camera" size="sm" className="mb-1 text-brand-muted" />
                <span className="text-xs font-semibold text-brand-deep">
                  Ambil Foto dari Kamera
                </span>
                <span className="text-[10.5px] text-brand-muted mt-0.5">
                  Kamera Web / HP
                </span>
              </button>
            </div>

            {buktiData && (
              <div className="mt-3 relative inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={buktiData}
                  alt="Bukti transaksi"
                  className="max-h-[140px] rounded-smarta-md border border-brand-line shadow-xs object-cover"
                />
                <button
                  type="button"
                  onClick={() => setBuktiData(null)}
                  className="absolute -top-2 -right-2 bg-brand-red text-white w-6 h-6 rounded-full text-xs font-bold shadow-sm flex items-center justify-center"
                  title="Hapus foto"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex gap-2.5 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-brand-deep hover:bg-brand-green disabled:opacity-50 text-white font-semibold text-sm py-3 px-5 rounded-smarta-md transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              {loading
                ? "Menyimpan..."
                : isEditing
                ? "Simpan Perubahan"
                : "Simpan Transaksi"}
            </button>
            <button
              type="button"
              onClick={handleResetForm}
              className="px-4 py-3 text-sm font-semibold rounded-smarta-md border border-brand-line bg-white hover:border-brand-green text-[#111111] transition-all"
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* Live Camera Modal */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(img) => setBuktiData(img)}
      />
    </div>
  );
};
