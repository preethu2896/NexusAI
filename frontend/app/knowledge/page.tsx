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
  Plus,
  ChevronDown,
  LayoutGrid,
  List,
  FolderOpen,
  Filter,
  ArrowUpDown,
  MoreVertical,
  Layers,
  ArrowRight,
  Info,
  Calendar,
  Layers2,
  FolderClosed,
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

  // Ingestion dialog/modal states
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

    // Simulate rename callback on UI layer, as the backend API lacks rename endpoint
    addToast(`Renamed index to: ${renameTitle} (Local mock)`, "success");
    setIsRenameOpen(false);
    setRenameDocId(null);
  };

  // Mock folder collections matching product specifications
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

  return (
    <div className="space-y-8 pb-12 select-none">
      {/* Title & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-headline-md font-bold tracking-tight text-on-surface">
            Knowledge Workspace
          </h2>
          <p className="text-xs text-on-surface-variant/60 mt-1.5 leading-none select-none">
            Manage reference sources, view embeddings ingestion status, and configure indexes.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button variant="ghost" onClick={() => setIsUploadOpen(true)}>
            <Upload className="w-3.5 h-3.5 mr-1.5" /> Ingest PDF
          </Button>
          <Button variant="primary" onClick={() => fetchDocuments()} className="bg-[#adc6ff] hover:bg-[#9cbbf5] text-[#002e6a]">
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Refresh Files
          </Button>
        </div>
      </div>

      {/* Grid: Folders / Sub-Collections */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {folders.map((f) => {
          const isActive = f.id === activeFolder;
          return (
            <div
              key={f.id}
              onClick={() => setActiveFolder(f.id)}
              className={`p-4 rounded-default border cursor-pointer transition-all flex items-center justify-between group select-none ${
                isActive
                  ? "bg-surface-container border-primary/25 text-on-surface shadow-md"
                  : "bg-surface-container-low border-white/5 text-on-surface-variant/70 hover:border-white/10 hover:text-on-surface"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <FolderOpen className={`w-4 h-4 shrink-0 ${isActive ? "text-primary" : "text-on-surface-variant/40 group-hover:text-on-surface"}`} />
                <span className="text-xs font-bold truncate leading-none">{f.name}</span>
              </div>
              <Badge variant={isActive ? "primary" : "secondary"} className="text-[10px] py-0 px-2 shrink-0">
                {f.count}
              </Badge>
            </div>
          );
        })}
      </div>

      {/* Toolbar: Search, Filters, View Modes */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-3.5">
        <div className="flex items-center gap-3 flex-grow max-w-md">
          <div className="relative w-full flex items-center">
            <Search className="w-4 h-4 text-on-surface-variant/35 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search reference library..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-2 pl-11 pr-4 rounded-default bg-surface-container border border-white/5 outline-none text-xs text-on-surface placeholder:text-on-surface-variant/30 focus:border-primary/25 transition-all"
            />
          </div>
        </div>

        {/* View toggles & Sorter */}
        <div className="flex items-center justify-end gap-3 shrink-0">
          <div className="flex items-center bg-[#171b26] p-0.5 rounded border border-white/5 text-[10px]">
            <button
              onClick={() => toggleSortOrder("name")}
              className={`px-2.5 py-1.5 rounded transition-all cursor-pointer font-bold ${
                sortBy === "name" ? "bg-surface-container text-on-surface" : "text-on-surface-variant/40 hover:text-on-surface"
              }`}
            >
              Name
            </button>
            <button
              onClick={() => toggleSortOrder("date")}
              className={`px-2.5 py-1.5 rounded transition-all cursor-pointer font-bold ${
                sortBy === "date" ? "bg-surface-container text-on-surface" : "text-on-surface-variant/40 hover:text-on-surface"
              }`}
            >
              Date
            </button>
            <button
              onClick={() => toggleSortOrder("chunks")}
              className={`px-2.5 py-1.5 rounded transition-all cursor-pointer font-bold ${
                sortBy === "chunks" ? "bg-surface-container text-on-surface" : "text-on-surface-variant/40 hover:text-on-surface"
              }`}
            >
              Chunks
            </button>
          </div>

          <div className="flex items-center bg-[#171b26] p-1 rounded border border-white/5">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1 rounded cursor-pointer ${viewMode === "grid" ? "text-primary bg-surface-container" : "text-on-surface-variant/45 hover:text-on-surface"}`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1 rounded cursor-pointer ${viewMode === "list" ? "text-primary bg-surface-container" : "text-on-surface-variant/45 hover:text-on-surface"}`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Files Grid or List wrapper */}
      <AnimatePresence mode="popLayout">
        {sortedDocs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-16 text-center select-none"
          >
            <FolderClosed className="w-12 h-12 text-on-surface-variant/20 mx-auto mb-4" />
            <h4 className="text-sm font-bold text-on-surface">No Reference Files Found</h4>
            <p className="text-xs text-on-surface-variant/40 mt-1 max-w-sm mx-auto">
              Please ingest a PDF document to create semantic vector indices.
            </p>
          </motion.div>
        ) : viewMode === "grid" ? (
          /* Grid View Layout */
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          >
            {sortedDocs.map((doc) => (
              <Card
                key={doc.document_id}
                variant="surface"
                onClick={() => setSelectedDocId(doc.document_id)}
                className="p-5 flex flex-col justify-between h-[180px] relative overflow-hidden group hover:border-primary/20 cursor-pointer"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-8 h-8 rounded bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-red-400" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge variant={doc.status === "indexed" ? "success" : "secondary"}>
                        {doc.status}
                      </Badge>
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
                            label: "Rename Title",
                            onClick: () => triggerRenameDialog(doc.document_id, doc.title),
                          },
                          {
                            id: "delete",
                            label: <span className="text-error font-bold">Delete Index</span>,
                            onClick: () => handleDeleteDoc(doc.document_id, doc.title),
                          },
                        ]}
                      />
                    </div>
                  </div>

                  <h4 className="text-body-sm font-bold text-on-surface mt-4 truncate">
                    {doc.title}
                  </h4>
                  <p className="text-[10px] text-on-surface-variant/40 font-mono mt-1.5 truncate">
                    {doc.filename}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-on-surface-variant/40 pt-3 border-t border-white/5">
                  <span>Chunks: <strong className="text-on-surface">{doc.chunk_count}</strong></span>
                  <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                </div>
              </Card>
            ))}
          </motion.div>
        ) : (
          /* List View Layout */
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="overflow-x-auto border border-white/5 rounded-default bg-surface-container-low/40 select-none"
          >
            <table className="w-full text-left border-collapse text-xs select-none">
              <thead>
                <tr className="border-b border-white/5 text-[9px] uppercase font-mono text-on-surface-variant/40 tracking-wider">
                  <th className="p-4 font-semibold">Document Title</th>
                  <th className="p-4 font-semibold">Chunks</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Indexed Date</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {sortedDocs.map((doc) => (
                  <tr
                    key={doc.document_id}
                    onClick={() => setSelectedDocId(doc.document_id)}
                    className="hover:bg-white/3 transition-colors cursor-pointer"
                  >
                    <td className="p-4 flex items-center gap-3">
                      <FileText className="w-4 h-4 text-red-400 shrink-0" />
                      <div className="min-w-0">
                        <span className="font-semibold text-on-surface block truncate max-w-[200px] sm:max-w-[320px]">
                          {doc.title}
                        </span>
                        <span className="text-[9px] font-mono text-on-surface-variant/40 block mt-0.5 truncate max-w-[200px]">
                          {doc.filename}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 font-mono font-semibold text-on-surface-variant/70">{doc.chunk_count}</td>
                    <td className="p-4">
                      <Badge variant={doc.status === "indexed" ? "success" : "secondary"}>
                        {doc.status}
                      </Badge>
                    </td>
                    <td className="p-4 font-mono text-on-surface-variant/50">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => triggerRenameDialog(doc.document_id, doc.title)}
                          className="p-1 rounded text-on-surface-variant/40 hover:text-on-surface hover:bg-white/5 cursor-pointer"
                          title="Rename"
                        >
                          📝
                        </button>
                        <button
                          onClick={() => handleDeleteDoc(doc.document_id, doc.title)}
                          className="p-1 rounded text-on-surface-variant/40 hover:text-error hover:bg-white/5 cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ingestion Dialog modal */}
      <Dialog
        isOpen={isUploadOpen}
        onClose={() => {
          setIsUploadOpen(false);
          setSelectedFile(null);
          setDocTitle("");
        }}
        title="Ingest Reference Source (PDF)"
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
                  Drag & Drop your file here
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
                Source Title
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
                  Chunking...
                </>
              ) : (
                "Start Ingestion"
              )}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Rename Dialog modal */}
      <Dialog
        isOpen={isRenameOpen}
        onClose={() => {
          setIsRenameOpen(false);
          setRenameDocId(null);
        }}
        title="Rename Document Source"
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
              placeholder="Enter new title name"
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
              Save Title
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Document Details Inspector Sheet Drawer */}
      <Sheet
        isOpen={!!selectedDocId}
        onClose={() => setSelectedDocId(null)}
        title="Reference Metadata Drawer"
      >
        {selectedDoc && (
          <div className="space-y-6 select-none">
            <div className="p-4 rounded-default border border-white/5 bg-surface-container-lowest/50 text-center flex flex-col items-center">
              <FileText className="w-10 h-10 text-red-400 mb-3" />
              <h4 className="text-xs font-bold text-on-surface truncate max-w-full">
                {selectedDoc.title}
              </h4>
              <p className="text-[9px] text-on-surface-variant/40 font-mono mt-1 select-all break-all w-full">
                {selectedDoc.document_id}
              </p>
            </div>

            <div className="space-y-4">
              <span className="text-[9px] font-bold font-mono tracking-widest text-on-surface-variant/40 uppercase block border-b border-white/5 pb-2">
                Metadata Details
              </span>

              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant/50">Filename</span>
                  <span className="font-semibold text-on-surface truncate max-w-[160px]" title={selectedDoc.filename}>
                    {selectedDoc.filename}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant/50">Ingestion Status</span>
                  <Badge variant={selectedDoc.status === "indexed" ? "success" : "secondary"}>
                    {selectedDoc.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant/50">Chunks Created</span>
                  <span className="font-mono text-on-surface font-semibold">{selectedDoc.chunk_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant/50">Embedding Engine</span>
                  <span className="font-mono text-on-surface font-semibold text-[10px]">text-embedding-3-small</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant/50">Created Date</span>
                  <span className="font-mono text-on-surface font-semibold">
                    {new Date(selectedDoc.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Mocked scrollable index chunks preview */}
            <div className="space-y-3 pt-4 border-t border-white/5">
              <span className="text-[9px] font-bold font-mono tracking-widest text-on-surface-variant/40 uppercase block">
                Index Chunks preview
              </span>
              <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar">
                {[...Array(Math.min(selectedDoc.chunk_count, 3))].map((_, i) => (
                  <div
                    key={i}
                    className="p-3 bg-[#171b26] border border-white/5 rounded-default text-[10px] text-on-surface-variant/70 leading-relaxed font-mono"
                  >
                    <span className="text-primary font-bold block mb-1">CHUNK #{i + 1}</span>
                    This is a preview chunk containing semantic text extracted from the uploaded document page {i + 1}. The embedding weights are active in the ChromaDB vector database index.
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-white/5">
              <Button
                variant="danger"
                className="w-full justify-center"
                onClick={() => {
                  handleDeleteDoc(selectedDoc.document_id, selectedDoc.title);
                }}
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete from Vector Store
              </Button>
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
}


