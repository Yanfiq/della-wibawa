"use client";

import React from "react";
import { Icon } from "./Icons";
import { useApp } from "@/lib/context/AppContext";

interface EmptyStateProps {
  message: string;
  showCta?: boolean;
  ctaText?: string;
  onCtaClick?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  message,
  showCta = false,
  ctaText = "+ Tambah Transaksi",
  onCtaClick,
}) => {
  const { setRoute } = useApp();

  const handleCta = () => {
    if (onCtaClick) {
      onCtaClick();
    } else {
      setRoute("tambah");
    }
  };

  return (
    <div className="text-center py-10 px-4 text-brand-muted flex flex-col items-center justify-center">
      <Icon name="inbox" className="w-11 h-11 mb-3 stroke-brand-lime" />
      <p className="text-sm mb-4 max-w-md">{message}</p>
      {showCta && (
        <button
          onClick={handleCta}
          className="inline-flex items-center justify-center gap-2 rounded-smarta-md bg-brand-deep hover:bg-brand-green text-white font-semibold text-sm px-5 py-2.5 transition-all shadow-sm"
        >
          {ctaText}
        </button>
      )}
    </div>
  );
};
