"use client";

import React, { useEffect, useState } from "react";
import { useApp } from "@/lib/context/AppContext";
import { settingsService } from "@/services/settings.service";
import { transactionService } from "@/services/transaction.service";
import { packageService } from "@/services/package.service";
import { reportService } from "@/services/report.service";
import { authService } from "@/services/auth.service";
import { User, Transaction, SubscriptionPackage, ReportItem } from "@/types";
import { rp, totals } from "@/lib/utils";
import { Icon } from "@/components/common/Icons";

export const AdminDashboardView: React.FC = () => {
  const { setRoute } = useApp();

  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      settingsService.listAllUsers(),
      packageService.listAll(),
      // We can collect transactions & reports across users
      reportService.listArchived(""),
    ]).then(([allUsers, allPkgs]) => {
      setUsers(allUsers);
      setPackages(allPkgs);
      setLoading(false);
    });
  }, []);

  const trialCount = users.filter(
    (u) => authService.getSubscriptionStatus(u) === "trial"
  ).length;
  const activeCount = users.filter(
    (u) => authService.getSubscriptionStatus(u) === "active"
  ).length;
  const expiredCount = users.filter(
    (u) => authService.getSubscriptionStatus(u) === "expired"
  ).length;

  const revenue = users
    .filter((u) => authService.getSubscriptionStatus(u) === "active")
    .reduce((acc, u) => {
      const p = packages.find((x) => x.id === u.plan);
      return acc + (p ? p.harga : 0);
    }, 0);

  const recentUsers = users
    .slice()
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
    .slice(0, 6);

  if (loading) {
    return <div className="p-8 text-center text-brand-muted">Memuat dashboard admin...</div>;
  }

  return (
    <div>
      <p className="text-brand-muted text-sm -mt-1 mb-5">
        Ringkasan pengguna, langganan, dan aktivitas SMARTA UMKM.
      </p>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-smarta-lg p-4.5 shadow-smarta1 border border-brand-line/40">
          <div className="flex items-center gap-2 text-[13px] text-brand-muted font-medium">
            <Icon name="users" size="sm" />
            Total Pengguna
          </div>
          <div className="font-serif text-[27px] font-bold mt-2 leading-tight text-[#111111]">
            {users.length}
          </div>
          <div className="text-xs text-brand-muted mt-1">
            Terdaftar dalam sistem
          </div>
        </div>

        <div className="bg-white rounded-smarta-lg p-4.5 shadow-smarta1 border border-brand-line/40">
          <div className="flex items-center gap-2 text-[13px] text-brand-muted font-medium">
            <Icon name="card" size="sm" />
            Langganan Aktif
          </div>
          <div className="font-serif text-[27px] font-bold mt-2 leading-tight text-brand-green">
            {activeCount}
          </div>
          <div className="text-xs text-brand-muted mt-1">
            {trialCount} sedang trial
          </div>
        </div>

        <div className="bg-white rounded-smarta-lg p-4.5 shadow-smarta1 border border-brand-line/40">
          <div className="flex items-center gap-2 text-[13px] text-brand-muted font-medium">
            <Icon name="bell" size="sm" />
            Expired
          </div>
          <div className="font-serif text-[27px] font-bold mt-2 leading-tight text-brand-red">
            {expiredCount}
          </div>
          <div className="text-xs text-brand-muted mt-1">
            Perlu ditindaklanjuti
          </div>
        </div>

        <div className="bg-white rounded-smarta-lg p-4.5 shadow-smarta1 border border-brand-line/40">
          <div className="flex items-center gap-2 text-[13px] text-brand-muted font-medium">
            <Icon name="chart" size="sm" />
            Estimasi Pendapatan
          </div>
          <div className="font-serif text-[27px] font-bold mt-2 leading-tight text-[#111111]">
            {rp(revenue)}
          </div>
          <div className="text-xs text-brand-muted mt-1">
            Dari langganan aktif
          </div>
        </div>
      </div>

      {/* Split Section: Recent Users & Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-4 mt-4">
        {/* Recent Users */}
        <div className="bg-white rounded-smarta-lg p-5 sm:p-6 shadow-smarta1 border border-brand-line/40">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base text-[#111111]">
              Pengguna Terbaru
            </h3>
            <button
              type="button"
              onClick={() => setRoute("adminUsers")}
              className="text-xs font-semibold py-1.5 px-3 rounded-full border border-brand-line bg-white hover:border-brand-green text-[#111111] transition-all"
            >
              Kelola Semua
            </button>
          </div>

          <div className="divide-y divide-brand-line">
            {recentUsers.map((u) => {
              const status = authService.getSubscriptionStatus(u);
              return (
                <div key={u.id} className="flex items-center gap-3 py-3">
                  <div className="w-[38px] h-[38px] rounded-xl bg-[#E7F4EA] text-brand-green grid place-items-center shrink-0">
                    <Icon name="person" size="sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <b className="text-sm block truncate text-[#111111]">{u.nama}</b>
                    <small className="text-brand-muted text-xs block truncate">
                      {u.namaUsaha || "-"} • {u.email}
                    </small>
                  </div>
                  <span
                    className={`inline-block text-[11px] font-semibold py-0.5 px-2.5 rounded-full ${
                      status === "active"
                        ? "bg-[#E7F4EA] text-brand-green"
                        : status === "trial"
                        ? "bg-[#FDF3DA] text-[#8a6300]"
                        : "bg-[#FBEBEA] text-brand-red"
                    }`}
                  >
                    {status === "trial" ? "Trial" : status === "active" ? "Aktif" : "Expired"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-smarta-lg p-5 sm:p-6 shadow-smarta1 border border-brand-line/40 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-[#111111] mb-4">
              Distribusi Status
            </h3>

            <div className="space-y-4">
              {[
                { label: "Trial", count: trialCount, color: "bg-brand-gold" },
                { label: "Aktif", count: activeCount, color: "bg-brand-lime" },
                { label: "Expired", count: expiredCount, color: "bg-brand-red" },
              ].map((item, idx) => {
                const pct = users.length
                  ? Math.round((item.count / users.length) * 100)
                  : 0;
                return (
                  <div key={idx}>
                    <div className="flex justify-between text-xs sm:text-[13px] mb-1.5">
                      <b className="text-[#111111]">{item.label}</b>
                      <span className="text-brand-muted">
                        {item.count} pengguna ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-[#EDF1EC] overflow-hidden">
                      <div
                        className={`h-full ${item.color}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="divide-y divide-brand-line text-xs sm:text-[13px] mt-6 pt-2 border-t border-brand-line">
            <div className="flex justify-between py-2">
              <b className="text-brand-muted">Paket Tersedia</b>
              <span className="font-semibold text-[#111111]">
                {packages.filter((p) => p.aktif).length} aktif
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
