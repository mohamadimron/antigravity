import React from "react";
import LoginForm from "@/app/components/LoginForm";
import { MessageSquareCode } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Masuk - Dashboard Admin OTP WhatsApp",
  description: "Portal masuk aman Dashboard Admin dengan verifikasi WhatsApp OTP (One-Time Password). Cepat, responsif, dan andal.",
};

export default function Home() {
  return (
    <main 
      id="login-page"
      className="min-h-screen w-full flex flex-col lg:flex-row items-center justify-center bg-zinc-50 dark:bg-zinc-950 font-sans relative overflow-hidden px-4 sm:px-6 safe-bottom-extra"
    >
      {/* Decorative Grid Patterns for SaaS vibe */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

      {/* Animated Floating Orbs – CSS-only decorative background */}
      <div className="absolute top-[10%] left-[5%] w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-emerald-500/[0.06] dark:bg-emerald-400/[0.04] blur-3xl animate-orb-float pointer-events-none"></div>
      <div className="absolute top-[50%] right-[3%] w-40 h-40 sm:w-56 sm:h-56 rounded-full bg-teal-400/[0.07] dark:bg-teal-500/[0.04] blur-3xl animate-orb-float-slow pointer-events-none"></div>
      <div className="absolute bottom-[10%] left-[15%] w-36 h-36 sm:w-48 sm:h-48 rounded-full bg-indigo-400/[0.05] dark:bg-indigo-500/[0.03] blur-3xl animate-orb-float-reverse pointer-events-none"></div>
      <div className="absolute top-[30%] left-[50%] w-28 h-28 sm:w-40 sm:h-40 rounded-full bg-emerald-300/[0.05] dark:bg-emerald-600/[0.03] blur-2xl animate-orb-float pointer-events-none" style={{ animationDelay: '2s' }}></div>

      {/* Brand Side - Hidden on small mobile screens, displayed nicely on md and up */}
      <div className="hidden lg:flex flex-col max-w-lg pr-12 text-left z-10">
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xl tracking-tight mb-6">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-md">
            <MessageSquareCode className="h-5 w-5" />
          </div>
          <span>Antigravity Dashboard</span>
        </div>
        
        <h1 className="text-4xl font-extrabold text-zinc-900 dark:text-zinc-50 leading-tight tracking-tight">
          Sistem Autentikasi <br />
          <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
            WhatsApp OTP Gateway
          </span>
        </h1>
        
        <p className="text-zinc-500 dark:text-zinc-400 mt-4 text-base leading-relaxed">
          Dashboard manajemen admin SaaS yang modern, minimalis, dan sangat responsif. 
          Mengintegrasikan login aman berbasis WhatsApp OTP untuk mencegah spam, 
          meningkatkan keamanan transaksi, dan memverifikasi pengguna secara real-time.
        </p>

        <div className="flex items-center gap-6 mt-8 border-t border-zinc-200 dark:border-zinc-800/80 pt-6">
          <div>
            <span className="block text-2xl font-bold text-zinc-900 dark:text-zinc-50">100%</span>
            <span className="text-xs text-zinc-400 font-medium">Bebas Password</span>
          </div>
          <div className="border-l border-zinc-200 dark:border-zinc-800 h-8"></div>
          <div>
            <span className="block text-2xl font-bold text-zinc-900 dark:text-zinc-50">&lt; 3 Detik</span>
            <span className="text-xs text-zinc-400 font-medium">Pengiriman OTP</span>
          </div>
          <div className="border-l border-zinc-200 dark:border-zinc-800 h-8"></div>
          <div>
            <span className="block text-2xl font-bold text-zinc-900 dark:text-zinc-50">SQLite 3</span>
            <span className="text-xs text-zinc-400 font-medium">Penyimpanan Terintegrasi</span>
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="w-full max-w-md flex flex-col items-center justify-center z-10 lg:pl-6 py-8 sm:py-10 lg:py-0">
        {/* Mobile Header (Visible only on mobile/tablet) */}
        <div className="flex lg:hidden flex-col items-center gap-1.5 mb-6 sm:mb-8 animate-float-up">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-lg tracking-tight">
            <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-sm">
              <MessageSquareCode className="h-4 w-4" />
            </div>
            <span>Antigravity Dashboard</span>
          </div>
          {/* Mobile tagline */}
          <p className="text-[11px] sm:text-xs text-zinc-400 dark:text-zinc-500 font-medium tracking-wide text-center">
            Login cepat &amp; aman via WhatsApp OTP
          </p>
        </div>

        {/* Mobile stats row – compact horizontal layout */}
        <div className="flex lg:hidden items-center justify-center gap-3 sm:gap-4 mb-6 sm:mb-8 animate-float-up animate-float-up-delay-1">
          <div className="flex items-center gap-1.5 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-sm border border-zinc-200/60 dark:border-zinc-800/60 rounded-full px-3 py-1.5 shadow-sm">
            <span className="text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-100">100%</span>
            <span className="text-[10px] sm:text-xs text-zinc-400 font-medium">Bebas Password</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-sm border border-zinc-200/60 dark:border-zinc-800/60 rounded-full px-3 py-1.5 shadow-sm">
            <span className="text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-100">&lt; 3 Detik</span>
            <span className="text-[10px] sm:text-xs text-zinc-400 font-medium">OTP</span>
          </div>
        </div>

        <LoginForm />

        <div className="text-center mt-6 sm:mt-8 text-[10px] sm:text-xs text-zinc-400 dark:text-zinc-600 font-medium px-4">
          © {new Date().getFullYear()} Antigravity Admin. Dilindungi Undang-Undang.
        </div>
      </div>
    </main>
  );
}
