import type { Metadata } from "next";
import { Poppins, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/lib/context/AppContext";
import { ToastProvider } from "@/lib/context/ToastContext";
import { ToastContainer } from "@/components/common/ToastContainer";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { ChatBot } from "@/components/common/ChatBot";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SMARTA UMKM — Catat Keuangan, Tingkatkan Keuntungan",
  description:
    "SMARTA UMKM membantu pemilik usaha dagang & jasa mencatat keuangan, memisahkan keuangan pribadi dari usaha, dan menganalisa laba rugi secara otomatis.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${poppins.variable} ${playfair.variable} scroll-smooth`}>
      <body className="antialiased min-h-screen bg-bg-app text-[#111111]">
        <ToastProvider>
          <AppProvider>
            {children}
            <ToastContainer />
            <ConfirmModal />
            <ChatBot />
          </AppProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
