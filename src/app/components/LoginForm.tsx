"use client";

import React, { useState, useTransition, useRef, useCallback } from "react";
import { requestOtp, verifyOtp } from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import { 
  User, 
  Phone, 
  KeyRound, 
  ArrowRight, 
  Loader2, 
  ShieldAlert, 
  MessageSquare,
  Lock,
  CheckCircle2,
  ChevronDown
} from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<"request" | "verify">("request");
  
  // Form values
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  
  // Feedback states
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Demo card collapsible state
  const [demoOpen, setDemoOpen] = useState(true);

  // OTP digit boxes refs
  const otpContainerRef = useRef<HTMLDivElement>(null);

  // Normalizes phone input (only numbers and optionally leading plus)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9+]/g, "");
    setPhone(val);
  };

  // Handle OTP digit box click/tap – focuses the hidden input
  const hiddenOtpRef = useRef<HTMLInputElement>(null);
  const focusOtpInput = useCallback(() => {
    hiddenOtpRef.current?.focus();
  }, []);

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, "").slice(0, 6);
    setOtp(val);
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    if (!username || !phone) {
      setError("Username dan Nomor HP wajib diisi.");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("phone", phone);

      const res = await requestOtp(null, formData);
      if (res.success) {
        setStep("verify");
        setInfoMessage(res.message);
        // Pre-fill phone if normalized by server
        if (res.phone) setPhone(res.phone);
      } else {
        setError(res.message);
      }
    });
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!otp) {
      setError("Kode OTP harus diisi.");
      return;
    }

    if (otp.length !== 6) {
      setError("Kode OTP harus terdiri dari 6 digit.");
      return;
    }

    startTransition(async () => {
      const res = await verifyOtp(username, phone, otp);
      if (res.success) {
        setInfoMessage(res.message);
        setTimeout(() => {
          // Force a full browser navigation. Next.js router cache or timing delays can sometimes prevent 
          // session cookies from being fully synchronized and sent on the immediate next client-side route, 
          // which causes route protection middleware to redirect the user back to the login page, 
          // especially when the app is accessed over HTTP via an IP address.
          window.location.replace("/dashboard");
        }, 1000);
      } else {
        setError(res.message);
      }
    });
  };

  // OTP digit boxes renderer
  const renderOtpBoxes = () => {
    const digits = otp.split("");
    return (
      <div
        ref={otpContainerRef}
        onClick={focusOtpInput}
        className="flex items-center justify-center gap-1.5 sm:gap-2 cursor-text"
      >
        {Array.from({ length: 6 }).map((_, i) => {
          const isFilled = i < digits.length;
          const isActive = i === digits.length && !isPending;
          return (
            <div
              key={i}
              className={`
                relative w-10 h-12 sm:w-12 sm:h-14 rounded-xl border-2 flex items-center justify-center
                font-mono text-lg sm:text-xl font-bold
                transition-all duration-200
                ${isFilled 
                  ? "border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-950/20 text-zinc-900 dark:text-zinc-50" 
                  : isActive
                    ? "border-emerald-500 bg-white dark:bg-zinc-900 shadow-md shadow-emerald-500/10"
                    : "border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 text-zinc-300 dark:text-zinc-600"
                }
                ${isPending ? "opacity-60" : ""}
              `}
            >
              {isFilled ? (
                <span className="animate-scale-up">{digits[i]}</span>
              ) : isActive ? (
                <span className="w-0.5 h-5 bg-emerald-500 rounded-full animate-pulse"></span>
              ) : null}
            </div>
          );
        })}
        {/* Hidden real input */}
        <input
          ref={hiddenOtpRef}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={otp}
          onChange={handleOtpChange}
          disabled={isPending}
          className="sr-only"
          aria-label="Kode OTP"
        />
      </div>
    );
  };

  return (
    <div className="w-full max-w-md touch-manipulation">
      {/* Decorative background glow */}
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl -z-10 animate-glow-pulse"></div>
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-teal-500/10 rounded-full blur-2xl -z-10 animate-glow-pulse" style={{ animationDelay: '1s' }}></div>

      {/* Animated gradient border wrapper */}
      <div className="p-[1.5px] rounded-2xl gradient-border-animated shadow-xl">
        <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl rounded-2xl p-6 sm:p-8 relative overflow-hidden transition-all duration-300">
        
          {/* Step Indicator with animated progress dots */}
          <div className="flex items-center justify-center gap-2 mb-5 sm:mb-6">
            <div className="flex items-center gap-1.5">
              <div className={`h-2 rounded-full transition-all duration-500 ${
                step === "request" 
                  ? "w-6 bg-emerald-500" 
                  : "w-2 bg-emerald-500"
              }`}></div>
              <div className={`h-2 rounded-full transition-all duration-500 ${
                step === "verify" 
                  ? "w-6 bg-emerald-500" 
                  : "w-2 bg-zinc-200 dark:bg-zinc-700"
              }`}></div>
            </div>
            <span className="text-[10px] sm:text-[11px] text-zinc-400 font-medium ml-2 tracking-wide">
              {step === "request" ? "Langkah 1 dari 2" : "Langkah 2 dari 2"}
            </span>
          </div>

          {/* Header */}
          <div className="flex flex-col items-center text-center mb-6 sm:mb-8">
            <div className="h-11 w-11 sm:h-12 sm:w-12 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center mb-3 sm:mb-4 border border-emerald-500/20 shadow-inner">
              <Lock className="h-5 w-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
              Dashboard Admin
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm mt-1">
              {step === "request" 
                ? "Masuk menggunakan nomor HP WhatsApp Anda" 
                : "Masukkan kode OTP yang telah dikirim"
              }
            </p>
          </div>

          {/* Global Error Banner */}
          {error && (
            <div className="flex items-start gap-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl p-3 sm:p-3.5 mb-5 sm:mb-6 text-sm text-red-600 dark:text-red-400 animate-shake">
              <ShieldAlert className="h-5 w-5 shrink-0 text-red-500" />
              <p className="font-medium leading-relaxed text-xs sm:text-sm">{error}</p>
            </div>
          )}

          {/* Global Success / Info Banner */}
          {infoMessage && (
            <div className="flex items-start gap-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-xl p-3 sm:p-3.5 mb-5 sm:mb-6 text-sm text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
              <p className="font-medium leading-relaxed text-xs sm:text-sm">{infoMessage}</p>
            </div>
          )}

          {/* Form Container */}
          {step === "request" ? (
            <form onSubmit={handleRequestOtp} className="space-y-4 sm:space-y-5">
              <div>
                <label htmlFor="username" className="block text-[10px] sm:text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5 sm:mb-2">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
                    <User className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <input
                    id="username"
                    type="text"
                    required
                    placeholder="Contoh: admin"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isPending}
                    className="w-full pl-10 sm:pl-11 pr-4 py-3.5 sm:py-3 bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm disabled:opacity-60"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-[10px] sm:text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5 sm:mb-2">
                  Nomor HP (WhatsApp)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500 font-semibold text-sm">
                    <Phone className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    required
                    placeholder="Contoh: 081234567890"
                    value={phone}
                    onChange={handlePhoneChange}
                    disabled={isPending}
                    className="w-full pl-10 sm:pl-11 pr-4 py-3.5 sm:py-3 bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm disabled:opacity-60"
                  />
                </div>
                <p className="text-[10px] sm:text-[11px] text-zinc-400 mt-1 sm:mt-1.5 ml-1">
                  Format nomor: 08xx atau +628xx
                </p>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-600/10 hover:shadow-emerald-600/20 active:animate-press transition-all cursor-pointer disabled:opacity-75 disabled:pointer-events-none text-sm group min-h-[48px]"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Mengirim OTP...
                  </>
                ) : (
                  <>
                    <MessageSquare className="h-4 w-4" />
                    Kirim OTP ke WhatsApp
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4 sm:space-y-5">
              <div>
                <div className="flex justify-between items-center mb-3 sm:mb-4">
                  <label className="block text-[10px] sm:text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Kode Verifikasi OTP
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setStep("request");
                      setOtp("");
                      setError(null);
                      setInfoMessage(null);
                    }}
                    className="text-[10px] sm:text-xs text-emerald-600 hover:text-emerald-500 font-medium hover:underline cursor-pointer min-h-[44px] flex items-center"
                  >
                    Ubah nomor HP
                  </button>
                </div>

                {/* Premium OTP digit boxes */}
                {renderOtpBoxes()}

                <p className="text-center text-[10px] sm:text-[11px] text-zinc-400 mt-2.5">
                  Ketuk kotak di atas untuk memasukkan kode
                </p>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-600/10 hover:shadow-emerald-600/20 active:animate-press transition-all cursor-pointer disabled:opacity-75 disabled:pointer-events-none text-sm min-h-[48px]"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Memverifikasi...
                  </>
                ) : (
                  <>
                    Verifikasi & Masuk
                  </>
                )}
              </button>
            </form>
          )}

          {/* Demo Helper Card – Collapsible on mobile */}
          <div className="mt-6 sm:mt-8 border-t border-zinc-150 dark:border-zinc-800/80 pt-4 sm:pt-6">
            <div className="bg-zinc-50 dark:bg-zinc-950/30 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl overflow-hidden">
              {/* Collapsible header */}
              <button
                type="button"
                onClick={() => setDemoOpen(prev => !prev)}
                className="w-full flex items-center justify-between p-3 sm:p-4 cursor-pointer text-left min-h-[44px]"
              >
                <div className="flex items-center gap-2.5">
                  <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-zinc-400 shrink-0" />
                  <span className="font-semibold text-[11px] sm:text-xs text-zinc-700 dark:text-zinc-300">
                    Simulasi OTP WhatsApp (Mode Demo)
                  </span>
                </div>
                <ChevronDown 
                  className={`h-4 w-4 text-zinc-400 transition-transform duration-200 shrink-0 ${
                    demoOpen ? "rotate-180" : ""
                  }`} 
                />
              </button>
              {/* Collapsible content */}
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  demoOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-0 text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 space-y-1 sm:space-y-1.5">
                  <p>1. Ketik nama pengguna apa saja (misal: <code className="bg-zinc-200 dark:bg-zinc-800 px-1 py-0.5 rounded text-zinc-800 dark:text-zinc-200 text-[10px] sm:text-[11px]">admin</code>).</p>
                  <p>2. Ketik nomor HP apa saja (misal: <code className="bg-zinc-200 dark:bg-zinc-800 px-1 py-0.5 rounded text-zinc-800 dark:text-zinc-200 text-[10px] sm:text-[11px]">081234567890</code>).</p>
                  <p>3. Masukkan kode OTP statis: <strong className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">123456</strong> untuk masuk.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
