"use client";

import React, { useEffect, useState } from "react";
import { useApp } from "@/lib/context/AppContext";
import { transactionService } from "@/services/transaction.service";
import { Transaction } from "@/types";
import { MONTHS } from "@/lib/constants";
import {
  totals,
  profitLoss,
  monthlySeries,
  rp,
  signed,
  fmtDate,
  ym,
  todayISO,
} from "@/lib/utils";
import { TrialBanner } from "@/components/common/TrialBanner";
import { BarChart } from "@/components/common/BarChart";
import { EmptyState } from "@/components/common/EmptyState";
import { Icon } from "@/components/common/Icons";

export const BerandaView: React.FC = () => {
  const {
    currentUser,
    currentProfile,
    selectedPeriod,
    setSelectedPeriod,
    setRoute,
  } = useApp();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      transactionService.listByUser(currentUser.id).then((list) => {
        setTransactions(list);
        setLoading(false);
      });
    }
  }, [currentUser]);

  if (loading) {
    return <div className="p-8 text-center text-brand-muted">Memuat data...</div>;
  }

  const p = selectedPeriod;
  const mo = transactions.filter((t) => ym(t.tanggal) === p);
  const t = totals(mo);
  const pl = profitLoss(transactions, p);

  // Previous month delta
  const [y, m] = p.split("-").map(Number);
  const prevDate = new Date(y, m - 2, 1);
  const prevP = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}`;
  const prevT = totals(transactions.filter((x) => ym(x.tanggal) === prevP));

  const dM =
    prevT.masuk > 0 ? ((t.masuk - prevT.masuk) / prevT.masuk) * 100 : null;
  const dK =
    prevT.keluar > 0 ? ((t.keluar - prevT.keluar) / prevT.keluar) * 100 : null;

  // Recent transactions
  const recent = transactions
    .slice()
    .sort(
      (a, b) =>
        b.tanggal.localeCompare(a.tanggal) ||
        b.createdAt.localeCompare(a.createdAt)
    )
    .slice(0, 5);

  // Chart data
  const series = monthlySeries(transactions, p.slice(0, 4))
    .filter((s) => s.count > 0 || s.periode <= p)
    .slice(-6)
    .map((s) => ({
      label: s.bulan.slice(0, 3),
      masuk: s.masuk,
      keluar: s.keluar,
    }));

  // Available month options
  const monthOptionsSet = new Set(transactions.map((tx) => ym(tx.tanggal)));
  monthOptionsSet.add(todayISO().slice(0, 7));
  const monthOptions = Array.from(monthOptionsSet).sort().reverse();

  const [yy, mm] = p.split("-");

  return (
    <div>
      <TrialBanner />

      {/* Header Selector */}
      <div className="flex items-center justify-between gap-3 flex-wrap mb-4 no-print">
        <p className="text-brand-muted m-0 text-sm">
          Ringkasan keuangan {MONTHS[+mm - 1]} {yy} untuk{" "}
          <b className="text-[#111111]">{currentProfile?.namaUsaha || currentUser?.namaUsaha || "usaha Anda"}</b>.
        </p>
        <select
          value={p}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="border border-brand-line rounded-smarta-md py-2 px-3 bg-white text-sm outline-none focus:border-brand-green max-w-[200px]"
        >
          {monthOptions.map((opt) => {
            const [oy, om] = opt.split("-");
            return (
              <option key={opt} value={opt}>
                {MONTHS[+om - 1]} {oy}
              </option>
            );
          })}
        </select>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pemasukan */}
        <div className="bg-white rounded-smarta-lg p-4.5 shadow-smarta1 border border-brand-line/40">
          <div className="flex items-center gap-2 text-[13px] text-brand-muted font-medium">
            <Icon name="download" size="sm" />
            Total Pemasukan
          </div>
          <div className="font-serif text-[27px] font-bold mt-2 leading-tight text-brand-deep break-words">
            {rp(t.masuk)}
          </div>
          <div className="text-xs text-brand-muted mt-1">
            {dM === null
              ? "Belum ada pembanding"
              : `${dM >= 0 ? "+" : ""}${dM.toFixed(0)}% vs bulan lalu`}
          </div>
        </div>

        {/* Pengeluaran */}
        <div className="bg-white rounded-smarta-lg p-4.5 shadow-smarta1 border border-brand-line/40">
          <div className="flex items-center gap-2 text-[13px] text-brand-muted font-medium">
            <Icon name="card" size="sm" />
            Total Pengeluaran
          </div>
          <div className="font-serif text-[27px] font-bold mt-2 leading-tight text-brand-red break-words">
            {rp(t.keluar)}
          </div>
          <div className="text-xs text-brand-muted mt-1">
            {dK === null
              ? "Belum ada pembanding"
              : `${dK >= 0 ? "+" : ""}${dK.toFixed(0)}% vs bulan lalu`}
          </div>
        </div>

        {/* Laba Bersih */}
        <div className="bg-white rounded-smarta-lg p-4.5 shadow-smarta1 border border-brand-line/40">
          <div className="flex items-center gap-2 text-[13px] text-brand-muted font-medium">
            <Icon name="chart" size="sm" />
            Laba Bersih (Usaha)
          </div>
          <div
            className={`font-serif text-[27px] font-bold mt-2 leading-tight break-words ${
              pl.laba >= 0 ? "text-brand-deep" : "text-brand-red"
            }`}
          >
            {(pl.laba < 0 ? "−" : "") + rp(pl.laba)}
          </div>
          <div className="text-xs text-brand-muted mt-1">
            Margin {pl.margin.toFixed(0)}%
          </div>
        </div>

        {/* Total Transaksi */}
        <div className="bg-white rounded-smarta-lg p-4.5 shadow-smarta1 border border-brand-line/40">
          <div className="flex items-center gap-2 text-[13px] text-brand-muted font-medium">
            <Icon name="doc" size="sm" />
            Total Transaksi
          </div>
          <div className="font-serif text-[27px] font-bold mt-2 leading-tight text-[#111111]">
            {t.count}
          </div>
          <div className="text-xs text-brand-muted mt-1">Bulan ini</div>
        </div>
      </div>

      {/* Split section: Chart & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.25fr] gap-4 mt-4">
        {/* Chart */}
        <div className="bg-white rounded-smarta-lg p-5 shadow-smarta1 border border-brand-line/40">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base text-[#111111]">
              Grafik Pemasukan vs Pengeluaran
            </h3>
            <small className="text-brand-muted text-xs">
              {MONTHS[+mm - 1]} {yy}
            </small>
          </div>
          {series.length > 0 ? (
            <BarChart series={series} />
          ) : (
            <EmptyState message="Belum ada data untuk grafik." showCta />
          )}
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-smarta-lg p-5 shadow-smarta1 border border-brand-line/40">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-base text-[#111111]">
              Transaksi Terbaru
            </h3>
            <button
              type="button"
              onClick={() => setRoute("riwayat")}
              className="text-xs font-semibold py-1.5 px-3 rounded-full border border-brand-line bg-white hover:border-brand-green hover:text-brand-deep text-[#111111] transition-all"
            >
              Lihat semua →
            </button>
          </div>

          <div className="divide-y divide-brand-line">
            {recent.length > 0 ? (
              recent.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center gap-3 py-3 first:pt-1 last:pb-0"
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
                </div>
              ))
            ) : (
              <EmptyState message="Belum ada transaksi." showCta />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
