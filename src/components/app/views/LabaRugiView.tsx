"use client";

import React, { useEffect, useState } from "react";
import { useApp } from "@/lib/context/AppContext";
import { transactionService } from "@/services/transaction.service";
import { reportService } from "@/services/report.service";
import { useToast } from "@/lib/context/ToastContext";
import { Transaction } from "@/types";
import { MONTHS } from "@/lib/constants";
import {
  profitLoss,
  interpret,
  rp,
  ym,
  todayISO,
  fmtDateTime,
} from "@/lib/utils";
import { Icon } from "@/components/common/Icons";

export const LabaRugiView: React.FC = () => {
  const {
    currentUser,
    currentProfile,
    selectedPeriod,
    setSelectedPeriod,
  } = useApp();
  const { showToast } = useToast();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isArchived, setIsArchived] = useState(false);
  const [loading, setLoading] = useState(true);

  const p = selectedPeriod;
  const [y, m] = p.split("-").map(Number);
  const prevDate = new Date(y, m - 2, 1);
  const prevP = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}`;

  const loadData = async () => {
    if (!currentUser) return;
    const [txs, arch] = await Promise.all([
      transactionService.listByUser(currentUser.id),
      reportService.isArchived(currentUser.id, p),
    ]);
    setTransactions(txs);
    setIsArchived(arch);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [currentUser, p]);

  const pl = profitLoss(transactions, p);
  const prevPl = profitLoss(transactions, prevP);
  const itp = interpret(pl, prevPl);

  const handleArchive = async () => {
    if (!currentUser) return;
    try {
      await reportService.archive(currentUser.id, p);
      setIsArchived(true);
      showToast(`Laporan ${p} berhasil diarsipkan.`, "success");
    } catch {
      showToast("Gagal mengarsipkan laporan.", "error");
    }
  };

  const handlePrint = () => {
    showToast('Membuka dialog cetak — pilih "Simpan sebagai PDF".', "info");
    setTimeout(() => {
      window.print();
    }, 350);
  };

  const monthOptionsSet = new Set(transactions.map((t) => ym(t.tanggal)));
  monthOptionsSet.add(todayISO().slice(0, 7));
  const monthOptions = Array.from(monthOptionsSet).sort().reverse();

  if (loading) {
    return <div className="p-8 text-center text-brand-muted">Memuat laporan...</div>;
  }

  const renderPLTable = () => {
    const renderRows = (
      arr: { nama: string; nilai: number }[],
      toneClass: string
    ) => {
      const activeRows = arr.filter((r) => r.nilai > 0);
      if (activeRows.length === 0) {
        return (
          <tr>
            <td className="pl-6.5 text-brand-muted py-2.5">Belum ada catatan</td>
            <td className="text-right text-brand-muted py-2.5">Rp 0</td>
          </tr>
        );
      }
      return activeRows.map((r, i) => (
        <tr key={i} className="border-b border-brand-line/60">
          <td className="pl-6.5 py-2.5 text-[#111111]">{r.nama}</td>
          <td className={`text-right py-2.5 font-medium ${toneClass}`}>
            {rp(r.nilai)}
          </td>
        </tr>
      ));
    };

    return (
      <>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[13.5px] min-w-[500px]">
            <thead>
              <tr className="border-b border-brand-line">
                <th className="text-left text-xs text-brand-muted uppercase py-2.5">
                  Keterangan
                </th>
                <th className="text-right text-xs text-brand-muted uppercase py-2.5">
                  Jumlah
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-line">
              <tr className="bg-bg-app/40 font-bold">
                <td className="py-2.5 text-[#111111]">A. PENDAPATAN</td>
                <td />
              </tr>
              {renderRows(pl.pendapatan, "text-brand-green")}
              <tr className="font-bold border-t border-brand-line">
                <td className="py-2.5 text-[#111111]">Total Pendapatan</td>
                <td className="text-right py-2.5 text-brand-deep">
                  {rp(pl.totalPendapatan)}
                </td>
              </tr>

              <tr className="bg-bg-app/40 font-bold">
                <td className="py-2.5 text-[#111111]">B. BEBAN USAHA</td>
                <td />
              </tr>
              {renderRows(pl.beban, "text-brand-red")}
              <tr className="font-bold border-t border-brand-line">
                <td className="py-2.5 text-[#111111]">Total Beban</td>
                <td className="text-right py-2.5 text-brand-red">
                  {rp(pl.totalBeban)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Laba Bersih Total Bar */}
        <div className="grid grid-cols-2 gap-3.5 mt-4">
          <div className="bg-brand-deep text-white rounded-smarta-md p-3.5 px-4.5 font-bold">
            LABA BERSIH
          </div>
          <div className="bg-brand-deep text-white rounded-smarta-md p-3.5 px-4.5 font-bold text-right">
            {(pl.laba < 0 ? "− " : "") + rp(pl.laba)}
          </div>
        </div>
      </>
    );
  };

  return (
    <div>
      {/* Controls */}
      <div className="flex items-center justify-between gap-3 flex-wrap mb-4 no-print">
        <p className="text-brand-muted text-sm m-0">
          Laporan laba rugi bulanan usaha Anda (transaksi pribadi tidak dihitung).
        </p>
        <div className="flex items-center gap-2.5 flex-wrap">
          <select
            value={p}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border border-brand-line rounded-smarta-md py-2 px-3 bg-white text-sm outline-none focus:border-brand-green max-w-[180px]"
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
          <button
            type="button"
            onClick={handleArchive}
            disabled={isArchived}
            className="rounded-smarta-md border border-brand-line bg-white hover:border-brand-green disabled:opacity-50 text-[#111111] font-semibold text-xs sm:text-sm px-3.5 py-2 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Icon name="folder" size="sm" />
            {isArchived ? "Sudah Diarsipkan" : "Arsipkan"}
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="rounded-smarta-md bg-brand-deep hover:bg-brand-green text-white font-semibold text-xs sm:text-sm px-4 py-2 flex items-center gap-2 transition-all shadow-sm cursor-pointer"
          >
            <Icon name="download" size="sm" />
            Download PDF
          </button>
        </div>
      </div>

      {/* Screen View */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_1fr] gap-4 no-print">
        {/* Table Card */}
        <div className="bg-white rounded-smarta-lg p-5 sm:p-6 shadow-smarta1 border border-brand-line/40">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif font-bold text-lg sm:text-xl text-[#111111]">
              Laporan Laba Rugi — {MONTHS[+m - 1]} {y}
            </h3>
            <small className="text-brand-muted truncate text-xs">
              {currentProfile?.namaUsaha || currentUser?.namaUsaha}
            </small>
          </div>
          {renderPLTable()}
          <p className="text-brand-muted text-xs mt-4 mb-0">
            Dihitung otomatis dari {pl.jumlahTransaksi} transaksi usaha pada periode ini.
          </p>
        </div>

        {/* Interpretation Box */}
        <div className="bg-[#E6F0DC] border border-[#CBE0B6] rounded-smarta-lg p-5.5 text-[#254032] flex flex-col justify-between">
          <div>
            <span className="bg-brand-deep text-white rounded-full py-1.5 px-3.5 text-xs font-semibold inline-block">
              {itp.judul}
            </span>
            <p className="text-[13.5px] mt-3.5 mb-2 leading-relaxed text-[#254032]">
              {itp.kalimat}
            </p>
            <ul className="pl-4.5 my-3 text-xs sm:text-[13px] space-y-2 list-disc text-[#254032]">
              {itp.poin.map((point, idx) => (
                <li key={idx} className="leading-relaxed">
                  {point}
                </li>
              ))}
            </ul>
          </div>
          <div className="text-[11.5px] text-brand-muted mt-4 border-t border-[#CBE0B6]/60 pt-3">
            Interpretasi dianalisis otomatis berdasarkan riwayat pendapatan dan beban usaha.
          </div>
        </div>
      </div>

      {/* Printable Document (Visible only when window.print() is triggered) */}
      <div id="printArea" className="hidden print:block text-black bg-white">
        <div className="text-xs max-w-2xl mx-auto py-4">
          <h1 className="font-serif text-2xl font-bold text-black mb-1">
            SMARTA UMKM
          </h1>
          <p className="m-0.5 text-sm">
            <b>{currentProfile?.namaUsaha || currentUser?.namaUsaha}</b> —{" "}
            {currentProfile?.jenisUsaha || currentUser?.jenisUsaha}
          </p>
          <p className="m-0.5 text-xs">{currentProfile?.alamat || "Surakarta, Jawa Tengah"}</p>
          <p className="m-0.5 text-xs font-semibold text-gray-700">
            Laporan Laba Rugi — Periode {MONTHS[+m - 1]} {y}
          </p>
          <hr className="my-3 border-gray-300" />
          {renderPLTable()}
          <h3 className="text-sm font-bold mt-4 mb-1">
            Interpretasi Kondisi Keuangan — {itp.judul}
          </h3>
          <p className="text-xs mb-2">{itp.kalimat}</p>
          <ul className="pl-4 text-xs space-y-1 list-disc">
            {itp.poin.map((point, idx) => (
              <li key={idx}>{point}</li>
            ))}
          </ul>
          <p className="mt-6 text-[10px] text-gray-500 border-t border-gray-200 pt-2">
            Dicetak {fmtDateTime(Date.now())} melalui SMARTA UMKM — smartaumkm@gmail.com
          </p>
        </div>
      </div>
    </div>
  );
};
