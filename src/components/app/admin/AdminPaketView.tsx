"use client";

import React, { useEffect, useState } from "react";
import { packageService } from "@/services/package.service";
import { settingsService } from "@/services/settings.service";
import { useToast } from "@/lib/context/ToastContext";
import { SubscriptionPackage, User } from "@/types";
import { rp } from "@/lib/utils";
import { Modal } from "@/components/common/Modal";

export const AdminPaketView: React.FC = () => {
  const { showToast } = useToast();

  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal form state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPkgId, setEditingPkgId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nama: "",
    harga: 0,
    durasi: 6,
    satuan: "bulan" as "hari" | "bulan",
    batas: 0,
    fiturText: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const loadData = async () => {
    const [pkgs, allUsers] = await Promise.all([
      packageService.listAll(),
      settingsService.listAllUsers(),
    ]);
    setPackages(pkgs);
    setUsers(allUsers);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingPkgId(null);
    setFormData({
      nama: "",
      harga: 0,
      durasi: 6,
      satuan: "bulan",
      batas: 0,
      fiturText: "",
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleOpenEdit = (pkg: SubscriptionPackage) => {
    setEditingPkgId(pkg.id);
    setFormData({
      nama: pkg.nama,
      harga: pkg.harga,
      durasi: pkg.durasi,
      satuan: pkg.satuan,
      batas: pkg.batas,
      fiturText: pkg.fitur.join("\n"),
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleToggle = async (pkg: SubscriptionPackage) => {
    try {
      const updated = await packageService.toggleActive(pkg.id);
      await loadData();
      showToast(
        `Paket ${updated.nama} ${updated.aktif ? "diaktifkan" : "dinonaktifkan"}.`,
        "info"
      );
    } catch {
      showToast("Gagal mengubah status paket.", "error");
    }
  };

  const handleSave = async () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nama.trim()) {
      newErrors.nama = "Nama paket wajib diisi.";
    }
    if (isNaN(formData.harga) || formData.harga < 0) {
      newErrors.harga = "Harga tidak valid.";
    }
    if (!formData.durasi || formData.durasi < 1) {
      newErrors.durasi = "Durasi minimal 1.";
    }
    if (isNaN(formData.batas) || formData.batas < 0) {
      newErrors.batas = "Batas tidak valid.";
    }

    const fitur = formData.fiturText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    if (fitur.length < 1) {
      newErrors.fitur = "Minimal satu fitur.";
    }

    setFormErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      await packageService.save(editingPkgId, {
        nama: formData.nama.trim(),
        harga: Number(formData.harga),
        durasi: Number(formData.durasi),
        satuan: formData.satuan,
        batas: Number(formData.batas),
        fitur,
        aktif: true,
      });
      await loadData();
      setModalOpen(false);
      showToast(
        editingPkgId
          ? "Paket berhasil diperbarui."
          : "Paket berhasil ditambahkan.",
        "success"
      );
    } catch {
      showToast("Gagal menyimpan paket.", "error");
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-brand-muted">Memuat paket...</div>;
  }

  return (
    <div>
      <p className="text-brand-muted text-sm -mt-1 mb-5">
        Atur nama paket, harga, durasi, batas transaksi, dan daftar fitur.
      </p>

      <div className="bg-white rounded-smarta-lg p-5 sm:p-6 shadow-smarta1 border border-brand-line/40">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-base text-[#111111]">Daftar Paket</h3>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="text-xs font-semibold py-1.5 px-3 rounded-full border border-brand-line bg-white hover:border-brand-green text-[#111111] transition-all"
          >
            + Tambah Paket
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[13.5px] min-w-[640px]">
            <thead>
              <tr className="border-b border-brand-line">
                <th className="text-left text-xs text-brand-muted uppercase py-2.5">
                  Nama Paket
                </th>
                <th className="text-right text-xs text-brand-muted uppercase py-2.5">
                  Harga
                </th>
                <th className="text-left text-xs text-brand-muted uppercase py-2.5">
                  Durasi
                </th>
                <th className="text-left text-xs text-brand-muted uppercase py-2.5">
                  Batas Transaksi
                </th>
                <th className="text-center text-xs text-brand-muted uppercase py-2.5">
                  Pengguna
                </th>
                <th className="text-center text-xs text-brand-muted uppercase py-2.5">
                  Status
                </th>
                <th className="text-center text-xs text-brand-muted uppercase py-2.5">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-line">
              {packages.map((pkg) => {
                const userCount = users.filter((u) => u.plan === pkg.id).length;
                return (
                  <tr key={pkg.id} className="hover:bg-bg-app/40 transition-colors">
                    <td className="py-3">
                      <b className="text-[#111111] block">{pkg.nama}</b>
                      <small className="text-brand-muted text-xs">
                        {pkg.fitur.length} fitur
                      </small>
                    </td>
                    <td className="py-3 text-right font-medium text-[#111111]">
                      {pkg.harga > 0 ? rp(pkg.harga) : "Gratis"}
                    </td>
                    <td className="py-3 text-[#111111]">
                      {pkg.durasi} {pkg.satuan}
                    </td>
                    <td className="py-3 text-[#111111]">
                      {pkg.batas > 0 ? `${pkg.batas} transaksi` : "Tidak terbatas"}
                    </td>
                    <td className="py-3 text-center text-[#111111] font-semibold">
                      {userCount}
                    </td>
                    <td className="py-3 text-center">
                      <span
                        className={`inline-block text-[11px] font-semibold py-0.5 px-2.5 rounded-full ${
                          pkg.aktif
                            ? "bg-[#E7F4EA] text-brand-green"
                            : "bg-[#FBEBEA] text-brand-red"
                        }`}
                      >
                        {pkg.aktif ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(pkg)}
                          className="text-xs font-semibold py-1.5 px-2.5 rounded-full border border-brand-line bg-white hover:border-brand-green text-[#111111] transition-all"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggle(pkg)}
                          className="text-xs font-semibold py-1.5 px-2.5 rounded-full border border-brand-line bg-white hover:border-brand-green text-[#111111] transition-all"
                        >
                          {pkg.aktif ? "Nonaktifkan" : "Aktifkan"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Package Form Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`${editingPkgId ? "Edit" : "Tambah"} Paket`}
      >
        <div className="space-y-3 mt-3">
          <div>
            <label className="block font-semibold text-xs mb-1 text-[#111111]">
              Nama Paket
            </label>
            <input
              type="text"
              value={formData.nama}
              onChange={(e) =>
                setFormData((p) => ({ ...p, nama: e.target.value }))
              }
              className="w-full border border-brand-line rounded-smarta-md p-2.5 text-sm outline-none focus:border-brand-green"
            />
            {formErrors.nama && (
              <div className="text-brand-red text-xs mt-1">{formErrors.nama}</div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-xs mb-1 text-[#111111]">
                Harga (Rp)
              </label>
              <input
                type="number"
                min="0"
                value={formData.harga}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, harga: Number(e.target.value) }))
                }
                className="w-full border border-brand-line rounded-smarta-md p-2.5 text-sm outline-none focus:border-brand-green"
              />
              {formErrors.harga && (
                <div className="text-brand-red text-xs mt-1">{formErrors.harga}</div>
              )}
            </div>
            <div>
              <label className="block font-semibold text-xs mb-1 text-[#111111]">
                Durasi
              </label>
              <input
                type="number"
                min="1"
                value={formData.durasi}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, durasi: Number(e.target.value) }))
                }
                className="w-full border border-brand-line rounded-smarta-md p-2.5 text-sm outline-none focus:border-brand-green"
              />
              {formErrors.durasi && (
                <div className="text-brand-red text-xs mt-1">{formErrors.durasi}</div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-xs mb-1 text-[#111111]">
                Satuan Durasi
              </label>
              <select
                value={formData.satuan}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    satuan: e.target.value as "hari" | "bulan",
                  }))
                }
                className="w-full border border-brand-line rounded-smarta-md p-2.5 text-sm outline-none focus:border-brand-green bg-white"
              >
                <option value="bulan">Bulan</option>
                <option value="hari">Hari</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-xs mb-1 text-[#111111]">
                Batas Transaksi (0 = tidak terbatas)
              </label>
              <input
                type="number"
                min="0"
                value={formData.batas}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, batas: Number(e.target.value) }))
                }
                className="w-full border border-brand-line rounded-smarta-md p-2.5 text-sm outline-none focus:border-brand-green"
              />
              {formErrors.batas && (
                <div className="text-brand-red text-xs mt-1">{formErrors.batas}</div>
              )}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-xs mb-1 text-[#111111]">
              Fitur (satu per baris)
            </label>
            <textarea
              rows={4}
              value={formData.fiturText}
              onChange={(e) =>
                setFormData((p) => ({ ...p, fiturText: e.target.value }))
              }
              className="w-full border border-brand-line rounded-smarta-md p-2.5 text-sm outline-none focus:border-brand-green"
            />
            {formErrors.fitur && (
              <div className="text-brand-red text-xs mt-1">{formErrors.fitur}</div>
            )}
          </div>
        </div>

        <div className="flex gap-2.5 justify-end mt-6">
          <button
            type="button"
            onClick={() => setModalOpen(false)}
            className="px-4 py-2 text-sm font-semibold rounded-full border border-brand-line bg-white text-[#111111]"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 text-sm font-semibold rounded-full bg-brand-deep text-white"
          >
            Simpan
          </button>
        </div>
      </Modal>
    </div>
  );
};
