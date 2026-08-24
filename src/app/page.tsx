"use client";

import React, { useEffect, useState } from "react";
import { useApp } from "@/lib/context/AppContext";
import { LandingView } from "@/components/landing/LandingView";
import { AuthScreen } from "@/components/auth/AuthScreen";
import { AppLayout } from "@/components/app/AppLayout";

export default function Home() {
  const { screen, currentUser, setScreen } = useApp();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync initial screen if user is already logged in
  useEffect(() => {
    if (mounted) {
      if (currentUser) {
        setScreen("app");
      }
    }
  }, [mounted, currentUser, setScreen]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-dark-green flex items-center justify-center text-white">
        <div className="font-serif text-2xl font-bold tracking-wider animate-pulse">
          SMARTA UMKM
        </div>
      </div>
    );
  }

  if (screen === "auth") {
    return <AuthScreen />;
  }

  if (screen === "app" && currentUser) {
    return <AppLayout />;
  }

  return <LandingView />;
}
