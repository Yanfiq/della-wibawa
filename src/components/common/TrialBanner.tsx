"use client";

import React from "react";
import { useApp } from "@/lib/context/AppContext";
import { authService } from "@/services/auth.service";
import { clamp, fmtDate } from "@/lib/utils";
import { TRIAL_DAYS } from "@/lib/constants";

export const TrialBanner: React.FC = () => {
  const { currentUser, setRoute } = useApp();

  if (!currentUser || currentUser.role === "admin") return null;

  const st = authService.getSubscriptionStatus(currentUser);

  if (st === "active") {
    return (
      <div className="bg-gradient-to-r from-brand-deep to-brand-green text-white rounded-smarta-lg p-4 px-5 flex items-center justify-between gap-3.5 flex-wrap mb-4.5 shadow-smarta1">
        <div className="flex-1 min-w-[240px]">
          <b className="text-[15px]">Langganan Aktif — {currentUser.plan === "pkg_6bulan" ? "Langganan 6 Bulan" : "Langganan"}</b>
          <p className="m-0 mt-0.5 text-[13px] opacity-90">
            Berlaku sampai {fmtDate((currentUser.subEnd || "").slice(0, 10))}. Semua fitur terbuka tanpa batas transaksi.
          </p>
        </div>
        <span className="inline-block text-[11.5px] font-semibold py-1 px-3 rounded-full bg-[#E7F4EA] text-brand-green">
          Aktif
        </span>
      </div>
    );
  }

  if (st === "expired") {
    return (
      <div className="bg-gradient-to-r from-[#8d322f] to-brand-red text-white rounded-smarta-lg p-4 px-5 flex items-center justify-between gap-3.5 flex-wrap mb-4.5 shadow-smarta1">
        <div className="flex-1 min-w-[240px]">
          <b className="text-[15px]">Trial 15 hari telah berakhir</b>
          <p className="m-0 mt-0.5 text-[13px] opacity-90">
            Berlangganan Rp51.000 per 6 bulan untuk melanjutkan pencatatan tanpa batas dan download laporan PDF.
          </p>
        </div>
        <button
          onClick={() => setRoute("paket")}
          className="bg-brand-gold text-[#3a2c00] font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-[#ffc93c] transition-all"
        >
          Berlangganan Sekarang
        </button>
      </div>
    );
  }

  const left = authService.getTrialDaysLeft(currentUser);
  const pct = clamp(Math.round((left / TRIAL_DAYS) * 100), 4, 100);

  return (
    <div className="bg-gradient-to-r from-brand-deep to-brand-green text-white rounded-smarta-lg p-4 px-5 flex items-center justify-between gap-3.5 flex-wrap mb-4.5 shadow-smarta1">
      <div className="flex-1 min-w-[240px]">
        <b className="text-[15px]">Masa Trial — sisa {left} hari</b>
        <p className="m-0 mt-0.5 text-[13px] opacity-90">
          Trial 15 hari berakhir {fmtDate(currentUser.trialEnd.slice(0, 10))}. Batas 100 transaksi selama trial.
        </p>
        <div className="h-2 rounded-full bg-brand-line overflow-hidden mt-2 max-w-[280px]">
          <i className="block h-full bg-brand-lime transition-all duration-300" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <button
        onClick={() => setRoute("paket")}
        className="bg-brand-gold text-[#3a2c00] font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-[#ffc93c] transition-all"
      >
        Lihat Paket
      </button>
    </div>
  );
};
