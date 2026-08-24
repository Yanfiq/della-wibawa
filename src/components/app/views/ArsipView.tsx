"use client";

import React, { useEffect, useState } from "react";
import { useApp } from "@/lib/context/AppContext";
import { reportService } from "@/services/report.service";
import { transactionService } from "@/services/transaction.service";
import { useToast } from "@/lib/context/ToastContext";
import { ReportItem, Transaction } from "@/types";
import { MONTHS } from "@/lib/constants";
import { profitLoss, rp, fmtDateTime, ym } from "@/lib/utils";
import { EmptyState } from "@/components/common/EmptyState";
import { Icon } from "@/components/common/Icons";

export const ArsipView: React.FC = () => {
  const { currentUser, setSelectedPeriod, setRoute, showConfirm } = useApp();
  const { showToast } = useToast();

  const [archivedReports, setArchivedReports] = useState<ReportItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!currentUser) return;
    const [reports, txs] = await Promise.all([
      reportService.listArchived(currentUser.id),
      transactionService.listByUser(currentUser.id),
    ]);
    setArchivedReports(reports);
    setTransactions(txs);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const periods = Array.from(
    new Set(transactions.map((t) => ym(t.tanggal)))
  ).sort().reverse();

  const handleDeleteArchive = (report: ReportItem) => {
    showConfirm(
      "Hapus arsip laporan?",
      "Data transaksi tidak akan terhapus, hanya arsip laporannya.",
      async () => {
        await reportService.deleteArchived(report.id);
        await loadData();
        showToast("Arsip laporan berhasil dihapus.", "success");
      },
      "Ya, Hapus",
      true
    );
  };

  const handlePrintPeriod = (period: string) => {
    setSelectedPeriod(period);
    setRoute("labarugi");
    showToast('Membuka dialog cetak — pilih "Simpan sebagai PDF".', "info");
    setTimeout(() => {
      window.print();
    }, 450);
  };

  if (loading) {
    return <div className="p-8 text-center text-brand-muted">Memuat arsip...</div>;
  }

  return (
    <div>
      <p className="text-brand-muted text-sm -mt-1 mb-5">
        Laporan yang pernah Anda arsipkan beserta seluruh periode yang tersedia.
      </p>

      {/* Laporan Terarsip */}
      <div className="bg-white rounded-smarta-lg p-5 sm:p-6 shadow-smarta1 border border-brand-line/40 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif font-bold text-lg text-[#111111]">
            Laporan Terarsip
          </h3>
          <span className="text-brand-muted text-xs">
            {archivedReports.length} laporan
          </span>
        </div>

        {archivedReports.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[13.5px] min-w-[640px]">
              <thead>
                <tr className="border-b border-brand-line">
                  <th className="text-left text-xs text-brand-muted uppercase py-2.5">
                    Periode
                  </th>
                  <th className="text-right text-xs text-brand-muted uppercase py-2.5">
                    Pendapatan
                  </th>
                  <th className="text-right text-xs text-brand-muted uppercase py-2.5">
                    Beban
                  </th>
                  <th className="text-right text-xs text-brand-muted uppercase py-2.5">
                    Laba
                  </th>
                  <th className="text-left text-xs text-brand-muted uppercase py-2.5">
                    Diarsipkan
                  </th>
                  <th className="text-center text-xs text-brand-muted uppercase py-2.5">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-line">
                {archivedReports.map((r) => {
                  const [ry, rm] = r.periode.split("-");
                  return (
                    <tr key={r.id} className="hover:bg-bg-app/40 transition-colors">
                      <td className="py-3 font-semibold text-[#111111]">
                        {MONTHS[+rm - 1]} {ry}
                      </td>
                      <td className="py-3 text-right text-brand-green font-medium">
                        {rp(r.pendapatan)}
                      </td>
                      <td className="py-3 text-right text-brand-red font-medium">
                        {rp(r.beban)}
                      </td>
                      <td
                        className={`py-3 text-right font-bold ${
                          r.laba >= 0 ? "text-brand-green" : "text-brand-red"
                        }`}
                      >
                        {(r.laba < 0 ? "− " : "") + rp(r.laba)}
                      </td>
                      <td className="py-3 text-brand-muted text-xs">
                        {fmtDateTime(r.createdAt)}
                      </td>
                      <td className="py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPeriod(r.periode);
                              setRoute("labarugi");
                            }}
                            className="text-xs font-semibold py-1.5 px-2.5 rounded-full border border-brand-line bg-white hover:border-brand-green text-[#111111] transition-all"
                          >
                            Buka
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePrintPeriod(r.periode)}
                            className="text-xs font-semibold py-1.5 px-2.5 rounded-full border border-brand-line bg-white hover:border-brand-green text-[#111111] transition-all"
                          >
                            Cetak / PDF
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteArchive(r)}
                            title="Hapus arsip"
                            className="w-7 h-7 rounded-lg border border-brand-line bg-white hover:border-brand-red hover:text-brand-red text-[#111111] grid place-items-center transition-all"
                          >
                            <Icon name="trash" size="sm" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            message="Belum ada laporan diarsipkan. Buka Laporan Laba Rugi lalu klik Arsipkan."
            showCta
            ctaText="Ke Laporan Laba Rugi"
            onCtaClick={() => setRoute("labarugi")}
          />
        )}
      </div>

      {/* Arsip Keuangan Bulan Sebelumnya */}
      <div className="bg-white rounded-smarta-lg p-5 sm:p-6 shadow-smarta1 border border-brand-line/40">
        <h3 className="font-serif font-bold text-lg text-[#111111] mb-4">
          Arsip Keuangan Bulan Sebelumnya
        </h3>

        {periods.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {periods.map((p) => {
              const [py, pm] = p.split("-");
              const pl = profitLoss(transactions, p);

              return (
                <div
                  key={p}
                  onClick={() => {
                    setSelectedPeriod(p);
                    setRoute("labarugi");
                  }}
                  className="border border-brand-line rounded-smarta-md p-3 px-3.5 flex items-center gap-3 cursor-pointer bg-white hover:border-brand-lime hover:shadow-smarta1 transition-all"
                >
                  <Icon name="calendar" className="text-brand-deep w-5 h-5" />
                  <div className="flex-1 min-w-0">
                    <b className="block text-sm text-[#111111] truncate">
                      {MONTHS[+pm - 1]}
                    </b>
                    <small className="text-brand-muted text-xs block truncate">
                      {py} • Laba {(pl.laba < 0 ? "− " : "") + rp(pl.laba)}
                    </small>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-6 text-center text-brand-muted text-sm">
            Belum ada periode transaksi.
          </div>
        )}
      </div>
    </div>
  );
};
