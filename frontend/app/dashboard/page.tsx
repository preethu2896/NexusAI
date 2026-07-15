"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  MessageSquare,
  FolderOpen,
  Search,
  Bot,
  Plus,
  Paperclip,
  ChevronDown,
  Settings,
  ArrowRight,
  Database,
  Braces,
  Zap,
  Activity,
  CheckCircle,
  FileCheck,
  Binary,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { useChatStore } from "../../store/chatStore";

export default function Dashboard() {
  const router = useRouter();
  const { selectConversation, fetchConversations } = useChatStore();

  const handleOpenConversation = async (id: string) => {
    // Navigate to chat
    router.push("/chat");
  };

  return (
    <div className="space-y-10 lg:space-y-12 pb-8">
      {/* Centered Hero Heading Section */}
      <div className="flex flex-col items-center text-center space-y-4 max-w-4xl mx-auto pt-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold font-mono tracking-wider text-primary uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-primary block animate-pulse" />
          System Operational
        </div>

        <h1 className="text-display-lg-mobile md:text-display-lg text-on-surface tracking-tight leading-tight select-none">
          Enterprise Knowledge Intelligence
        </h1>

        <p className="text-body-sm md:text-body-base text-on-surface-variant/80 max-w-2xl leading-relaxed">
          Ask questions across all enterprise knowledge with AI-powered retrieval, grounded answers, and intelligent citations. Your data stays private, secure, and ready for real-time inference.
        </p>
      </div>

      {/* Large Input Pill Prompter */}
      <div className="max-w-3xl mx-auto w-full">
        <div className="p-1.5 bg-[#171b26] border border-white/5 rounded-xl flex items-center shadow-lg focus-within:border-primary/30 transition-all duration-200">
          {/* Model Selector Pill */}
          <button className="flex items-center gap-1.5 px-3 py-2 bg-surface-container rounded-lg border border-white/5 text-xs text-on-surface font-semibold shrink-0 cursor-pointer hover:bg-surface-container-high transition-all">
            <Paperclip className="w-3.5 h-3.5 text-on-surface-variant/60" />
            <span>GPT-4o</span>
            <ChevronDown className="w-3 h-3 text-on-surface-variant/40" />
          </button>

          {/* Prompt input field */}
          <input
            type="text"
            placeholder="Ask anything about your enterprise knowledge..."
            className="flex-grow bg-transparent text-sm text-on-surface outline-none border-none px-4 placeholder:text-on-surface-variant/30"
          />

          {/* Extra utilities & trigger */}
          <div className="flex items-center gap-2 pr-1 shrink-0">
            <button className="p-2 text-on-surface-variant/40 hover:text-on-surface transition-colors cursor-pointer rounded hover:bg-white/5">
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={() => router.push("/chat")}
              className="w-8 h-8 rounded-full bg-primary hover:bg-[#9cbbf5] text-on-primary flex items-center justify-center transition-all shadow-sm cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Floating row of actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
          <Link href="/knowledge" className="no-underline">
            <button className="flex items-center gap-1.5 py-1.5 px-3 rounded-full border border-white/5 bg-[#171b26]/50 hover:bg-[#1c1f2a] text-xs font-semibold text-on-surface-variant hover:text-on-surface transition-all cursor-pointer">
              <FileText className="w-3.5 h-3.5" />
              <span>Upload PDF</span>
            </button>
          </Link>
          <Link href="/chat" className="no-underline">
            <button className="flex items-center gap-1.5 py-1.5 px-3 rounded-full border border-white/5 bg-[#171b26]/50 hover:bg-[#1c1f2a] text-xs font-semibold text-on-surface-variant hover:text-on-surface transition-all cursor-pointer">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>New Chat</span>
            </button>
          </Link>
          <Link href="/knowledge" className="no-underline">
            <button className="flex items-center gap-1.5 py-1.5 px-3 rounded-full border border-white/5 bg-[#171b26]/50 hover:bg-[#1c1f2a] text-xs font-semibold text-on-surface-variant hover:text-on-surface transition-all cursor-pointer">
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Select Collection</span>
            </button>
          </Link>
          <Link href="/knowledge" className="no-underline">
            <button className="flex items-center gap-1.5 py-1.5 px-3 rounded-full border border-white/5 bg-[#171b26]/50 hover:bg-[#1c1f2a] text-xs font-semibold text-on-surface-variant hover:text-on-surface transition-all cursor-pointer">
              <Search className="w-3.5 h-3.5" />
              <span>Hybrid Search</span>
            </button>
          </Link>
          <button className="flex items-center gap-1.5 py-1.5 px-3 rounded-full border border-white/5 bg-[#171b26]/50 hover:bg-[#1c1f2a] text-xs font-semibold text-on-surface-variant hover:text-on-surface transition-all cursor-pointer">
            <Bot className="w-3.5 h-3.5" />
            <span>GPT-4o</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card variant="lowest" className="relative overflow-hidden group p-6">
          <div className="flex items-center justify-between text-on-surface-variant/40 mb-2">
            <span className="text-[10px] font-bold font-mono tracking-widest uppercase">
              Documents Indexed
            </span>
            <FileText className="w-4 h-4 text-primary" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-on-surface">
              12,482
            </span>
            <span className="text-[10px] text-green-400 font-mono font-bold">
              +12%
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary/40 group-hover:bg-primary transition-all duration-300" />
        </Card>

        <Card variant="lowest" className="relative overflow-hidden group p-6">
          <div className="flex items-center justify-between text-on-surface-variant/40 mb-2">
            <span className="text-[10px] font-bold font-mono tracking-widest uppercase">
              Knowledge Chunks
            </span>
            <Braces className="w-4 h-4 text-[#d0bcff]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-on-surface">
              4.2M
            </span>
            <span className="text-[10px] text-green-400 font-mono font-bold">
              +85k
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#d0bcff]/40 group-hover:bg-[#d0bcff] transition-all duration-300" />
        </Card>

        <Card variant="lowest" className="relative overflow-hidden group p-6">
          <div className="flex items-center justify-between text-on-surface-variant/40 mb-2">
            <span className="text-[10px] font-bold font-mono tracking-widest uppercase">
              Knowledge Collections
            </span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-on-surface">
              142
            </span>
            <span className="text-[10px] text-green-400 font-mono font-bold">
              +8
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-cyan-400/40 group-hover:bg-cyan-400 transition-all duration-300" />
        </Card>

        <Card variant="lowest" className="relative overflow-hidden group p-6">
          <div className="flex items-center justify-between text-on-surface-variant/40 mb-2">
            <span className="text-[10px] font-bold font-mono tracking-widest uppercase">
              AI Queries Today
            </span>
            <Zap className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-on-surface">
              2,841
            </span>
            <span className="text-[10px] text-green-400 font-mono font-bold">
              +14%
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-400/40 group-hover:bg-yellow-400 transition-all duration-300" />
        </Card>
      </div>

      {/* AI Activity Pipeline */}
      <Card variant="surface" className="p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2.5">
            <Activity className="w-4 h-4 text-primary shrink-0" />
            <h3 className="text-label-caps text-on-surface tracking-wider">
              AI Activity Pipeline
            </h3>
          </div>
          <button className="text-xs text-primary hover:text-[#9cbbf5] transition-colors font-semibold bg-transparent border-none">
            View Live Monitor
          </button>
        </div>

        <div className="relative">
          {/* Connector Line */}
          <div className="absolute top-6 left-10 right-10 h-0.5 bg-white/5 z-0 hidden lg:block" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6 relative z-10">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-primary/20 border-2 border-primary text-primary flex items-center justify-center shadow-[0_0_12px_rgba(173,198,255,0.2)]">
                <CheckCircle className="w-5 h-5" />
              </div>
              <span className="text-body-sm font-bold text-on-surface mt-3">Document Uploaded</span>
              <span className="text-[10px] font-mono text-on-surface-variant/40 mt-1">2m ago</span>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-primary/20 border-2 border-primary text-primary flex items-center justify-center shadow-[0_0_12px_rgba(173,198,255,0.2)]">
                <FileCheck className="w-5 h-5" />
              </div>
              <span className="text-body-sm font-bold text-on-surface mt-3">PDF Parsed</span>
              <span className="text-[10px] font-mono text-on-surface-variant/40 mt-1">1m ago</span>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-cyan-500/20 border-2 border-cyan-400 text-cyan-400 flex items-center justify-center shadow-[0_0_12px_rgba(34,211,238,0.2)] animate-pulse">
                <Binary className="w-5 h-5" />
              </div>
              <span className="text-body-sm font-bold text-cyan-400 mt-3">Chunks Created</span>
              <span className="text-[10px] font-mono text-cyan-400 font-semibold mt-1">Just now</span>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center text-center opacity-40">
              <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 text-on-surface-variant flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <span className="text-body-sm font-bold text-on-surface mt-3">Embeddings</span>
              <span className="text-[10px] font-mono text-on-surface-variant/40 mt-1">Pending</span>
            </div>

            {/* Step 5 */}
            <div className="flex flex-col items-center text-center opacity-40">
              <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 text-on-surface-variant flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <span className="text-body-sm font-bold text-on-surface mt-3">Indexed</span>
              <span className="text-[10px] font-mono text-on-surface-variant/40 mt-1">Pending</span>
            </div>

            {/* Step 6 */}
            <div className="flex flex-col items-center text-center opacity-40">
              <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 text-on-surface-variant flex items-center justify-center">
                <CheckCircle className="w-5 h-5" />
              </div>
              <span className="text-body-sm font-bold text-on-surface mt-3">Ready</span>
              <span className="text-[10px] font-mono text-on-surface-variant/40 mt-1">Pending</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Columns: Recent Conversations and Recent Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Recent Conversations */}
        <Card variant="surface" className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-label-caps text-on-surface tracking-wider">
              Recent Conversations
            </h3>
            <Link
              href="/chat"
              className="text-xs text-primary hover:text-[#9cbbf5] transition-colors flex items-center gap-1 font-semibold no-underline"
            >
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            <div
              onClick={() => handleOpenConversation("q3-compliance")}
              className="p-4 rounded-default border border-white/5 hover:border-primary/20 bg-surface-container-low/40 hover:bg-white/3 transition-all duration-150 cursor-pointer flex items-start justify-between gap-4 group"
            >
              <div className="flex gap-3 min-w-0">
                <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center border border-primary/20 text-primary shrink-0 group-hover:text-primary transition-colors">
                  <MessageSquare className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-body-sm font-bold text-on-surface group-hover:text-primary transition-colors truncate">
                    Summarize Q3 Compliance Requirements
                  </h4>
                  <p className="text-xs text-on-surface-variant/60 line-clamp-1 mt-1 leading-normal">
                    Based on the provided PDFs, the main requirements...
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-on-surface-variant/40 shrink-0 text-right">
                14:20 PM
              </span>
            </div>

            <div
              onClick={() => handleOpenConversation("arch-migration")}
              className="p-4 rounded-default border border-white/5 hover:border-primary/20 bg-surface-container-low/40 hover:bg-white/3 transition-all duration-150 cursor-pointer flex items-start justify-between gap-4 group"
            >
              <div className="flex gap-3 min-w-0">
                <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center border border-primary/20 text-primary shrink-0 group-hover:text-primary transition-colors">
                  <MessageSquare className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-body-sm font-bold text-on-surface group-hover:text-primary transition-colors truncate">
                    Cloud Architecture Migration Roadmap
                  </h4>
                  <p className="text-xs text-on-surface-variant/60 line-clamp-1 mt-1 leading-normal">
                    I found 12 related documents regarding the AWS...
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-on-surface-variant/40 shrink-0 text-right">
                Yesterday
              </span>
            </div>

            <div
              onClick={() => handleOpenConversation("apollo-nda")}
              className="p-4 rounded-default border border-white/5 hover:border-primary/20 bg-surface-container-low/40 hover:bg-white/3 transition-all duration-150 cursor-pointer flex items-start justify-between gap-4 group"
            >
              <div className="flex gap-3 min-w-0">
                <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center border border-primary/20 text-primary shrink-0 group-hover:text-primary transition-colors">
                  <MessageSquare className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-body-sm font-bold text-on-surface group-hover:text-primary transition-colors truncate">
                    Legal Review: Project Apollo NDA
                  </h4>
                  <p className="text-xs text-on-surface-variant/60 line-clamp-1 mt-1 leading-normal">
                    The indemnity clause in Section 4.2 differs from the...
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-on-surface-variant/40 shrink-0 text-right">
                Oct 24
              </span>
            </div>
          </div>
        </Card>

        {/* Recent Documents */}
        <Card variant="surface" className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-label-caps text-on-surface tracking-wider">
              Recent Documents
            </h3>
            <Link
              href="/knowledge"
              className="text-xs text-primary hover:text-[#9cbbf5] transition-colors flex items-center gap-1 font-semibold no-underline"
            >
              Go to Library <ChevronDown className="w-3.5 h-3.5 rotate-270" />
            </Link>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-default border border-white/5 bg-surface-container-low/40 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded bg-red-500/10 flex items-center justify-center border border-red-500/15 text-red-400 shrink-0">
                  <FileText className="w-4 h-4 text-red-400" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-body-sm font-bold text-on-surface truncate">
                    Annual_Financial_Report_2023.pdf
                  </h4>
                  <span className="text-[10px] text-on-surface-variant/45 font-mono block mt-0.5">
                    Oct 26 • 1,240 chunks • text-embedding-3-small
                  </span>
                </div>
              </div>
              <Badge variant="default" className="text-[10px] py-0 px-2 shrink-0">
                Indexed
              </Badge>
            </div>

            <div className="p-4 rounded-default border border-white/5 bg-surface-container-low/40 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded bg-blue-500/10 flex items-center justify-center border border-blue-500/15 text-blue-400 shrink-0">
                  <FileText className="w-4 h-4 text-blue-400" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-body-sm font-bold text-on-surface truncate">
                    Market_Research_Analysis_Q4.docx
                  </h4>
                  <span className="text-[10px] text-on-surface-variant/45 font-mono block mt-0.5">
                    Oct 25 • 850 chunks • text-embedding-3-small
                  </span>
                </div>
              </div>
              <Badge variant="default" className="text-[10px] py-0 px-2 shrink-0">
                Indexed
              </Badge>
            </div>

            <div className="p-4 rounded-default border border-white/5 bg-surface-container-low/40 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded bg-green-500/10 flex items-center justify-center border border-green-500/15 text-green-400 shrink-0">
                  <FileText className="w-4 h-4 text-green-400" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-body-sm font-bold text-on-surface truncate">
                    Customer_Feedback_Raw_Data.csv
                  </h4>
                  <span className="text-[10px] text-on-surface-variant/45 font-mono block mt-0.5">
                    Oct 24 • Parsing... • text-embedding-3-small
                  </span>
                </div>
              </div>
              <Badge variant="primary" className="text-[10px] py-0 px-2 shrink-0 animate-pulse">
                Parsing
              </Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
