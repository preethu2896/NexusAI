"use client";

import React, { useState } from "react";
import {
  ComposedChart,
  AreaChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Cell,
} from "recharts";
import {
  FileText,
  TrendingUp,
  Zap,
  ArrowUpRight,
  Download,
  CheckCircle,
  Network,
  Cpu,
  ChevronDown,
} from "lucide-react";
import { Card } from "../../components/ui/Card";

export default function Analytics() {
  const [timeframe, setTimeframe] = useState("Day");

  // Mock data matching the Mon-Sun "Infrastructure Scaling" chart in the mockup
  const infraData = [
    { name: "MON", docs: 30, tokens: 40, fill: "rgba(255,255,255,0.08)" },
    { name: "TUE", docs: 45, tokens: 48, fill: "rgba(255,255,255,0.08)" },
    { name: "WED", docs: 35, tokens: 50, fill: "rgba(255,255,255,0.08)" },
    { name: "THU", docs: 58, tokens: 55, fill: "rgba(255,255,255,0.08)" },
    { name: "FRI", docs: 82, tokens: 58, fill: "var(--color-primary)" }, // highlighted
    { name: "SAT", docs: 78, tokens: 62, fill: "var(--color-primary)" }, // highlighted
    { name: "SUN", docs: 88, tokens: 68, fill: "var(--color-primary)" }, // highlighted
  ];

  // Mock data matching the Jan-Dec "Embedding Growth" chart
  const embeddingData = [
    { name: "JAN", value: 0.5 },
    { name: "FEB", value: 0.8 },
    { name: "MAR", value: 1.2 },
    { name: "APR", value: 1.5 },
    { name: "MAY", value: 2.1 },
    { name: "JUN", value: 2.6 },
    { name: "JUL", value: 3.2 },
    { name: "AUG", value: 3.8 },
    { name: "SEP", value: 4.1 },
    { name: "OCT", value: 4.5 },
    { name: "NOV", value: 4.8 },
    { name: "DEC", value: 5.2 },
  ];

  // Mock data for conversation volume bar chart
  const volumeData = [
    { name: "1", value: 10, fill: "rgba(255,255,255,0.08)" },
    { name: "2", value: 25, fill: "rgba(255,255,255,0.08)" },
    { name: "3", value: 45, fill: "rgba(255,255,255,0.15)" },
    { name: "4", value: 70, fill: "var(--color-secondary)" },
    { name: "5", value: 55, fill: "var(--color-primary)" },
    { name: "6", value: 90, fill: "var(--color-primary)" },
    { name: "7", value: 40, fill: "rgba(255,255,255,0.15)" },
    { name: "8", value: 20, fill: "rgba(255,255,255,0.08)" },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* 6-Column Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card variant="surface" className="p-4 flex flex-col justify-between">
          <span className="text-[9px] font-bold font-mono tracking-widest text-on-surface-variant/40 uppercase">
            Total Documents
          </span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-xl font-bold text-on-surface">12,482</span>
            <span className="text-[9px] text-green-400 font-mono font-bold flex items-center">
              +4.2% <TrendingUp className="w-2.5 h-2.5 ml-0.5" />
            </span>
          </div>
        </Card>

        <Card variant="surface" className="p-4 flex flex-col justify-between">
          <span className="text-[9px] font-bold font-mono tracking-widest text-on-surface-variant/40 uppercase">
            Token Consumption
          </span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-xl font-bold text-on-surface">1.2M</span>
            <span className="text-[9px] text-on-surface-variant/40 font-mono">
              Steady
            </span>
          </div>
        </Card>

        <Card variant="surface" className="p-4 flex flex-col justify-between">
          <span className="text-[9px] font-bold font-mono tracking-widest text-on-surface-variant/40 uppercase">
            Avg. Latency
          </span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-xl font-bold text-on-surface">142ms</span>
            <span className="text-[9px] text-cyan-400 font-mono font-bold">
              -12ms
            </span>
          </div>
        </Card>

        <Card variant="surface" className="p-4 flex flex-col justify-between">
          <span className="text-[9px] font-bold font-mono tracking-widest text-on-surface-variant/40 uppercase">
            Search Accuracy
          </span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-xl font-bold text-on-surface">98.4%</span>
            <span className="text-[9px] text-green-400 font-mono font-bold">
              +0.8%
            </span>
          </div>
        </Card>

        <Card variant="surface" className="p-4 flex flex-col justify-between">
          <span className="text-[9px] font-bold font-mono tracking-widest text-on-surface-variant/40 uppercase">
            Retrieval Success
          </span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-xl font-bold text-on-surface">94.2%</span>
            <span className="text-[9px] text-green-400 font-mono font-bold flex items-center">
              +1.2% <TrendingUp className="w-2.5 h-2.5 ml-0.5" />
            </span>
          </div>
        </Card>

        <Card variant="surface" className="p-4 flex flex-col justify-between">
          <span className="text-[9px] font-bold font-mono tracking-widest text-on-surface-variant/40 uppercase">
            Avg Similarity
          </span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-xl font-bold text-on-surface">0.89</span>
            <span className="text-[9px] text-[#adc6ff] font-mono font-bold flex items-center">
              Optimal <CheckCircle className="w-2.5 h-2.5 ml-0.5 text-primary" />
            </span>
          </div>
        </Card>
      </div>

      {/* Grid: Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Chart 1: Infrastructure Scaling */}
        <Card variant="surface" className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-body-base font-bold text-on-surface">
                Infrastructure Scaling
              </h3>
              <p className="text-xs text-on-surface-variant/60 mt-1">
                Document corpus growth vs token processing volume
              </p>
            </div>
            {/* Day / Week Toggle buttons */}
            <div className="flex items-center bg-[#171b26] p-0.5 rounded border border-white/5 text-[10px] font-semibold">
              <button
                onClick={() => setTimeframe("Day")}
                className={`px-3 py-1 rounded transition-all cursor-pointer ${
                  timeframe === "Day"
                    ? "bg-surface-container text-on-surface border border-white/5"
                    : "text-on-surface-variant/40 hover:text-on-surface"
                }`}
              >
                Day
              </button>
              <button
                onClick={() => setTimeframe("Week")}
                className={`px-3 py-1 rounded transition-all cursor-pointer ${
                  timeframe === "Week"
                    ? "bg-surface-container text-on-surface border border-white/5"
                    : "text-on-surface-variant/40 hover:text-on-surface"
                }`}
              >
                Week
              </button>
            </div>
          </div>

          <div className="h-64 sm:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={infraData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-surface-container)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "var(--radius-default)",
                    color: "var(--color-on-surface)",
                  }}
                />
                <Bar dataKey="docs" radius={[4, 4, 0, 0]}>
                  {infraData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
                <Line
                  type="monotone"
                  dataKey="tokens"
                  stroke="var(--color-secondary)"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "var(--color-secondary)" }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4 text-[10px] font-bold font-mono uppercase tracking-wider text-on-surface-variant/50">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-primary block" />
              <span>Docs Indexed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-secondary block" />
              <span>Tokens Used</span>
            </div>
          </div>
        </Card>

        {/* Chart 2: Embedding Growth Over Time */}
        <Card variant="surface" className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-body-base font-bold text-on-surface">
                Embedding Growth Over Time
              </h3>
              <p className="text-xs text-on-surface-variant/60 mt-1">
                Cumulative vector count across all knowledge clusters
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs text-green-400 font-bold font-mono">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span>+240k this month</span>
            </div>
          </div>

          <div className="h-64 sm:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={embeddingData}>
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-surface-container)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "var(--radius-default)",
                    color: "var(--color-on-surface)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="var(--color-primary)"
                  fillOpacity={1}
                  fill="url(#areaGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Grid: System Performance and Queried Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* System Performance */}
        <Card variant="surface" className="p-6 lg:col-span-1 flex flex-col justify-between">
          <div className="space-y-6">
            <h3 className="text-body-base font-bold text-on-surface flex items-center justify-between">
              <span>System Performance</span>
            </h3>

            {/* Performance Bars */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-[11px] font-bold font-mono tracking-wider text-on-surface-variant/60 uppercase">
                  <span>P99 Latency</span>
                  <span className="text-on-surface">198ms</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full mt-1.5 overflow-hidden">
                  <div className="bg-primary h-full w-[65%] rounded-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-bold font-mono tracking-wider text-on-surface-variant/60 uppercase">
                  <span>P95 Latency</span>
                  <span className="text-on-surface">112ms</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full mt-1.5 overflow-hidden">
                  <div className="bg-on-surface-variant/30 h-full w-[45%] rounded-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-bold font-mono tracking-wider text-on-surface-variant/60 uppercase">
                  <span>API Uptime</span>
                  <span className="text-green-400">99.998%</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full mt-1.5 overflow-hidden">
                  <div className="bg-green-400 h-full w-[99.9%] rounded-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Optimization active card */}
          <div className="mt-8 p-4 rounded-default border border-white/5 bg-[#171b26]/50 flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center border border-primary/20 text-primary shrink-0">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <div>
              <span className="text-xs font-bold text-on-surface block">
                Optimization Active
              </span>
              <span className="text-[9px] text-on-surface-variant/40 font-mono block mt-0.5">
                LAST TUNED 2H AGO
              </span>
            </div>
          </div>
        </Card>

        {/* Top Queried Documents */}
        <Card variant="surface" className="p-6 lg:col-span-1">
          <h3 className="text-body-base font-bold text-on-surface mb-4">
            Top Queried Documents
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/5 text-[9px] uppercase font-mono text-on-surface-variant/40 tracking-wider">
                  <th className="pb-3 font-semibold">Document</th>
                  <th className="pb-3 font-semibold">Hits</th>
                  <th className="pb-3 font-semibold text-right">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  { name: "API_Reference_v2.pdf", hits: "12,840", trend: "+12%" },
                  { name: "Security_Policy.docx", hits: "8,211", trend: "+5%" },
                  { name: "Onboarding_Guide.md", hits: "5,402", trend: "0%" },
                ].map((row) => (
                  <tr key={row.name} className="hover:bg-white/3">
                    <td className="py-3.5 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-on-surface-variant/40 shrink-0" />
                      <span className="font-semibold text-on-surface truncate max-w-[120px] sm:max-w-[160px]">
                        {row.name}
                      </span>
                    </td>
                    <td className="py-3.5 font-mono text-on-surface font-semibold">{row.hits}</td>
                    <td className="py-3.5 text-right font-mono font-bold text-green-400">
                      {row.trend}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* High-Traffic Documents */}
        <Card variant="surface" className="p-6 lg:col-span-1">
          <h3 className="text-body-base font-bold text-on-surface mb-4">
            High-Traffic Documents
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/5 text-[9px] uppercase font-mono text-on-surface-variant/40 tracking-wider">
                  <th className="pb-3 font-semibold">Resource</th>
                  <th className="pb-3 font-semibold">Requests</th>
                  <th className="pb-3 font-semibold text-right">Tokens</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  { name: "Q4_Fiscal_Report.pdf", reqs: "2,412", tokens: "450k" },
                  { name: "Engineering_Onboarding.md", reqs: "1,894", tokens: "820k" },
                  { name: "Product_Vision_2025.pdf", reqs: "1,502", tokens: "1.20M" },
                  { name: "Client_Agreement_Templates.docx", reqs: "948", tokens: "310k" },
                ].map((row) => (
                  <tr key={row.name} className="hover:bg-white/3">
                    <td className="py-3 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-on-surface-variant/40 shrink-0" />
                      <span className="font-semibold text-on-surface truncate max-w-[110px] sm:max-w-[140px]">
                        {row.name}
                      </span>
                    </td>
                    <td className="py-3 font-mono text-on-surface font-semibold">{row.reqs}</td>
                    <td className="py-3 text-right font-mono text-on-surface-variant/70">
                      {row.tokens}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Vector Embedding Clusters Gauge and Conversation Volume */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Gauge Card */}
        <Card variant="surface" className="p-6 flex items-center justify-between lg:col-span-1">
          <div className="space-y-1">
            <span className="text-[9px] font-bold font-mono tracking-widest text-on-surface-variant/40 uppercase">
              Vector Embedding Clusters
            </span>
            <h3 className="text-3xl font-bold tracking-tight text-on-surface mt-2">
              4.8M
            </h3>
            <p className="text-xs text-on-surface-variant/60">
              High-density knowledge nodes
            </p>
          </div>

          {/* Circular Gauge Ring Mock */}
          <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
            {/* SVG Ring */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="36"
                className="stroke-white/5 fill-transparent"
                strokeWidth="6"
              />
              <circle
                cx="48"
                cy="48"
                r="36"
                className="stroke-primary fill-transparent"
                strokeWidth="6"
                strokeDasharray="226"
                strokeDashoffset="60" // 75% fill
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                <Network className="w-4 h-4 text-on-surface-variant" />
              </div>
            </div>
          </div>
        </Card>

        {/* Conversation Volume Card */}
        <Card variant="surface" className="p-6 lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-0.5">
              <span className="text-[9px] font-bold font-mono tracking-widest text-on-surface-variant/40 uppercase">
                Conversation Volume
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-2xl font-bold text-on-surface">82,410</h3>
                <span className="text-[10px] text-on-surface-variant/40 uppercase tracking-wide">
                  Queries Total
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-green-400 font-bold font-mono">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>18%</span>
            </div>
          </div>

          <div className="flex items-end justify-between gap-2 h-16 w-full px-2">
            {volumeData.map((item, index) => (
              <div
                key={index}
                className="w-full rounded-sm"
                style={{ height: `${item.value}%`, backgroundColor: item.fill }}
              />
            ))}
          </div>

          <div className="flex items-center justify-end mt-4 pt-2 border-t border-white/5">
            <button className="text-xs text-primary hover:text-[#9cbbf5] transition-colors flex items-center gap-1 bg-transparent border-none cursor-pointer font-semibold">
              <Download className="w-3.5 h-3.5" /> Export Log
            </button>
          </div>
        </Card>
      </div>

      {/* Footer Branding Status */}
      <footer className="pt-6 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[10px] font-bold font-mono text-on-surface-variant/45">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 block shrink-0" />
          <span>SYSTEM OPERATIONAL</span>
          <span className="text-white/10">|</span>
          <span>NEXUSAI V2.4.0-STABLE</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hover:text-on-surface cursor-pointer">DOCUMENTATION</span>
          <span className="hover:text-on-surface cursor-pointer">SUPPORT</span>
        </div>
      </footer>
    </div>
  );
}
