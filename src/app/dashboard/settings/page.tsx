import React from "react";
import { getSettings } from "@/app/actions/settings";
import SettingsForm from "@/app/components/SettingsForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pengaturan Sistem - Dashboard Admin OTP WhatsApp",
  description: "Kelola konfigurasi integrasi WhatsApp OTP Gateway (WAG), sandbox mode, API provider endpoints, dan spesifikasi database SQLite.",
};

export default async function SettingsPage() {
  // Fetch system configurations from SQLite on server side
  const settings = await getSettings();

  return (
    <div className="space-y-6 animate-fade-in" id="settings-page">
      {/* Title Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Pengaturan Sistem & Integrasi
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Sesuaikan kredensial WhatsApp API Gateway, uji status koneksi provider, dan periksa spesifikasi database SQLite.
        </p>
      </div>

      {/* Render Client Settings Panel */}
      <SettingsForm initialSettings={settings} />
    </div>
  );
}
