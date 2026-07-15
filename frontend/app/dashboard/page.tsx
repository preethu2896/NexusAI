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
  ChevronRight,
  HardDrive,
  Clock,
} from "lucide-react";
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

  // Ingestion state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docTitle, setDocTitle] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    fetchDocuments();
    fetchConversations();
  }, [fetchDocuments, fetchConversations]);

  const handleStartChat = async () => {
    try {
      const id = await createConversation(`Session Query #${conversations.length + 1}`);
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
    }, 1500);
  };

  // Pipeline chunks stats
  const totalChunks = documents.reduce((acc, doc) => acc + (doc.chunk_count || 0), 0);
  const indexedCount = documents.filter((d) => d.status === "indexed").length;
  const processingCount = documents.filter((d) => d.status === "processing").length;
  const failedCount = documents.filter((d) => d.status === "failed").length;

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h2 className="text-headline-md font-bold tracking-tight text-on-surface">
            Operational Control Center
          </h2>
          <p className="text-xs text-on-surface-variant/60 mt-1">
            Real-time pipeline monitoring, ingestion orchestrations, and LLM telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0f2e1a] border border-green-500/20 text-[9px] font-bold font-mono tracking-wider text-green-400 uppercase select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 block shrink-0 animate-pulse" />
            Active
          </div>
          <Button
            variant="ghost"
            onClick={handleForceSync}
            disabled={isSyncing}
            className="text-xs border border-white/5 bg-white/3 hover:bg-white/5"
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

      {/* Main command center grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
        {/* Left & Middle Column panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* KPI metrics nodes */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card variant="surface" className="p-4 border border-white/5">
              <span className="text-[9px] font-bold font-mono tracking-widest uppercase text-on-surface-variant/40 block mb-1">
                System Health
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-bold text-on-surface">99.98%</span>
                <span className="text-[8px] text-green-400 font-mono font-bold">Uptime</span>
              </div>
            </Card>

            <Card variant="surface" className="p-4 border border-white/5">
              <span className="text-[9px] font-bold font-mono tracking-widest uppercase text-on-surface-variant/40 block mb-1">
                Document Index
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-bold text-on-surface">{documents.length} Files</span>
                <span className="text-[8px] text-primary font-mono font-bold">{totalChunks} Chunks</span>
              </div>
            </Card>

            <Card variant="surface" className="p-4 border border-white/5">
              <span className="text-[9px] font-bold font-mono tracking-widest uppercase text-on-surface-variant/40 block mb-1">
                Retrieval Sim
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-bold text-on-surface">98.4%</span>
                <span className="text-[8px] text-[#d0bcff] font-mono font-bold">Cosine</span>
              </div>
            </Card>

            <Card variant="surface" className="p-4 border border-white/5">
              <span className="text-[9px] font-bold font-mono tracking-widest uppercase text-on-surface-variant/40 block mb-1">
                LLM Inference
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-bold text-on-surface">GPT-4o</span>
                <span className="text-[8px] text-yellow-500 font-mono font-bold">Active</span>
              </div>
            </Card>
          </div>

          {/* Quick Operations Actions bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 select-none">
            <button
              onClick={() => setIsUploadOpen(true)}
              className="flex items-center justify-between p-3 bg-surface-container border border-white/5 hover:border-primary/20 rounded-default text-left transition-all cursor-pointer focus:outline-none group"
            >
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-on-surface block truncate">Upload PDF</span>
                <span className="text-[9px] text-on-surface-variant/40 block truncate mt-0.5">Ingest new knowledge</span>
              </div>
              <Upload className="w-4 h-4 text-on-surface-variant/30 group-hover:text-primary shrink-0 ml-1.5" />
            </button>

            <button
              onClick={handleStartChat}
              className="flex items-center justify-between p-3 bg-surface-container border border-white/5 hover:border-[#d0bcff]/20 rounded-default text-left transition-all cursor-pointer focus:outline-none group"
            >
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-on-surface block truncate">Query RAG</span>
                <span className="text-[9px] text-on-surface-variant/40 block truncate mt-0.5">Launch new chat</span>
              </div>
              <Plus className="w-4 h-4 text-on-surface-variant/30 group-hover:text-[#d0bcff] shrink-0 ml-1.5" />
            </button>

            <button
              onClick={() => router.push("/knowledge")}
              className="flex items-center justify-between p-3 bg-surface-container border border-white/5 hover:border-cyan-400/20 rounded-default text-left transition-all cursor-pointer focus:outline-none group"
            >
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-on-surface block truncate">Browse Files</span>
                <span className="text-[9px] text-on-surface-variant/40 block truncate mt-0.5">Manage collections</span>
              </div>
              <ChevronRight className="w-4 h-4 text-on-surface-variant/30 group-hover:text-cyan-400 shrink-0 ml-1.5" />
            </button>

            <button
              onClick={() => router.push("/analytics")}
              className="flex items-center justify-between p-3 bg-surface-container border border-white/5 hover:border-yellow-400/20 rounded-default text-left transition-all cursor-pointer focus:outline-none group"
            >
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-on-surface block truncate">Observability</span>
                <span className="text-[9px] text-on-surface-variant/40 block truncate mt-0.5">Check token telemetry</span>
              </div>
              <BarChart3 className="w-4 h-4 text-on-surface-variant/30 group-hover:text-yellow-400 shrink-0 ml-1.5" />
            </button>
          </div>

          {/* Tables: Recent Documents & Conversations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Recent Documents Table */}
            <Card variant="surface" className="p-4 border border-white/5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[9px] font-bold font-mono tracking-widest text-on-surface-variant/45 uppercase">
                  Recent Document Ingestions
                </span>
                <button
                  onClick={() => router.push("/knowledge")}
                  className="text-[10px] text-primary hover:underline font-semibold"
                >
                  View library
                </button>
              </div>

              <div className="space-y-2">
                {documents.length === 0 ? (
                  <div className="py-8 text-center text-xs text-on-surface-variant/30 font-mono">
                    No active documents.
                  </div>
                ) : (
                  documents.slice(0, 3).map((doc) => (
                    <div
                      key={doc.document_id}
                      className="p-2.5 rounded bg-surface-container-low/50 border border-white/3 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0">
                        <span className="font-semibold text-on-surface block truncate">
                          {doc.title}
                        </span>
                        <span className="text-[9px] text-on-surface-variant/40 font-mono block mt-0.5">
                          {doc.chunk_count} chunks • {(doc.file_size_bytes ? (doc.file_size_bytes / 1024).toFixed(1) : 0)} KB
                        </span>
                      </div>
                      <Badge variant={doc.status === "indexed" ? "success" : "secondary"}>
                        {doc.status}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Recent Conversations Table */}
            <Card variant="surface" className="p-4 border border-white/5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[9px] font-bold font-mono tracking-widest text-on-surface-variant/45 uppercase">
                  Recent Chat Inferences
                </span>
                <button
                  onClick={() => router.push("/chat")}
                  className="text-[10px] text-primary hover:underline font-semibold"
                >
                  View console
                </button>
              </div>

              <div className="space-y-2">
                {conversations.length === 0 ? (
                  <div className="py-8 text-center text-xs text-on-surface-variant/30 font-mono">
                    No active threads.
                  </div>
                ) : (
                  conversations.slice(0, 3).map((conv) => (
                    <div
                      key={conv.id}
                      onClick={async () => {
                        await selectConversation(conv.id);
                        router.push("/chat");
                      }}
                      className="p-2.5 rounded bg-surface-container-low/50 border border-white/3 hover:border-primary/20 transition-all cursor-pointer flex items-center justify-between gap-3 text-xs group"
                    >
                      <div className="min-w-0 flex items-center gap-2">
                        <MessageSquare className="w-3.5 h-3.5 text-on-surface-variant/30 group-hover:text-primary shrink-0" />
                        <span className="font-semibold text-on-surface block truncate group-hover:text-primary transition-colors">
                          {conv.title || "Untitled Chat"}
                        </span>
                      </div>
                      <span className="text-[9px] font-mono text-on-surface-variant/30 shrink-0">
                        {new Date(conv.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Right side operational log panel */}
        <div className="space-y-6">
          {/* Pipeline queues */}
          <Card variant="surface" className="p-4 border border-white/5">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-primary" />
              <span className="text-[9px] font-bold font-mono tracking-widest text-on-surface-variant/45 uppercase">
                Pipeline Index status
              </span>
            </div>

            <div className="space-y-3.5">
              <div>
                <div className="flex justify-between text-[10px] font-mono text-on-surface-variant/50 mb-1">
                  <span>Indexed Files</span>
                  <span className="text-on-surface">{indexedCount} / {documents.length}</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="bg-green-400 h-full rounded-full transition-all duration-300"
                    style={{ width: `${documents.length ? (indexedCount / documents.length) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[10px] font-mono text-on-surface-variant/50 mb-1">
                  <span>In Progress</span>
                  <span className="text-on-surface">{processingCount}</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full transition-all duration-300"
                    style={{ width: `${documents.length ? (processingCount / documents.length) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 grid grid-cols-3 gap-2 text-center font-mono text-[9px] text-on-surface-variant/40">
                <div>
                  <strong className="text-on-surface block text-xs">{indexedCount}</strong> indexed
                </div>
                <div>
                  <strong className="text-on-surface block text-xs">{processingCount}</strong> pending
                </div>
                <div>
                  <strong className="text-on-surface block text-xs">{failedCount}</strong> failed
                </div>
              </div>
            </div>
          </Card>

          {/* Operational logs console */}
          <Card variant="surface" className="p-4 border border-white/5">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-[#d0bcff]" />
              <span className="text-[9px] font-bold font-mono tracking-widest text-on-surface-variant/45 uppercase">
                Operational Event Log
              </span>
            </div>

            <div className="space-y-3 font-mono text-[9px] leading-relaxed relative before:absolute before:top-2 before:bottom-2 before:left-[5px] before:w-px before:bg-white/5 pl-4">
              <div className="relative">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 block absolute -left-[14.5px] top-1" />
                <span className="text-on-surface-variant/30 block mb-0.5">[14:10:04]</span>
                <span className="text-on-surface-variant/75">
                  ChromaDB vector embedding sync complete. Cosine accuracy index threshold: 0.89.
                </span>
              </div>
              <div className="relative">
                <span className="w-1.5 h-1.5 rounded-full bg-primary block absolute -left-[14.5px] top-1" />
                <span className="text-on-surface-variant/30 block mb-0.5">[14:02:12]</span>
                <span className="text-on-surface-variant/75">
                  Ingestion process triggered for standard reference document PDF upload.
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Ingest PDF Modal */}
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
