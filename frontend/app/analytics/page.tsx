"use client";

import React from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { BarChart3, Clock, Database, Zap, FileText } from "lucide-react";
import { Card } from "../../components/ui/Card";

export default function Analytics() {
  // Chart Data Mock
  const tokenData = [
    { name: "07/08", input: 1200, output: 800 },
    { name: "07/09", input: 2400, output: 1400 },
    { name: "07/10", input: 1800, output: 950 },
    { name: "07/11", input: 3200, output: 2100 },
    { name: "07/12", input: 4000, output: 2800 },
    { name: "07/13", input: 4900, output: 3500 },
    { name: "07/14", input: 5500, output: 4200 },
  ];

  const latencyData = [
    { name: "Q1", value: 185 },
    { name: "Q2", value: 240 },
    { name: "Q3", value: 210 },
    { name: "Q4", value: 310 },
    { name: "Q5", value: 160 },
    { name: "Q6", value: 225 },
    { name: "Q7", value: 195 },
  ];

  const similarityData = [
    { chunk: "C1", score: 0.82 },
    { chunk: "C2", score: 0.76 },
    { chunk: "C3", score: 0.71 },
    { chunk: "C4", score: 0.68 },
    { chunk: "C5", score: 0.65 },
    { chunk: "C6", score: 0.58 },
  ];

  const topSources = [
    { name: "sample_stream_docs.pdf", count: 24, type: "PDF Reference" },
    { name: "nexusai_architecture.pdf", count: 18, type: "ADR Spec" },
    { name: "connection_pooling_v2.pdf", count: 12, type: "Technical Doc" },
    { name: "chromadb_handbook.pdf", count: 9, type: "Operations Manual" },
  ];

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card variant="surface">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-label-caps text-on-surface-variant/50">
                Throughput
              </span>
              <h3 className="text-2xl font-bold text-on-surface mt-2">
                9.7k t/day
              </h3>
            </div>
            <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center border border-primary/10">
              <Zap className="w-4 h-4 text-primary" />
            </div>
          </div>
          <p className="text-xs text-on-surface-variant/60 mt-3">
            Token consumption rate
          </p>
        </Card>

        <Card variant="surface">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-label-caps text-on-surface-variant/50">
                Speed Index
              </span>
              <h3 className="text-2xl font-bold text-on-surface mt-2">
                215 ms
              </h3>
            </div>
            <div className="w-8 h-8 rounded bg-green-500/10 flex items-center justify-center border border-green-500/10">
              <Clock className="w-4 h-4 text-green-400" />
            </div>
          </div>
          <p className="text-xs text-on-surface-variant/60 mt-3">
            Average query latency
          </p>
        </Card>

        <Card variant="surface">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-label-caps text-on-surface-variant/50">
                Search Accuracy
              </span>
              <h3 className="text-2xl font-bold text-on-surface mt-2">
                0.764
              </h3>
            </div>
            <div className="w-8 h-8 rounded bg-secondary/10 flex items-center justify-center border border-secondary/10">
              <Database className="w-4 h-4 text-secondary" />
            </div>
          </div>
          <p className="text-xs text-on-surface-variant/60 mt-3">
            Cosine similarity margin
          </p>
        </Card>

        <Card variant="surface">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-label-caps text-on-surface-variant/50">
                Cache hit rate
              </span>
              <h3 className="text-2xl font-bold text-on-surface mt-2">
                92.4%
              </h3>
            </div>
            <div className="w-8 h-8 rounded bg-yellow-500/10 flex items-center justify-center border border-yellow-500/10">
              <BarChart3 className="w-4 h-4 text-yellow-400" />
            </div>
          </div>
          <p className="text-xs text-on-surface-variant/60 mt-3">
            Local Chroma index reuse
          </p>
        </Card>
      </div>

      {/* Primary Graphs Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Token Usage Trend */}
        <Card variant="surface">
          <h3 className="text-label-caps text-on-surface tracking-wider mb-6">
            Token Consumption Volume
          </h3>
          <div className="h-64 sm:h-80 w-full overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={tokenData} margin={{ left: -20, right: 10 }}>
                <defs>
                  <linearGradient id="colorInput" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorOutput" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-secondary)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--color-secondary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} />
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
                  dataKey="input"
                  stroke="var(--color-primary)"
                  fillOpacity={1}
                  fill="url(#colorInput)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="output"
                  stroke="var(--color-secondary)"
                  fillOpacity={1}
                  fill="url(#colorOutput)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Latency History */}
        <Card variant="surface">
          <h3 className="text-label-caps text-on-surface tracking-wider mb-6">
            Query Latency Profile (ms)
          </h3>
          <div className="h-64 sm:h-80 w-full overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={latencyData} margin={{ left: -20, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-surface-container)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "var(--radius-default)",
                    color: "var(--color-on-surface)",
                  }}
                />
                <Bar dataKey="value" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Grid: Match distribution & sources */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Similarity Line Chart */}
        <Card variant="surface" className="lg:col-span-1">
          <h3 className="text-label-caps text-on-surface tracking-wider mb-6">
            Relevance Score Curve
          </h3>
          <div className="h-64 w-full overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={similarityData} margin={{ left: -20, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="chunk" stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} />
                <YAxis
                  domain={[0.4, 1.0]}
                  stroke="rgba(255,255,255,0.4)"
                  fontSize={10}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-surface-container)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "var(--radius-default)",
                    color: "var(--color-on-surface)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="var(--color-secondary)"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "var(--color-secondary)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Top Referenced Sources Table / Cards */}
        <Card variant="surface" className="lg:col-span-2">
          <h3 className="text-label-caps text-on-surface tracking-wider mb-6">
            Top Referenced Context Sources
          </h3>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[10px] uppercase font-mono text-on-surface-variant/40 tracking-wider">
                  <th className="pb-3 font-semibold">Source Document</th>
                  <th className="pb-3 font-semibold">Classification</th>
                  <th className="pb-3 font-semibold text-right">Referenced Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {topSources.map((source) => (
                  <tr key={source.name} className="hover:bg-white/3 transition-colors duration-150">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-on-surface-variant/40 shrink-0" />
                        <span className="text-body-sm font-semibold text-on-surface truncate max-w-[240px]">
                          {source.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 text-xs text-on-surface-variant/60">
                      {source.type}
                    </td>
                    <td className="py-4 text-right text-body-sm font-semibold text-primary font-mono">
                      {source.count} times
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Stacked Card View */}
          <div className="block sm:hidden space-y-4">
            {topSources.map((source) => (
              <div
                key={source.name}
                className="p-4 rounded-default border border-white/5 bg-surface-container-low space-y-3"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-on-surface-variant/40 shrink-0" />
                  <span className="text-body-sm font-semibold text-on-surface truncate">
                    {source.name}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-on-surface-variant/60">
                    {source.type}
                  </span>
                  <span className="font-semibold text-primary font-mono">
                    {source.count} times
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
