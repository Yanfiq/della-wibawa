"use client";

import React from "react";
import { useApp } from "@/lib/context/AppContext";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";

export const AuthScreen: React.FC = () => {
  const { authMode, showLanding } = useApp();

  return (
    <div className="min-h-screen grid place-items-center p-4 sm:p-8 bg-[radial-gradient(900px_520px_at_20%_-10%,rgba(154,205,50,0.22),transparent_60%)] bg-dark-green text-[#111111]">
      <div className="w-full max-w-[470px] bg-white rounded-smarta-xl p-6 sm:p-8 shadow-smarta2 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between gap-3">
          <div className="font-serif text-[22px] tracking-wide text-brand-deep font-bold">
            SMARTA
          </div>
          <button
            type="button"
            onClick={showLanding}
            className="text-xs sm:text-sm font-semibold py-1.5 px-3 rounded-full border border-brand-line bg-white hover:border-brand-green hover:text-brand-deep text-[#111111] transition-all"
          >
            ← Beranda
          </button>
        </div>

        {authMode === "login" ? <LoginForm /> : <RegisterForm />}
      </div>
    </div>
  );
};
