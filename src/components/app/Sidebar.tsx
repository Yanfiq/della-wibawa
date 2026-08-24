"use client";

import React from "react";
import { useApp } from "@/lib/context/AppContext";
import { Icon } from "../common/Icons";
import { authService } from "@/services/auth.service";
import { useToast } from "@/lib/context/ToastContext";
import { ActiveRoute } from "@/types";

interface NavGroup {
  sec: string;
  items: { k: ActiveRoute; t: string; i: string }[];
}

const USER_NAV: NavGroup[] = [
  {
    sec: "Menu Utama",
    items: [
      { k: "beranda", t: "Beranda", i: "home" },
      { k: "tambah", t: "Tambah Transaksi", i: "plus" },
      { k: "labarugi", t: "Laporan Laba Rugi", i: "chart" },
    ],
  },
  {
    sec: "Keuangan",
    items: [
      { k: "usaha", t: "Keuangan Usaha", i: "store" },
      { k: "pribadi", t: "Keuangan Pribadi", i: "wallet" },
      { k: "riwayat", t: "Riwayat Transaksi", i: "history" },
      { k: "kategori", t: "Kategori", i: "tag" },
    ],
  },
  {
    sec: "Laporan",
    items: [
      { k: "bulanan", t: "Laporan Bulanan", i: "calendar" },
      { k: "tahunan", t: "Laporan Tahunan", i: "calchart" },
      { k: "arsip", t: "Arsip Laporan", i: "folder" },
    ],
  },
  {
    sec: "Pengaturan",
    items: [
      { k: "paket", t: "Paket Langganan", i: "card" },
      { k: "setelan", t: "Setelan", i: "settings" },
      { k: "bantuanApp", t: "Bantuan", i: "doc" },
    ],
  },
];

const ADMIN_NAV: NavGroup[] = [
  {
    sec: "Admin",
    items: [
      { k: "admin", t: "Dashboard Admin", i: "chart" },
      { k: "adminUsers", t: "Manajemen User", i: "users" },
      { k: "adminPaket", t: "Manajemen Paket", i: "box" },
      { k: "adminPembayaran", t: "Pembayaran", i: "inbox" },
      { k: "adminKonten", t: "Manajemen Konten", i: "content" },
    ],
  },
  {
    sec: "Akun",
    items: [{ k: "setelan", t: "Setelan", i: "settings" }],
  },
];

export const Sidebar: React.FC = () => {
  const {
    currentUser,
    currentProfile,
    route,
    setRoute,
    isSidebarOpen,
    setIsSidebarOpen,
    showLanding,
    refreshUser,
    showConfirm,
  } = useApp();
  const { showToast } = useToast();

  const isAdmin = currentUser?.role === "admin";
  const navGroups = isAdmin ? ADMIN_NAV : USER_NAV;

  const handleLogout = () => {
    showConfirm(
      "Keluar dari akun?",
      "Anda akan kembali ke halaman beranda. Data tetap tersimpan di browser ini.",
      async () => {
        await authService.logout();
        await refreshUser();
        showLanding();
        showToast("Anda telah keluar.", "info");
      },
      "Ya, Keluar",
      true
    );
  };

  const userInitials = currentUser?.nama
    ? currentUser.nama
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  return (
    <>
      {/* Mobile Scrim */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/45 z-45 md:hidden backdrop-blur-[1px] no-print"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed top-0 left-0 w-[260px] md:w-[260px] lg:w-[260px] h-screen bg-dark-green text-white flex flex-col z-50 transition-transform duration-200 ease-out no-print ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } shadow-smarta2`}
      >
        {/* Header */}
        <div className="p-4.5 pb-3 shrink-0">
          <div className="font-serif text-xl tracking-[0.04em] flex items-center gap-1.5 text-white">
            SMARTA <em className="text-brand-gold not-italic font-sans text-[17px] font-bold">UMKM</em>
          </div>
          <hr className="border-0 border-t border-white/[0.18] mt-3" />
        </div>

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto px-3 pb-3 space-y-1 scrollbar-thin">
          {navGroups.map((g, gIdx) => (
            <div key={gIdx}>
              <div
                className={`text-[11px] tracking-[0.1em] text-white/55 font-semibold px-2.5 uppercase ${
                  gIdx === 0 ? "mt-1.5 mb-1.5" : "mt-4.5 mb-1.5"
                }`}
              >
                {g.sec}
              </div>
              {g.items.map((it) => {
                const isActive = route === it.k;
                return (
                  <button
                    key={it.k}
                    onClick={() => setRoute(it.k)}
                    className={`w-full flex items-center gap-2.5 h-[42px] px-3 rounded-xl text-left text-sm font-medium transition-all mb-1 cursor-pointer ${
                      isActive
                        ? "bg-brand-green text-white font-semibold shadow-sm"
                        : "text-white/85 hover:bg-white/[0.09] hover:text-white"
                    }`}
                  >
                    <Icon name={it.i} className="opacity-90 w-5 h-5" />
                    <span className="truncate uppercase">{it.t}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer User Info */}
        <div className="shrink-0 border-t border-white/15 p-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-[42px] h-[42px] rounded-full bg-brand-gold text-[#3a2c00] font-bold grid place-items-center shrink-0 text-sm">
              {userInitials}
            </div>
            <div className="flex-1 min-w-0">
              <b className="text-[13.5px] block truncate text-white">
                {currentUser?.nama || "Pengguna"}
              </b>
              <span className="text-[11.5px] text-white/65 block truncate">
                {isAdmin
                  ? "Administrator"
                  : currentProfile?.namaUsaha || currentUser?.namaUsaha || "Usaha Anda"}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="mt-2.5 h-10 w-full rounded-xl border border-white/35 bg-transparent hover:bg-brand-red hover:border-transparent text-white font-semibold text-[13.5px] flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <Icon name="logout" size="sm" />
            Keluar
          </button>
        </div>
      </aside>
    </>
  );
};
