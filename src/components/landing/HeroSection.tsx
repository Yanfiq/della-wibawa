"use client";

import React from "react";
import { useApp } from "@/lib/context/AppContext";
import { authService } from "@/services/auth.service";
import { useToast } from "@/lib/context/ToastContext";

interface HeroSectionProps {
  tagline?: string;
  sub?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  tagline = "Catat Keuangan, Tingkatkan Keuntungan",
  sub = "SMARTA UMKM membantu pemilik usaha dagang & jasa mencatat keuangan, memisahkan keuangan pribadi dari usaha, dan menganalisa laba rugi secara otomatis.",
}) => {
  const { openAuth, refreshUser, enterApp } = useApp();
  const { showToast } = useToast();

  const handleDemoLogin = async () => {
    try {
      await authService.loginDemo();
      await refreshUser();
      enterApp();
      showToast("Masuk sebagai akun demo.", "info");
    } catch {
      showToast("Gagal masuk akun demo", "error");
    }
  };

  return (
    <header className="relative pt-11 pb-16 overflow-hidden bg-dark-green text-white">
      {/* Background radial glow effects */}
      <div className="absolute w-[760px] h-[760px] rounded-full -right-[260px] -top-[160px] bg-[radial-gradient(circle_at_30%_30%,rgba(154,205,50,0.20),transparent_62%)] pointer-events-none" />
      <div className="absolute w-[420px] h-[420px] rounded-full -left-[180px] -bottom-[200px] bg-[radial-gradient(circle_at_50%_50%,rgba(31,122,76,0.35),transparent_65%)] pointer-events-none" />

      <div className="max-w-[1180px] mx-auto px-5 relative">
        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-6.5 items-stretch">
          {/* Main Hero Card */}
          <div className="bg-gradient-to-br from-brand-green via-[#63a83f] to-brand-lime rounded-smarta-xl p-8 sm:p-10 text-[#0d2b1b] flex flex-col justify-between shadow-smarta2">
            <div>
              <h1 className="font-serif text-3xl sm:text-[44px] font-extrabold leading-[1.12]">
                Catat Keuangan,
                <span className="text-brand-gold block">Tingkatkan</span>
                <span className="text-brand-gold block">Keuntungan</span>
              </h1>
              <p className="my-4 sm:my-6 max-w-[460px] text-[#123a26] text-[15px] leading-relaxed">
                {sub}
              </p>
            </div>
            <div className="flex flex-wrap gap-3 mt-4">
              <button
                onClick={() => openAuth("register")}
                className="bg-brand-gold text-[#3a2c00] font-semibold text-sm px-6 py-3 rounded-full hover:bg-[#ffc93c] transition-all shadow-sm active:scale-95"
              >
                UJI COBA GRATIS 15 HARI
              </button>
              <button
                onClick={handleDemoLogin}
                className="border border-[#0d2b1b] text-[#0d2b1b] font-semibold text-sm px-6 py-3 rounded-full hover:bg-white/20 transition-all active:scale-95"
              >
                LIHAT DEMO
              </button>
            </div>
          </div>

          {/* Side Mockup Card */}
          <div className="bg-white/[0.09] border border-white/[0.14] rounded-smarta-xl p-5 flex flex-col justify-between">
            <div>
              <span className="inline-block bg-brand-gold text-[#3a2c00] font-bold text-xs tracking-wider px-3.5 py-1.5 rounded-lg mb-3.5">
                TAMPILAN APLIKASI
              </span>
              <div className="bg-white rounded-smarta-lg p-3 text-[#111111] shadow-smarta2">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <i className="w-2.5 h-2.5 rounded-full bg-brand-line block" />
                  <i className="w-2.5 h-2.5 rounded-full bg-brand-line block" />
                  <i className="w-2.5 h-2.5 rounded-full bg-brand-line block" />
                  <b className="text-[11px] ml-1.5 text-brand-muted">Beranda — SMARTA UMKM</b>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-bg-app rounded-xl p-2.5">
                    <span className="block text-[10px] text-brand-muted">Total Pemasukan</span>
                    <b className="text-[13px] text-brand-green">Rp 12.500.000</b>
                  </div>
                  <div className="bg-bg-app rounded-xl p-2.5">
                    <span className="block text-[10px] text-brand-muted">Total Pengeluaran</span>
                    <b className="text-[13px] text-brand-red">Rp 8.250.000</b>
                  </div>
                  <div className="bg-bg-app rounded-xl p-2.5">
                    <span className="block text-[10px] text-brand-muted">Laba Bersih</span>
                    <b className="text-[13px]">Rp 4.250.000</b>
                  </div>
                  <div className="bg-bg-app rounded-xl p-2.5">
                    <span className="block text-[10px] text-brand-muted">Total Transaksi</span>
                    <b className="text-[13px]">47</b>
                  </div>
                </div>

                <div className="flex items-end gap-1.5 h-[74px] mt-2.5 px-0.5">
                  <i className="flex-1 rounded-t bg-brand-deep" style={{ height: "62%" }} />
                  <i className="flex-1 rounded-t bg-brand-gold" style={{ height: "38%" }} />
                  <i className="flex-1 rounded-t bg-brand-deep" style={{ height: "80%" }} />
                  <i className="flex-1 rounded-t bg-brand-gold" style={{ height: "48%" }} />
                  <i className="flex-1 rounded-t bg-brand-deep" style={{ height: "55%" }} />
                  <i className="flex-1 rounded-t bg-brand-gold" style={{ height: "66%" }} />
                  <i className="flex-1 rounded-t bg-brand-deep" style={{ height: "92%" }} />
                  <i className="flex-1 rounded-t bg-brand-gold" style={{ height: "44%" }} />
                </div>

                <div className="flex gap-4 text-[11px] text-brand-muted mt-2.5 flex-wrap">
                  <span className="flex items-center">
                    <i className="w-2.5 h-2.5 rounded-[3px] inline-block mr-1.5 bg-brand-deep" />
                    Pemasukan
                  </span>
                  <span className="flex items-center">
                    <i className="w-2.5 h-2.5 rounded-[3px] inline-block mr-1.5 bg-brand-gold" />
                    Pengeluaran
                  </span>
                </div>
              </div>
            </div>
            <p className="text-[12.5px] text-white/80 mt-3.5 leading-relaxed">
              Semua angka pada dashboard dihitung otomatis dari transaksi yang Anda catat — tanpa rumus, tanpa keahlian akuntansi.
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
