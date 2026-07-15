"use client";

import React, { useState } from "react";
import {
  Bot,
  Terminal,
  Settings,
  Check,
  Copy,
  GitFork,
  Database,
  Search,
  CheckCircle,
  FileSearch,
  Globe,
  Sliders,
  RefreshCw,
  FolderOpen,
  Filter,
  Zap,
  Microscope,
  Code,
  X,
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";

export default function Agents() {
  const [copiedCode, setCopiedCode] = useState(false);
  const [isSDKOpen, setIsSDKOpen] = useState(false);

  const sdkCode = `from nexusai import AgentOrchestrator

orchestrator = AgentOrchestrator(
    model="gpt-4o-mini",
    temperature=0.0
)

# Invoke the structured planning agent pipeline
response = orchestrator.run(
    query="How does database connection pooling affect PostgreSQL throughput?",
    document_id="ac6e267a-b579-49a7-a3a6-30283dcb4fb7"
)

print(response.answer)
`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(sdkCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-8 pb-12 relative">
      {/* Title Header area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-headline-md font-bold tracking-tight text-on-surface">
            Agentic Intelligence
          </h2>
          <p className="text-xs text-on-surface-variant/70 mt-2 max-w-3xl leading-relaxed">
            Deploy specialized RAG-enabled agents designed for complex orchestration. NexusAI agents operate autonomously within your knowledge boundaries to decompose strategies, synthesize data, and verify outputs.
          </p>
        </div>

        {/* Buttons on Right */}
        <div className="flex items-center gap-3 shrink-0">
          <Button variant="ghost">
            <Filter className="w-3.5 h-3.5" /> Filter
          </Button>
          <Button variant="primary" className="bg-[#adc6ff] hover:bg-[#9cbbf5] text-[#002e6a]">
            <Zap className="w-3.5 h-3.5" /> Quick Deploy
          </Button>
        </div>
      </div>

      {/* Grid of Agent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Planner Agent */}
        <Card variant="surface" className="p-6 flex flex-col justify-between h-[280px]">
          <div>
            <div className="flex items-start justify-between">
              <div className="w-9 h-9 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                <GitFork className="w-5 h-5 text-primary" />
              </div>
              <Badge variant="secondary" className="text-[9px] py-0 px-2 uppercase tracking-wide">
                Running
              </Badge>
            </div>
            <h4 className="text-body-sm font-bold text-on-surface mt-4">
              Planner Agent
            </h4>
            <p className="text-xs text-on-surface-variant/65 mt-2 line-clamp-3 leading-relaxed">
              Strategic task decomposition. Breaks down complex user requests into executable multi-step workflows.
            </p>
          </div>

          <div>
            <div className="grid grid-cols-2 gap-y-2 text-[10px] font-mono text-on-surface-variant/50 border-t border-white/5 pt-3">
              <div>
                LATENCY: <strong className="text-on-surface">120ms</strong>
              </div>
              <div>
                MEMORY: <strong className="text-on-surface">42MB</strong>
              </div>
              <div>
                VERSION: <strong className="text-on-surface">v1.4.2</strong>
              </div>
              <div>
                LAST EXEC: <strong className="text-on-surface">2m ago</strong>
              </div>
            </div>
            <div className="flex justify-between items-center mt-3 pt-2 border-t border-white/5 text-[10px] font-semibold text-on-surface-variant">
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-bold">L3</span>
                <span className="hover:text-on-surface cursor-pointer">✏️</span>
              </div>
              <button className="text-primary hover:underline cursor-pointer font-bold bg-transparent border-none">
                Configure
              </button>
            </div>
          </div>
        </Card>

        {/* Retriever Agent */}
        <Card variant="surface" className="p-6 flex flex-col justify-between h-[280px]">
          <div>
            <div className="flex items-start justify-between">
              <div className="w-9 h-9 rounded-md bg-[#d0bcff]/10 border border-[#d0bcff]/20 flex items-center justify-center text-[#d0bcff] shrink-0">
                <FileSearch className="w-5 h-5" />
              </div>
              <Badge variant="default" className="text-[9px] py-0 px-2 uppercase tracking-wide">
                Ready
              </Badge>
            </div>
            <h4 className="text-body-sm font-bold text-on-surface mt-4">
              Retriever Agent
            </h4>
            <p className="text-xs text-on-surface-variant/65 mt-2 line-clamp-3 leading-relaxed">
              High-precision semantic search. Optimized for finding granular data within vector stores and dense RAG indexes.
            </p>
          </div>

          <div>
            <div className="grid grid-cols-2 gap-y-2 text-[10px] font-mono text-on-surface-variant/50 border-t border-white/5 pt-3">
              <div>
                LATENCY: <strong className="text-on-surface">85ms</strong>
              </div>
              <div>
                MEMORY: <strong className="text-on-surface">128MB</strong>
              </div>
              <div>
                VERSION: <strong className="text-on-surface">v2.1.0</strong>
              </div>
              <div>
                LAST EXEC: <strong className="text-on-surface">14s ago</strong>
              </div>
            </div>
            <div className="flex justify-between items-center mt-3 pt-2 border-t border-white/5 text-[10px] font-semibold text-on-surface-variant">
              <span>ID: RT-9021</span>
              <button className="text-primary hover:underline cursor-pointer font-bold bg-transparent border-none">
                Configure
              </button>
            </div>
          </div>
        </Card>

        {/* Research Agent */}
        <Card variant="surface" className="p-6 flex flex-col justify-between h-[280px]">
          <div>
            <div className="flex items-start justify-between">
              <div className="w-9 h-9 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-on-surface-variant shrink-0">
                <Microscope className="w-5 h-5" />
              </div>
              <Badge variant="default" className="text-[9px] py-0 px-2 uppercase tracking-wide bg-white/5 text-on-surface-variant/75">
                Idle
              </Badge>
            </div>
            <h4 className="text-body-sm font-bold text-on-surface mt-4">
              Research Agent
            </h4>
            <p className="text-xs text-on-surface-variant/65 mt-2 line-clamp-2 leading-relaxed">
              Deep-dive synthesis and reporting. Cross-references multiple sources to create comprehensive whitepapers.
            </p>

            {/* Special Inner Container: LAST RUN OUTCOME */}
            <div className="mt-3 p-2.5 rounded border border-white/5 bg-[#171b26] flex items-center gap-2 text-[10px]">
              <CheckCircle className="w-3.5 h-3.5 text-green-400 shrink-0" />
              <span className="font-mono italic text-on-surface-variant/80 truncate">
                "Annual Market Analysis complete..."
              </span>
            </div>
          </div>

          <div>
            <div className="grid grid-cols-2 gap-y-2 text-[10px] font-mono text-on-surface-variant/50 border-t border-white/5 pt-3">
              <div>
                LATENCY: <strong className="text-on-surface">1.2s</strong>
              </div>
              <div>
                MEMORY: <strong className="text-on-surface">512MB</strong>
              </div>
              <div>
                VERSION: <strong className="text-on-surface">v0.9.8</strong>
              </div>
              <div>
                LAST EXEC: <strong className="text-on-surface">1h ago</strong>
              </div>
            </div>
            <div className="flex justify-end items-center mt-3 pt-2 border-t border-white/5 text-[10px] font-semibold">
              <button className="text-primary hover:underline cursor-pointer font-bold bg-transparent border-none">
                Configure
              </button>
            </div>
          </div>
        </Card>

        {/* SQL Agent */}
        <Card variant="surface" className="p-6 flex flex-col justify-between h-[280px]">
          <div>
            <div className="flex items-start justify-between">
              <div className="w-9 h-9 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                <Database className="w-5 h-5 text-primary" />
              </div>
              <Badge variant="secondary" className="text-[9px] py-0 px-2 uppercase tracking-wide">
                Running
              </Badge>
            </div>
            <h4 className="text-body-sm font-bold text-on-surface mt-4">
              SQL Agent
            </h4>
            <p className="text-xs text-on-surface-variant/65 mt-2 line-clamp-3 leading-relaxed">
              Structured data querying. Translates natural language into high-performance SQL for direct database interaction.
            </p>
          </div>

          <div>
            <div className="grid grid-cols-2 gap-y-2 text-[10px] font-mono text-on-surface-variant/50 border-t border-white/5 pt-3">
              <div>
                LATENCY: <strong className="text-on-surface">45ms</strong>
              </div>
              <div>
                MEMORY: <strong className="text-on-surface">32MB</strong>
              </div>
              <div>
                VERSION: <strong className="text-on-surface">v1.2.0</strong>
              </div>
              <div>
                LAST EXEC: <strong className="text-on-surface">5m ago</strong>
              </div>
            </div>
            <div className="flex justify-between items-center mt-3 pt-2 border-t border-white/5 text-[10px] font-semibold text-on-surface-variant">
              <span>DB Connect: Main_Prod</span>
              <button className="text-primary hover:underline cursor-pointer font-bold bg-transparent border-none">
                Configure
              </button>
            </div>
          </div>
        </Card>

        {/* Web Search Agent */}
        <Card variant="surface" className="p-6 flex flex-col justify-between h-[280px]">
          <div>
            <div className="flex items-start justify-between">
              <div className="w-9 h-9 rounded-md bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <Badge variant="error" className="text-[9px] py-0 px-2 uppercase tracking-wide">
                Offline
              </Badge>
            </div>
            <h4 className="text-body-sm font-bold text-on-surface mt-4">
              Web Search Agent
            </h4>
            <p className="text-xs text-on-surface-variant/65 mt-2 line-clamp-3 leading-relaxed">
              Real-time external knowledge. Scours the live web to find the most current information beyond static training data.
            </p>
          </div>

          <div>
            <div className="grid grid-cols-2 gap-y-2 text-[10px] font-mono text-on-surface-variant/50 border-t border-white/5 pt-3">
              <div>
                LATENCY: <strong className="text-on-surface">2.4s</strong>
              </div>
              <div>
                MEMORY: <strong className="text-on-surface">64MB</strong>
              </div>
              <div>
                VERSION: <strong className="text-on-surface">v1.0.5</strong>
              </div>
              <div>
                LAST EXEC: <strong className="text-on-surface">12m ago</strong>
              </div>
            </div>
            <div className="flex justify-between items-center mt-3 pt-2 border-t border-white/5 text-[10px] font-semibold text-on-surface-variant">
              <div className="flex items-center gap-1">
                <span className="w-4 h-4 rounded bg-white/5 block" />
                <span className="w-4 h-4 rounded bg-white/5 block" />
              </div>
              <button className="text-primary hover:underline cursor-pointer font-bold bg-transparent border-none">
                Configure
              </button>
            </div>
          </div>
        </Card>

        {/* Memory Agent */}
        <Card variant="surface" className="p-6 flex flex-col justify-between h-[280px]">
          <div>
            <div className="flex items-start justify-between">
              <div className="w-9 h-9 rounded-md bg-[#d0bcff]/10 border border-[#d0bcff]/20 flex items-center justify-center text-[#d0bcff] shrink-0">
                <Sliders className="w-5 h-5" />
              </div>
              <Badge variant="default" className="text-[9px] py-0 px-2 uppercase tracking-wide">
                Ready
              </Badge>
            </div>
            <h4 className="text-body-sm font-bold text-on-surface mt-4">
              Memory Agent
            </h4>
            <p className="text-xs text-on-surface-variant/65 mt-2 line-clamp-3 leading-relaxed">
              Long-term conversation context. Manages entity extraction and user preference persistence across sessions.
            </p>
          </div>

          <div>
            <div className="grid grid-cols-2 gap-y-2 text-[10px] font-mono text-on-surface-variant/50 border-t border-white/5 pt-3">
              <div>
                LATENCY: <strong className="text-on-surface">15ms</strong>
              </div>
              <div>
                MEMORY: <strong className="text-on-surface">256MB</strong>
              </div>
              <div>
                VERSION: <strong className="text-on-surface">v2.0.1</strong>
              </div>
              <div>
                LAST EXEC: <strong className="text-on-surface">Now</strong>
              </div>
            </div>
            <div className="flex justify-between items-center mt-3 pt-2 border-t border-white/5 text-[10px] font-semibold text-on-surface-variant">
              <span>2.4k entities tracked</span>
              <button className="text-primary hover:underline cursor-pointer font-bold bg-transparent border-none">
                Configure
              </button>
            </div>
          </div>
        </Card>

        {/* Reflection Agent (spans 2 columns on large screens) */}
        <Card variant="surface" className="p-6 flex flex-col justify-between h-[280px] lg:col-span-2">
          <div>
            <div className="flex items-start justify-between">
              <div className="w-9 h-9 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                <RefreshCw className="w-5 h-5 text-primary" />
              </div>
              <Badge variant="secondary" className="text-[9px] py-0 px-2 uppercase tracking-wide">
                Running
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <h4 className="text-body-sm font-bold text-on-surface">
                  Reflection Agent
                </h4>
                <p className="text-xs text-on-surface-variant/65 mt-2 leading-relaxed">
                  Output verification and self-correction. Critiques other agents' responses to ensure accuracy, safety, and brand alignment before delivery.
                </p>
              </div>

              {/* Middle/Right Accuracy Gauge block */}
              <div className="flex flex-col justify-center border-l border-white/5 md:pl-6">
                <span className="text-[9px] font-bold font-mono tracking-widest text-on-surface-variant/40 uppercase">
                  Verification Accuracy
                </span>
                <span className="text-2xl font-bold text-on-surface mt-1">
                  99.8%
                </span>
                <div className="w-full h-1.5 bg-white/5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-primary h-full w-[99.8%] rounded-full" />
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 text-[9px] font-mono text-on-surface-variant/50">
                  <div>LATENCY: 85ms</div>
                  <div>MEMORY: 128MB</div>
                  <div>VERSION: v2.1.0</div>
                  <div>LAST EXEC: 14s ago</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end items-center pt-3 border-t border-white/5">
            <button className="py-1.5 px-4 rounded bg-[#171b26] hover:bg-[#1c1f2a] border border-white/5 text-[10px] font-bold text-on-surface transition-all cursor-pointer">
              Run Integrity Audit
            </button>
          </div>
        </Card>

        {/* View Logs Card (Spans remaining column in Reflection row) */}
        <Card variant="surface" className="p-6 flex flex-col items-center justify-center text-center h-[280px]">
          <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-on-surface-variant/50 mb-4">
            <Terminal className="w-5 h-5" />
          </div>
          <h4 className="text-body-sm font-bold text-on-surface">System Logs</h4>
          <p className="text-xs text-on-surface-variant/40 mt-1 max-w-[180px]">
            Audit raw orchestration agent execution steps.
          </p>
          <button className="mt-5 w-full py-2 bg-[#171b26] hover:bg-[#1c1f2a] border border-white/5 text-xs font-semibold text-on-surface rounded-default transition-all cursor-pointer">
            View Logs
          </button>
        </Card>
      </div>

      {/* Custom Agent Development Banner */}
      <Card variant="surface" className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-surface-container-low via-surface-container to-surface-container-high relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-2 relative z-10 max-w-xl">
          <h3 className="text-headline-md font-bold text-on-surface tracking-tight">
            Custom Agent Development
          </h3>
          <p className="text-xs text-on-surface-variant/75 leading-relaxed">
            Need something more specific? Use our SDK to build and register your own custom agents with proprietary tools and logic.
          </p>
        </div>

        <div className="relative z-10 shrink-0">
          <button
            onClick={() => setIsSDKOpen(true)}
            className="px-5 py-2.5 bg-white text-black hover:bg-neutral-200 font-bold text-xs rounded-default transition-all shadow-md active:scale-[0.98] cursor-pointer"
          >
            View SDK Documentation
          </button>
        </div>
      </Card>

      {/* Programmatic execution details shown in a modal if clicked */}
      {isSDKOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl bg-surface-container border-white/10 p-6 relative">
            <button
              onClick={() => setIsSDKOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded text-on-surface-variant/60 hover:text-on-surface hover:bg-white/5 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-primary" />
                <h3 className="text-label-caps text-on-surface tracking-wider">
                  Programmatic Execution (Python SDK)
                </h3>
              </div>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-on-surface bg-white/5 px-2.5 py-1 rounded border border-white/5 transition-all cursor-pointer font-semibold focus:outline-none"
              >
                {copiedCode ? "Copied!" : "Copy Snippet"}
              </button>
            </div>

            <div className="relative rounded-default overflow-hidden bg-surface-container-lowest border border-white/5">
              <pre className="p-4 overflow-x-auto leading-relaxed custom-scrollbar">
                <code className="text-mono-code text-green-400 block">{sdkCode}</code>
              </pre>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
