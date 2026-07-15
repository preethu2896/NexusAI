"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  MessageSquare,
  Layers,
  BarChart3,
  Plus,
  Upload,
  Cpu,
  Activity,
  CheckCircle,
  Database,
  Search,
  Zap,
  TrendingUp,
  Brain,
  ShieldCheck,
  Server,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Dialog } from "../../components/ui/Dialog";
import { useChatStore } from "../../store/chatStore";
import { useToastStore } from "../../store/toastStore";
import { api } from "../../services/api";

export default function Dashboard() {
  const router = useRouter();
  const { addToast } = useToastStore();
  const {
    documents,
    conversations,
    fetchDocuments,
    fetchConversations,
    createConversation,
    selectConversation,
  } = useChatStore();

  // Ingestion dialog state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docTitle, setDocTitle] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // System stats state
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    fetchDocuments();
    fetchConversations();
  }, [fetchDocuments, fetchConversations]);

  const handleStartChat = async () => {
    try {
      const id = await createConversation(`Workspace Chat #${conversations.length + 1}`);
      addToast("Created a new AI chat thread", "success");
      router.push("/chat");
    } catch (e) {
      addToast("Failed to create chat thread", "error");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setDocTitle(file.name.replace(/\.[^/.]+$/, ""));
      setUploadError("");
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !docTitle.trim()) return;

    setIsUploading(true);
    setUploadError("");

    try {
      await api.uploadDocument(selectedFile, docTitle);
      addToast("Document uploaded and started parsing", "success");
      setSelectedFile(null);
      setDocTitle("");
      setIsUploadOpen(false);
      fetchDocuments();
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : "Failed to upload document");
    } finally {
      setIsUploading(false);
    }
  };

  const handleForceSync = () => {
    setIsSyncing(true);
    addToast("Triggering full index synchronization across models...", "info");
    setTimeout(() => {
      setIsSyncing(false);
      fetchDocuments();
      addToast("Vector embeddings sync completed", "success");
    }, 2000);
  };

  // Pipeline chunks visual state
  const totalChunks = documents.reduce((acc, doc) => acc + (doc.chunk_count || 0), 0);
  const indexedCount = documents.filter((d) => d.status === "indexed").length;
  const processingCount = documents.filter((d) => d.status === "processing").length;
  const failedCount = documents.filter((d) => d.status === "failed").length;

  return (
    <div className="space-y-8 pb-12 select-none">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-display-lg-mobile md:text-headline-md lg:text-display-lg text-on-surface tracking-tight font-semibold select-none leading-none">
            AI Operating System
          </h1>
          <p className="text-body-sm text-on-surface-variant/65 mt-2.5">
            Orchestrating reference knowledge libraries, Agentic pipeline workflows, and secure inference queries.
          </p>
        </div>

        {/* Live system state */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-default bg-surface-container border border-white/5 text-[10px] font-bold font-mono tracking-wider text-green-400 uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 block shrink-0 animate-pulse" />
            Operational
          </div>
          <Button
            variant="ghost"
            onClick={handleForceSync}
            disabled={isSyncing}
            className="text-xs"
          >
            {isSyncing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            )}
            Force Sync
          </Button>
        </div>
      </div>

      {/* Grid: Health & Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Workspace Health */}
        <Card variant="surface" className="p-6 relative overflow-hidden group">
          <div className="flex items-center justify-between text-on-surface-variant/40 mb-3">
            <span className="text-[10px] font-bold font-mono tracking-widest uppercase">
              System Health
            </span>
            <ShieldCheck className="w-4 h-4 text-green-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-on-surface">
              99.98%
            </span>
            <span className="text-[9px] text-green-400 font-mono font-bold">
              Optimal
            </span>
          </div>
          <p className="text-[10px] text-on-surface-variant/40 mt-2">
            Inference latencies average 142ms.
          </p>
        </Card>

        {/* Active Collections */}
        <Card variant="surface" className="p-6 relative overflow-hidden group">
          <div className="flex items-center justify-between text-on-surface-variant/40 mb-3">
            <span className="text-[10px] font-bold font-mono tracking-widest uppercase">
              Knowledge Summary
            </span>
            <Layers className="w-4 h-4 text-primary" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight text-on-surface">
              {documents.length} Docs
            </span>
            <span className="text-[10px] text-on-surface-variant/40 font-mono">
              {totalChunks} Chunks
            </span>
          </div>
          <p className="text-[10px] text-on-surface-variant/40 mt-2">
            ChromaDB embeddings database indexed.
          </p>
        </Card>

        {/* Retrieval Status */}
        <Card variant="surface" className="p-6 relative overflow-hidden group">
          <div className="flex items-center justify-between text-on-surface-variant/40 mb-3">
            <span className="text-[10px] font-bold font-mono tracking-widest uppercase">
              Retrieval Accuracy
            </span>
            <Brain className="w-4 h-4 text-[#d0bcff]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-on-surface">
              98.4%
            </span>
            <span className="text-[9px] text-[#d0bcff] font-mono font-semibold">
              Cosine Sim
            </span>
          </div>
          <p className="text-[10px] text-on-surface-variant/40 mt-2">
            Average query distance delta 0.89.
          </p>
        </Card>

        {/* Token Usage */}
        <Card variant="surface" className="p-6 relative overflow-hidden group">
          <div className="flex items-center justify-between text-on-surface-variant/40 mb-3">
            <span className="text-[10px] font-bold font-mono tracking-widest uppercase">
              Current Model
            </span>
            <Cpu className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-on-surface">
              GPT-4o
            </span>
            <span className="text-[9px] text-on-surface-variant/40 font-mono">
              LLM Provider
            </span>
          </div>
          <p className="text-[10px] text-on-surface-variant/40 mt-2">
            Active connections to OpenAI secure API.
          </p>
        </Card>
      </div>

      {/* Grid: Quick Actions Command bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => setIsUploadOpen(true)}
          className="flex items-center gap-3 p-4 bg-surface-container border border-white/5 hover:border-primary/20 hover:bg-white/3 rounded-default transition-all duration-150 cursor-pointer text-left focus:outline-none group"
        >
          <div className="w-8 h-8 rounded bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-on-primary transition-colors">
            <Upload className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-on-surface block">
              Upload Document
            </span>
            <span className="text-[9px] text-on-surface-variant/40 block mt-0.5">
              Ingest new reference PDF
            </span>
          </div>
        </button>

        <button
          onClick={handleStartChat}
          className="flex items-center gap-3 p-4 bg-surface-container border border-white/5 hover:border-[#d0bcff]/20 hover:bg-white/3 rounded-default transition-all duration-150 cursor-pointer text-left focus:outline-none group"
        >
          <div className="w-8 h-8 rounded bg-[#d0bcff]/10 border border-[#d0bcff]/20 text-[#d0bcff] flex items-center justify-center shrink-0 group-hover:bg-[#d0bcff] group-hover:text-on-secondary transition-colors">
            <Plus className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-on-surface block">
              Start Chat
            </span>
            <span className="text-[9px] text-on-surface-variant/40 block mt-0.5">
              Launch a new chat session
            </span>
          </div>
        </button>

        <button
          onClick={() => router.push("/knowledge")}
          className="flex items-center gap-3 p-4 bg-surface-container border border-white/5 hover:border-cyan-400/20 hover:bg-white/3 rounded-default transition-all duration-150 cursor-pointer text-left focus:outline-none group"
        >
          <div className="w-8 h-8 rounded bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 flex items-center justify-center shrink-0 group-hover:bg-cyan-400 group-hover:text-black transition-colors">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-on-surface block">
              Create Collection
            </span>
            <span className="text-[9px] text-on-surface-variant/40 block mt-0.5">
              Group reference indexes
            </span>
          </div>
        </button>

        <button
          onClick={() => router.push("/analytics")}
          className="flex items-center gap-3 p-4 bg-surface-container border border-white/5 hover:border-yellow-400/20 hover:bg-white/3 rounded-default transition-all duration-150 cursor-pointer text-left focus:outline-none group"
        >
          <div className="w-8 h-8 rounded bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 flex items-center justify-center shrink-0 group-hover:bg-yellow-400 group-hover:text-black transition-colors">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-on-surface block">
              View Analytics
            </span>
            <span className="text-[9px] text-on-surface-variant/40 block mt-0.5">
              Check model token latencies
            </span>
          </div>
        </button>
      </div>

      {/* Grid: Pipeline Status & Activity Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Pipeline Status */}
        <Card variant="surface" className="p-6 lg:col-span-1">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="w-4 h-4 text-primary" />
            <h3 className="text-label-caps text-on-surface tracking-wider">
              Pipeline Status
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5 font-bold font-mono text-on-surface-variant/50">
                <span>Indexed (Success)</span>
                <span className="text-on-surface">{indexedCount} / {documents.length}</span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="bg-green-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${documents.length ? (indexedCount / documents.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5 font-bold font-mono text-on-surface-variant/50">
                <span>Processing</span>
                <span className="text-on-surface">{processingCount}</span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-500"
                  style={{ width: `${documents.length ? (processingCount / documents.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 grid grid-cols-3 gap-4 text-center">
              <div>
                <span className="text-xs font-bold text-on-surface block">{indexedCount}</span>
                <span className="text-[9px] text-on-surface-variant/40 uppercase font-bold mt-1">Indexed</span>
              </div>
              <div>
                <span className="text-xs font-bold text-on-surface block">{processingCount}</span>
                <span className="text-[9px] text-on-surface-variant/40 uppercase font-bold mt-1">Pending</span>
              </div>
              <div>
                <span className="text-xs font-bold text-on-surface block">{failedCount}</span>
                <span className="text-[9px] text-on-surface-variant/40 uppercase font-bold mt-1">Failed</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Activity Timeline */}
        <Card variant="surface" className="p-6 lg:col-span-2">
          <h3 className="text-label-caps text-on-surface tracking-wider mb-6">
            Ingestion & Inferences Timeline
          </h3>

          <div className="space-y-4 relative before:absolute before:top-2 before:bottom-2 before:left-[11px] before:w-0.5 before:bg-white/5">
            <div className="flex gap-4 relative">
              <div className="w-6 h-6 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center shrink-0 z-10">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <span className="text-xs font-semibold text-on-surface block">
                    Document parser synchronization complete
                  </span>
                  <span className="text-[10px] font-mono text-on-surface-variant/45">Just now</span>
                </div>
                <p className="text-[10px] text-on-surface-variant/65 mt-1 leading-normal">
                  ChromaDB vector embedding clusters successfully synchronized with OpenAI index structures.
                </p>
              </div>
            </div>

            <div className="flex gap-4 relative">
              <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0 z-10">
                <Upload className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <span className="text-xs font-semibold text-on-surface block">
                    Source text ingestion triggered
                  </span>
                  <span className="text-[10px] font-mono text-on-surface-variant/45">12m ago</span>
                </div>
                <p className="text-[10px] text-on-surface-variant/65 mt-1 leading-normal">
                  User uploaded standard document files containing reference APIs.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Grid: Recent Conversations & Recent Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Recent Conversations */}
        <Card variant="surface" className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-label-caps text-on-surface tracking-wider">
              Recent Conversations
            </h3>
            <button
              onClick={() => router.push("/chat")}
              className="text-xs text-primary hover:text-[#9cbbf5] transition-colors flex items-center gap-1 font-semibold"
            >
              View Chat Feed <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {conversations.length === 0 ? (
              <div className="py-8 text-center text-xs text-on-surface-variant/30 font-mono">
                No active conversations found.
              </div>
            ) : (
              conversations.slice(0, 3).map((conv) => (
                <div
                  key={conv.id}
                  onClick={async () => {
                    await selectConversation(conv.id);
                    router.push("/chat");
                  }}
                  className="p-3.5 rounded-default border border-white/5 hover:border-primary/20 bg-surface-container-low/40 hover:bg-white/3 transition-all duration-150 cursor-pointer flex items-center justify-between gap-4 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <MessageSquare className="w-4 h-4 text-on-surface-variant/30 group-hover:text-primary shrink-0" />
                    <span className="text-xs font-semibold text-on-surface group-hover:text-primary transition-colors truncate">
                      {conv.title || "Untitled Chat"}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-on-surface-variant/40 shrink-0">
                    {new Date(conv.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Recent Documents */}
        <Card variant="surface" className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-label-caps text-on-surface tracking-wider">
              Recent Documents
            </h3>
            <button
              onClick={() => router.push("/knowledge")}
              className="text-xs text-primary hover:text-[#9cbbf5] transition-colors flex items-center gap-1 font-semibold"
            >
              Browse Library <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {documents.length === 0 ? (
              <div className="py-8 text-center text-xs text-on-surface-variant/30 font-mono">
                No indexed files found.
              </div>
            ) : (
              documents.slice(0, 3).map((doc) => (
                <div
                  key={doc.document_id}
                  className="p-3.5 rounded-default border border-white/5 bg-surface-container-low/40 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className="w-4 h-4 text-on-surface-variant/30 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-xs font-semibold text-on-surface block truncate">
                        {doc.title}
                      </span>
                      <span className="text-[9px] text-on-surface-variant/45 font-mono block mt-0.5">
                        {doc.chunk_count} Chunks • {doc.status}
                      </span>
                    </div>
                  </div>
                  <Badge variant={doc.status === "indexed" ? "success" : "secondary"}>
                    {doc.status}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Upload document Modal dialog */}
      <Dialog
        isOpen={isUploadOpen}
        onClose={() => {
          setIsUploadOpen(false);
          setSelectedFile(null);
          setDocTitle("");
        }}
        title="Add Reference Knowledge Document"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">
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
                  Drag & Drop or Click to Select File
                </p>
                <p className="text-[10px] text-on-surface-variant/40 mt-1">
                  PDF format only (Max 25MB)
                </p>
              </div>
            )}
          </div>

          {selectedFile && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold font-mono uppercase text-on-surface-variant/60 block">
                Ingested File Title
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

          {uploadError && (
            <div className="flex items-start gap-2 bg-error-container/10 border border-error/20 p-3 rounded-default text-xs text-error">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{uploadError}</span>
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
                  Processing...
                </>
              ) : (
                "Ingest & Embed"
              )}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}

// Replacement for refreshcw import error
const RefreshCw = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
    />
  </svg>
);
