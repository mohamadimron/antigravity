import React from "react";
import { getDashboardStats } from "@/app/actions/dashboard";
import DashboardCharts from "@/app/components/DashboardCharts";
import { 
  Users, 
  ShieldCheck, 
  CheckCircle2, 
  MessageSquare,
  Clock,
  Activity,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ringkasan - Dashboard Admin OTP WhatsApp",
  description: "Halaman utama dashboard admin yang memuat data statistik, grafik trafik pengiriman, dan log aktivitas terbaru.",
};

// Date formatter utility helper
function formatIndoDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }) + " WIB";
  } catch (e) {
    return isoString;
  }
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  const cards = [
    {
      title: "Total Pengguna",
      value: stats.totalUsers,
      desc: "Terdaftar di database SQLite",
      icon: Users,
      color: "text-blue-600 dark:text-blue-400",
      iconBg: "from-blue-500/20 to-blue-600/5 border-blue-500/20",
      hoverGlow: "hover:shadow-blue-500/5",
    },
    {
      title: "Pengguna Aktif",
      value: stats.activeUsers,
      desc: "Status akun aktif saat ini",
      icon: ShieldCheck,
      color: "text-emerald-600 dark:text-emerald-400",
      iconBg: "from-emerald-500/20 to-emerald-600/5 border-emerald-500/20",
      hoverGlow: "hover:shadow-emerald-500/5",
    },
    {
      title: "Rasio Sukses OTP",
      value: `${stats.successRate}%`,
      desc: "Tingkat keberhasilan kirim",
      icon: CheckCircle2,
      color: "text-indigo-600 dark:text-indigo-400",
      iconBg: "from-indigo-500/20 to-indigo-600/5 border-indigo-500/20",
      hoverGlow: "hover:shadow-indigo-500/5",
    },
    {
      title: "Total Log OTP",
      value: stats.totalOtpRequests,
      desc: "Transaksi OTP & Login",
      icon: MessageSquare,
      color: "text-purple-600 dark:text-purple-400",
      iconBg: "from-purple-500/20 to-purple-600/5 border-purple-500/20",
      hoverGlow: "hover:shadow-purple-500/5",
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in" id="dashboard-summary">
      
      {/* Welcome & Time Header */}
      <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Selamat Datang di Admin Panel
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5 sm:mt-1">
            Pantau statistik verifikasi WhatsApp OTP dan kelola database user SQLite Anda.
          </p>
        </div>
        
        {/* Real-time system state status card */}
        <div className="flex items-center gap-2.5 px-4 py-2.5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 rounded-xl text-xs font-semibold shadow-sm w-full sm:w-fit">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-zinc-500">Sistem Operasional:</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/25">Dummy Active</span>
        </div>
      </div>

      {/* 4 Stats Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className={`animate-card-stagger bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 p-3.5 sm:p-5 rounded-2xl shadow-sm flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${card.hoverGlow}`}
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider leading-tight">
                  {card.title}
                </span>
                <div className={`h-7 w-7 sm:h-8 sm:w-8 rounded-lg flex items-center justify-center border bg-gradient-to-br ${card.iconBg} ${card.color}`}>
                  <Icon className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5" />
                </div>
              </div>
              <div className="mt-2.5 sm:mt-4">
                <span className="text-xl sm:text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
                  {card.value}
                </span>
                <span className="block text-[10px] sm:text-[11px] text-zinc-400 mt-1 sm:mt-1.5 font-medium leading-tight">
                  {card.desc}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mounted Charts Section */}
      <DashboardCharts />

      {/* Recent Activity Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-zinc-150 dark:border-zinc-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-emerald-500" />
            <div>
              <h4 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">Log Aktivitas Terbaru</h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">Riwayat 10 transaksi login dan OTP teratas</p>
            </div>
          </div>
          <Link
            href="/dashboard/users"
            className="flex items-center justify-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline group border border-emerald-500/10 hover:border-emerald-500/30 bg-emerald-500/5 px-3 py-2 sm:py-1.5 rounded-xl transition-all cursor-pointer self-stretch sm:self-auto min-h-[44px] sm:min-h-0"
          >
            Kelola Pengguna
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Desktop Table (md and up) */}
        <div className="hidden md:block overflow-x-auto w-full">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-950/50 text-zinc-400 uppercase tracking-wider font-semibold border-b border-zinc-100 dark:border-zinc-800/80">
                <th className="px-6 py-3.5">Nama User</th>
                <th className="px-6 py-3.5">Deskripsi Aktivitas</th>
                <th className="px-6 py-3.5 text-center">Status</th>
                <th className="px-6 py-3.5 text-right">Tanggal & Waktu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-medium">
              {stats.recentActivities.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-zinc-400 dark:text-zinc-500">
                    Belum ada rekaman aktivitas saat ini.
                  </td>
                </tr>
              ) : (
                stats.recentActivities.map((act) => {
                  let badgeStyle = "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300";
                  if (act.status === "Success") {
                    badgeStyle = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10";
                  } else if (act.status === "Failed") {
                    badgeStyle = "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/10";
                  } else if (act.status === "Pending") {
                    badgeStyle = "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/10";
                  }

                  return (
                    <tr 
                      key={act.id} 
                      className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="h-6 w-6 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md flex items-center justify-center text-[10px] font-bold text-zinc-500 uppercase">
                            {act.username[0]}
                          </div>
                          <span className="text-zinc-900 dark:text-zinc-200">{act.username}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">
                        {act.activity}
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-block ${badgeStyle}`}>
                          {act.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap text-zinc-400 dark:text-zinc-500 font-mono text-[11px]">
                        {formatIndoDate(act.created_at)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card List (below md) */}
        <div className="md:hidden divide-y divide-zinc-100 dark:divide-zinc-800/60">
          {stats.recentActivities.length === 0 ? (
            <div className="text-center py-8 text-zinc-400 dark:text-zinc-500 text-sm">
              Belum ada rekaman aktivitas saat ini.
            </div>
          ) : (
            stats.recentActivities.map((act) => {
              let badgeStyle = "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300";
              if (act.status === "Success") {
                badgeStyle = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10";
              } else if (act.status === "Failed") {
                badgeStyle = "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/10";
              } else if (act.status === "Pending") {
                badgeStyle = "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/10";
              }

              return (
                <div
                  key={act.id}
                  className="px-4 py-3.5 flex flex-col gap-2.5 active:bg-zinc-50/50 dark:active:bg-zinc-800/30 transition-colors"
                >
                  {/* Top row: Avatar + Username + Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded-lg flex items-center justify-center text-xs font-bold text-zinc-600 dark:text-zinc-300 uppercase">
                        {act.username[0]}
                      </div>
                      <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {act.username}
                      </span>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${badgeStyle}`}>
                      {act.status}
                    </span>
                  </div>

                  {/* Activity description */}
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed pl-[42px]">
                    {act.activity}
                  </p>

                  {/* Timestamp */}
                  <div className="flex items-center gap-1.5 pl-[42px]">
                    <Clock className="h-3 w-3 text-zinc-400" />
                    <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono">
                      {formatIndoDate(act.created_at)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}
