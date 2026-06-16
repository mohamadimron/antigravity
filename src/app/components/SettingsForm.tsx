"use client";

import React, { useState, useTransition } from "react";
import { saveSettings, testConnection, SystemSettings } from "@/app/actions/settings";
import { 
  Save, 
  RefreshCw, 
  Key, 
  Globe, 
  Sliders, 
  FileText, 
  Database, 
  Cpu, 
  Layers,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff
} from "lucide-react";

interface SettingsFormProps {
  initialSettings: SystemSettings;
}

export default function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [isPending, startTransition] = useTransition();
  const [testPending, setTestPending] = useState(false);
  
  // Form values
  const [provider, setProvider] = useState(initialSettings.otp_whatsapp_provider);
  const [apiUrl, setApiUrl] = useState(initialSettings.otp_api_url);
  const [apiKey, setApiKey] = useState(initialSettings.otp_api_key);
  const [delay, setDelay] = useState(initialSettings.otp_delay);
  const [sandbox, setSandbox] = useState(initialSettings.otp_sandbox === "true");
  const [template, setTemplate] = useState(initialSettings.otp_template);

  // UI state
  const [showApiKey, setShowApiKey] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [testMsg, setTestMsg] = useState<{ success: boolean; message: string } | null>(null);

  // Submits form to SQLite using Server Action
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setTestMsg(null);

    startTransition(async () => {
      const data: SystemSettings = {
        otp_whatsapp_provider: provider,
        otp_api_url: apiUrl,
        otp_api_key: apiKey,
        otp_delay: delay,
        otp_sandbox: sandbox ? "true" : "false",
        otp_template: template,
      };

      const res = await saveSettings(data);
      if (res.success) {
        setSuccessMsg(res.message);
      } else {
        setErrorMsg(res.message);
      }
    });
  };

  // Simulates a test call to the WhatsApp API
  const handleTestConnection = async () => {
    setTestMsg(null);
    setErrorMsg(null);
    setSuccessMsg(null);
    setTestPending(true);
    
    try {
      const res = await testConnection();
      setTestMsg(res);
    } catch (e: any) {
      setTestMsg({ success: false, message: e.message || "Gagal menghubungi server gateway." });
    } finally {
      setTestPending(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-5 md:space-y-6 pb-36 md:pb-0">
      
      {/* Action status notification */}
      {errorMsg && (
        <div className="flex items-start gap-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl p-4 text-xs text-red-650 dark:text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
          <div>
            <span className="font-bold">Gagal Menyimpan:</span>
            <p className="mt-0.5">{errorMsg}</p>
          </div>
        </div>
      )}
      {successMsg && (
        <div className="flex items-start gap-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-xl p-4 text-xs text-emerald-750 dark:text-emerald-400">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
          <div>
            <span className="font-bold">Konfigurasi Disimpan:</span>
            <p className="mt-0.5">{successMsg}</p>
          </div>
        </div>
      )}

      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6">
        
        {/* Left Side: Forms parameters (2 cols on large screens) */}
        <div className="lg:col-span-2 space-y-5 md:space-y-6">
          
          {/* Card 1: API Configuration */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-4 md:px-6 py-4 md:py-4.5 border-b border-zinc-150 dark:border-zinc-800/80 flex items-center gap-2.5">
              <Sliders className="h-5 w-5 text-emerald-500" />
              <div>
                <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">Pengaturan WhatsApp Gateway</h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">Sesuaikan parameter API penyedia WhatsApp OTP Anda</p>
              </div>
            </div>

            <div className="p-4 md:p-6 space-y-5 md:space-y-5">
              {/* Provider Selection */}
              <div>
                <label className="block text-[11px] md:text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  Penyedia Gateway (WhatsApp Provider)
                </label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  disabled={isPending}
                  className="w-full px-3 py-3 md:py-2.5 bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm md:text-xs cursor-pointer min-h-[44px]"
                >
                  <option value="Fonnte API">Fonnte (Rekomendasi Indonesia)</option>
                  <option value="Wablas API">Wablas Gateway</option>
                  <option value="Twilio WhatsApp API">Twilio Business API</option>
                  <option value="Dummy (Simulasi)">Dummy Gateway (Statik)</option>
                </select>
              </div>

              {/* Endpoint URL & API Key Group */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-4">
                <div>
                  <label className="block text-[11px] md:text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                    Endpoint URL Target API
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <input
                      type="url"
                      required
                      placeholder="https://api.fonnte.com/send"
                      value={apiUrl}
                      onChange={(e) => setApiUrl(e.target.value)}
                      disabled={isPending}
                      className="w-full pl-9 pr-3.5 py-3 md:py-2.5 bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm md:text-xs min-h-[44px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] md:text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                    API Token / Authorization Key
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <input
                      type={showApiKey ? "text" : "password"}
                      required
                      placeholder="Kunci API rahasia Anda"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      disabled={isPending}
                      className="w-full pl-9 pr-12 py-3 md:py-2.5 bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm md:text-xs font-mono min-h-[44px]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 rounded-lg text-zinc-400 hover:text-zinc-650 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
                    >
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Simulation Delays & Sandbox Mode */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 border-t border-zinc-100 dark:border-zinc-800/80 pt-5">
                
                {/* Delay Slider */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-[11px] md:text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      Simulasi Tunda Pengiriman (Delay)
                    </label>
                    <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {delay} Detik
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="1"
                    value={delay}
                    onChange={(e) => setDelay(e.target.value)}
                    disabled={isPending}
                    className="w-full h-2 md:h-1.5 bg-zinc-150 dark:bg-zinc-850 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                  <span className="text-[10px] text-zinc-400 mt-1.5 block leading-relaxed">
                    Menunda respon Server Action untuk simulasi delay WhatsApp Gateway.
                  </span>
                </div>

                {/* Sandbox Toggle */}
                <div className="flex flex-col justify-between">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <span className="block text-[11px] md:text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                        Mode Sandbox (Statik OTP)
                      </span>
                      <span className="text-[10px] text-zinc-400 block mt-1 leading-relaxed">
                        Gunakan kode OTP statis `123456` untuk login admin tanpa kirim pesan asli.
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${sandbox ? 'text-emerald-500' : 'text-zinc-400'}`}>
                        {sandbox ? 'ON' : 'OFF'}
                      </span>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input 
                          type="checkbox" 
                          checked={sandbox} 
                          onChange={(e) => setSandbox(e.target.checked)}
                          disabled={isPending}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 md:w-9 md:h-5 bg-zinc-200 dark:bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 md:after:h-4 md:after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Card 2: Message Template Config */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-4 md:px-6 py-4 md:py-4.5 border-b border-zinc-150 dark:border-zinc-800/80 flex items-center gap-2.5">
              <FileText className="h-5 w-5 text-emerald-500" />
              <div>
                <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">Templat Pesan WhatsApp OTP</h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">Format teks pesan yang dikirimkan ke nomor WhatsApp user</p>
              </div>
            </div>

            <div className="p-4 md:p-6 space-y-4">
              <div>
                <textarea
                  required
                  rows={4}
                  placeholder="Format pesan..."
                  value={template}
                  onChange={(e) => setTemplate(e.target.value)}
                  disabled={isPending}
                  className="w-full px-3.5 py-3 md:py-2.5 bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm md:text-xs leading-relaxed font-sans min-h-[120px] md:min-h-0"
                />
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl p-3.5">
                <span className="block text-[10px] font-bold text-zinc-500 dark:text-zinc-450 uppercase mb-1.5">
                  Variabel Pendukung Templat:
                </span>
                <div className="flex flex-wrap gap-2 text-[10px] text-zinc-400">
                  <span className="bg-zinc-200/60 dark:bg-zinc-850 px-2 py-1 md:px-1.5 md:py-0.5 rounded text-zinc-700 dark:text-zinc-300">
                    {"{{username}}"} - Nama User
                  </span>
                  <span className="bg-zinc-200/60 dark:bg-zinc-850 px-2 py-1 md:px-1.5 md:py-0.5 rounded text-zinc-700 dark:text-zinc-300">
                    {"{{otp}}"} - Kode OTP (6 digit)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Connection Test & SQLite Specs (1 col on large screens) */}
        <div className="space-y-5 md:space-y-6">
          
          {/* Card 3: Gateway Connection Tester */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm p-4 md:p-6 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-zinc-950 dark:text-zinc-50 uppercase tracking-wider">
                Pengujian Koneksi Gateway
              </h4>
              <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                Uji apakah credentials API target Anda sudah valid dan merespon dengan status online (200 OK).
              </p>
            </div>

            <div className="mt-5 space-y-4">
              {/* Test results banner */}
              {testMsg && (
                <div className={`flex items-start gap-2.5 border rounded-xl p-3 text-xs ${
                  testMsg.success 
                    ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-450" 
                    : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50 text-red-650 dark:text-red-400"
                }`}>
                  {testMsg.success ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" /> : <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />}
                  <span>{testMsg.message}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testPending || isPending}
                className="w-full flex items-center justify-center gap-2 border border-zinc-200 dark:border-zinc-855 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 font-semibold py-3 md:py-2.5 rounded-xl text-sm md:text-xs cursor-pointer transition-all disabled:opacity-50 min-h-[44px] active:scale-[0.98]"
              >
                {testPending ? (
                  <>
                    <Loader2 className="h-4 w-4 md:h-3.5 md:w-3.5 animate-spin text-emerald-500" />
                    Menghubungi Gateway...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 md:h-3.5 md:w-3.5 text-zinc-400" />
                    Uji Konektivitas API
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Card 4: SQLite Database Specs */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-4 md:px-5 py-4 border-b border-zinc-150 dark:border-zinc-800/80 flex items-center gap-2">
              <Database className="h-4 w-4 text-emerald-500" />
              <h4 className="text-xs font-bold text-zinc-950 dark:text-zinc-50 uppercase tracking-wider">
                Spesifikasi Database
              </h4>
            </div>
            
            <div className="p-4 md:p-5 space-y-4 text-[11px]">
              
              <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800/80 pb-2.5 md:pb-2">
                <span className="text-zinc-400 font-medium">SQLite Driver</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200 font-mono">better-sqlite3</span>
              </div>

              <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800/80 pb-2.5 md:pb-2">
                <span className="text-zinc-400 font-medium">Lokasi Database</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200 font-mono text-right">/database.sqlite</span>
              </div>

              <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800/80 pb-2.5 md:pb-2">
                <span className="text-zinc-400 font-medium">Mode Transaksi</span>
                <span className="font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/15">WAL Mode</span>
              </div>

              <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800/80 pb-2.5 md:pb-2">
                <span className="text-zinc-400 font-medium">Kapasitas Maksimal</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200 font-mono text-right">Unlimited (Disk-based)</span>
              </div>

              <div className="flex flex-col gap-1 text-[10px] text-zinc-400 bg-zinc-50 dark:bg-zinc-950/30 p-3 md:p-2.5 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50 leading-relaxed">
                <span className="font-semibold text-zinc-700 dark:text-zinc-350 block">Catatan Integrasi:</span>
                Semua pembaruan pada dashboard admin tersimpan langsung secara transaksional ke berkas SQLite 3 lokal.
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* Form Submit Area — Desktop: inline card; Mobile: sticky bottom bar */}
      <div className="hidden md:flex justify-end gap-3 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 p-4 rounded-2xl shadow-sm">
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-6 rounded-xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-[0.98] transition-all cursor-pointer text-xs disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Menyimpan Pengaturan...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Simpan Semua Perubahan
            </>
          )}
        </button>
      </div>

      {/* Mobile Sticky Save Button */}
      <div className="md:hidden fixed bottom-[calc(56px+env(safe-area-inset-bottom,0px))] inset-x-0 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-t border-zinc-200 dark:border-zinc-800 p-4">
        <button
          type="submit"
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-[0.98] transition-all cursor-pointer text-sm disabled:opacity-50 min-h-[48px]"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4.5 w-4.5 animate-spin" />
              Menyimpan Pengaturan...
            </>
          ) : (
            <>
              <Save className="h-4.5 w-4.5" />
              Simpan Semua Perubahan
            </>
          )}
        </button>
      </div>

    </form>
  );
}
