"use client";

import React from "react";
import { useToast } from "@/lib/context/ToastContext";

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-[min(360px,calc(100vw-32px))] pointer-events-none">
      {toasts.map((toast) => {
        let borderClass = "border-l-brand-green";
        if (toast.type === "error") borderClass = "border-l-brand-red";
        if (toast.type === "info") borderClass = "border-l-brand-gold";

        return (
          <div
            key={toast.id}
            onClick={() => removeToast(toast.id)}
            role="status"
            className={`pointer-events-auto cursor-pointer bg-white border-l-4 ${borderClass} rounded-smarta-md py-3 px-4 shadow-smarta2 text-[13.5px] text-[#111111] animate-in fade-in slide-in-from-right-5 duration-200 transition-all`}
          >
            {toast.message}
          </div>
        );
      })}
    </div>
  );
};
