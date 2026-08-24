"use client";

import React from "react";
import { useApp } from "@/lib/context/AppContext";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { ActiveRoute } from "@/types";

// User Views
import { BerandaView } from "./views/BerandaView";
import { TambahTransaksiView } from "./views/TambahTransaksiView";
import { LabaRugiView } from "./views/LabaRugiView";
import { KeuanganView } from "./views/KeuanganView";
import { RiwayatView } from "./views/RiwayatView";
import { KategoriView } from "./views/KategoriView";
import { BulananView } from "./views/BulananView";
import { TahunanView } from "./views/TahunanView";
import { ArsipView } from "./views/ArsipView";
import { PaketView } from "./views/PaketView";
import { SetelanView } from "./views/SetelanView";
import { BantuanAppView } from "./views/BantuanAppView";

// Admin Views
import { AdminDashboardView } from "./admin/AdminDashboardView";
import { AdminUsersView } from "./admin/AdminUsersView";
import { AdminPaketView } from "./admin/AdminPaketView";
import { AdminPembayaranView } from "./admin/AdminPembayaranView";
import { AdminKontenView } from "./admin/AdminKontenView";

const ROUTE_TITLES: Record<ActiveRoute, string> = {
  beranda: "Beranda",
  tambah: "Tambah Transaksi",
  labarugi: "Laporan Laba Rugi",
  usaha: "Keuangan Usaha",
  pribadi: "Keuangan Pribadi",
  riwayat: "Riwayat Transaksi",
  kategori: "Kategori",
  bulanan: "Laporan Bulanan",
  tahunan: "Laporan Tahunan",
  arsip: "Arsip Laporan",
  paket: "Paket Langganan",
  setelan: "Setelan",
  bantuanApp: "Bantuan",
  admin: "Dashboard Admin",
  adminUsers: "Manajemen User",
  adminPaket: "Manajemen Paket",
  adminPembayaran: "Permintaan Pembayaran",
  adminKonten: "Manajemen Konten",
};

export const AppLayout: React.FC = () => {
  const { route, currentUser } = useApp();

  const title = ROUTE_TITLES[route] || "SMARTA UMKM";

  const renderCurrentView = () => {
    switch (route) {
      case "beranda":
        return <BerandaView />;
      case "tambah":
        return <TambahTransaksiView />;
      case "labarugi":
        return <LabaRugiView />;
      case "usaha":
        return <KeuanganView accountType="usaha" />;
      case "pribadi":
        return <KeuanganView accountType="pribadi" />;
      case "riwayat":
        return <RiwayatView />;
      case "kategori":
        return <KategoriView />;
      case "bulanan":
        return <BulananView />;
      case "tahunan":
        return <TahunanView />;
      case "arsip":
        return <ArsipView />;
      case "paket":
        return <PaketView />;
      case "setelan":
        return <SetelanView />;
      case "bantuanApp":
        return <BantuanAppView />;
      case "admin":
        return <AdminDashboardView />;
      case "adminUsers":
        return <AdminUsersView />;
      case "adminPaket":
        return <AdminPaketView />;
      case "adminPembayaran":
        return <AdminPembayaranView />;
      case "adminKonten":
        return <AdminKontenView />;
      default:
        return currentUser?.role === "admin" ? (
          <AdminDashboardView />
        ) : (
          <BerandaView />
        );
    }
  };

  return (
    <div className="min-h-screen bg-bg-app flex flex-col">
      <Sidebar />
      <div className="md:ml-[260px] min-h-screen flex flex-col transition-all">
        <Topbar title={title} />
        <main className="p-4 sm:p-7 md:p-8 flex-1">{renderCurrentView()}</main>
      </div>
    </div>
  );
};
