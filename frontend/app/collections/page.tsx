"use client";

import React, { useState } from "react";
import {
  Layers,
  Search,
  Plus,
  RefreshCw,
  MoreVertical,
  FolderOpen,
  Calendar,
  HardDrive,
  Cpu,
  Trash2,
  Settings2,
  CheckCircle,
  Database,
  ArrowRight,
  ChevronDown,
  User,
  Activity,
  FileText,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";
import { Dialog } from "../../components/ui/Dialog";
import { Dropdown } from "../../components/ui/Dropdown";
import { useToastStore } from "../../store/toastStore";
import { useChatStore } from "../../store/chatStore";

export default function Collections() {
  const { addToast } = useToastStore();
  const { documents } = useChatStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newColName, setNewColName] = useState("");
  const [newColDesc, setNewColDesc] = useState("");

  const [collections, setCollections] = useState([
    {
      id: "legal",
      name: "Legal Compliance",
      desc: "Corporate NDA agreements, compliance audit checklists, and legal briefs.",
      docsCount: 3,
      chunks: 142,
      embeddings: "1.2M",
      storage: "14.2 MB",
      status: "HEALTHY",
      updatedAt: "2h ago",
      owner: "Alex Rivera",
      activity: "NDA contract parsing success",
      files: ["corporate_nda_draft.pdf", "compliance_checklist_v1.pdf", "indemnity_audits.pdf"],
    },
    {
      id: "eng",
      name: "Engineering Specs",
      desc: "API routing architecture specifications, schema files, and technical RFCs.",
      docsCount: 5,
      chunks: 384,
      embeddings: "4.8M",
      storage: "48.1 MB",
      status: "HEALTHY",
      updatedAt: "1d ago",
      owner: "Sarah Chen",
      activity: "FastAPI schema ingestion",
      files: ["api_routing_rfc.pdf", "database_pool_spec.pdf", "vector_search_algorithm.pdf"],
    },
    {
      id: "market",
      name: "Market Intelligence",
      desc: "Competitor reports, product feature analysis sheets, and sales queries logs.",
      docsCount: 2,
      chunks: 85,
      embeddings: "850k",
      storage: "8.4 MB",
      status: "HEALTHY",
      updatedAt: "3d ago",
      owner: "David Miller",
      activity: "Q3 competitive analysis sync",
      files: ["competitor_index_chart.pdf", "sales_telemetry_logs.pdf"],
    },
    {
      id: "sec",
      name: "Security Protocols",
      desc: "SOC2 compliance frameworks, network audit blueprints, and security checklists.",
      docsCount: 4,
      chunks: 240,
      embeddings: "2.1M",
      storage: "18.9 MB",
      status: "HEALTHY",
      updatedAt: "1w ago",
      owner: "Alex Rivera",
      activity: "SOC2 network diagram split",
      files: ["soc2_audit_blueprint.pdf", "network_security_protocols.pdf"],
    },
  ]);

  const handleCreateCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;

    const newCol = {
      id: Math.random().toString(36).substring(2, 9),
      name: newColName,
      desc: newColDesc || "Custom grouped documents index library.",
      docsCount: 0,
      chunks: 0,
      embeddings: "0",
      storage: "0 KB",
      status: "HEALTHY",
      updatedAt: "Just now",
      owner: "Alex Rivera",
      activity: "Collection created",
      files: [],
    };

    setCollections([...collections, newCol]);
    addToast(`Collection "${newColName}" created successfully`, "success");
    setNewColName("");
    setNewColDesc("");
    setIsCreateOpen(false);
  };

  const handleDeleteCollection = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete the collection "${name}"? This action does not delete source files.`)) {
      setCollections(collections.filter((c) => c.id !== id));
      addToast(`Deleted collection: ${name}`, "warning");
    }
  };

  const filteredCols = collections.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h2 className="text-headline-md font-bold tracking-tight text-on-surface">
            Knowledge Collections
          </h2>
          <p className="text-xs text-on-surface-variant/60 mt-1">
            Group references into logical segments to route targeted AI RAG searches.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button variant="primary" onClick={() => setIsCreateOpen(true)} className="bg-[#adc6ff] hover:bg-[#9cbbf5] text-[#002e6a] text-xs py-1.5">
            <Plus className="w-3.5 h-3.5 mr-1" /> Create Collection
          </Button>
        </div>
      </div>

      {/* Search Input bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-grow max-w-md">
          <div className="relative w-full flex items-center">
            <Search className="w-4 h-4 text-on-surface-variant/30 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search collections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-2 pl-10 pr-4 rounded bg-[#0f131d] border border-white/5 outline-none text-xs text-on-surface placeholder:text-on-surface-variant/30 focus:border-primary/20 transition-all font-mono"
            />
          </div>
        </div>
      </div>

      {/* Grid of collections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        <AnimatePresence mode="popLayout">
          {filteredCols.map((col) => (
            <Card
              key={col.id}
              variant="surface"
              className="p-5 flex flex-col justify-between min-h-[260px] border border-white/5 hover:border-primary/20 transition-all duration-150 relative group overflow-hidden"
            >
              {/* Main Card View */}
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                      <Layers className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-on-surface truncate group-hover:text-primary transition-colors">
                        {col.name}
                      </h4>
                      <span className="text-[9px] text-on-surface-variant/40 font-mono block mt-0.5">
                        ID: {col.id} • Last Sync {col.updatedAt}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge variant="success" className="text-[9px] py-0.5 px-2">
                      {col.status}
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
                          id: "delete",
                          label: <span className="text-error font-bold">Delete Collection</span>,
                          onClick: () => handleDeleteCollection(col.id, col.name),
                        },
                      ]}
                    />
                  </div>
                </div>

                <p className="text-xs text-on-surface-variant/65 line-clamp-2 leading-relaxed">
                  {col.desc}
                </p>

                {/* Owner and health indicators */}
                <div className="flex items-center justify-between text-[9px] font-mono text-on-surface-variant/40 pt-2">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3 text-on-surface-variant/30" />
                    Owner: <strong className="text-on-surface">{col.owner}</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <Activity className="w-3 h-3 text-[#d0bcff]" />
                    Log: <strong className="text-on-surface-variant/60">{col.activity}</strong>
                  </span>
                </div>
              </div>

              {/* Stats Footer bar */}
              <div className="grid grid-cols-4 gap-2 text-center text-[9px] font-mono text-on-surface-variant/40 pt-4 border-t border-white/5 mt-4 select-none">
                <div className="text-left">
                  Files: <strong className="text-on-surface block mt-0.5">{col.docsCount} pdfs</strong>
                </div>
                <div>
                  Chunks: <strong className="text-on-surface block mt-0.5">{col.chunks}</strong>
                </div>
                <div>
                  Vectors: <strong className="text-on-surface block mt-0.5">{col.embeddings}</strong>
                </div>
                <div className="text-right">
                  Disk Weight: <strong className="text-on-surface block mt-0.5">{col.storage}</strong>
                </div>
              </div>

              {/* Hover Preview Slide-in Panel */}
              {col.files.length > 0 && (
                <div className="absolute inset-x-0 bottom-0 top-[175px] bg-[#0c0e14] border-t border-white/5 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-200 select-none flex flex-col justify-start z-10">
                  <span className="text-[8px] font-bold font-mono tracking-widest text-primary uppercase block mb-1.5">
                    Associated Files index ({col.files.length})
                  </span>
                  <div className="space-y-1 overflow-y-auto max-h-14 custom-scrollbar">
                    {col.files.map((file, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-1.5 text-[10px] text-on-surface-variant/70">
                        <FileText className="w-3 h-3 text-on-surface-variant/30 shrink-0" />
                        <span className="truncate">{file}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </AnimatePresence>
      </div>

      {/* Create Collection Dialog */}
      <Dialog
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setNewColName("");
          setNewColDesc("");
        }}
        title="Create Reference Collection"
      >
        <form onSubmit={handleCreateCollection} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold font-mono uppercase text-on-surface-variant/65 block">
              Collection Name
            </label>
            <Input
              type="text"
              value={newColName}
              onChange={(e) => setNewColName(e.target.value)}
              placeholder="e.g. Finance Reports Q4"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold font-mono uppercase text-on-surface-variant/65 block">
              Description (Optional)
            </label>
            <textarea
              value={newColDesc}
              onChange={(e) => setNewColDesc(e.target.value)}
              placeholder="Brief summary of the documents grouped inside this collection..."
              className="w-full h-24 p-3 rounded-default bg-surface-container-low border border-white/5 outline-none text-xs text-on-surface placeholder:text-on-surface-variant/30 focus:border-primary/20 transition-all resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Collection
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
