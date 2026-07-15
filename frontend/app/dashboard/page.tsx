"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Database,
  Cpu,
  Clock,
  ArrowRight,
  MessageSquare,
  FileText,
  Activity,
  Bot,
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { useChatStore } from "../../store/chatStore";

export default function Dashboard() {
  const router = useRouter();
  const {
    conversations,
    documents,
    fetchConversations,
    fetchDocuments,
    selectConversation,
  } = useChatStore();

  useEffect(() => {
    fetchConversations();
    fetchDocuments();
  }, [fetchConversations, fetchDocuments]);

  // Compute stats
  const activeAgentsCount = 6;
  const documentsCount = documents.length;
  const conversationsCount = conversations.length;

  const handleOpenConversation = async (id: string) => {
    await selectConversation(id);
    router.push("/chat");
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Hero Welcome banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-surface-container-low via-surface-container to-surface-container-high p-6 sm:p-8 rounded-lg border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <h2 className="text-headline-md font-bold tracking-tight text-on-surface flex items-center gap-2">
            Welcome to NexusAI Workspace
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
          </h2>
          <p className="text-body-sm text-on-surface-variant/80 max-w-xl">
            Orchestrate semantic searches, configure multi-agent reasoning loops, and audit live vector index operations.
          </p>
        </div>
        <div className="relative z-10 flex flex-wrap gap-3 shrink-0">
          <Link href="/chat" className="no-underline">
            <Button variant="primary">
              New Chat Thread
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/knowledge" className="no-underline">
            <Button variant="ghost">Upload PDF</Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card glowOnHover variant="surface">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-label-caps text-on-surface-variant/50">
                Orchestrator
              </span>
              <h3 className="text-3xl font-bold tracking-tight text-on-surface mt-2">
                {activeAgentsCount}
              </h3>
            </div>
            <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center border border-primary/10">
              <Bot className="w-4 h-4 text-primary" />
            </div>
          </div>
          <p className="text-xs text-on-surface-variant/60 mt-3">
            Active system agents
          </p>
        </Card>

        <Card glowOnHover variant="surface">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-label-caps text-on-surface-variant/50">
                Indexed Data
              </span>
              <h3 className="text-3xl font-bold tracking-tight text-on-surface mt-2">
                {documentsCount}
              </h3>
            </div>
            <div className="w-8 h-8 rounded bg-secondary/10 flex items-center justify-center border border-secondary/10">
              <Database className="w-4 h-4 text-secondary" />
            </div>
          </div>
          <p className="text-xs text-on-surface-variant/60 mt-3">
            Uploaded document files
          </p>
        </Card>

        <Card glowOnHover variant="surface">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-label-caps text-on-surface-variant/50">
                RAG Engine
              </span>
              <h3 className="text-3xl font-bold tracking-tight text-on-surface mt-2">
                ChromaDB
              </h3>
            </div>
            <div className="w-8 h-8 rounded bg-green-500/10 flex items-center justify-center border border-green-500/10">
              <Cpu className="w-4 h-4 text-green-400" />
            </div>
          </div>
          <p className="text-xs text-on-surface-variant/60 mt-3">
            Dense vector embeddings
          </p>
        </Card>

        <Card glowOnHover variant="surface">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-label-caps text-on-surface-variant/50">
                Chat Threads
              </span>
              <h3 className="text-3xl font-bold tracking-tight text-on-surface mt-2">
                {conversationsCount}
              </h3>
            </div>
            <div className="w-8 h-8 rounded bg-yellow-500/10 flex items-center justify-center border border-yellow-500/10">
              <Clock className="w-4 h-4 text-yellow-400" />
            </div>
          </div>
          <p className="text-xs text-on-surface-variant/60 mt-3">
            Active sessions persisted
          </p>
        </Card>
      </div>

      {/* Activity Pipeline Visualization */}
      <Card variant="surface">
        <div className="flex items-center gap-2 mb-6">
          <Activity className="w-4 h-4 text-primary" />
          <h3 className="text-label-caps text-on-surface tracking-wider">
            RAG Pipeline Status
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { step: "1. Document Ingest", desc: "Local PDF File Storage", active: true },
            { step: "2. Text Chunking", desc: "Recursive 170-char split", active: true },
            { step: "3. Embed Generator", desc: "Sentence-Transformers 384d", active: true },
            { step: "4. Index Sync", desc: "Local ChromaDB store", active: true },
            { step: "5. Context Query", desc: "FastAPI stream responses", active: true },
          ].map((item) => (
            <div
              key={item.step}
              className={`p-4 rounded-default border flex flex-col justify-between h-28 transition-all ${
                item.active
                  ? "bg-surface-container-high/40 border-primary/20 hover:border-primary/30"
                  : "bg-surface-container-low border-white/5 opacity-40"
              }`}
            >
              <span className="text-body-sm font-semibold text-on-surface block">
                {item.step}
              </span>
              <div>
                <span className="text-[10px] text-on-surface-variant/50 block font-mono">
                  {item.desc}
                </span>
                <span className="text-[9px] text-green-400 font-mono mt-1 block font-semibold">
                  ● OPERATIONAL
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Grid: Recent threads and Recent files */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Recent Conversations */}
        <Card variant="surface">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-label-caps text-on-surface tracking-wider">
              Recent Conversations
            </h3>
            <Link
              href="/chat"
              className="text-xs text-primary hover:text-[#9cbbf5] transition-colors flex items-center gap-1 font-medium no-underline"
            >
              View Chat Room <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {conversations.length === 0 ? (
            <div className="py-12 text-center text-body-sm text-on-surface-variant/40 font-mono">
              No conversation logs available
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {conversations.slice(0, 5).map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => handleOpenConversation(conv.id)}
                  className="py-3 flex items-center justify-between cursor-pointer hover:bg-white/3 px-2 rounded-default transition-all group"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <MessageSquare className="w-4 h-4 text-on-surface-variant/40 group-hover:text-primary transition-colors shrink-0" />
                    <span className="text-body-sm font-medium text-on-surface truncate max-w-[200px] sm:max-w-[280px]">
                      {conv.title || "Untitled Conversation"}
                    </span>
                  </div>
                  <span className="text-[10px] text-on-surface-variant/40 font-mono shrink-0">
                    {new Date(conv.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Documents */}
        <Card variant="surface">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-label-caps text-on-surface tracking-wider">
              Indexed Documents
            </h3>
            <Link
              href="/knowledge"
              className="text-xs text-primary hover:text-[#9cbbf5] transition-colors flex items-center gap-1 font-medium no-underline"
            >
              View Collections <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {documents.length === 0 ? (
            <div className="py-12 text-center text-body-sm text-on-surface-variant/40 font-mono">
              No files indexed in vector store
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {documents.slice(0, 5).map((doc) => (
                <div
                  key={doc.document_id}
                  className="py-3 flex items-center justify-between px-2 rounded-default"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <FileText className="w-4 h-4 text-on-surface-variant/40 shrink-0" />
                    <span className="text-body-sm font-medium text-on-surface truncate max-w-[160px] sm:max-w-[240px]">
                      {doc.title || doc.filename}
                    </span>
                  </div>
                  <Badge
                    variant={doc.status === "indexed" ? "success" : "warning"}
                    className="shrink-0"
                  >
                    {doc.status.toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
