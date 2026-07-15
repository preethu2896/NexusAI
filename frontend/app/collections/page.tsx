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

  // Manage collections locally as mock state that user can extend
  const [collections, setCollections] = useState([
    {
      id: "legal",
      name: "Legal Compliance",
      desc: "Corporate NDA agreements, compliance audit checklists, and legal briefs.",
      docsCount: 1,
      embeddings: "1.2M",
      storage: "14.2 MB",
      status: "HEALTHY",
      updatedAt: "2h ago",
    },
    {
      id: "eng",
      name: "Engineering Specs",
      desc: "API routing architecture specifications, schema files, and technical RFCs.",
      docsCount: 2,
      embeddings: "4.8M",
      storage: "48.1 MB",
      status: "HEALTHY",
      updatedAt: "1d ago",
    },
    {
      id: "market",
      name: "Market Intelligence",
      desc: "Competitor reports, product feature analysis sheets, and sales queries logs.",
      docsCount: 1,
      embeddings: "850k",
      storage: "8.4 MB",
      status: "HEALTHY",
      updatedAt: "3d ago",
    },
    {
      id: "sec",
      name: "Security Protocols",
      desc: "SOC2 compliance frameworks, network audit blueprints, and security checklists.",
      docsCount: 1,
      embeddings: "2.1M",
      storage: "18.9 MB",
      status: "HEALTHY",
      updatedAt: "1w ago",
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
      embeddings: "0",
      storage: "0 KB",
      status: "HEALTHY",
      updatedAt: "Just now",
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
    <div className="space-y-8 pb-12 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-headline-md font-bold tracking-tight text-on-surface">
            Knowledge Collections
          </h2>
          <p className="text-xs text-on-surface-variant/60 mt-1.5 leading-none">
            Logical groupings of reference sources that can be targeted individually in RAG queries.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button variant="primary" onClick={() => setIsCreateOpen(true)} className="bg-[#adc6ff] hover:bg-[#9cbbf5] text-[#002e6a]">
            <Plus className="w-4 h-4 mr-1.5" /> Create Collection
          </Button>
        </div>
      </div>

      {/* Toolbar: Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-3.5">
        <div className="flex items-center gap-3 flex-grow max-w-md">
          <div className="relative w-full flex items-center">
            <Search className="w-4 h-4 text-on-surface-variant/30 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search collections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-2 pl-11 pr-4 rounded-default bg-surface-container border border-white/5 outline-none text-xs text-on-surface placeholder:text-on-surface-variant/30 focus:border-primary/20 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Grid of collections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 lg:gap-8">
        <AnimatePresence mode="popLayout">
          {filteredCols.map((col) => (
            <Card
              key={col.id}
              variant="surface"
              className="p-6 flex flex-col justify-between h-[230px] border border-white/5 hover:border-primary/25 transition-all duration-150 relative group"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="w-10 h-10 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                    <Layers className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge variant={col.status === "HEALTHY" ? "success" : "secondary"} className="text-[9px] py-0.5 px-2">
                      {col.status}
                    </Badge>
                    <Dropdown
                      trigger={
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="p-1 rounded text-on-surface-variant/40 hover:text-on-surface hover:bg-white/5 cursor-pointer focus:outline-none"
                        >
                          <MoreVertical className="w-4 h-4" />
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

                <h4 className="text-body-sm font-bold text-on-surface mt-4 tracking-wide">
                  {col.name}
                </h4>
                <p className="text-xs text-on-surface-variant/65 mt-2 line-clamp-2 leading-relaxed">
                  {col.desc}
                </p>
              </div>

              {/* Stats Footer bar */}
              <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono text-on-surface-variant/40 pt-4 border-t border-white/5">
                <div className="text-left">
                  Docs: <strong className="text-on-surface block mt-0.5">{col.docsCount} files</strong>
                </div>
                <div>
                  Embeddings: <strong className="text-on-surface block mt-0.5">{col.embeddings}</strong>
                </div>
                <div className="text-right">
                  Storage: <strong className="text-on-surface block mt-0.5">{col.storage}</strong>
                </div>
              </div>
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
