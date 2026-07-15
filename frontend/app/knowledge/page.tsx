"use client";

import React, { useEffect, useState } from "react";
import {
  Upload,
  RefreshCw,
  Search,
  Database,
  Trash2,
  FileText,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Layers,
  ArrowRight,
  TrendingUp,
  Activity,
  Plus,
  Shield,
  Code,
  X,
  ChevronDown,
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { useChatStore } from "../../store/chatStore";
import { api } from "../../services/api";

export default function KnowledgeBase() {
  const { documents, fetchDocuments } = useChatStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Upload States
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docTitle, setDocTitle] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const cleanName = file.name.replace(/\.[^/.]+$/, "");
      setDocTitle(cleanName);
      setUploadError("");
      setUploadSuccess(false);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !docTitle.trim()) return;

    setIsUploading(true);
    setUploadError("");
    setUploadSuccess(false);

    try {
      await api.uploadDocument(selectedFile, docTitle);
      setUploadSuccess(true);
      setSelectedFile(null);
      setDocTitle("");
      await fetchDocuments();
      setTimeout(() => {
        setIsUploadOpen(false);
        setUploadSuccess(false);
      }, 1500);
    } catch (err: unknown) {
      console.error(err);
      setUploadError(
        err instanceof Error ? err.message : "Failed to upload document"
      );
    } finally {
      setIsUploading(false);
    }
  };

  // Mock collections data matching PNG exactly
  const mockCollections = [
    {
      title: "Legal Repository 2024",
      description: "Internal compliance documents, contract templates, and historical case...",
      docs: 428,
      sync: "2h ago",
      status: "HEALTHY",
      icon: FileText,
      iconColor: "text-primary bg-primary/10 border-primary/20",
    },
    {
      title: "Engineering Specs",
      description: "Architecture diagrams, API definitions, and technical RFCs for the core...",
      docs: 1054,
      sync: "1d ago",
      status: "HEALTHY",
      icon: Code,
      iconColor: "text-green-400 bg-green-400/10 border-green-400/20",
    },
    {
      title: "Market Intelligence",
      description: "Real-time competitive analysis reports and global market trend datasets.",
      docs: 18,
      sync: "45%",
      status: "SYNCING",
      icon: RefreshCw,
      iconColor: "text-secondary bg-secondary/10 border-secondary/20",
    },
    {
      title: "Security Protocols",
      description: "SOC2 compliance checklists, incident response playbooks, and security audit...",
      docs: 89,
      sync: "3d ago",
      status: "HEALTHY",
      icon: Shield,
      iconColor: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
    },
  ];

  // Mock logs matching PNG exactly
  const mockLogs = [
    {
      title: "Q3 Financial Reports Indexing Complete",
      desc: "Legal Repository • 142 documents processed • 1,842 chunks created",
      time: "14:24",
      status: "Success",
      color: "text-green-400 bg-green-400/10 border-green-400/15",
    },
    {
      title: "Market Intelligence Syncing...",
      desc: "Cloud Source • Processing item 4 of 12 • 24% completion",
      time: "14:10",
      status: "Active",
      color: "text-primary bg-primary/10 border-primary/15 animate-spin",
    },
    {
      title: "Ingestion Failed: broken_link_detected.pdf",
      desc: "Engineering Specs • Resource at 192.168.1.1 unreachable",
      time: "13:45",
      status: "Failed",
      color: "text-error bg-error/10 border-error/15",
    },
  ];

  return (
    <div className="space-y-8 pb-12 relative">
      {/* Title Header area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-headline-md font-bold tracking-tight text-on-surface">
            Knowledge Base
          </h2>
          <div className="flex items-center gap-3 text-xs text-on-surface-variant/50 mt-1.5 font-semibold">
            <span className="flex items-center gap-1 text-green-400">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 block" /> System Healthy
            </span>
            <span>Last synchronization: 12 minutes ago</span>
          </div>
        </div>

        {/* Buttons on Right */}
        <div className="flex items-center gap-3 shrink-0">
          <Button variant="ghost" onClick={() => setIsUploadOpen(true)}>
            <Upload className="w-4 h-4" /> Ingest Data
          </Button>
          <Button variant="primary" className="bg-[#adc6ff] hover:bg-[#9cbbf5] text-[#002e6a]">
            <RefreshCw className="w-4 h-4" /> Force Sync
          </Button>
        </div>
      </div>

      {/* Metrics Row (4 Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="surface" className="p-5 flex flex-col justify-between">
          <span className="text-[9px] font-bold font-mono tracking-widest text-on-surface-variant/40 uppercase">
            Total Collections
          </span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl font-bold text-on-surface">14</span>
            <span className="text-[9px] text-green-400 font-mono font-bold flex items-center">
              +2 <TrendingUp className="w-2.5 h-2.5 ml-0.5" />
            </span>
          </div>
        </Card>

        <Card variant="surface" className="p-5 flex flex-col justify-between">
          <span className="text-[9px] font-bold font-mono tracking-widest text-on-surface-variant/40 uppercase">
            Active Documents
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-on-surface">1,284</span>
            <span className="text-[9px] text-on-surface-variant/45 font-mono">
              4.2GB
            </span>
          </div>
        </Card>

        <Card variant="surface" className="p-5 flex flex-col justify-between">
          <span className="text-[9px] font-bold font-mono tracking-widest text-on-surface-variant/40 uppercase">
            Knowledge Chunks
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-on-surface">42.8k</span>
            <span className="text-[9px] text-[#adc6ff] font-mono font-semibold">
              Vectorized
            </span>
          </div>
        </Card>

        <Card variant="surface" className="p-5 flex flex-col justify-between">
          <span className="text-[9px] font-bold font-mono tracking-widest text-on-surface-variant/40 uppercase">
            Total Embeddings
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-on-surface">8.1M</span>
            <span className="text-[9px] text-on-surface-variant/45 font-mono">
              Ada-002
            </span>
          </div>
        </Card>
      </div>

      {/* Grid: Charts area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Left Column: Index Health Score */}
        <Card variant="surface" className="p-6 lg:col-span-1 flex flex-col justify-between">
          <div>
            <h3 className="text-label-caps text-on-surface tracking-wider mb-6">
              Index Health Score
            </h3>

            {/* Circular Gauge */}
            <div className="flex items-center justify-center py-4">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="72"
                    cy="72"
                    r="54"
                    className="stroke-white/5 fill-transparent"
                    strokeWidth="8"
                  />
                  <circle
                    cx="72"
                    cy="72"
                    r="54"
                    className="stroke-primary fill-transparent"
                    strokeWidth="8"
                    strokeDasharray="339"
                    strokeDashoffset="7" // 98% complete
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-extrabold text-on-surface">98%</span>
                  <span className="text-[9px] font-bold text-primary font-mono uppercase tracking-widest mt-1">
                    Optimal
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-white/5 text-xs">
            <div className="flex justify-between text-on-surface-variant/60">
              <span className="font-semibold">Latency</span>
              <span className="font-mono text-on-surface font-semibold">14ms</span>
            </div>
            <div className="flex justify-between text-on-surface-variant/60">
              <span className="font-semibold">Consistency</span>
              <span className="font-semibold text-green-400">High</span>
            </div>
            <div className="w-full h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
              <div className="bg-primary h-full w-[95%] rounded-full" />
            </div>
          </div>
        </Card>

        {/* Right Column: Chunk Distribution Matrix */}
        <Card variant="surface" className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-label-caps text-on-surface tracking-wider">
              Chunk Distribution Matrix
            </h3>
            {/* Legend block */}
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-white/5 block" />
              <span className="w-2.5 h-2.5 rounded-sm bg-white/10 block" />
              <span className="w-2.5 h-2.5 rounded-sm bg-white/20 block" />
              <span className="w-2.5 h-2.5 rounded-sm bg-primary block animate-pulse" />
            </div>
          </div>

          {/* Replicating the 14 bar bars chart exactly */}
          <div className="h-64 flex items-end justify-between gap-2.5 px-2">
            {[15, 30, 20, 48, 25, 75, 40, 60, 45, 82, 35, 68, 48, 30].map((hVal, idx) => {
              const isActive = idx === 9; // 10th bar highlighted
              return (
                <div
                  key={idx}
                  className={`w-full rounded-sm transition-all duration-300 ${
                    isActive
                      ? "bg-primary shadow-[0_0_12px_rgba(173,198,255,0.4)]"
                      : "bg-white/10 hover:bg-white/15"
                  }`}
                  style={{ height: `${hVal}%` }}
                />
              );
            })}
          </div>

          <div className="flex justify-between text-[10px] font-bold font-mono text-on-surface-variant/40 uppercase tracking-widest mt-6">
            <span>Low Density Clusters</span>
            <span>High Density Clusters</span>
          </div>
        </Card>
      </div>

      {/* Section 2: Knowledge Collections */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <h3 className="text-body-base font-bold text-on-surface tracking-wide">
            Knowledge Collections
          </h3>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#171b26] border border-white/5 text-[10px] font-semibold text-on-surface hover:bg-surface-container-high transition-colors">
              <span>Recent First</span>
              <ChevronDown className="w-3 h-3 text-on-surface-variant/60" />
            </button>
            <button className="p-2 rounded bg-[#171b26] border border-white/5 text-on-surface-variant/60 hover:text-on-surface transition-all">
              <Search className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {mockCollections.map((col) => {
            const Icon = col.icon;
            return (
              <Card key={col.title} variant="surface" className="p-6 flex flex-col justify-between h-[210px] relative overflow-hidden group hover:border-[rgba(255,255,255,0.12)]">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className={`w-9 h-9 rounded-md flex items-center justify-center border shrink-0 ${col.iconColor}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <Badge variant={col.status === "HEALTHY" ? "success" : "secondary"} className="text-[9px] py-0 px-2 uppercase tracking-wide">
                      {col.status}
                    </Badge>
                  </div>
                  <h4 className="text-body-sm font-bold text-on-surface mt-4 truncate">
                    {col.title}
                  </h4>
                  <p className="text-xs text-on-surface-variant/65 mt-2 line-clamp-2 leading-relaxed">
                    {col.description}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-on-surface-variant/50 pt-3 border-t border-white/5">
                  <div>
                    Docs: <strong className="text-on-surface">{col.docs}</strong>
                  </div>
                  <div>
                    {col.status === "SYNCING" ? "Status: " : "Last Sync: "}
                    <strong className="text-on-surface">{col.sync}</strong>
                  </div>
                </div>
              </Card>
            );
          })}

          {/* Create Collection card (dashed box) */}
          <Card
            onClick={() => setIsUploadOpen(true)}
            className="border border-dashed border-white/10 hover:border-primary/30 bg-surface-container-lowest/20 hover:bg-surface-container-low/40 flex flex-col items-center justify-center text-center h-[210px] cursor-pointer transition-all duration-200 group"
          >
            <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-on-surface-variant/60 group-hover:text-primary group-hover:border-primary/30 transition-all mb-4">
              <Plus className="w-5 h-5" />
            </div>
            <h4 className="text-body-sm font-bold text-on-surface">Create Collection</h4>
            <p className="text-xs text-on-surface-variant/40 mt-1">Connect a new data source</p>
          </Card>
        </div>
      </div>

      {/* Section 3: Recent Ingestion Logs */}
      <Card variant="surface" className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-label-caps text-on-surface tracking-wider">
            Recent Ingestion Logs
          </h3>
          <button className="text-xs text-primary hover:text-[#9cbbf5] transition-colors font-semibold bg-transparent border-none">
            View All Logs
          </button>
        </div>

        <div className="space-y-4">
          {mockLogs.map((log, idx) => (
            <div
              key={idx}
              className="p-4 rounded-default border border-white/5 bg-surface-container-low/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border shrink-0 ${log.color}`}>
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-body-sm font-bold text-on-surface truncate">
                    {log.title}
                  </h4>
                  <p className="text-xs text-on-surface-variant/60 truncate mt-0.5 leading-normal">
                    {log.desc}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0 text-right">
                <span className="text-[10px] font-mono text-on-surface-variant/40">
                  {log.time}
                </span>
                <Badge
                  variant={
                    log.status === "Success"
                      ? "success"
                      : log.status === "Failed"
                      ? "error"
                      : "secondary"
                  }
                  className="text-[10px] py-0 px-2 font-mono uppercase"
                >
                  {log.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* PDF Upload Modal overlay */}
      {isUploadOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-surface-container border-white/10 p-6 relative">
            <button
              onClick={() => setIsUploadOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded text-on-surface-variant/60 hover:text-on-surface hover:bg-white/5 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-body-base font-bold text-on-surface mb-4">
              Add New Reference Document
            </h3>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {/* Drag Drop Area */}
              <div className="relative border border-dashed border-white/10 hover:border-primary/45 rounded-default p-8 text-center transition-all bg-surface-container-lowest/40 cursor-pointer">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isUploading}
                />
                <Upload className="w-8 h-8 text-on-surface-variant/30 mx-auto mb-2" />
                {selectedFile ? (
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-primary truncate max-w-[240px] mx-auto">
                      {selectedFile.name}
                    </p>
                    <p className="text-[10px] text-on-surface-variant/50 font-mono">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-semibold text-on-surface">
                      Drag & Drop your file
                    </p>
                    <p className="text-[10px] text-on-surface-variant/50 mt-1">
                      PDF format only (Max 25MB)
                    </p>
                  </div>
                )}
              </div>

              {/* Title input */}
              {selectedFile && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold font-mono uppercase text-on-surface-variant/60 block">
                    Collection Title
                  </label>
                  <Input
                    type="text"
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    placeholder="Enter document title"
                    required
                  />
                </div>
              )}

              {/* Status notifications */}
              {uploadError && (
                <div className="flex items-start gap-2 bg-error-container/10 border border-error/20 p-3 rounded-default text-xs text-error">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{uploadError}</span>
                </div>
              )}

              {uploadSuccess && (
                <div className="flex items-start gap-2 bg-green-500/10 border border-green-500/20 p-3 rounded-default text-xs text-green-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>Document ingested and indexed successfully!</span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsUploadOpen(false)}
                  disabled={isUploading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!selectedFile || isUploading}
                  variant="primary"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Chunking...
                    </>
                  ) : (
                    "Start Ingestion"
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
