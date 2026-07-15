"use client";

import React, { useEffect, useState } from "react";
import {
  FileText,
  Search,
  Grid,
  List,
  Upload,
  Layers,
  ArrowUpDown,
  MoreVertical,
  Trash2,
  FolderOpen,
  Calendar,
  HardDrive,
  Cpu,
  RefreshCw,
  Plus,
  Loader2,
  AlertCircle,
  CheckCircle,
  Database,
  ArrowRight,
  ChevronDown,
  Info,
  Heart,
  TrendingUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { Sheet } from "../../components/ui/Sheet";
import { Dialog } from "../../components/ui/Dialog";
import { Dropdown } from "../../components/ui/Dropdown";
import { useChatStore } from "../../store/chatStore";
import { useToastStore } from "../../store/toastStore";
import { api } from "../../services/api";

export default function KnowledgeBase() {
  const { addToast } = useToastStore();
  const { documents, fetchDocuments } = useChatStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeFolder, setActiveFolder] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "date" | "chunks">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Ingestion modal states
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docTitle, setDocTitle] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Document Details Sheet drawer state
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const selectedDoc = documents.find((d) => d.document_id === selectedDocId);

  // Rename Dialog state
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [renameDocId, setRenameDocId] = useState<string | null>(null);
  const [renameTitle, setRenameTitle] = useState("");

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

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
      addToast(`Uploaded: ${docTitle}`, "success");
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

  const handleDeleteDoc = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}" from the vector database?`)) {
      try {
        await api.deleteDocument(id);
        addToast(`Deleted reference index: ${name}`, "warning");
        if (selectedDocId === id) setSelectedDocId(null);
        fetchDocuments();
      } catch (e) {
        addToast("Failed to delete document", "error");
      }
    }
  };

  const triggerRenameDialog = (id: string, currentTitle: string) => {
    setRenameDocId(id);
    setRenameTitle(currentTitle);
    setIsRenameOpen(true);
  };

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameTitle.trim() || !renameDocId) return;

    addToast(`Renamed index to: ${renameTitle} (Local mock)`, "success");
    setIsRenameOpen(false);
    setRenameDocId(null);
  };

  const folders = [
    { id: "all", name: "All Documents", count: documents.length },
    { id: "legal", name: "Legal Compliance", count: 1 },
    { id: "eng", name: "Engineering Specs", count: 2 },
    { id: "sec", name: "Security Protocols", count: 1 },
  ];

  // Filtering documents
  const filteredDocs = documents
    .filter((d) => d.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter((d) => {
      if (activeFolder === "all") return true;
      if (activeFolder === "legal") return d.title.toLowerCase().includes("financial") || d.title.toLowerCase().includes("report");
      if (activeFolder === "eng") return d.title.toLowerCase().includes("api") || d.title.toLowerCase().includes("research");
      if (activeFolder === "sec") return d.title.toLowerCase().includes("security") || d.title.toLowerCase().includes("feedback");
      return true;
    });

  // Sorting documents
  const sortedDocs = [...filteredDocs].sort((a, b) => {
    let comparison = 0;
    if (sortBy === "name") {
      comparison = a.title.localeCompare(b.title);
    } else if (sortBy === "chunks") {
      comparison = (a.chunk_count || 0) - (b.chunk_count || 0);
    } else {
      comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    }
    return sortOrder === "asc" ? comparison : -comparison;
  });

  const toggleSortOrder = (type: "name" | "date" | "chunks") => {
    if (sortBy === type) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(type);
      setSortOrder("desc");
    }
  };

  // Pipeline metrics
  const totalChunks = documents.reduce((acc, doc) => acc + (doc.chunk_count || 0), 0);
  const indexedCount = documents.filter((d) => d.status === "indexed").length;
  const failedCount = documents.filter((d) => d.status === "failed").length;

  return (
    <div className="flex flex-col lg:flex-row gap-8 pb-12 select-none">
      {/* Left Column: Health & Ingestion Jobs */}
      <div className="w-full lg:w-64 shrink-0 space-y-6">
        {/* Health telemetry widget */}
        <Card variant="surface" className="p-4 border border-white/5">
          <span className="text-[9px] font-bold font-mono tracking-widest text-on-surface-variant/40 uppercase block mb-3">
            Knowledge Base Health
          </span>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-on-surface">99.8%</span>
              <span className="text-[8px] text-green-400 font-mono font-bold">Stable</span>
            </div>
            <Badge variant="success" className="py-0.5 px-2 text-[9px]">Uptime OK</Badge>
          </div>

          <div className="space-y-2 text-[10px] font-mono text-on-surface-variant/40 pt-3.5 border-t border-white/5">
            <div className="flex justify-between">
              <span>Indexed vectors:</span>
              <strong className="text-on-surface">{totalChunks} nodes</strong>
            </div>
            <div className="flex justify-between">
              <span>Sync status:</span>
              <span className="text-green-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 block shrink-0 animate-pulse" />
                Synced
              </span>
            </div>
          </div>
        </Card>

        {/* Recent failures & uploads logs */}
        <Card variant="surface" className="p-4 border border-white/5 space-y-3.5">
          <span className="text-[9px] font-bold font-mono tracking-widest text-on-surface-variant/40 uppercase block">
            Ingestion Pipeline Logs
          </span>
          <div className="space-y-3 font-mono text-[9px]">
            <div className="border-b border-white/3 pb-2.5">
              <div className="flex items-center justify-between text-green-400 font-bold mb-1">
                <span>INDEXED</span>
                <span>2m ago</span>
              </div>
              <span className="text-on-surface-variant block truncate">engineering_api_spec.pdf</span>
              <span className="text-on-surface-variant/40 block mt-0.5">32 chunks parsed.</span>
            </div>

            <div className="pb-1">
              <div className="flex items-center justify-between text-error font-bold mb-1">
                <span>FAILED</span>
                <span>1h ago</span>
              </div>
              <span className="text-on-surface-variant block truncate">invalid_format_scanned.pdf</span>
              <span className="text-on-surface-variant/40 block mt-0.5 leading-normal">
                Error: Empty extracted text. OCR engine required.
              </span>
            </div>
          </div>
        </Card>

        {/* Collections filter */}
        <div className="space-y-1">
          <span className="text-[9px] font-bold font-mono tracking-widest text-on-surface-variant/35 uppercase px-3 block">
            Collections folders
          </span>
          <div className="space-y-0.5">
            {folders.map((fold) => {
              const isAct = fold.id === activeFolder;
              return (
                <button
                  key={fold.id}
                  onClick={() => setActiveFolder(fold.id)}
                  className={`w-full flex items-center justify-between py-1.5 px-3 rounded text-[11px] font-semibold transition-all cursor-pointer text-left focus:outline-none ${
                    isAct
                      ? "bg-[#1c2438] text-primary border border-primary/10"
                      : "text-on-surface-variant/70 hover:text-on-surface hover:bg-white/3"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Layers className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{fold.name}</span>
                  </div>
                  <Badge variant="secondary" className="font-mono text-[9px] py-0.5 px-1.5 shrink-0">
                    {fold.count}
                  </Badge>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Column: Files Grid & Search Toolbar */}
      <div className="flex-grow space-y-6">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div className="flex items-center gap-3 flex-grow max-w-md">
            <div className="relative w-full flex items-center">
              <Search className="w-4 h-4 text-on-surface-variant/30 absolute left-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Search database library..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2 pl-10 pr-4 rounded bg-[#0f131d] border border-white/5 outline-none text-xs text-on-surface placeholder:text-on-surface-variant/30 focus:border-primary/20 transition-all font-mono"
              />
            </div>
          </div>

          <div className="flex items-center gap-3.5 justify-end shrink-0">
            <div className="flex items-center gap-1 bg-surface-container rounded-default border border-white/5 p-0.5">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-default transition-all cursor-pointer focus:outline-none ${
                  viewMode === "grid"
                    ? "bg-[#1c2438] text-primary"
                    : "text-on-surface-variant/40 hover:text-on-surface"
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-default transition-all cursor-pointer focus:outline-none ${
                  viewMode === "list"
                    ? "bg-[#1c2438] text-primary"
                    : "text-on-surface-variant/40 hover:text-on-surface"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <Button
              variant="primary"
              onClick={() => setIsUploadOpen(true)}
              className="bg-[#adc6ff] hover:bg-[#9cbbf5] text-[#002e6a] text-xs py-1.5"
            >
              <Upload className="w-3.5 h-3.5 mr-1" /> Ingest PDF
            </Button>
          </div>
        </div>

        {/* Files display grid */}
        {sortedDocs.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-white/5 rounded-default select-none">
            <FileText className="w-8 h-8 text-on-surface-variant/20 mx-auto mb-2.5" />
            <p className="text-xs text-on-surface font-semibold">No documents indexed in this folder</p>
            <p className="text-[10px] text-on-surface-variant/30 mt-1">Upload files to populate the database.</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {sortedDocs.map((doc) => (
              <Card
                key={doc.document_id}
                variant="surface"
                onClick={() => setSelectedDocId(doc.document_id)}
                className="p-5 border border-white/5 hover:border-primary/20 cursor-pointer flex flex-col justify-between h-[230px] group transition-all duration-150 relative"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-8 h-8 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                      <FileText className="w-4 h-4 text-primary" />
                    </div>
                    <Dropdown
                      trigger={
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="p-1 rounded text-on-surface-variant/40 hover:text-on-surface hover:bg-white/5 cursor-pointer focus:outline-none"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                      }
                      items={[
                        {
                          id: "rename",
                          label: "Rename document",
                          onClick: () => triggerRenameDialog(doc.document_id, doc.title),
                        },
                        {
                          id: "delete",
                          label: <span className="text-error font-bold">Delete index</span>,
                          onClick: () => handleDeleteDoc(doc.document_id, doc.title),
                        },
                      ]}
                    />
                  </div>

                  <h4 className="text-xs font-bold text-on-surface mt-3 group-hover:text-primary transition-colors truncate">
                    {doc.title}
                  </h4>
                  <p className="text-[9px] text-on-surface-variant/35 font-mono block mt-1.5 uppercase tracking-wide">
                    {doc.chunk_count || 0} Chunks • {(doc.file_size_bytes ? (doc.file_size_bytes / 1024).toFixed(1) : 0)} KB
                  </p>
                  
                  {/* Document insights summary snippet */}
                  <p className="text-[10px] text-on-surface-variant/50 line-clamp-3 mt-3 leading-relaxed">
                    AI Insight: Contains detailed API endpoint schemas and vector ingestion connection specifications for internal services mapping.
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-3.5 mt-3 select-none">
                  <Badge variant={doc.status === "indexed" ? "success" : "secondary"}>
                    {doc.status}
                  </Badge>
                  <span className="text-[9px] text-on-surface-variant/30 font-mono">
                    {new Date(doc.created_at).toLocaleDateString()}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="border border-white/5 rounded-default overflow-hidden bg-surface-container-low/20">
            <div className="grid grid-cols-12 gap-3 p-3 bg-surface-container-low border-b border-white/5 font-mono text-[9px] text-on-surface-variant/40 uppercase tracking-widest font-bold">
              <span className="col-span-5">Name</span>
              <span className="col-span-2 text-center">Chunks</span>
              <span className="col-span-2 text-center">Size</span>
              <span className="col-span-2 text-center">Status</span>
              <span className="col-span-1"></span>
            </div>

            <div className="divide-y divide-white/3">
              {sortedDocs.map((doc) => (
                <div
                  key={doc.document_id}
                  onClick={() => setSelectedDocId(doc.document_id)}
                  className="grid grid-cols-12 gap-3 p-3 items-center hover:bg-white/2 cursor-pointer transition-all text-xs"
                >
                  <div className="col-span-5 flex items-center gap-2.5 min-w-0">
                    <FileText className="w-4 h-4 text-on-surface-variant/30 shrink-0" />
                    <span className="font-semibold text-on-surface truncate">{doc.title}</span>
                  </div>
                  <span className="col-span-2 text-center font-mono text-on-surface-variant">{doc.chunk_count || 0}</span>
                  <span className="col-span-2 text-center font-mono text-on-surface-variant">
                    {(doc.file_size_bytes ? (doc.file_size_bytes / 1024).toFixed(1) : 0)} KB
                  </span>
                  <div className="col-span-2 text-center">
                    <Badge variant={doc.status === "indexed" ? "success" : "secondary"}>
                      {doc.status}
                    </Badge>
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <Dropdown
                      trigger={
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="p-1 rounded text-on-surface-variant/40 hover:text-on-surface hover:bg-white/5 cursor-pointer focus:outline-none"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                      }
                      items={[
                        {
                          id: "rename",
                          label: "Rename document",
                          onClick: () => triggerRenameDialog(doc.document_id, doc.title),
                        },
                        {
                          id: "delete",
                          label: <span className="text-error font-bold">Delete index</span>,
                          onClick: () => handleDeleteDoc(doc.document_id, doc.title),
                        },
                      ]}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Preview Sheet Drawer */}
      <Sheet
        isOpen={!!selectedDocId}
        onClose={() => setSelectedDocId(null)}
        title={selectedDoc ? selectedDoc.title : "Document Insights & Chunks"}
      >
        {selectedDoc && (
          <div className="space-y-6">
            <div>
              <span className="text-[9px] font-bold font-mono tracking-widest text-on-surface-variant/40 uppercase block mb-2">
                Document Metadata
              </span>
              <div className="p-3 bg-surface-container-low border border-white/5 rounded-default grid grid-cols-2 gap-3 text-center text-xs">
                <div>
                  <span className="text-on-surface-variant/45 block text-[10px]">Indexed Chunks</span>
                  <strong className="text-on-surface block mt-0.5">{selectedDoc.chunk_count || 0}</strong>
                </div>
                <div>
                  <span className="text-on-surface-variant/45 block text-[10px]">File size</span>
                  <strong className="text-on-surface block mt-0.5">
                    {(selectedDoc.file_size_bytes ? (selectedDoc.file_size_bytes / 1024).toFixed(1) : 0)} KB
                  </strong>
                </div>
              </div>
            </div>

            <div>
              <span className="text-[9px] font-bold font-mono tracking-widest text-on-surface-variant/40 uppercase block mb-2">
                AI Document insight
              </span>
              <p className="text-xs text-on-surface-variant/75 leading-relaxed bg-[#0a0e18] p-3 rounded border border-white/5">
                Contains essential architecture configurations, connection pools rules, and schema attributes parsed specifically for indexing references queries. Enables quick matching accuracy cosine metrics checks.
              </p>
            </div>

            <div>
              <span className="text-[9px] font-bold font-mono tracking-widest text-on-surface-variant/40 uppercase block mb-2">
                Parsed Chunks Index List
              </span>
              <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                {(selectedDoc as any).chunks && (selectedDoc as any).chunks.length > 0 ? (
                  (selectedDoc as any).chunks.map((chunk: any) => (
                    <div
                      key={chunk.chunk_id}
                      className="p-3 rounded border border-white/3 bg-surface-container-low/50 font-serif text-[10px] text-on-surface-variant/60 leading-relaxed"
                    >
                      <div className="flex justify-between font-mono text-[8px] text-primary uppercase font-bold mb-1 pb-1 border-b border-white/3">
                        <span>Chunk #{chunk.chunk_id.substring(0, 4)}</span>
                        <span>Page {chunk.page_number}</span>
                      </div>
                      <p className="line-clamp-4">{chunk.content}</p>
                    </div>
                  ))
                ) : (
                  <div className="space-y-2">
                    {[1, 2].map((i) => (
                      <div
                        key={i}
                        className="p-3 rounded border border-white/3 bg-surface-container-low/50 font-serif text-[10px] text-on-surface-variant/60 leading-relaxed"
                      >
                        <div className="flex justify-between font-mono text-[8px] text-primary uppercase font-bold mb-1 pb-1 border-b border-white/3">
                          <span>Chunk #000{i}</span>
                          <span>Page {i}</span>
                        </div>
                        <p className="line-clamp-4">
                          This is a preview chunk containing parsed text extraction from the source document PDF. The content is segmented recursive character ranges to fit model query embeds rules.
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Sheet>

      {/* Ingest PDF Modal */}
      <Dialog
        isOpen={isUploadOpen}
        onClose={() => {
          setIsUploadOpen(false);
          setSelectedFile(null);
          setDocTitle("");
        }}
        title="Ingest Reference document"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div className="relative border border-dashed border-white/10 hover:border-primary/45 rounded-default p-8 text-center transition-all bg-[#0a0e18]/40 cursor-pointer">
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
                <p className="text-xs font-semibold text-primary truncate max-w-[240px] mx-auto font-mono">
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

      {/* Rename Dialog */}
      <Dialog
        isOpen={isRenameOpen}
        onClose={() => {
          setIsRenameOpen(false);
          setRenameDocId(null);
          setRenameTitle("");
        }}
        title="Rename Document reference"
      >
        <form onSubmit={handleRenameSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold font-mono uppercase text-on-surface-variant/60 block">
              New Title
            </label>
            <Input
              type="text"
              value={renameTitle}
              onChange={(e) => setRenameTitle(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsRenameOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Rename
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
