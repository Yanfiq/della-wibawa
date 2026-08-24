"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useApp } from "@/lib/context/AppContext";
import { transactionService } from "@/services/transaction.service";
import { settingsService } from "@/services/settings.service";
import { useToast } from "@/lib/context/ToastContext";
import { Transaction, Category, FilterState } from "@/types";
import { MONTHS } from "@/lib/constants";
import { totals, rp, signed, fmtDate, fmtDateTime } from "@/lib/utils";
import { EmptyState } from "@/components/common/EmptyState";
import { Modal } from "@/components/common/Modal";
import { Icon } from "@/components/common/Icons";

export const RiwayatView: React.FC = () => {
  const { currentUser, setRoute, setEditingTxId, showConfirm } = useApp();
  const { showToast } = useToast();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailTx, setDetailTx] = useState<Transaction | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    q: "",
    jenis: "",
    kategori: "",
    akun: "",
    tanggal: "",
    bulan: "",
    tahun: "",
    sort: "tanggal_desc",
  });

  const loadData = async () => {
    if (!currentUser) return;
    const [txs, cats] = await Promise.all([
      transactionService.listByUser(currentUser.id),
      settingsService.getCategories(currentUser.id),
    ]);
    setTransactions(txs);
    setCategories(cats);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const filteredList = useMemo(() => {
    let list = [...transactions];

    if (filters.q) {
      const q = filters.q.toLowerCase();
      list = list.filter(
        (t) =>
          (t.deskripsi || "").toLowerCase().includes(q) ||
          t.kategori.toLowerCase().includes(q)
      );
    }
    if (filters.jenis) {
      list = list.filter((t) => t.jenis === filters.jenis);
    }
    if (filters.kategori) {
      list = list.filter((t) => t.kategori === filters.kategori);
    }
    if (filters.akun) {
      list = list.filter((t) => t.akunKeuangan === filters.akun);
    }
    if (filters.tanggal) {
      list = list.filter((t) => t.tanggal === filters.tanggal);
    }
    if (filters.bulan) {
      list = list.filter((t) => t.tanggal.slice(5, 7) === filters.bulan);
    }
    if (filters.tahun) {
      list = list.filter((t) => t.tanggal.slice(0, 4) === filters.tahun);
    }

    const [key, dir] = filters.sort.split("_");
    list.sort((a, b) => {
      let r = 0;
      if (key === "nominal") {
        r = a.nominal - b.nominal;
      } else if (key === "tanggal") {
        r = a.tanggal.localeCompare(b.tanggal) || a.createdAt.localeCompare(b.createdAt);
      } else if (key === "kategori") {
        r = a.kategori.localeCompare(b.kategori);
      }
      return dir === "desc" ? -r : r;
    });

    return list;
  }, [transactions, filters]);

  const summary = useMemo(() => totals(filteredList), [filteredList]);

  const resetFilters = () => {
    setFilters({
      q: "",
      jenis: "",
      kategori: "",
      akun: "",
      tanggal: "",
      bulan: "",
      tahun: "",
      sort: "tanggal_desc",
    });
    showToast("Filter direset.", "info");
  };

  const handleDelete = (tx: Transaction) => {
    showConfirm(
      "Hapus transaksi?",
      `"${tx.deskripsi || tx.kategori}" sebesar ${rp(
        tx.nominal
      )} akan dihapus permanen.`,
      async () => {
        await transactionService.delete(tx.id);
        await loadData();
        showToast("Transaksi berhasil dihapus.", "success");
      },
      "Ya, Hapus",
      true
    );
  };

  const handleEdit = (id: string) => {
    setEditingTxId(id);
    setRoute("tambah");
  };

  // Year options
  const yearOptionsSet = new Set(transactions.map((t) => t.tanggal.slice(0, 4)));
  yearOptionsSet.add(String(new Date().getFullYear()));
  const yearOptions = Array.from(yearOptionsSet).sort().reverse();

  if (loading) {
    return <div className="p-8 text-center text-brand-muted">Memuat riwayat...</div>;
  }

  return (
    <div>
      <p className="text-brand-muted text-sm -mt-1 mb-5">
        Cari, filter, dan kelola seluruh transaksi Anda ({filteredList.length} dari{" "}
        {transactions.length} transaksi).
      </p>

      <div className="bg-white rounded-smarta-lg p-5 shadow-smarta1 border border-brand-line/40">
        {/* Filters grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
          <input
            type="text"
            placeholder="Cari deskripsi / kategori..."
            value={filters.q}
            onChange={(e) => setFilters((p) => ({ ...p, q: e.target.value }))}
            className="border border-brand-line rounded-smarta-md p-2.5 text-xs sm:text-sm bg-white outline-none focus:border-brand-green"
          />

          <select
            value={filters.jenis}
            onChange={(e) => setFilters((p) => ({ ...p, jenis: e.target.value }))}
            className="border border-brand-line rounded-smarta-md p-2.5 text-xs sm:text-sm bg-white outline-none focus:border-brand-green"
          >
            <option value="">Semua Jenis</option>
            <option value="pemasukan">Pemasukan</option>
            <option value="pengeluaran">Pengeluaran</option>
          </select>

          <select
            value={filters.kategori}
            onChange={(e) =>
              setFilters((p) => ({ ...p, kategori: e.target.value }))
            }
            className="border border-brand-line rounded-smarta-md p-2.5 text-xs sm:text-sm bg-white outline-none focus:border-brand-green"
          >
            <option value="">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.nama}>
                {c.nama}
              </option>
            ))}
          </select>

          <select
            value={filters.akun}
            onChange={(e) => setFilters((p) => ({ ...p, akun: e.target.value }))}
            className="border border-brand-line rounded-smarta-md p-2.5 text-xs sm:text-sm bg-white outline-none focus:border-brand-green"
          >
            <option value="">Usaha &amp; Pribadi</option>
            <option value="usaha">Keuangan Usaha</option>
            <option value="pribadi">Keuangan Pribadi</option>
          </select>

          <input
            type="date"
            value={filters.tanggal}
            onChange={(e) =>
              setFilters((p) => ({ ...p, tanggal: e.target.value }))
            }
            className="border border-brand-line rounded-smarta-md p-2.5 text-xs sm:text-sm bg-white outline-none focus:border-brand-green"
          />

          <select
            value={filters.bulan}
            onChange={(e) => setFilters((p) => ({ ...p, bulan: e.target.value }))}
            className="border border-brand-line rounded-smarta-md p-2.5 text-xs sm:text-sm bg-white outline-none focus:border-brand-green"
          >
            <option value="">Semua Bulan</option>
            {MONTHS.map((m, i) => (
              <option key={i} value={String(i + 1).padStart(2, "0")}>
                {m}
              </option>
            ))}
          </select>

          <select
            value={filters.tahun}
            onChange={(e) => setFilters((p) => ({ ...p, tahun: e.target.value }))}
            className="border border-brand-line rounded-smarta-md p-2.5 text-xs sm:text-sm bg-white outline-none focus:border-brand-green"
          >
            <option value="">Semua Tahun</option>
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <select
            value={filters.sort}
            onChange={(e) => setFilters((p) => ({ ...p, sort: e.target.value }))}
            className="border border-brand-line rounded-smarta-md p-2.5 text-xs sm:text-sm bg-white outline-none focus:border-brand-green"
          >
            <option value="tanggal_desc">Terbaru</option>
            <option value="tanggal_asc">Terlama</option>
            <option value="nominal_desc">Nominal terbesar</option>
            <option value="nominal_asc">Nominal terkecil</option>
            <option value="kategori_asc">Kategori A–Z</option>
          </select>
        </div>

        {/* Summary and Reset Bar */}
        <div className="flex items-center justify-between gap-3 flex-wrap mt-4 pt-3 border-t border-brand-line/60">
          <button
            type="button"
            onClick={resetFilters}
            className="text-xs font-semibold py-1.5 px-3 rounded-smarta-md border border-brand-line bg-white hover:border-brand-green text-[#111111] transition-all"
          >
            Reset Filter
          </button>
          <div className="text-xs sm:text-[13px] text-brand-muted">
            Pemasukan <b className="text-brand-green">{rp(summary.masuk)}</b> •
            Pengeluaran <b className="text-brand-red">{rp(summary.keluar)}</b> •
            Selisih{" "}
            <b
              className={
                summary.saldo >= 0 ? "text-brand-green" : "text-brand-red"
              }
            >
              {(summary.saldo < 0 ? "−" : "") + rp(summary.saldo)}
            </b>
          </div>
        </div>

        {/* List of Transactions */}
        <div className="divide-y divide-brand-line mt-4">
          {filteredList.length > 0 ? (
            filteredList.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center gap-3 py-3 hover:bg-bg-app/50 px-2 rounded-xl transition-colors"
              >
                <div
                  className={`w-[38px] h-[38px] rounded-xl grid place-items-center shrink-0 ${
                    tx.jenis === "pemasukan"
                      ? "bg-[#E7F4EA] text-brand-green"
                      : "bg-[#FBEBEA] text-brand-red"
                  }`}
                >
                  <Icon
                    name={tx.jenis === "pemasukan" ? "download" : "card"}
                    size="sm"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <b className="text-sm block truncate text-[#111111]">
                    {tx.deskripsi || tx.kategori}
                  </b>
                  <small className="text-brand-muted text-xs">
                    {tx.kategori} •{" "}
                    <span
                      className={`inline-block text-[10.5px] font-semibold py-0.5 px-2 rounded-full ${
                        tx.akunKeuangan === "usaha"
                          ? "bg-[#E7F4EA] text-brand-green"
                          : "bg-[#FDF3DA] text-[#8a6300]"
                      }`}
                    >
                      {tx.akunKeuangan === "usaha" ? "Usaha" : "Pribadi"}
                    </span>
                  </small>
                </div>
                <div
                  className={`text-right font-semibold text-sm whitespace-nowrap ${
                    tx.jenis === "pemasukan"
                      ? "text-brand-green"
                      : "text-brand-red"
                  }`}
                >
                  {signed(tx.nominal, tx.jenis)}
                  <small className="block text-brand-muted font-normal text-[11.5px]">
                    {fmtDate(tx.tanggal)}
                  </small>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 ml-2">
                  <button
                    type="button"
                    onClick={() => setDetailTx(tx)}
                    title="Detail"
                    className="w-8 h-8 rounded-lg border border-brand-line bg-white hover:border-brand-green hover:text-brand-deep grid place-items-center text-[#111111] transition-all"
                  >
                    <Icon name="eye" size="sm" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEdit(tx.id)}
                    title="Edit"
                    className="w-8 h-8 rounded-lg border border-brand-line bg-white hover:border-brand-green hover:text-brand-deep grid place-items-center text-[#111111] transition-all"
                  >
                    <Icon name="edit" size="sm" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(tx)}
                    title="Hapus"
                    className="w-8 h-8 rounded-lg border border-brand-line bg-white hover:border-brand-red hover:text-brand-red grid place-items-center text-[#111111] transition-all"
                  >
                    <Icon name="trash" size="sm" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <EmptyState
              message="Belum ada transaksi yang cocok dengan filter."
              showCta
            />
          )}
        </div>
      </div>

      {/* Transaction Detail Modal */}
      {detailTx && (
        <Modal
          isOpen={Boolean(detailTx)}
          onClose={() => setDetailTx(null)}
          title="Detail Transaksi"
        >
          <div className="divide-y divide-brand-line mt-3 text-sm">
            <div className="flex justify-between py-2.5">
              <b className="text-brand-muted">Jenis</b>
              <span
                className={`font-semibold ${
                  detailTx.jenis === "pemasukan"
                    ? "text-brand-green"
                    : "text-brand-red"
                }`}
              >
                {detailTx.jenis === "pemasukan" ? "Pemasukan" : "Pengeluaran"}
              </span>
            </div>
            <div className="flex justify-between py-2.5">
              <b className="text-brand-muted">Tanggal</b>
              <span className="font-semibold text-[#111111]">
                {fmtDate(detailTx.tanggal)}
              </span>
            </div>
            <div className="flex justify-between py-2.5">
              <b className="text-brand-muted">Nominal</b>
              <span className="font-semibold text-[#111111]">
                {rp(detailTx.nominal)}
              </span>
            </div>
            <div className="flex justify-between py-2.5">
              <b className="text-brand-muted">Kategori</b>
              <span className="font-semibold text-[#111111]">
                {detailTx.kategori}
              </span>
            </div>
            <div className="flex justify-between py-2.5">
              <b className="text-brand-muted">Akun Keuangan</b>
              <span className="font-semibold text-[#111111]">
                {detailTx.akunKeuangan === "usaha"
                  ? "Keuangan Usaha"
                  : "Keuangan Pribadi"}
              </span>
            </div>
            <div className="flex justify-between py-2.5">
              <b className="text-brand-muted">Deskripsi</b>
              <span className="font-semibold text-[#111111]">
                {detailTx.deskripsi || "-"}
              </span>
            </div>
            <div className="flex justify-between py-2.5">
              <b className="text-brand-muted">Dicatat</b>
              <span className="font-semibold text-[#111111]">
                {fmtDateTime(detailTx.createdAt)}
              </span>
            </div>
          </div>

          {detailTx.bukti ? (
            <div className="mt-4">
              <b className="text-xs text-brand-muted block mb-1.5">
                Bukti Transaksi
              </b>
              <div className="rounded-smarta-md overflow-hidden border border-brand-line inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={detailTx.bukti}
                  alt={`Bukti transaksi ${detailTx.deskripsi}`}
                  className="max-h-[160px] object-cover"
                />
              </div>
            </div>
          ) : (
            <p className="text-xs text-brand-muted mt-3 mb-0">
              Tidak ada foto bukti untuk transaksi ini.
            </p>
          )}

          <div className="flex gap-2.5 justify-end mt-6">
            <button
              type="button"
              onClick={() => setDetailTx(null)}
              className="px-4 py-2 text-sm font-semibold rounded-full border border-brand-line bg-white hover:border-brand-green text-[#111111] transition-all"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={() => {
                const id = detailTx.id;
                setDetailTx(null);
                handleEdit(id);
              }}
              className="px-5 py-2 text-sm font-semibold rounded-full bg-brand-deep hover:bg-brand-green text-white transition-all"
            >
              Edit
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};
