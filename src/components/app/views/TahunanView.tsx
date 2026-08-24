"use client";

import React, { useEffect, useState } from "react";
import { useApp } from "@/lib/context/AppContext";
import { transactionService } from "@/services/transaction.service";
import { Transaction } from "@/types";
import { monthlySeries, rp } from "@/lib/utils";
import { BarChart } from "@/components/common/BarChart";
import { Icon } from "@/components/common/Icons";

export const TahunanView: React.FC = () => {
  const { currentUser, selectedYear, setSelectedYear, setSelectedPeriod, setRoute } =
    useApp();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      transactionService.listByUser(currentUser.id).then((txs) => {
        setTransactions(txs);
        setLoading(false);
      });
    }
  }, [currentUser]);

  const y = selectedYear;
  const series = monthlySeries(transactions, y, "usaha");
  const tot = series.reduce(
    (a, s) => ({
      masuk: a.masuk + s.masuk,
      keluar: a.keluar + s.keluar,
      laba: a.laba + s.laba,
    }),
    { masuk: 0, keluar: 0, laba: 0 }
  );

  const best = series.slice().sort((a, b) => b.laba - a.laba)[0];

  const yearOptionsSet = new Set(transactions.map((t) => t.tanggal.slice(0, 4)));
  yearOptionsSet.add(String(new Date().getFullYear()));
  const yearOptions = Array.from(yearOptionsSet).sort().reverse();

  if (loading) {
    return <div className="p-8 text-center text-brand-muted">Memuat data tahunan...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3 flex-wrap mb-4 no-print">
        <p className="text-brand-muted text-sm m-0">
          Ringkasan 12 bulan keuangan usaha tahun {y}.
        </p>
        <select
          value={y}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="border border-brand-line rounded-smarta-md py-2 px-3 bg-white text-sm outline-none focus:border-brand-green max-w-[140px]"
        >
          {yearOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-smarta-lg p-4.5 shadow-smarta1 border border-brand-line/40">
          <div className="flex items-center gap-2 text-[13px] text-brand-muted font-medium">
            <Icon name="download" size="sm" />
            Pemasukan Setahun
          </div>
          <div className="font-serif text-[27px] font-bold mt-2 leading-tight text-brand-green">
            {rp(tot.masuk)}
          </div>
        </div>

        <div className="bg-white rounded-smarta-lg p-4.5 shadow-smarta1 border border-brand-line/40">
          <div className="flex items-center gap-2 text-[13px] text-brand-muted font-medium">
            <Icon name="card" size="sm" />
            Pengeluaran Setahun
          </div>
          <div className="font-serif text-[27px] font-bold mt-2 leading-tight text-brand-red">
            {rp(tot.keluar)}
          </div>
        </div>

        <div className="bg-white rounded-smarta-lg p-4.5 shadow-smarta1 border border-brand-line/40">
          <div className="flex items-center gap-2 text-[13px] text-brand-muted font-medium">
            <Icon name="chart" size="sm" />
            Laba Bersih Setahun
          </div>
          <div
            className={`font-serif text-[27px] font-bold mt-2 leading-tight ${
              tot.laba >= 0 ? "text-brand-deep" : "text-brand-red"
            }`}
          >
            {(tot.laba < 0 ? "− " : "") + rp(tot.laba)}
          </div>
        </div>

        <div className="bg-white rounded-smarta-lg p-4.5 shadow-smarta1 border border-brand-line/40">
          <div className="flex items-center gap-2 text-[13px] text-brand-muted font-medium">
            <Icon name="calendar" size="sm" />
            Bulan Terbaik
          </div>
          <div className="font-serif text-[27px] font-bold mt-2 leading-tight text-[#111111]">
            {best && best.laba > 0 ? best.bulan : "—"}
          </div>
          <div className="text-xs text-brand-muted mt-1">
            {best && best.laba > 0 ? `${rp(best.laba)} laba` : "Belum ada data"}
          </div>
        </div>
      </div>

      {/* Chart Card */}
      <div className="bg-white rounded-smarta-lg p-5 sm:p-6 shadow-smarta1 border border-brand-line/40 mt-4">
        <h3 className="font-bold text-base text-[#111111] mb-4">
          Visualisasi 12 Bulan — {y}
        </h3>
        <BarChart
          series={series.map((s) => ({
            label: s.bulan.slice(0, 3),
            masuk: s.masuk,
            keluar: s.keluar,
          }))}
        />
      </div>

      {/* 12-Month Table */}
      <div className="bg-white rounded-smarta-lg p-5 sm:p-6 shadow-smarta1 border border-brand-line/40 mt-4">
        <h3 className="font-bold text-base text-[#111111] mb-4">
          Rincian 12 Bulan
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[13.5px] min-w-[640px]">
            <thead>
              <tr className="border-b border-brand-line">
                <th className="text-left text-xs text-brand-muted uppercase py-2.5">
                  Bulan
                </th>
                <th className="text-right text-xs text-brand-muted uppercase py-2.5">
                  Pemasukan
                </th>
                <th className="text-right text-xs text-brand-muted uppercase py-2.5">
                  Pengeluaran
                </th>
                <th className="text-right text-xs text-brand-muted uppercase py-2.5">
                  Laba / Rugi
                </th>
                <th className="text-center text-xs text-brand-muted uppercase py-2.5">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-line">
              {series.map((s) => (
                <tr key={s.periode} className="hover:bg-bg-app/40 transition-colors">
                  <td className="py-2.5 font-semibold text-[#111111]">{s.bulan}</td>
                  <td className="py-2.5 text-right text-brand-green font-medium">
                    {rp(s.masuk)}
                  </td>
                  <td className="py-2.5 text-right text-brand-red font-medium">
                    {rp(s.keluar)}
                  </td>
                  <td
                    className={`py-2.5 text-right font-semibold ${
                      s.laba >= 0 ? "text-brand-green" : "text-brand-red"
                    }`}
                  >
                    {(s.laba < 0 ? "− " : "") + rp(s.laba)}
                  </td>
                  <td className="py-2.5 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPeriod(s.periode);
                        setRoute("labarugi");
                      }}
                      className="text-xs font-semibold py-1.5 px-3 rounded-full border border-brand-line bg-white hover:border-brand-green hover:text-brand-deep text-[#111111] transition-all"
                    >
                      Laporan
                    </button>
                  </td>
                </tr>
              ))}
              <tr className="bg-bg-app font-bold border-t-2 border-brand-line">
                <td className="py-3 text-[#111111]">TOTAL {y}</td>
                <td className="py-3 text-right text-brand-green">
                  {rp(tot.masuk)}
                </td>
                <td className="py-3 text-right text-brand-red">
                  {rp(tot.keluar)}
                </td>
                <td
                  className={`py-3 text-right ${
                    tot.laba >= 0 ? "text-brand-green" : "text-brand-red"
                  }`}
                >
                  {(tot.laba < 0 ? "− " : "") + rp(tot.laba)}
                </td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
