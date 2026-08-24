"use client";

import React from "react";
import { useApp } from "@/lib/context/AppContext";
import { Icon } from "../common/Icons";
import { NotificationPanel } from "./NotificationPanel";

interface TopbarProps {
  title: string;
}

export const Topbar: React.FC<TopbarProps> = ({ title }) => {
  const {
    setIsSidebarOpen,
    isNotifOpen,
    setIsNotifOpen,
    unreadNotifCount,
    setRoute,
    setEditingTxId,
    currentUser,
  } = useApp();

  const isAdmin = currentUser?.role === "admin";

  return (
    <div className="bg-white rounded-b-smarta-xl px-4 sm:px-8 py-3.5 sm:py-4 flex items-center gap-3.5 shadow-smarta1 sticky top-0 z-30 no-print">
      {/* Mobile Burger */}
      <button
        type="button"
        onClick={() => setIsSidebarOpen(true)}
        className="md:hidden bg-transparent border border-brand-line rounded-xl p-2 cursor-pointer text-[#111111] hover:border-brand-green"
        aria-label="Buka menu"
      >
        <svg className="w-5 h-5 stroke-current fill-none stroke-[1.8]" viewBox="0 0 24 24">
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      </button>

      {/* Page Title */}
      <h1 className="flex-1 min-w-0 font-serif text-xl sm:text-[29px] font-bold leading-tight truncate text-[#111111]">
        {title}
      </h1>

      {/* Notification Bell */}
      <button
        id="notifBtn"
        type="button"
        onClick={() => setIsNotifOpen(!isNotifOpen)}
        className="w-[38px] h-[38px] rounded-smarta-md border border-brand-line bg-white hover:border-brand-green hover:text-brand-deep cursor-pointer relative grid place-items-center transition-all text-[#111111]"
        aria-label="Notifikasi"
      >
        <Icon name="bell" className="w-5 h-5" />
        {unreadNotifCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[17px] h-[17px] px-1 rounded-full bg-brand-red text-white text-[10px] font-bold grid place-items-center">
            {unreadNotifCount}
          </span>
        )}
      </button>

      {/* Quick Add Button (Users only) */}
      {!isAdmin && (
        <button
          type="button"
          onClick={() => {
            setEditingTxId(null);
            setRoute("tambah");
          }}
          className="rounded-smarta-md border border-brand-line bg-white hover:border-brand-green hover:text-brand-deep text-[#111111] font-semibold text-sm px-3.5 py-2 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
        >
          <Icon name="plus" size="sm" />
          <span className="hidden sm:inline">TAMBAH TRANSAKSI</span>
        </button>
      )}

      {/* Notification Floating Panel */}
      <NotificationPanel />
    </div>
  );
};
