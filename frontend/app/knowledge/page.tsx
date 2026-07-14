"use client";

import React, { useEffect, useState } from "react";
import {
  Upload,
  Search,
  Database,
  Trash2,
  FileText,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Layers,
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
  
  // Upload States
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docTitle, setDocTitle] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Compute metrics
  const totalPages = documents.reduce((sum, doc) => sum + (doc.page_count || 0), 0);
  const totalChunks = documents.reduce((sum, doc) => sum + doc.chunk_count, 0);
  const totalSize = documents.reduce(
    (sum, doc) => sum + (doc.file_size_bytes || 0),
    0
  );
  const sizeMb = (totalSize / (1024 * 1024)).toFixed(2);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      // Auto fill title with clean filename (strip extension)
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
    } catch (err: unknown) {
      console.error(err);
      setUploadError(
        err instanceof Error ? err.message : "Failed to upload document"
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this document and remove all associated vectors from ChromaDB?")) {
      try {
        await api.deleteDocument(id);
        await fetchDocuments();
      } catch (err) {
        console.error(err);
        alert("Failed to delete document from storage.");
      }
    }
  };

  const filteredDocs = documents.filter(
    (doc) =>
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:w-96">
          <Input
            icon={<Search className="w-4 h-4" />}
            placeholder="Search document collections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-primary-container/10 border border-primary/20 flex items-center justify-center text-primary">
              <Layers className="w-5 h-5 text-primary" />
            </div>
            <div>
              <span className="text-[10px] font-bold font-mono tracking-widest text-on-surface-variant/40 uppercase block">
                Total Pages
              </span>
              <h3 className="text-xl font-bold text-on-surface mt-0.5">
                {totalPages}
              </h3>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-secondary-container/10 border border-secondary/20 flex items-center justify-center text-secondary">
              <Database className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <span className="text-[10px] font-bold font-mono tracking-widest text-on-surface-variant/40 uppercase block">
                Total Vectors
              </span>
              <h3 className="text-xl font-bold text-on-surface mt-0.5">
                {totalChunks} chunks
              </h3>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
              <FileText className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <span className="text-[10px] font-bold font-mono tracking-widest text-on-surface-variant/40 uppercase block">
                Storage Size
              </span>
              <h3 className="text-xl font-bold text-on-surface mt-0.5">
                {sizeMb} MB
              </h3>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Panel */}
        <div className="space-y-4 lg:col-span-1">
          <Card>
            <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface font-mono mb-4">
              Add New Reference Document
            </h3>
            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {/* Drag Drop Area */}
              <div className="relative border border-dashed border-white/10 hover:border-primary/40 rounded-lg p-6 text-center transition-all bg-surface-container-lowest/20">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isUploading}
                />
                <Upload className="w-8 h-8 text-on-surface-variant/40 mx-auto mb-2" />
                {selectedFile ? (
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-primary truncate max-w-[200px] mx-auto">
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
                  <label className="text-[10px] font-bold font-mono uppercase text-on-surface-variant/60">
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

              {/* Error or Success notification */}
              {uploadError && (
                <div className="flex items-start gap-2 bg-error-container/10 border border-error/20 p-3 rounded-md text-xs text-error">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{uploadError}</span>
                </div>
              )}

              {uploadSuccess && (
                <div className="flex items-start gap-2 bg-green-500/10 border border-green-500/20 p-3 rounded-md text-xs text-green-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>Document ingested and indexed successfully!</span>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={!selectedFile || isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Chunking & Indexing...
                  </>
                ) : (
                  "Start Ingestion"
                )}
              </Button>
            </form>
          </Card>
        </div>

        {/* Collections Table List */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface font-mono">
                Ingested PDF Index
              </h3>
              <span className="text-[10px] font-mono text-on-surface-variant/40">
                {filteredDocs.length} Total items
              </span>
            </div>

            {filteredDocs.length === 0 ? (
              <div className="py-12 text-center text-xs text-on-surface-variant/40 font-mono">
                No indexed documents match the query filter.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-[10px] uppercase font-mono text-on-surface-variant/40 tracking-wider">
                      <th className="pb-3 font-semibold">Document Title</th>
                      <th className="pb-3 font-semibold">Details</th>
                      <th className="pb-3 font-semibold">Chroma Index</th>
                      <th className="pb-3 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredDocs.map((doc) => (
                      <tr key={doc.document_id} className="group hover:bg-white/3">
                        <td className="py-4">
                          <div className="flex items-center gap-3 pr-2">
                            <FileText className="w-4 h-4 text-on-surface-variant/40 shrink-0" />
                            <div className="overflow-hidden">
                              <span className="text-sm font-semibold text-on-surface block truncate max-w-[220px]">
                                {doc.title}
                              </span>
                              <span className="text-[10px] text-on-surface-variant/40 block truncate max-w-[220px] font-mono">
                                {doc.filename}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4">
                          <span className="text-xs text-on-surface-variant/60 block">
                            {doc.page_count !== null ? `${doc.page_count} pages` : "0 pages"}
                          </span>
                          <span className="text-[10px] text-on-surface-variant/40 block font-mono">
                            {doc.file_size_bytes
                              ? `${(doc.file_size_bytes / 1024).toFixed(1)} KB`
                              : "0 KB"}
                          </span>
                        </td>
                        <td className="py-4">
                          <div className="flex flex-col gap-1 items-start">
                            <Badge variant={doc.status === "indexed" ? "success" : "warning"}>
                              {doc.status.toUpperCase()}
                            </Badge>
                            <span className="text-[10px] text-on-surface-variant/50 font-mono">
                              {doc.chunk_count} chunks
                            </span>
                          </div>
                        </td>
                        <td className="py-4 text-right">
                          <button
                            onClick={() => handleDelete(doc.document_id)}
                            className="text-on-surface-variant/40 hover:text-error transition-colors p-1.5 rounded hover:bg-white/5 cursor-pointer"
                            title="Delete index files & vector store entries"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
