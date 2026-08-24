"use client";

import React from "react";
import { useApp } from "@/lib/context/AppContext";
import { Modal } from "./Modal";

export const ConfirmModal: React.FC = () => {
  const { confirmDialog, hideConfirm } = useApp();

  if (!confirmDialog.isOpen) return null;

  return (
    <Modal isOpen={confirmDialog.isOpen} onClose={hideConfirm} title={confirmDialog.title}>
      <p className="text-brand-muted text-sm mb-6 leading-relaxed">
        {confirmDialog.body}
      </p>
      <div className="flex gap-2.5 justify-end flex-wrap">
        <button
          type="button"
          onClick={hideConfirm}
          className="px-4 py-2 text-sm font-semibold rounded-full border border-brand-line bg-white hover:border-brand-green hover:text-brand-deep text-[#111111] transition-all"
        >
          Batal
        </button>
        <button
          type="button"
          onClick={() => {
            hideConfirm();
            confirmDialog.onConfirm();
          }}
          className={`px-5 py-2 text-sm font-semibold rounded-full text-white transition-all ${
            confirmDialog.isDanger
              ? "bg-brand-red hover:bg-[#c9433f]"
              : "bg-brand-deep hover:bg-brand-green"
          }`}
        >
          {confirmDialog.confirmLabel || "Ya, Lanjutkan"}
        </button>
      </div>
    </Modal>
  );
};
