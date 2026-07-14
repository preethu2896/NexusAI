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
  const activeAgentsCount = 6; // Planner, Retriever, Research, SQL, Memory, Reflection
  const documentsCount = documents.length;
  const conversationsCount = conversations.length;

  const handleOpenConversation = async (id: string) => {
    await selectConversation(id);
    router.push("/chat");
  };

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Hero Welcome banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-surface-container-low via-surface-container to-surface-container-high p-8 rounded-xl border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="space-y-2 relative z-10">
          <h2 className="text-2xl font-bold tracking-tight text-on-surface flex items-center gap-2">
            Welcome to NexusAI Workspace
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
          </h2>
          <p className="text-sm text-on-surface-variant max-w-xl">
            Orchestrate semantic searches, configure multi-agent reasoning loops, and audit live vector index operations.
          </p>
        </div>
        <div className="relative z-10 flex gap-3 shrink-0">
          <Link href="/chat">
            <Button>
              New Chat Thread
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/knowledge">
            <Button variant="ghost">Upload PDF</Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card glowOnHover>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold font-mono tracking-widest text-on-surface-variant/40 uppercase">
              Orchestrator
            </span>
            <Bot className="w-4 h-4 text-primary" />
          </div>
          <div className="mt-3">
            <h3 className="text-3xl font-bold tracking-tight text-on-surface">
              {activeAgentsCount}
            </h3>
            <p className="text-xs text-on-surface-variant/60 mt-1">
              Active system agents
            </p>
          </div>
        </Card>

        <Card glowOnHover>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold font-mono tracking-widest text-on-surface-variant/40 uppercase">
              Indexed Data
            </span>
            <Database className="w-4 h-4 text-secondary" />
          </div>
          <div className="mt-3">
            <h3 className="text-3xl font-bold tracking-tight text-on-surface">
              {documentsCount}
            </h3>
            <p className="text-xs text-on-surface-variant/60 mt-1">
              Uploaded document files
            </p>
          </div>
        </Card>

        <Card glowOnHover>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold font-mono tracking-widest text-on-surface-variant/40 uppercase">
              RAG Engine
            </span>
            <Cpu className="w-4 h-4 text-green-400" />
          </div>
          <div className="mt-3">
            <h3 className="text-3xl font-bold tracking-tight text-on-surface">
              ChromaDB
            </h3>
            <p className="text-xs text-on-surface-variant/60 mt-1">
              Dense vector embeddings
            </p>
          </div>
        </Card>

        <Card glowOnHover>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold font-mono tracking-widest text-on-surface-variant/40 uppercase">
              Chat Threads
            </span>
            <Clock className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="mt-3">
            <h3 className="text-3xl font-bold tracking-tight text-on-surface">
              {conversationsCount}
            </h3>
            <p className="text-xs text-on-surface-variant/60 mt-1">
              Active sessions persisted
            </p>
          </div>
        </Card>
      </div>

      {/* Activity Pipeline Visualization */}
      <Card>
        <div className="flex items-center gap-2 mb-6">
          <Activity className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface font-mono">
            RAG Pipeline Status
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {[
            { step: "1. Document Ingest", desc: "Local PDF File Storage", active: true },
            { step: "2. Text Chunking", desc: "Recursive 170-char split", active: true },
            { step: "3. Embed Generator", desc: "Sentence-Transformers 384d", active: true },
            { step: "4. Index Sync", desc: "Local ChromaDB store", active: true },
            { step: "5. Context Query", desc: "FastAPI stream responses", active: true },
          ].map((item) => (
            <div
              key={item.step}
              className={`p-4 rounded-md border border-white/5 flex flex-col justify-between h-24 ${
                item.active
                  ? "bg-surface-container-high/40 border-primary/20"
                  : "bg-surface-container-low opacity-40"
              }`}
            >
              <span className="text-xs font-semibold text-on-surface block">
                {item.step}
              </span>
              <div>
                <span className="text-[10px] text-on-surface-variant/50 block font-mono">
                  {item.desc}
                </span>
                <span className="text-[9px] text-green-400 font-mono mt-1 block">
                  ● OPERATIONAL
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Grid: Recent threads and Recent files */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Recent Conversations */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface font-mono">
              Recent Conversations
            </h3>
            <Link href="/chat" className="text-xs text-primary hover:underline flex items-center gap-1 font-medium">
              View Chat Room <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {conversations.length === 0 ? (
            <div className="py-8 text-center text-xs text-on-surface-variant/40 font-mono">
              No conversation logs available
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {conversations.slice(0, 5).map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => handleOpenConversation(conv.id)}
                  className="py-3 flex items-center justify-between cursor-pointer hover:bg-white/3 px-2 rounded-md transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-4 h-4 text-on-surface-variant/40 group-hover:text-primary transition-colors" />
                    <span className="text-sm font-medium text-on-surface truncate max-w-[240px]">
                      {conv.title || "Untitled Conversation"}
                    </span>
                  </div>
                  <span className="text-[10px] text-on-surface-variant/40 font-mono">
                    {new Date(conv.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Documents */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface font-mono">
              Indexed Documents
            </h3>
            <Link href="/knowledge" className="text-xs text-primary hover:underline flex items-center gap-1 font-medium">
              View Collections <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {documents.length === 0 ? (
            <div className="py-8 text-center text-xs text-on-surface-variant/40 font-mono">
              No files indexed in vector store
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {documents.slice(0, 5).map((doc) => (
                <div
                  key={doc.document_id}
                  className="py-3 flex items-center justify-between px-2 rounded-md"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <FileText className="w-4 h-4 text-on-surface-variant/40 shrink-0" />
                    <span className="text-sm font-medium text-on-surface truncate max-w-[200px]">
                      {doc.title || doc.filename}
                    </span>
                  </div>
                  <Badge variant={doc.status === "indexed" ? "success" : "warning"}>
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
