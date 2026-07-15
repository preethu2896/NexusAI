"use client";

import React, { useState } from "react";
import {
  Bot,
  Terminal,
  Settings,
  GitFork,
  Database,
  Cpu,
  Zap,
  Globe,
  Sliders,
  RefreshCw,
  Plus,
  ArrowRight,
  TrendingUp,
  Activity,
  CheckCircle,
  FileText,
  Lock,
  Code,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Dialog } from "../../components/ui/Dialog";
import { Tabs } from "../../components/ui/Tabs";
import { useToastStore } from "../../store/toastStore";

export default function Agents() {
  const { addToast } = useToastStore();

  // Selected agent for Dialog details
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Mock agents data with deep capabilities, tool limits, prompts
  const [agents, setAgents] = useState([
    {
      id: "planner",
      name: "Planner Agent",
      purpose: "Strategic task decomposition",
      desc: "Breaks down complex user queries into logical multi-step executable workflows.",
      status: "Running",
      version: "v1.4.2",
      latency: "120ms",
      memory: "42MB",
      lastExec: "2m ago",
      tools: ["Task decomposer", "Schema parser"],
      prompt: "Decompose user query Q into a sequence of dependency tasks [T1, T2, ... Tn] based on reference context...",
      temp: 0.2,
      maxTokens: 2048,
    },
    {
      id: "retriever",
      name: "Retriever Agent",
      purpose: "High-precision semantic search",
      desc: "Optimized for locating and rank-extracting granular context chunks within vector indexes.",
      status: "Ready",
      version: "v2.1.0",
      latency: "85ms",
      memory: "128MB",
      lastExec: "14s ago",
      tools: ["Cosine similarity calculator", "ChromaDB vector query"],
      prompt: "Extract top K documents relevant to the vector weights matching query embeddings...",
      temp: 0.1,
      maxTokens: 1024,
    },
    {
      id: "research",
      name: "Research Agent",
      purpose: "Deep-dive document synthesis",
      desc: "Cross-references multiple collections to compile technical whitepapers and audits.",
      status: "Idle",
      version: "v0.9.8",
      latency: "1.2s",
      memory: "512MB",
      lastExec: "1h ago",
      tools: ["Citation generator", "HTML link parser"],
      prompt: "Synthesize source files context to write an analytical summary with page citation notes...",
      temp: 0.4,
      maxTokens: 4096,
    },
    {
      id: "sql",
      name: "SQL Agent",
      purpose: "Structured relational queries",
      desc: "Translates natural language inputs into high-performance raw SQL statements.",
      status: "Running",
      version: "v1.2.0",
      latency: "45ms",
      memory: "32MB",
      lastExec: "5m ago",
      tools: ["PostgreSQL schema analyzer", "Query formatter"],
      prompt: "Convert prompt P into valid PostgreSQL query syntax using connection schema details...",
      temp: 0.0,
      maxTokens: 512,
    },
    {
      id: "web",
      name: "Web Search Agent",
      purpose: "Real-time external knowledge retrieval",
      desc: "Indexes the live web to supply immediate context missing from historical training corpuses.",
      status: "Offline",
      version: "v1.0.5",
      latency: "2.4s",
      memory: "64MB",
      lastExec: "12m ago",
      tools: ["Brave search API engine", "Site scraper"],
      prompt: "Query live web index for recent topics and filter outputs based on source credibility...",
      temp: 0.3,
      maxTokens: 1024,
    },
    {
      id: "memory",
      name: "Memory Agent",
      purpose: "Long-term conversation storage",
      desc: "Manages session conversation cache, extracts key entities, and updates user workspace preferences.",
      status: "Ready",
      version: "v2.0.1",
      latency: "15ms",
      memory: "256MB",
      lastExec: "Now",
      tools: ["Entity extractor", "Redis key-value mapper"],
      prompt: "Update user context graph with extracted session facts and user workspace preferences...",
      temp: 0.2,
      maxTokens: 512,
    },
    {
      id: "reflection",
      name: "Reflection Agent",
      purpose: "Verification and audit alignment",
      desc: "Reviews generated outputs for formatting compliance, fact checks citations, and guards brand alignment.",
      status: "Running",
      version: "v2.1.0",
      latency: "85ms",
      memory: "128MB",
      lastExec: "14s ago",
      tools: ["Factuality checker", "Brand policy filter"],
      prompt: "Evaluate response R against source documents D for factual grounding errors or hallucination issues...",
      temp: 0.0,
      maxTokens: 2048,
    },
  ]);

  const activeAgent = agents.find((a) => a.id === selectedAgentId);

  const handleUpdateAgentConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAgent) return;
    addToast(`Configuration for ${activeAgent.name} saved successfully`, "success");
    setSelectedAgentId(null);
  };

  const handleDeployNewAgent = () => {
    addToast("Initializing Agent build deployment pipeline (mock)", "info");
  };

  return (
    <div className="space-y-8 pb-12 select-none">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-headline-md font-bold tracking-tight text-on-surface">
            Agent Marketplace
          </h2>
          <p className="text-xs text-on-surface-variant/60 mt-1.5 leading-none">
            Orchestrate specialized AI execution units with custom prompt scripts and system access keys.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button variant="primary" onClick={handleDeployNewAgent} className="bg-[#adc6ff] hover:bg-[#9cbbf5] text-[#002e6a]">
            <Plus className="w-4 h-4 mr-1.5" /> Deploy Agent
          </Button>
        </div>
      </div>

      {/* Grid of Agent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {agents.map((agent) => {
          const statusBadges = {
            Running: "success",
            Ready: "primary",
            Idle: "secondary",
            Offline: "error",
          } as const;

          return (
            <Card
              key={agent.id}
              variant="surface"
              className="p-6 flex flex-col justify-between h-[280px] border border-white/5 hover:border-primary/20 transition-all duration-150 group"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="w-9 h-9 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
                  <Badge variant={statusBadges[agent.status as keyof typeof statusBadges] || "secondary"}>
                    {agent.status}
                  </Badge>
                </div>
                <h4 className="text-body-sm font-bold text-on-surface mt-4 tracking-wide">
                  {agent.name}
                </h4>
                <p className="text-xs text-on-surface-variant/65 mt-2 line-clamp-3 leading-relaxed">
                  {agent.desc}
                </p>
              </div>

              <div>
                <div className="grid grid-cols-2 gap-y-2.5 text-[10px] font-mono text-on-surface-variant/40 pt-4 border-t border-white/5">
                  <div>
                    SPEED: <strong className="text-on-surface">{agent.latency}</strong>
                  </div>
                  <div>
                    MEM: <strong className="text-on-surface">{agent.memory}</strong>
                  </div>
                  <div>
                    VERSION: <strong className="text-on-surface">{agent.version}</strong>
                  </div>
                  <div>
                    LAST RUN: <strong className="text-on-surface">{agent.lastExec}</strong>
                  </div>
                </div>

                <div className="flex justify-end pt-3.5 border-t border-white/5 mt-3 select-none">
                  <button
                    onClick={() => {
                      setSelectedAgentId(agent.id);
                      setActiveTab("overview");
                    }}
                    className="text-xs font-bold text-primary hover:text-[#9cbbf5] hover:underline cursor-pointer bg-transparent border-none focus:outline-none"
                  >
                    Configure Agent
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Agent details Modal console */}
      <Dialog
        isOpen={!!selectedAgentId}
        onClose={() => setSelectedAgentId(null)}
        title={activeAgent ? `${activeAgent.name} Console` : "Agent Configuration"}
      >
        {activeAgent && (
          <div className="space-y-6 select-none">
            {/* Tabs Selector */}
            <Tabs
              tabs={[
                { id: "overview", label: "Overview" },
                { id: "config", label: "Configuration" },
                { id: "prompt", label: "System Prompt" },
                { id: "logs", label: "Runtime Logs" },
              ]}
              activeTab={activeTab}
              onChange={(id) => setActiveTab(id)}
            />

            {/* Content Tabs switcher */}
            {activeTab === "overview" && (
              <div className="space-y-4">
                <div>
                  <span className="text-[9px] font-bold font-mono tracking-widest text-on-surface-variant/40 uppercase block mb-1">
                    Description
                  </span>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    {activeAgent.desc}
                  </p>
                </div>

                <div>
                  <span className="text-[9px] font-bold font-mono tracking-widest text-on-surface-variant/40 uppercase block mb-2">
                    Capabilities & Tools Access
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {activeAgent.tools.map((t, i) => (
                      <Badge key={i} variant="secondary" className="font-mono text-[9px] py-0.5 px-2">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-surface-container-low border border-white/5 rounded-default grid grid-cols-2 gap-4 text-center">
                  <div>
                    <span className="text-[10px] text-on-surface-variant/40 block">Latencies Uptime</span>
                    <strong className="text-xs text-on-surface block mt-1">{activeAgent.latency}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-on-surface-variant/40 block">Allocated RAM</span>
                    <strong className="text-xs text-on-surface block mt-1">{activeAgent.memory}</strong>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "config" && (
              <form onSubmit={handleUpdateAgentConfig} className="space-y-4">
                {/* Temperature slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold font-mono text-on-surface-variant/60">
                    <span>Inference Temperature</span>
                    <span className="text-primary">{activeAgent.temp}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    defaultValue={activeAgent.temp}
                    className="w-full h-1 bg-white/5 rounded outline-none appearance-none accent-primary cursor-pointer"
                  />
                  <p className="text-[9px] text-on-surface-variant/30">
                    Lower levels favor determinism and precision. High levels increase creativity.
                  </p>
                </div>

                {/* Max tokens input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold font-mono text-on-surface-variant/60">
                    <span>Max Tokens Limit</span>
                    <span className="text-primary">{activeAgent.maxTokens}</span>
                  </div>
                  <input
                    type="number"
                    defaultValue={activeAgent.maxTokens}
                    className="w-full p-2 rounded bg-surface-container-low border border-white/5 text-xs text-on-surface focus:border-primary/20 outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-white/5 mt-4">
                  <Button type="button" variant="ghost" onClick={() => setSelectedAgentId(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary">
                    Save Config
                  </Button>
                </div>
              </form>
            )}

            {activeTab === "prompt" && (
              <div className="space-y-4">
                <div>
                  <span className="text-[9px] font-bold font-mono tracking-widest text-on-surface-variant/40 uppercase block mb-2">
                    Orchestrator System Instructions
                  </span>
                  <div className="p-3.5 bg-[#0a0e18] border border-white/5 rounded-default font-mono text-[11px] text-green-400 leading-relaxed overflow-x-auto select-all max-h-56">
                    {activeAgent.prompt}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "logs" && (
              <div className="space-y-4">
                <span className="text-[9px] font-bold font-mono tracking-widest text-on-surface-variant/40 uppercase block">
                  Runtime Stack Trace
                </span>
                <div className="p-3.5 bg-[#0a0e18] border border-white/5 rounded-default font-mono text-[10px] text-on-surface-variant/60 leading-relaxed space-y-2 max-h-56 overflow-y-auto custom-scrollbar">
                  <div>
                    <span className="text-on-surface-variant/30">[14:10:02]</span> Initializing agent graph dependencies.
                  </div>
                  <div>
                    <span className="text-on-surface-variant/30">[14:10:02]</span> Loaded system prompt structure.
                  </div>
                  <div>
                    <span className="text-on-surface-variant/30">[14:10:03]</span> Connecting database endpoints... Done.
                  </div>
                  <div className="text-green-400/90 font-bold">
                    <span className="text-on-surface-variant/30">[14:10:04]</span> Inference process returned successfully with code 0.
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Dialog>
    </div>
  );
}
