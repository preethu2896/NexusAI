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
  ShieldCheck,
  Database,
  BarChart3,
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Tabs } from "../../components/ui/Tabs";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { useToastStore } from "../../store/toastStore";

export default function Analytics() {
  const { addToast } = useToastStore();
  const [timeframe, setTimeframe] = useState("30d");

  // Telemetry mock data
  const latencyData = [
    { name: "01:00", latency: 110, tokens: 400 },
    { name: "02:00", latency: 142, tokens: 620 },
    { name: "03:00", latency: 98, tokens: 350 },
    { name: "04:00", latency: 165, tokens: 890 },
    { name: "05:00", latency: 120, tokens: 520 },
    { name: "06:00", latency: 135, tokens: 710 },
    { name: "07:00", latency: 142, tokens: 750 },
  ];

  const embeddingData = [
    { name: "Jan", vectors: 1.2 },
    { name: "Feb", vectors: 1.8 },
    { name: "Mar", vectors: 2.5 },
    { name: "Apr", vectors: 3.1 },
    { name: "May", vectors: 4.2 },
    { name: "Jun", vectors: 4.8 },
  ];

  const similarityData = [
    { range: "0.0-0.2", count: 12 },
    { range: "0.2-0.4", count: 48 },
    { range: "0.4-0.6", count: 142 },
    { range: "0.6-0.8", count: 854 },
    { range: "0.8-1.0", count: 2410 },
  ];

  const cacheData = [
    { name: "Cache Hits", value: 65, fill: "var(--color-primary)" },
    { name: "Vector Search Misses", value: 35, fill: "rgba(255,255,255,0.08)" },
  ];

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h2 className="text-headline-md font-bold tracking-tight text-on-surface">
            AI Operations Telemetry
          </h2>
          <p className="text-xs text-on-surface-variant/60 mt-1">
            End-to-end pipeline observability: latency rates, vector storage growth, and factual grounding checks.
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
          <Button variant="ghost" onClick={handleRefreshAnalytics} className="border border-white/5 bg-white/3 hover:bg-white/5">
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* SECTION 1: System Health & Cache Observability */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-green-400" />
          <h3 className="text-xs font-bold font-mono tracking-widest text-[#adc6ff] uppercase">
            I. System Uptime & Caching
          </h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cache Hit Ratio Donut */}
          <Card variant="surface" className="p-4 border border-white/5 flex flex-col justify-between h-[210px] lg:col-span-1">
            <div>
              <span className="text-[9px] font-bold font-mono tracking-widest text-on-surface-variant/40 block">
                Cache hit ratio
              </span>
              <p className="text-[10px] text-on-surface-variant/50 mt-1 leading-normal">
                Percentage of vector search queries resolved in cache to save model ingestion costs.
              </p>
            </div>

            <div className="h-24 w-full relative flex items-center justify-center my-1.5">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={cacheData}
                    cx="50%"
                    cy="50%"
                    innerRadius={28}
                    outerRadius={38}
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
                <span className="text-lg font-bold text-on-surface">65%</span>
                <span className="text-[7px] text-primary font-bold font-mono uppercase tracking-wider">Hit Ratio</span>
              </div>
            </div>

            <div className="text-[9px] font-mono text-on-surface-variant/40 flex justify-between pt-1 border-t border-white/5">
              <span>Hits: <strong>65%</strong></span>
              <span>Misses: <strong>35%</strong></span>
            </div>
          </Card>

          {/* Database Health log telemetry */}
          <Card variant="surface" className="p-4 border border-white/5 flex flex-col justify-between h-[210px] lg:col-span-2">
            <div>
              <span className="text-[9px] font-bold font-mono tracking-widest text-on-surface-variant/40 block">
                Active Connections Telemetry
              </span>
              <p className="text-[10px] text-on-surface-variant/50 mt-1">
                Relational and Vector database servers active logs.
              </p>
            </div>

            <div className="space-y-2.5 font-mono text-[9px] text-on-surface-variant/65">
              <div className="flex items-center justify-between border-b border-white/3 pb-1.5">
                <span className="flex items-center gap-1">
                  <Database className="w-3 h-3 text-primary" /> ChromaDB Endpoint
                </span>
                <span className="text-green-400 font-bold">http://localhost:8000 (HEALTHY)</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/3 pb-1.5">
                <span className="flex items-center gap-1">
                  <Cpu className="w-3 h-3 text-secondary" /> PostgreSQL Engine
                </span>
                <span className="text-green-400 font-bold">Uptime 100% (ONLINE)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-yellow-500" /> OpenAI Inference API
                </span>
                <span className="text-green-400 font-bold">Uptime 99.98% (STABLE)</span>
              </div>
            </div>

            <span className="text-[8px] font-mono text-on-surface-variant/30 text-right">
              Logs checked 14s ago.
            </span>
          </Card>
        </div>
      </div>

      {/* SECTION 2: Retrieval Performance */}
      <div className="space-y-3 pt-4 border-t border-white/5">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-bold font-mono tracking-widest text-[#adc6ff] uppercase">
            II. Retrieval Accuracy & Latency
          </h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Latency vs Tokens composed */}
          <Card variant="surface" className="p-4 border border-white/5">
            <div>
              <span className="text-[9px] font-bold font-mono tracking-widest text-on-surface-variant/40 block">
                Response Latency (ms) vs Tokens
              </span>
              <p className="text-[10px] text-on-surface-variant/50 mt-1 leading-normal mb-4">
                Compares vector-fetch speeds mapped against ingested tokens volume.
              </p>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={latencyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={8} tickLine={false} />
                  <YAxis yAxisId="left" stroke="rgba(255,255,255,0.3)" fontSize={8} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.3)" fontSize={8} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-surface-container)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "var(--radius-default)",
                      color: "var(--color-on-surface)",
                      fontSize: 10,
                    }}
                  />
                  <Bar yAxisId="right" dataKey="tokens" fill="rgba(255,255,255,0.08)" radius={[2, 2, 0, 0]} />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="latency"
                    stroke="var(--color-primary)"
                    strokeWidth={1.5}
                    dot={{ r: 2, fill: "var(--color-primary)" }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Cosine similarity score bar */}
          <Card variant="surface" className="p-4 border border-white/5">
            <div>
              <span className="text-[9px] font-bold font-mono tracking-widest text-on-surface-variant/40 block">
                Cosine Similarity Distribution
              </span>
              <p className="text-[10px] text-on-surface-variant/50 mt-1 leading-normal mb-4">
                Total chunks retrieved grouped by accuracy metrics score thresholds.
              </p>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={similarityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis dataKey="range" stroke="rgba(255,255,255,0.3)" fontSize={8} tickLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={8} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-surface-container)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "var(--radius-default)",
                      color: "var(--color-on-surface)",
                      fontSize: 10,
                    }}
                  />
                  <Bar dataKey="count" fill="rgba(255,255,255,0.08)" radius={[2, 2, 0, 0]}>
                    {similarityData.map((entry, index) => {
                      const isActive = index === 4;
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
        </div>
      </div>

      {/* SECTION 3: LLM Consumption & Hallucination Guardrails */}
      <div className="space-y-3 pt-4 border-t border-white/5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#d0bcff]" />
          <h3 className="text-xs font-bold font-mono tracking-widest text-[#adc6ff] uppercase">
            III. LLM Consumption & Factual Grounding
          </h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Model distribution */}
          <Card variant="surface" className="p-4 border border-white/5 flex flex-col justify-between h-[210px] lg:col-span-1">
            <div>
              <span className="text-[9px] font-bold font-mono tracking-widest text-on-surface-variant/40 block">
                Model Query Volume
              </span>
              <p className="text-[10px] text-on-surface-variant/50 mt-1">
                Volume of query inferences processed per model.
              </p>
            </div>

            <div className="h-24 w-full my-1.5">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={modelUsageData} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.3)" fontSize={7} width={45} tickLine={false} />
                  <Bar dataKey="queries" radius={[0, 2, 2, 0]}>
                    {modelUsageData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="text-[9px] font-mono text-on-surface-variant/40 flex justify-between pt-1 border-t border-white/5">
              <span>Total Queries: <strong>23.5k Inferences</strong></span>
            </div>
          </Card>

          {/* Hallucination guardrail stats */}
          <Card variant="surface" className="p-4 border border-white/5 flex flex-col justify-between h-[210px] lg:col-span-2">
            <div>
              <span className="text-[9px] font-bold font-mono tracking-widest text-on-surface-variant/40 block">
                Hallucination Detection & Citation Audits
              </span>
              <p className="text-[10px] text-on-surface-variant/50 mt-1 leading-normal">
                Verifies if generated LLM responses match retrieved reference source documents.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 my-2 text-center select-none">
              <div className="bg-[#0f2e1a] border border-green-500/20 p-3 rounded">
                <span className="text-[18px] font-bold text-green-400 block leading-none">99.4%</span>
                <span className="text-[8px] font-mono text-green-400 font-bold uppercase tracking-wider block mt-1">Factual Grounding</span>
              </div>
              <div className="bg-primary/10 border border-primary/20 p-3 rounded">
                <span className="text-[18px] font-bold text-primary block leading-none">100%</span>
                <span className="text-[8px] font-mono text-primary font-bold uppercase tracking-wider block mt-1">Citations Verified</span>
              </div>
            </div>

            <p className="text-[9px] font-mono text-on-surface-variant/40 leading-normal">
              Reflexive check model monitors all prompts inputs against indexed database ranges.
            </p>
          </Card>
        </div>
      </div>

      {/* SECTION 4: Vector Storage & Ingestion Scaling */}
      <div className="space-y-3 pt-4 border-t border-white/5">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-bold font-mono tracking-widest text-[#adc6ff] uppercase">
            IV. Embedding Storage & Growth
          </h3>
        </div>
        <Card variant="surface" className="p-4 border border-white/5">
          <div>
            <span className="text-[9px] font-bold font-mono tracking-widest text-on-surface-variant/40 block">
              Vector Embedding count
            </span>
            <p className="text-[10px] text-on-surface-variant/50 mt-1 leading-normal mb-4">
              Cumulative number of vectors stored in ChromaDB (Millions).
            </p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={embeddingData}>
                <defs>
                  <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={8} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={8} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-surface-container)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "var(--radius-default)",
                    color: "var(--color-on-surface)",
                    fontSize: 10,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="vectors"
                  stroke="var(--color-primary)"
                  fillOpacity={1}
                  fill="url(#growthGrad)"
                  strokeWidth={1.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}


