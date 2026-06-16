"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutUser } from "@/app/actions/auth";
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  User, 
  MessageSquareCode,
  Bell,
  ChevronDown
} from "lucide-react";

interface DashboardLayoutShellProps {
  user: {
    username: string;
    phone: string;
    role: string;
  };
  children: React.ReactNode;
}

export default function DashboardLayoutShell({ user, children }: DashboardLayoutShellProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [drawerClosing, setDrawerClosing] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Users", href: "/dashboard/users", icon: Users },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  // Find the current page's menu item for the icon in the header
  const currentMenuItem = menuItems.find((item) => pathname === item.href);
  const CurrentPageIcon = currentMenuItem?.icon;

  const handleLogout = async () => {
    await logoutUser();
    window.location.href = "/";
  };

  // Smooth close for mobile drawer
  const closeMobileMenu = useCallback(() => {
    setDrawerClosing(true);
    setTimeout(() => {
      setMobileMenuOpen(false);
      setDrawerClosing(false);
    }, 280);
  }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <div className="min-h-screen flex bg-zinc-50 dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-50">
      
      {/* ──────────────────────────────────────────────── */}
      {/* 1. Desktop Sidebar                              */}
      {/* ──────────────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-64 bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-950 border-r border-zinc-800 text-zinc-400 h-screen sticky top-0 shrink-0">
        {/* Brand */}
        <div className="h-16 px-6 flex items-center gap-2.5 border-b border-zinc-800/60 bg-zinc-950/50">
          <div className="h-8 w-8 bg-emerald-500/10 rounded-lg flex items-center justify-center border border-emerald-500/20">
            <MessageSquareCode className="h-5 w-5 text-emerald-500" />
          </div>
          <span className="font-bold text-white tracking-tight text-base">Antigravity Gateway</span>
        </div>

        {/* Menu Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group cursor-pointer relative ${
                  isActive 
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-md shadow-emerald-500/5 font-semibold" 
                    : "hover:bg-zinc-800/50 hover:text-zinc-200 border border-transparent"
                }`}
              >
                {/* Active left accent border */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-emerald-400 rounded-r-full shadow-sm shadow-emerald-400/50" />
                )}
                <Icon className={`h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${isActive ? "text-emerald-400" : "text-zinc-400 group-hover:text-zinc-300"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Footer Profile */}
        <div className="p-4 border-t border-zinc-800/80 bg-zinc-950/30">
          <div className="flex items-center gap-3 px-2 py-1.5 mb-3">
            <div className="h-9 w-9 bg-emerald-500/10 rounded-lg flex items-center justify-center border border-emerald-500/20 text-emerald-400 font-bold shrink-0">
              {user.username[0].toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-xs font-semibold text-zinc-200 truncate">{user.username}</span>
              <span className="block text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">{user.role}</span>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-800/50 hover:bg-red-950/20 hover:text-red-400 text-zinc-300 border border-zinc-700/50 hover:border-red-900/30 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            Keluar (Logout)
          </button>

          {/* Version badge */}
          <div className="mt-3 flex justify-center">
            <span className="text-[10px] text-zinc-600 font-mono bg-zinc-800/60 px-2.5 py-0.5 rounded-full border border-zinc-700/30">
              v1.0.0 Beta
            </span>
          </div>
        </div>
      </aside>

      {/* ──────────────────────────────────────────────── */}
      {/* 2. Mobile Navigation Drawer Backdrop & Panel    */}
      {/* ──────────────────────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-280 ${
              drawerClosing ? "opacity-0" : "opacity-100 animate-fade-in"
            }`}
            onClick={closeMobileMenu}
          ></div>

          {/* Drawer Menu */}
          <div className={`relative flex-1 flex flex-col max-w-[280px] w-full bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-950 text-zinc-400 h-full shadow-2xl transition-transform duration-280 ease-out ${
            drawerClosing ? "-translate-x-full" : "animate-slide-in"
          }`}>
            {/* Swipe gesture hint bar */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-zinc-700/80" />
            </div>

            {/* Close Button */}
            <div className="absolute top-3.5 right-3.5 z-55">
              <button
                onClick={closeMobileMenu}
                className="p-2 rounded-xl bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-700 cursor-pointer transition-all duration-150 active:scale-95"
                style={{ minWidth: 44, minHeight: 44 }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Brand */}
            <div className="h-14 px-5 flex items-center gap-2.5 border-b border-zinc-800/60 bg-zinc-950/50">
              <div className="h-7 w-7 bg-emerald-500/10 rounded-lg flex items-center justify-center border border-emerald-500/20">
                <MessageSquareCode className="h-4.5 w-4.5 text-emerald-500" />
              </div>
              <span className="font-bold text-white tracking-tight text-sm">Antigravity Gateway</span>
            </div>

            {/* Menu Navigation */}
            <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer relative active:scale-[0.98] ${
                      isActive 
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold" 
                        : "hover:bg-zinc-800/50 hover:text-zinc-200 border border-transparent"
                    }`}
                    style={{ minHeight: 48 }}
                  >
                    {/* Active left accent */}
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-emerald-400 rounded-r-full" />
                    )}
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Footer Profile */}
            <div className="p-4 border-t border-zinc-800/85 bg-zinc-950/30">
              <div className="flex items-center gap-3 px-2 py-1.5 mb-3">
                <div className="h-9 w-9 bg-emerald-500/10 rounded-lg flex items-center justify-center border border-emerald-500/20 text-emerald-400 font-bold shrink-0">
                  {user.username[0].toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block text-xs font-semibold text-zinc-200 truncate">{user.username}</span>
                  <span className="block text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">{user.role}</span>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-zinc-800/50 hover:bg-red-950/20 hover:text-red-400 text-zinc-300 border border-zinc-700/50 hover:border-red-900/30 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer active:scale-[0.98]"
                style={{ minHeight: 48 }}
              >
                <LogOut className="h-3.5 w-3.5" />
                Keluar (Logout)
              </button>

              {/* Version badge */}
              <div className="mt-3 flex justify-center">
                <span className="text-[10px] text-zinc-600 font-mono bg-zinc-800/60 px-2.5 py-0.5 rounded-full border border-zinc-700/30">
                  v1.0.0 Beta
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────── */}
      {/* 3. Main Area Wrapper                            */}
      {/* ──────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Header – with safe-area inset for notched phones */}
        <header
          className="h-16 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-4 sm:px-6"
          style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
        >
          {/* Left: hamburger + page title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer transition-colors active:scale-95"
              style={{ minWidth: 44, minHeight: 44 }}
            >
              <Menu className="h-5 w-5" />
            </button>
            
            {/* Breadcrumb/Title with page icon on mobile */}
            <div className="flex items-center gap-2">
              {CurrentPageIcon && (
                <CurrentPageIcon className="h-4.5 w-4.5 text-emerald-500 lg:hidden" />
              )}
              <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 capitalize">
                {pathname === "/dashboard" 
                  ? "Ringkasan Dashboard" 
                  : pathname.split("/").pop()}
              </h3>
            </div>
          </div>

          {/* Right Navigation controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Notification Dropdown */}
            <div className="relative">
              <button 
                onClick={() => {
                  setNotifOpen(!notifOpen);
                  setProfileOpen(false);
                }}
                className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer relative active:scale-95"
                style={{ minWidth: 44, minHeight: 44 }}
              >
                <Bell className="h-4.5 w-4.5" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-950 animate-pulse"></span>
              </button>

              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-45" onClick={() => setNotifOpen(false)}></div>
                  {/* Responsive: nearly full-width on mobile, fixed on desktop */}
                  <div className="fixed left-2 right-2 top-[72px] sm:absolute sm:left-auto sm:top-auto sm:right-0 sm:mt-2.5 sm:w-80 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-50 py-2.5 animate-slide-up">
                    <div className="px-4 py-2 border-b border-zinc-150 dark:border-zinc-800 pb-2.5 flex justify-between items-center">
                      <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Notifikasi Terbaru</span>
                      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">Simulasi</span>
                    </div>
                    <div className="divide-y divide-zinc-100 dark:divide-zinc-800 max-h-60 overflow-y-auto">
                      <div className="px-4 py-3.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 text-left cursor-pointer transition-all">
                        <p className="text-xs text-zinc-700 dark:text-zinc-300 font-semibold leading-relaxed">
                          OTP statis `123456` terdeteksi aktif di Sandbox.
                        </p>
                        <span className="text-[10px] text-zinc-400 block mt-1">1 menit yang lalu</span>
                      </div>
                      <div className="px-4 py-3.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 text-left cursor-pointer transition-all">
                        <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                          Integrasi Fonnte / Wablas siap dipetakan.
                        </p>
                        <span className="text-[10px] text-zinc-400 block mt-1">10 menit yang lalu</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setProfileOpen(!profileOpen);
                  setNotifOpen(false);
                }}
                className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer text-left active:scale-[0.98]"
                style={{ minHeight: 44 }}
              >
                <div className="h-7 w-7 bg-emerald-500/10 rounded-lg flex items-center justify-center border border-emerald-500/20 text-emerald-500 dark:text-emerald-400 font-bold text-xs">
                  {user.username[0].toUpperCase()}
                </div>
                <span className="hidden sm:inline text-xs font-semibold text-zinc-700 dark:text-zinc-300">{user.username}</span>
                <ChevronDown className={`h-3.5 w-3.5 text-zinc-400 transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`} />
              </button>

              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-45" onClick={() => setProfileOpen(false)}></div>
                  {/* Responsive: wider on mobile */}
                  <div className="fixed left-4 right-4 top-[72px] sm:absolute sm:left-auto sm:top-auto sm:right-0 sm:mt-2.5 sm:w-56 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-50 py-1.5 animate-slide-up">
                    <div className="px-4 py-2.5 border-b border-zinc-100 dark:border-zinc-800 text-left">
                      <span className="block text-xs font-bold text-zinc-950 dark:text-zinc-200 truncate">{user.username}</span>
                      <span className="block text-[10px] text-zinc-400 truncate mt-0.5">{user.phone}</span>
                    </div>
                    <Link
                      href="/dashboard/settings"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-3 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all cursor-pointer text-left w-full"
                      style={{ minHeight: 44 }}
                    >
                      <Settings className="h-3.5 w-3.5" />
                      Pengaturan Akun
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 px-4 py-3 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer text-left w-full border-t border-zinc-100 dark:border-zinc-800"
                      style={{ minHeight: 44 }}
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Keluar (Logout)
                    </button>
                  </div>
                </>
              )}
            </div>

          </div>
        </header>

        {/* Content area – extra bottom padding on mobile for the bottom nav */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 pb-24 lg:pb-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* ──────────────────────────────────────────────── */}
      {/* 4. Mobile Bottom Navigation Bar                  */}
      {/* ──────────────────────────────────────────────── */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-t border-zinc-200/80 dark:border-zinc-800/80"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex items-stretch justify-around px-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-0.5 py-2.5 px-3 flex-1 transition-all duration-200 relative group ${
                  isActive 
                    ? "text-emerald-500" 
                    : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300"
                }`}
                style={{ minHeight: 56 }}
              >
                {/* Active indicator dot */}
                {isActive && (
                  <span className="absolute top-1 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-emerald-500 rounded-full" />
                )}
                <Icon className={`h-5 w-5 transition-transform duration-200 ${isActive ? "scale-110" : "group-active:scale-90"}`} />
                <span className={`text-[10px] font-semibold tracking-tight ${isActive ? "text-emerald-500" : ""}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

    </div>
  );
}
