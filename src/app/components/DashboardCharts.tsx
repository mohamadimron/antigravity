"use client";

import React, { useState, useEffect } from "react";
import { TrendingUp, MessageSquare, ShieldCheck, HelpCircle } from "lucide-react";

export default function DashboardCharts() {
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; val: number; label: string } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Trigger bar-grow animation after mount
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Line Chart Data: Daily OTP Requests
  const dailyData = [
    { day: "Senin", requests: 145, success: 138 },
    { day: "Selasa", requests: 168, success: 160 },
    { day: "Rabu", requests: 220, success: 215 },
    { day: "Kamis", requests: 185, success: 172 },
    { day: "Jumat", requests: 260, success: 251 },
    { day: "Sabtu", requests: 195, success: 189 },
    { day: "Minggu", requests: 310, success: 298 },
  ];

  // SVG dimensions & mapping
  const width = 500;
  const height = 200;
  const paddingX = 40;
  const paddingY = 20;

  // Map values to SVG space
  const maxVal = 350;
  const getX = (index: number) => paddingX + (index * (width - paddingX * 2)) / (dailyData.length - 1);
  const getY = (val: number) => height - paddingY - (val * (height - paddingY * 2)) / maxVal;

  // Build the SVG path
  const linePoints = dailyData.map((d, i) => `${getX(i)},${getY(d.requests)}`).join(" ");
  const successPoints = dailyData.map((d, i) => `${getX(i)},${getY(d.success)}`).join(" ");

  // Build the fill area path (from line down to bottom)
  const fillAreaPath = `${getX(0)},${height - paddingY} ` + 
    dailyData.map((d, i) => `${getX(i)},${getY(d.requests)}`).join(" ") + 
    ` ${getX(dailyData.length - 1)},${height - paddingY}`;

  // Provider data
  const providers = [
    { name: "Fonnte API", success: 94, total: 100, color: "bg-emerald-500", gradientFrom: "from-emerald-400", gradientTo: "to-emerald-600" },
    { name: "Wablas API", success: 87, total: 100, color: "bg-teal-500", gradientFrom: "from-teal-400", gradientTo: "to-teal-600" },
    { name: "Dummy Gateway (Sandbox)", success: 100, total: 100, color: "bg-emerald-600", gradientFrom: "from-emerald-500", gradientTo: "to-emerald-700" },
    { name: "Twilio WhatsApp", success: 98, total: 100, color: "bg-zinc-600", gradientFrom: "from-zinc-500", gradientTo: "to-zinc-700" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
      {/* 1. Line Chart: Daily OTP Traffic */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col relative transition-all duration-300 hover:shadow-md hover:shadow-zinc-200/50 dark:hover:shadow-zinc-900/50">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 mb-4">
          <div>
            <h4 className="text-sm font-bold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              Trafik Harian Pengiriman OTP
            </h4>
            <p className="text-[11px] text-zinc-400 mt-0.5">Pengiriman OTP 7 Hari Terakhir</p>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-semibold">
            <span className="flex items-center gap-1.5 text-zinc-500">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              Sukses
            </span>
            <span className="flex items-center gap-1.5 text-zinc-500">
              <span className="h-2 w-2 rounded-full bg-zinc-300 dark:bg-zinc-700"></span>
              Total
            </span>
          </div>
        </div>

        {/* SVG Container */}
        <div className="flex-1 min-h-[180px] sm:min-h-[200px] relative w-full mt-2">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" style={{ touchAction: "none" }}>
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                <stop offset="50%" stopColor="#10b981" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Gridlines */}
            {[0, 100, 200, 300].map((val) => (
              <g key={val}>
                <line
                  x1={paddingX}
                  y1={getY(val)}
                  x2={width - paddingX}
                  y2={getY(val)}
                  stroke="currentColor"
                  className="text-zinc-100 dark:text-zinc-800/60"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingX - 10}
                  y={getY(val) + 4}
                  textAnchor="end"
                  className="fill-zinc-400 font-medium text-[9px] font-mono"
                >
                  {val}
                </text>
              </g>
            ))}

            {/* Gradient Area Fill under total requests */}
            <polygon points={fillAreaPath} fill="url(#chartGradient)" />

            {/* Success Line (Green/Emerald) */}
            <polyline
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={successPoints}
            />

            {/* Total Requests Line (Zinc/Slate dashed) */}
            <polyline
              fill="none"
              stroke="#94a3b8"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="3 3"
              points={linePoints}
            />

            {/* Interactive Circles / Nodes */}
            {dailyData.map((d, i) => (
              <g key={i}>
                {/* Invisible hover/touch target — larger on mobile */}
                <circle
                  cx={getX(i)}
                  cy={getY(d.requests)}
                  r="20"
                  className="fill-transparent cursor-pointer"
                  onMouseEnter={() => {
                    setHoveredPoint({
                      x: getX(i),
                      y: getY(d.requests),
                      val: d.requests,
                      label: `${d.day}: ${d.requests} OTP (${d.success} Sukses)`,
                    });
                  }}
                  onMouseLeave={() => setHoveredPoint(null)}
                  onTouchStart={() => {
                    setHoveredPoint({
                      x: getX(i),
                      y: getY(d.requests),
                      val: d.requests,
                      label: `${d.day}: ${d.requests} OTP (${d.success} Sukses)`,
                    });
                  }}
                  onTouchEnd={() => setTimeout(() => setHoveredPoint(null), 1500)}
                />
                
                {/* Visible dot */}
                <circle
                  cx={getX(i)}
                  cy={getY(d.requests)}
                  r="4.5"
                  className="fill-white dark:fill-zinc-900 stroke-zinc-400 dark:stroke-zinc-500 cursor-pointer hover:r-6 hover:stroke-emerald-500 transition-all duration-150"
                  strokeWidth="2.5"
                />
                <circle
                  cx={getX(i)}
                  cy={getY(d.success)}
                  r="3.5"
                  className="fill-emerald-500 stroke-white dark:stroke-zinc-900 cursor-pointer"
                  strokeWidth="1.5"
                />
              </g>
            ))}

            {/* Tooltip Overlay */}
            {hoveredPoint && (
              <g>
                <rect
                  x={Math.max(10, Math.min(width - 150, hoveredPoint.x - 70))}
                  y={hoveredPoint.y - 32}
                  width="140"
                  height="22"
                  rx="6"
                  className="fill-zinc-950 dark:fill-zinc-800 shadow-md"
                />
                <text
                  x={Math.max(80, Math.min(width - 80, hoveredPoint.x))}
                  y={hoveredPoint.y - 18}
                  textAnchor="middle"
                  className="fill-white font-semibold text-[9px]"
                >
                  {hoveredPoint.label}
                </text>
              </g>
            )}

            {/* X-Axis Labels */}
            {dailyData.map((d, i) => (
              <text
                key={i}
                x={getX(i)}
                y={height - 4}
                textAnchor="middle"
                className="fill-zinc-400 font-semibold text-[9px]"
              >
                {d.day}
              </text>
            ))}
          </svg>
        </div>
      </div>

      {/* 2. Bar Chart: OTP Distribution by WhatsApp Gateway Provider */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col transition-all duration-300 hover:shadow-md hover:shadow-zinc-200/50 dark:hover:shadow-zinc-900/50">
        <div>
          <h4 className="text-sm font-bold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-emerald-500" />
            Distribusi Performa Provider Gateway
          </h4>
          <p className="text-[11px] text-zinc-400 mt-0.5">Rasio Pengiriman Sukses vs Gagal</p>
        </div>

        {/* Provider Bars */}
        <div className="flex-grow flex flex-col justify-center gap-5 sm:gap-4 mt-6 min-h-[180px] sm:min-h-[200px]">
          {providers.map((prov, index) => {
            const pct = Math.round((prov.success / prov.total) * 100);
            return (
              <div key={prov.name} className="space-y-2 sm:space-y-1.5">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-0.5 sm:gap-0 text-xs font-semibold">
                  <span className="text-zinc-700 dark:text-zinc-300">{prov.name}</span>
                  <span className="text-zinc-500 text-[11px] sm:text-xs">
                    <strong className="text-zinc-900 dark:text-white font-bold">{prov.success}</strong> / {prov.total} Sukses ({pct}%)
                  </span>
                </div>
                
                {/* Bar */}
                <div className="w-full h-5 sm:h-3.5 bg-zinc-100 dark:bg-zinc-800/80 rounded-full overflow-hidden relative border border-zinc-200/20 shadow-inner flex">
                  <div 
                    className={`bg-gradient-to-r ${prov.gradientFrom} ${prov.gradientTo} h-full rounded-full transition-all duration-700 ease-out relative flex items-center justify-end`}
                    style={{ width: mounted ? `${pct}%` : '0%' }}
                  >
                    {/* Percentage label inside bar when wide enough */}
                    {pct >= 30 && (
                      <span className="text-[9px] sm:text-[8px] font-bold text-white/90 pr-2 whitespace-nowrap">
                        {pct}%
                      </span>
                    )}
                  </div>
                  {pct < 100 && (
                    <div 
                      className="bg-red-400 h-full transition-all duration-700 ease-out"
                      style={{ width: mounted ? `${100 - pct}%` : '0%' }}
                    ></div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
