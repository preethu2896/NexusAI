"use client";

import React, { useState } from "react";
import {
  ComposedChart,
  AreaChart,
  BarChart,
  PieChart,
  Area,
  Bar,
  Line,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  Clock,
  Zap,
  Activity,
  HardDrive,
  Cpu,
  RefreshCw,
  Award,
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Tabs } from "../../components/ui/Tabs";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { useToastStore } from "../../store/toastStore";

export default function Analytics() {
  const { addToast } = useToastStore();
  const [timeframe, setTimeframe] = useState("30d");

  // Latency & Token Usage Composed Data
  const latencyData = [
    { name: "01:00", latency: 110, tokens: 400 },
    { name: "02:00", latency: 142, tokens: 620 },
    { name: "03:00", latency: 98, tokens: 350 },
    { name: "04:00", latency: 165, tokens: 890 },
    { name: "05:00", latency: 120, tokens: 520 },
    { name: "06:00", latency: 135, tokens: 710 },
    { name: "07:00", latency: 142, tokens: 750 },
  ];

  // Embedding Growth Area Data
  const embeddingData = [
    { name: "Jan", vectors: 1.2 },
    { name: "Feb", vectors: 1.8 },
    { name: "Mar", vectors: 2.5 },
    { name: "Apr", vectors: 3.1 },
    { name: "May", vectors: 4.2 },
    { name: "Jun", vectors: 4.8 },
  ];

  // Similarity Distribution Bar Data
  const similarityData = [
    { range: "0.0-0.2", count: 12 },
    { range: "0.2-0.4", count: 48 },
    { range: "0.4-0.6", count: 142 },
    { range: "0.6-0.8", count: 854 },
    { range: "0.8-1.0", count: 2410 }, // highlighted
  ];

  // Cache Hit Ratio Pie Data
  const cacheData = [
    { name: "Cache Hits", value: 65, fill: "var(--color-primary)" },
    { name: "Vector Search Misses", value: 35, fill: "rgba(255,255,255,0.08)" },
  ];

  // Model usage chart data
  const modelUsageData = [
    { name: "GPT-4o", queries: 12480, fill: "var(--color-primary)" },
    { name: "GPT-4o-mini", queries: 8240, fill: "var(--color-secondary)" },
    { name: "Claude 3.5 Sonnet", queries: 2840, fill: "rgba(255,255,255,0.15)" },
  ];

  const handleRefreshAnalytics = () => {
    addToast("Re-fetching systems telemetry logs...", "info");
  };

  return (
    <div className="space-y-8 pb-12 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-headline-md font-bold tracking-tight text-on-surface">
            AI Operations Telemetry
          </h2>
          <p className="text-xs text-on-surface-variant/60 mt-1.5 leading-none">
            Monitor pipeline retrieval speeds, similarity distances, cache hit efficiency, and model token costs.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Tabs
            tabs={[
              { id: "24h", label: "24 Hours" },
              { id: "7d", label: "7 Days" },
              { id: "30d", label: "30 Days" },
            ]}
            activeTab={timeframe}
            onChange={(id) => {
              setTimeframe(id);
              addToast(`Timeframe changed to ${id}`, "info");
            }}
          />
          <Button variant="ghost" onClick={handleRefreshAnalytics}>
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Primary Analytics grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Chart 1: Retrieval Latency vs Token Usage */}
        <Card variant="surface" className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-body-sm font-bold text-on-surface">
                Latency vs Token Ingestion
              </h3>
              <p className="text-[10px] text-on-surface-variant/50 mt-1">
                Real-time query speed (ms) mapped against prompt tokens.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-green-400 font-bold font-mono">
              <Clock className="w-4 h-4 text-green-400" />
              <span>Avg: 142ms</span>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={latencyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} />
                <YAxis yAxisId="left" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-surface-container)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "var(--radius-default)",
                    color: "var(--color-on-surface)",
                  }}
                />
                <Bar yAxisId="right" dataKey="tokens" fill="rgba(255,255,255,0.08)" radius={[3, 3, 0, 0]} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="latency"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "var(--color-primary)" }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4 text-[10px] font-bold font-mono uppercase tracking-wider text-on-surface-variant/50">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-primary block" />
              <span>Latency (ms)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-white/10 rounded-sm block" />
              <span>Tokens Used</span>
            </div>
          </div>
        </Card>

        {/* Chart 2: Embedding growth */}
        <Card variant="surface" className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-body-sm font-bold text-on-surface">
                Vector Embedding growth
              </h3>
              <p className="text-[10px] text-on-surface-variant/50 mt-1">
                Cumulative vector node count indexed in ChromaDB (Millions).
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-primary font-bold font-mono">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span>+240k this month</span>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={embeddingData}>
                <defs>
                  <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.15} />
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
                  dataKey="vectors"
                  stroke="var(--color-primary)"
                  fillOpacity={1}
                  fill="url(#growthGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 3: Similarity score distribution */}
        <Card variant="surface" className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-body-sm font-bold text-on-surface">
                Cosine Similarity Score Distribution
              </h3>
              <p className="text-[10px] text-on-surface-variant/50 mt-1">
                Volume of query retrieval chunks grouped by accuracy similarity scores.
              </p>
            </div>
            <Badge variant="success">98.4% Optimal</Badge>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={similarityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="range" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-surface-container)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "var(--radius-default)",
                    color: "var(--color-on-surface)",
                  }}
                />
                <Bar dataKey="count" fill="rgba(255,255,255,0.08)" radius={[3, 3, 0, 0]}>
                  {similarityData.map((entry, index) => {
                    const isActive = index === 4; // Highlight highest accuracy
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={isActive ? "var(--color-primary)" : "rgba(255,255,255,0.08)"}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 4: Model Usage & Cache Hit Ratio */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
          {/* Cache Hit Ratio Donut */}
          <Card variant="surface" className="p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-body-sm font-bold text-on-surface">
                Cache Hit Ratio
              </h3>
              <p className="text-[10px] text-on-surface-variant/50 mt-1">
                Vector retrieval database caching efficiency.
              </p>
            </div>

            <div className="h-32 w-full relative flex items-center justify-center my-3">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={cacheData}
                    cx="50%"
                    cy="50%"
                    innerRadius={36}
                    outerRadius={48}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {cacheData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
                <span className="text-xl font-bold text-on-surface">65%</span>
                <span className="text-[8px] text-primary font-bold font-mono tracking-wider">Hit Ratio</span>
              </div>
            </div>

            <div className="text-[9px] font-mono text-on-surface-variant/40 flex justify-between pt-2 border-t border-white/5">
              <span>Hits: <strong>65%</strong></span>
              <span>Misses: <strong>35%</strong></span>
            </div>
          </Card>

          {/* Model Usage chart */}
          <Card variant="surface" className="p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-body-sm font-bold text-on-surface">
                Model Inference Usage
              </h3>
              <p className="text-[10px] text-on-surface-variant/50 mt-1">
                Volume of query inferences processed per model.
              </p>
            </div>

            <div className="h-32 w-full my-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={modelUsageData} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.3)" fontSize={8} width={50} tickLine={false} />
                  <Bar dataKey="queries" radius={[0, 3, 3, 0]}>
                    {modelUsageData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="text-[9px] font-mono text-on-surface-variant/40 flex justify-between pt-2 border-t border-white/5">
              <span>Total: <strong>23.5k Inferences</strong></span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
