"use client";

import React, { useRef, useEffect } from "react";
import { useApp } from "@/lib/context/AppContext";
import { fmtDateTime } from "@/lib/utils";
import { useToast } from "@/lib/context/ToastContext";

export const NotificationPanel: React.FC = () => {
  const {
    isNotifOpen,
    setIsNotifOpen,
    notifications,
    markAllNotificationsRead,
    clearNotifications,
  } = useApp();
  const { showToast } = useToast();
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isNotifOpen) {
      markAllNotificationsRead();
    }
  }, [isNotifOpen, markAllNotificationsRead]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        !(e.target as Element).closest("#notifBtn")
      ) {
        setIsNotifOpen(false);
      }
    };
    if (isNotifOpen) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isNotifOpen, setIsNotifOpen]);

  if (!isNotifOpen) return null;

  return (
    <div
      ref={panelRef}
      className="absolute right-4 md:right-8 top-[68px] w-[min(330px,calc(100vw-32px))] bg-white rounded-smarta-lg shadow-smarta2 z-35 overflow-hidden border border-brand-line animate-in fade-in zoom-in-95 duration-150 no-print"
    >
      {notifications.length > 0 ? (
        <div className="max-h-[360px] overflow-y-auto divide-y divide-brand-line">
          {notifications.slice(0, 8).map((n) => (
            <div key={n.id} className="p-3 px-3.5 text-[13px] hover:bg-bg-app transition-colors">
              <b className="text-[#111111] block mb-0.5">{n.judul}</b>
              <small className="text-brand-muted block leading-relaxed">{n.isi}</small>
              <small className="text-brand-muted/80 block mt-1 text-[11px]">
                {fmtDateTime(n.ts)}
              </small>
            </div>
          ))}
          <div className="p-2.5 text-center bg-bg-app">
            <button
              type="button"
              onClick={async () => {
                await clearNotifications();
                setIsNotifOpen(false);
                showToast("Notifikasi dibersihkan.", "info");
              }}
              className="text-xs font-semibold py-1.5 px-3 rounded-full border border-brand-line bg-white hover:border-brand-green text-[#111111] transition-all"
            >
              Bersihkan semua
            </button>
          </div>
        </div>
      ) : (
        <div className="p-6 text-center text-brand-muted text-[13px]">
          Belum ada notifikasi.
        </div>
      )}
    </div>
  );
};
