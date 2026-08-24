"use client";

import React, { useEffect, useState } from "react";
import { useApp } from "@/lib/context/AppContext";
import { transactionService } from "@/services/transaction.service";
import { Transaction, FinancialAccountType } from "@/types";
import { totals, rp, signed, fmtDate } from "@/lib/utils";
import { EmptyState } from "@/components/common/EmptyState";
import { Icon } from "@/components/common/Icons";

interface KeuanganViewProps {
  accountType: FinancialAccountType;
}

export const KeuanganView: React.FC<KeuanganViewProps> = ({ accountType }) => {
  const { currentUser, setRoute, setEditingTxId, showConfirm } = useApp();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!currentUser) return;
    const all = await transactionService.listByUser(currentUser.id);
    setTransactions(
      all
        .filter((t) => t.akunKeuangan === accountType)
        .sort((a, b) => b.tanggal.localeCompare(a.tanggal))
    );
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [currentUser, accountType]);

  const label = accountType === "usaha" ? "Usaha" : "Pribadi";
  const t = totals(transactions);

  const handleDelete = (tx: Transaction) => {
    showConfirm(
      "Hapus transaksi?",
      `"${tx.deskripsi || tx.kategori}" sebesar ${rp(
        tx.nominal
      )} akan dihapus permanen.`,
      async () => {
        await transactionService.delete(tx.id);
        await loadData();
      },
      "Ya, Hapus",
      true
    );
  };

  if (loading) {
    return <div className="p-8 text-center text-brand-muted">Memuat data...</div>;
  }

  return (
    <div>
      <p className="text-brand-muted text-sm -mt-1 mb-5">
        {accountType === "usaha"
          ? "Catat keuangan khusus untuk operasional usaha Anda."
          : "Keuangan pribadi Anda, terpisah dari keuangan usaha."}
      </p>

      {/* 3 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-smarta-lg p-5 shadow-smarta1 border border-brand-line/40">
          <div className="flex items-center gap-2 text-[13px] text-brand-muted font-medium">
            <Icon name={accountType === "usaha" ? "store" : "person"} size="sm" />
            Saldo {label}
          </div>
          <div
            className={`font-serif text-[27px] font-bold mt-2 leading-tight ${
              t.saldo >= 0 ? "text-brand-deep" : "text-brand-red"
            }`}
          >
            {(t.saldo < 0 ? "−" : "") + rp(t.saldo)}
          </div>
          <div className="text-xs text-brand-muted mt-1">{t.count} transaksi</div>
        </div>

        <div className="bg-white rounded-smarta-lg p-5 shadow-smarta1 border border-brand-line/40">
          <div className="flex items-center gap-2 text-[13px] text-brand-muted font-medium">
            <Icon name="download" size="sm" />
            Pemasukan {label}
          </div>
          <div className="font-serif text-[27px] font-bold mt-2 leading-tight text-brand-green">
            {rp(t.masuk)}
          </div>
        </div>

        <div className="bg-white rounded-smarta-lg p-5 shadow-smarta1 border border-brand-line/40">
          <div className="flex items-center gap-2 text-[13px] text-brand-muted font-medium">
            <Icon name="card" size="sm" />
            Pengeluaran {label}
          </div>
          <div className="font-serif text-[27px] font-bold mt-2 leading-tight text-brand-red">
            {rp(t.keluar)}
          </div>
        </div>
      </div>

      {/* Personal financial notice */}
      {accountType === "pribadi" && (
        <div className="bg-[#FDF8EA] border border-[#F0DDA8] rounded-smarta-md p-4 mt-4 text-[#111111]">
          <b className="text-sm block">Catatan penting</b>
          <p className="text-brand-muted text-[13.5px] mt-1 mb-0 leading-relaxed">
            Transaksi pribadi tidak dihitung dalam laporan laba rugi usaha, sehingga laba usaha Anda tetap akurat dan bersih dari pengeluaran rumah tangga.
          </p>
        </div>
      )}

      {/* List of transactions */}
      <div className="bg-white rounded-smarta-lg p-5 shadow-smarta1 border border-brand-line/40 mt-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-base text-[#111111]">
            Riwayat Transaksi {label}
          </h3>
          <button
            type="button"
            onClick={() => {
              setEditingTxId(null);
              setRoute("tambah");
            }}
            className="text-xs font-semibold py-1.5 px-3 rounded-full border border-brand-line bg-white hover:border-brand-green hover:text-brand-deep text-[#111111] transition-all"
          >
            + Tambah
          </button>
        </div>

        <div className="divide-y divide-brand-line">
          {transactions.length > 0 ? (
            transactions.map((tx) => (
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
                  <small className="text-brand-muted text-xs">{tx.kategori}</small>
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

                <div className="flex items-center gap-1.5 ml-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTxId(tx.id);
                      setRoute("tambah");
                    }}
                    title="Edit"
                    className="w-8 h-8 rounded-lg border border-brand-line bg-white hover:border-brand-green text-[#111111] grid place-items-center transition-all"
                  >
                    <Icon name="edit" size="sm" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(tx)}
                    title="Hapus"
                    className="w-8 h-8 rounded-lg border border-brand-line bg-white hover:border-brand-red hover:text-brand-red text-[#111111] grid place-items-center transition-all"
                  >
                    <Icon name="trash" size="sm" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <EmptyState
              message={`Belum ada transaksi ${label.toLowerCase()}.`}
              showCta
            />
          )}
        </div>
      </div>
    </div>
  );
};
