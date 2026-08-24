"use client";

import React, { useEffect, useState } from "react";
import { useApp } from "@/lib/context/AppContext";
import { settingsService } from "@/services/settings.service";
import { transactionService } from "@/services/transaction.service";
import { useToast } from "@/lib/context/ToastContext";
import { Category, Transaction } from "@/types";
import { Modal } from "@/components/common/Modal";
import { Icon } from "@/components/common/Icons";

export const KategoriView: React.FC = () => {
  const { currentUser, showConfirm } = useApp();
  const { showToast } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalJenis, setModalJenis] = useState<"pemasukan" | "pengeluaran">("pemasukan");
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catName, setCatName] = useState("");
  const [catError, setCatError] = useState("");

  const loadData = async () => {
    if (!currentUser) return;
    const [cats, txs] = await Promise.all([
      settingsService.getCategories(currentUser.id),
      transactionService.listByUser(currentUser.id),
    ]);
    setCategories(cats);
    setTransactions(txs);
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const handleOpenAdd = (jenis: "pemasukan" | "pengeluaran") => {
    setModalJenis(jenis);
    setEditingCatId(null);
    setCatName("");
    setCatError("");
    setModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setModalJenis(cat.jenis);
    setEditingCatId(cat.id);
    setCatName(cat.nama);
    setCatError("");
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!currentUser) return;
    const name = catName.trim();
    if (!name) {
      setCatError("Nama kategori wajib diisi.");
      return;
    }
    if (name.length < 3) {
      setCatError("Minimal 3 karakter.");
      return;
    }
    if (
      categories.some(
        (c) =>
          c.nama.toLowerCase() === name.toLowerCase() &&
          c.id !== editingCatId &&
          c.jenis === modalJenis
      )
    ) {
      setCatError("Kategori sudah ada.");
      return;
    }

    try {
      await settingsService.saveCategory(
        currentUser.id,
        editingCatId,
        name,
        modalJenis
      );
      await loadData();
      setModalOpen(false);
      showToast(
        editingCatId
          ? "Kategori berhasil diperbarui."
          : "Kategori berhasil ditambahkan.",
        "success"
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menyimpan kategori.";
      setCatError(msg);
    }
  };

  const handleDelete = (cat: Category) => {
    if (!currentUser) return;
    const usedCount = transactions.filter((t) => t.kategori === cat.nama).length;

    showConfirm(
      "Hapus kategori?",
      usedCount > 0
        ? `Kategori "${cat.nama}" masih digunakan ${usedCount} transaksi. Transaksi tersebut akan dipindah ke kategori "Lainnya".`
        : `Kategori "${cat.nama}" akan dihapus permanen.`,
      async () => {
        await settingsService.deleteCategory(currentUser.id, cat.id);
        await loadData();
        showToast("Kategori berhasil dihapus.", "success");
      },
      "Ya, Hapus",
      true
    );
  };

  const renderCategoryBlock = (jenis: "pemasukan" | "pengeluaran", title: string) => {
    const rows = categories.filter((c) => c.jenis === jenis);

    return (
      <div className="bg-white rounded-smarta-lg p-5 shadow-smarta1 border border-brand-line/40">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-base text-[#111111]">{title}</h3>
          <button
            type="button"
            onClick={() => handleOpenAdd(jenis)}
            className="text-xs font-semibold py-1.5 px-3 rounded-full border border-brand-line bg-white hover:border-brand-green hover:text-brand-deep text-[#111111] transition-all"
          >
            + Tambah
          </button>
        </div>

        <div className="divide-y divide-brand-line">
          {rows.length > 0 ? (
            rows.map((c) => {
              const count = transactions.filter((t) => t.kategori === c.nama).length;
              return (
                <div
                  key={c.id}
                  className="flex items-center gap-3 py-3 hover:bg-bg-app/50 px-2 rounded-xl transition-colors"
                >
                  <div
                    className={`w-[38px] h-[38px] rounded-xl grid place-items-center shrink-0 ${
                      jenis === "pemasukan"
                        ? "bg-[#E7F4EA] text-brand-green"
                        : "bg-[#FBEBEA] text-brand-red"
                    }`}
                  >
                    <Icon name="tag" size="sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <b className="text-sm block truncate text-[#111111]">{c.nama}</b>
                    <small className="text-brand-muted text-xs">
                      {count} transaksi menggunakan kategori ini
                    </small>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(c)}
                      title="Edit"
                      className="w-8 h-8 rounded-lg border border-brand-line bg-white hover:border-brand-green hover:text-brand-deep grid place-items-center text-[#111111] transition-all"
                    >
                      <Icon name="edit" size="sm" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(c)}
                      title="Hapus"
                      className="w-8 h-8 rounded-lg border border-brand-line bg-white hover:border-brand-red hover:text-brand-red grid place-items-center text-[#111111] transition-all"
                    >
                      <Icon name="trash" size="sm" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-6 text-center text-brand-muted text-sm">
              Belum ada kategori.
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <p className="text-brand-muted text-sm -mt-1 mb-5">
        Kelola kategori pemasukan dan pengeluaran sesuai kebutuhan operasional usaha Anda.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {renderCategoryBlock("pemasukan", "Kategori Pemasukan")}
        {renderCategoryBlock("pengeluaran", "Kategori Pengeluaran")}
      </div>

      {/* Category Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`${editingCatId ? "Edit" : "Tambah"} Kategori ${
          modalJenis === "pemasukan" ? "Pemasukan" : "Pengeluaran"
        }`}
      >
        <div className="mt-4 mb-2">
          <label className="block font-semibold text-sm mb-1.5 text-[#111111]">
            Nama Kategori
          </label>
          <input
            type="text"
            value={catName}
            maxLength={40}
            placeholder="Contoh: Penjualan Online"
            onChange={(e) => {
              setCatName(e.target.value);
              setCatError("");
            }}
            className={`w-full border rounded-smarta-md p-3 text-sm bg-white outline-none transition-all ${
              catError
                ? "border-brand-red"
                : "border-brand-line focus:border-brand-green"
            }`}
          />
          {catError && (
            <div className="text-brand-red text-xs mt-1.5">{catError}</div>
          )}
        </div>

        <div className="flex gap-2.5 justify-end mt-6">
          <button
            type="button"
            onClick={() => setModalOpen(false)}
            className="px-4 py-2 text-sm font-semibold rounded-full border border-brand-line bg-white hover:border-brand-green text-[#111111] transition-all"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 text-sm font-semibold rounded-full bg-brand-deep hover:bg-brand-green text-white transition-all shadow-sm"
          >
            Simpan
          </button>
        </div>
      </Modal>
    </div>
  );
};
