"use client";

import React, { useEffect, useState } from "react";
import { useApp } from "@/lib/context/AppContext";
import { transactionService } from "@/services/transaction.service";
import { Transaction } from "@/types";
import { monthlySeries, rp } from "@/lib/utils";
import { BarChart } from "@/components/common/BarChart";
import { EmptyState } from "@/components/common/EmptyState";

export const BulananView: React.FC = () => {
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
  const filled = series.filter((s) => s.count > 0);

  const yearOptionsSet = new Set(transactions.map((t) => t.tanggal.slice(0, 4)));
  yearOptionsSet.add(String(new Date().getFullYear()));
  const yearOptions = Array.from(yearOptionsSet).sort().reverse();

  if (loading) {
    return <div className="p-8 text-center text-brand-muted">Memuat data bulanan...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3 flex-wrap mb-4 no-print">
        <p className="text-brand-muted text-sm m-0">
          Rekap bulanan keuangan usaha tahun {y}.
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

      <div className="bg-white rounded-smarta-lg p-5 sm:p-6 shadow-smarta1 border border-brand-line/40">
        <h3 className="font-serif font-bold text-lg text-[#111111] mb-4">
          Rekap Bulanan {y}
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[13.5px] min-w-[640px]">
            <thead>
              <tr className="border-b border-brand-line">
                <th className="text-left text-xs text-brand-muted uppercase py-2.5">
                  Bulan
                </th>
                <th className="text-left text-xs text-brand-muted uppercase py-2.5">
                  Transaksi
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
              {filled.length > 0 ? (
                filled.map((s) => (
                  <tr key={s.periode} className="hover:bg-bg-app/40 transition-colors">
                    <td className="py-3 font-semibold text-[#111111]">{s.bulan}</td>
                    <td className="py-3 text-brand-muted">{s.count}</td>
                    <td className="py-3 text-right text-brand-green font-medium">
                      {rp(s.masuk)}
                    </td>
                    <td className="py-3 text-right text-brand-red font-medium">
                      {rp(s.keluar)}
                    </td>
                    <td
                      className={`py-3 text-right font-bold ${
                        s.laba >= 0 ? "text-brand-green" : "text-brand-red"
                      }`}
                    >
                      {(s.laba < 0 ? "− " : "") + rp(s.laba)}
                    </td>
                    <td className="py-3 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPeriod(s.periode);
                          setRoute("labarugi");
                        }}
                        className="text-xs font-semibold py-1.5 px-3 rounded-full border border-brand-line bg-white hover:border-brand-green hover:text-brand-deep text-[#111111] transition-all"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8">
                    <EmptyState
                      message={`Belum ada transaksi usaha pada tahun ${y}.`}
                      showCta
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filled.length > 0 && (
          <div className="mt-8 pt-6 border-t border-brand-line">
            <h4 className="font-bold text-sm text-[#111111] mb-3">
              Grafik Bulanan
            </h4>
            <BarChart
              series={filled.map((s) => ({
                label: s.bulan.slice(0, 3),
                masuk: s.masuk,
                keluar: s.keluar,
              }))}
            />
          </div>
        )}
      </div>
    </div>
  );
};
