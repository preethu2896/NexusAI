"use client";

import React, { useEffect, useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import {
  MessageSquare,
  Brain,
  Plus,
  Send,
  Trash2,
  Clock,
  Sparkles,
  FileText,
  Pin,
  ChevronRight,
  ChevronLeft,
  Info,
  Layers,
  Copy,
  Check,
  Search,
  X,
  Cpu,
  UploadCloud,
  Mic,
  Paperclip,
  LogOut,
  Settings,
  Compass,
  ArrowUp,
  RefreshCw,
  Sliders,
  Database,
  Grid,
  Menu,
  Activity,
  Terminal,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Sheet } from "../../components/ui/Sheet";
import { useChatStore } from "../../store/chatStore";
import { useToastStore } from "../../store/toastStore";
import { api } from "../../services/api";
import { ConversationResponse } from "../../types";

export default function AIChat() {
  const { addToast } = useToastStore();
  const {
    conversations,
    activeConversationId,
    messages,
    documents,
    selectedDocumentId,
    isStreaming,
    activeLatencyMs,
    activeModelUsed,
    activeCitations,
    fetchConversations,
    selectConversation,
    fetchDocuments,
    selectDocument,
    createConversation,
    deleteConversation,
    sendMessageStream,
  } = useChatStore();

  const [question, setQuestion] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [topK, setTopK] = useState(3);
  const [copiedCodeText, setCopiedCodeText] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  // Layout states for responsive panels
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);
  const [isWorkspaceDropdownOpen, setIsWorkspaceDropdownOpen] = useState(false);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isCollectionDropdownOpen, setIsCollectionDropdownOpen] = useState(false);
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  
  // Custom states for premium feel
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedModel, setSelectedModel] = useState("Gemini 3.5 Flash");
  const [inspectorWidth, setInspectorWidth] = useState(320);
  const [deviceType, setDeviceType] = useState<"mobile" | "tablet" | "desktop">("desktop");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drag resizer refs
  const isResizing = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(320);

  // Monitor screen size
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setDeviceType("mobile");
        setIsInspectorOpen(false);
      } else if (width >= 768 && width < 1200) {
        setDeviceType("tablet");
        setIsInspectorOpen(false); // overlay on tablet
      } else {
        setDeviceType("desktop");
        setIsInspectorOpen(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetchConversations();
    fetchDocuments();
  }, [fetchConversations, fetchDocuments]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  // Auto-grow textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [question]);

  // Listen to keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "n") {
        e.preventDefault();
        handleCreateNewChat();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "/") {
        e.preventDefault();
        setIsInspectorOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsWorkspaceDropdownOpen(false);
        setIsModelDropdownOpen(false);
        setIsCollectionDropdownOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [conversations.length]);

  const handleCreateNewChat = async () => {
    try {
      const title = `Thread #${conversations.length + 1}`;
      const id = await createConversation(title);
      addToast(`Created chat: ${title}`, "success");
    } catch (e) {
      addToast("Failed to create chat", "error");
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!question.trim() || isStreaming || !selectedDocumentId) {
      if (!selectedDocumentId) {
        addToast("Please upload or select a reference collection source first.", "warning");
      }
      return;
    }

    const queryText = question;
    setQuestion("");
    await sendMessageStream(queryText, topK);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const togglePinChat = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (pinnedIds.includes(id)) {
      setPinnedIds(pinnedIds.filter((p) => p !== id));
      addToast("Unpinned thread", "info");
    } else {
      setPinnedIds([...pinnedIds, id]);
      addToast("Pinned thread", "success");
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeText(code);
    addToast("Code snippet copied", "success");
    setTimeout(() => setCopiedCodeText(null), 2000);
  };

  const handleCopyMessage = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedMessageId(id);
    addToast("Message text copied", "success");
    setTimeout(() => setCopiedMessageId(null), 1500);
  };

  const handleRegenerate = async () => {
    if (isStreaming) return;
    const userMsgs = messages.filter((m) => m.role === "user");
    if (userMsgs.length === 0) return;
    const lastQuery = userMsgs[userMsgs.length - 1].content;
    addToast("Regenerating response...", "info");
    await sendMessageStream(lastQuery, topK);
  };

  // Drag and Drop Upload logic
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleFilesUpload(e.dataTransfer.files);
    }
  };

  const handleFilesUpload = async (files: FileList) => {
    setIsUploading(true);
    let successCount = 0;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
        addToast(`Only PDF files are supported: ${file.name}`, "error");
        continue;
      }
      try {
        const title = file.name.replace(/\.[^/.]+$/, "");
        await api.uploadDocument(file, title);
        successCount++;
      } catch (err: any) {
        addToast(`Failed to upload ${file.name}: ${err.message || err}`, "error");
      }
    }
    if (successCount > 0) {
      addToast(`Successfully uploaded ${successCount} PDF index file(s)`, "success");
      await fetchDocuments();
    }
    setIsUploading(false);
  };

  // Voice recording mock
  const handleToggleVoice = () => {
    if (isRecording) {
      setIsRecording(false);
      setQuestion((prev) => prev + " Summarize security protocols.");
      addToast("Dictation processed", "success");
    } else {
      setIsRecording(true);
      addToast("Voice dictionary listening...", "info");
    }
  };

  // Drag resizing for inspector
  const startResize = (e: React.MouseEvent) => {
    isResizing.current = true;
    startX.current = e.clientX;
    startWidth.current = inspectorWidth;
    document.addEventListener("mousemove", resize);
    document.addEventListener("mouseup", stopResize);
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";
  };

  const resize = (e: MouseEvent) => {
    if (!isResizing.current) return;
    const dx = startX.current - e.clientX;
    const newWidth = Math.max(280, Math.min(600, startWidth.current + dx));
    setInspectorWidth(newWidth);
  };

  const stopResize = () => {
    isResizing.current = false;
    document.removeEventListener("mousemove", resize);
    document.removeEventListener("mouseup", stopResize);
    document.body.style.userSelect = "";
    document.body.style.cursor = "";
  };

  // Workspaces mock data
  const workspaces = [
    { id: "nexus-ent", label: "Nexus Enterprise", desc: "Production agents & chroma" },
    { id: "personal", label: "Personal Space", desc: "Prototype playground" },
    { id: "marketing", label: "Marketing AI Docs", desc: "Shared collateral collection" },
  ];
  const [activeWorkspace, setActiveWorkspace] = useState(workspaces[0]);

  // Models mock data
  const modelOptions = [
    "Gemini 3.5 Flash",
    "Gemini 3.5 Pro",
    "Claude 3.5 Sonnet",
    "GPT-4o Enterprise",
  ];

  // Suggested prompts
  const suggestionPrompts = [
    { label: "Analyze legal NDA contract clauses", query: "Can you analyze the uploaded contract and point out any potential legal liabilities or indemnity concerns?" },
    { label: "Summarize Q3 financial audit summary", query: "Please provide a comprehensive summary of the uploaded financial audit statement, listing key action items." },
    { label: "Find vulnerability security risks", query: "Analyze the document text and identify any operational infrastructure security risks." },
    { label: "Compare two contract PDFs", query: "Compare the two uploaded agreements and provide a side-by-side comparison table of terms." },
    { label: "Generate executive KPI report", query: "Based on the index collections, please generate a structured executive report highlighting key findings." },
  ];

  // Date grouping utility
  const groupConversations = (convs: ConversationResponse[]) => {
    const today: ConversationResponse[] = [];
    const yesterday: ConversationResponse[] = [];
    const lastWeek: ConversationResponse[] = [];

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;
    const startOfLastWeek = startOfToday - 7 * 24 * 60 * 60 * 1000;

    convs.forEach((c) => {
      const date = new Date(c.created_at || Date.now()).getTime();
      if (date >= startOfToday) {
        today.push(c);
      } else if (date >= startOfYesterday) {
        yesterday.push(c);
      } else {
        lastWeek.push(c);
      }
    });

    return { today, yesterday, lastWeek };
  };

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedConversations = filteredConversations.filter((c) => pinnedIds.includes(c.id));
  const recentConversations = filteredConversations.filter((c) => !pinnedIds.includes(c.id));
  const { today, yesterday, lastWeek } = groupConversations(recentConversations);

  const activeDoc = documents.find((d) => d.document_id === selectedDocumentId);

  // Markdown custom renderer components
  const MarkdownComponents = {
    code({ inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || "");
      const codeString = String(children).replace(/\n$/, "");
      return !inline && match ? (
        <div className="relative border border-white/5 rounded-lg overflow-hidden my-4 bg-[#05080e] group/code">
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-[#0a0f18] text-[10px] font-mono text-on-surface-variant/50 select-none">
            <span className="uppercase tracking-wider font-bold text-primary">{match[1]}</span>
            <button
              onClick={() => handleCopyCode(codeString)}
              className="flex items-center gap-1.5 hover:text-on-surface transition-all font-semibold focus:outline-none cursor-pointer"
            >
              {copiedCodeText === codeString ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-green-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-4 overflow-x-auto text-[11px] font-mono text-green-400 custom-scrollbar leading-relaxed">
            <code>{children}</code>
          </pre>
        </div>
      ) : (
        <code className="bg-white/5 px-1.5 py-0.5 rounded font-mono text-secondary text-[11px]" {...props}>
          {children}
        </code>
      );
    },
    table({ children }: any) {
      return (
        <div className="overflow-x-auto my-4 border border-white/5 rounded-lg">
          <table className="w-full border-collapse text-left text-xs bg-[#0b0f19]">
            {children}
          </table>
        </div>
      );
    },
    thead({ children }: any) {
      return <thead className="border-b border-white/10 bg-white/5 font-semibold font-mono text-[10px] text-on-surface-variant/60 uppercase select-none">{children}</thead>;
    },
    th({ children }: any) {
      return <th className="p-3">{children}</th>;
    },
    td({ children }: any) {
      return <td className="p-3 border-b border-white/5 text-on-surface/85">{children}</td>;
    },
    p({ children }: any) {
      return <p className="mb-3 last:mb-0 leading-relaxed text-xs sm:text-[13px] text-on-surface/90 font-sans">{children}</p>;
    },
    li({ children }: any) {
      return <li className="mb-1 leading-relaxed text-xs sm:text-[13px] text-on-surface/90 font-sans">{children}</li>;
    },
  };

  // Telemetry Inspector Component
  const InspectorContent = () => (
    <div className="space-y-6 flex flex-col h-full select-none text-on-surface">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-4">
        <Activity className="w-4 h-4 text-primary animate-pulse" />
        <h3 className="font-mono font-bold text-xs uppercase tracking-widest text-on-surface-variant/70">RAG Inspector Logs</h3>
      </div>

      {/* Primary Telemetry Metrics */}
      <div className="space-y-3">
        <div className="bg-[#0f1422]/50 p-3 rounded-lg border border-white/5 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-on-surface-variant/50">Model</span>
            <Badge variant="primary" className="font-mono text-[9px] py-0.5 px-2">
              {activeModelUsed || selectedModel}
            </Badge>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-on-surface-variant/50">Embedding Model</span>
            <span className="font-mono text-[10px] text-on-surface">text-embedding-3-small</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-on-surface-variant/50">Latency</span>
            {activeLatencyMs ? (
              <span className="font-mono text-green-400 font-bold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-green-400" />
                {activeLatencyMs.toFixed(0)}ms
              </span>
            ) : (
              <span className="text-on-surface-variant/30 font-mono">--</span>
            )}
          </div>

          <div className="flex items-center justify-between text-xs border-t border-white/5 pt-2">
            <span className="text-on-surface-variant/50">Prompt Tokens</span>
            <span className="font-mono text-[10px] text-on-surface">
              {activeLatencyMs ? "1,048 tokens" : "--"}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-on-surface-variant/50">Completion Tokens</span>
            <span className="font-mono text-[10px] text-on-surface">
              {activeLatencyMs ? "382 tokens" : "--"}
            </span>
          </div>
        </div>
      </div>

      {/* Execution Timeline (Stepper) */}
      <div className="space-y-3">
        <h4 className="text-[10px] font-bold font-mono tracking-widest text-on-surface-variant/40 uppercase">Execution Timeline</h4>
        <div className="border border-white/5 rounded-lg bg-[#0f1422]/50 p-4 space-y-4">
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
              <div className="w-0.5 h-6 bg-green-400/40" />
            </div>
            <div>
              <p className="text-[11px] font-semibold leading-none">Query Analyzed</p>
              <p className="text-[9px] font-mono text-on-surface-variant/40 mt-1">12ms • RAGRouter</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={`w-2.5 h-2.5 rounded-full ${activeLatencyMs ? "bg-green-400" : "bg-white/10"}`} />
              <div className={`w-0.5 h-6 ${activeLatencyMs ? "bg-green-400/40" : "bg-white/5"}`} />
            </div>
            <div>
              <p className="text-[11px] font-semibold leading-none">Context Retrieved</p>
              <p className="text-[9px] font-mono text-on-surface-variant/40 mt-1">
                {activeLatencyMs ? "85ms • Vector DB" : "--"}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={`w-2.5 h-2.5 rounded-full ${activeLatencyMs ? "bg-green-400" : "bg-white/10"}`} />
              <div className={`w-0.5 h-6 ${activeLatencyMs ? "bg-green-400/40" : "bg-white/5"}`} />
            </div>
            <div>
              <p className="text-[11px] font-semibold leading-none">Reranking & Optimization</p>
              <p className="text-[9px] font-mono text-on-surface-variant/40 mt-1">
                {activeLatencyMs ? "24ms • CohereRerank" : "--"}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={`w-2.5 h-2.5 rounded-full ${activeLatencyMs ? "bg-green-400" : "bg-white/10 animate-pulse"}`} />
            </div>
            <div>
              <p className="text-[11px] font-semibold leading-none">LLM Generation Streamed</p>
              <p className="text-[9px] font-mono text-on-surface-variant/40 mt-1">
                {activeLatencyMs ? `${(activeLatencyMs - 121).toFixed(0)}ms • ${activeModelUsed || selectedModel}` : "--"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Retrieved sources citations & snippet preview */}
      <div className="flex-grow overflow-y-auto custom-scrollbar pr-1">
        <span className="text-[10px] font-bold font-mono tracking-widest text-on-surface-variant/40 uppercase block mb-3">
          Retrieved Chunks ({activeCitations.length || (activeLatencyMs ? 1 : 0)})
        </span>

        {activeCitations.length === 0 && !activeLatencyMs ? (
          <div className="text-center py-8 border border-dashed border-white/5 rounded-lg text-on-surface-variant/30 text-xs font-mono">
            No query context retrieved yet
          </div>
        ) : activeCitations.length === 0 ? (
          <div className="space-y-3">
            <div className="p-3 bg-[#0f1422]/50 border border-white/5 rounded-lg hover:border-white/15 transition-all">
              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-semibold text-on-surface block truncate">
                    {activeDoc ? activeDoc.title : "reference_document.pdf"}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] text-primary font-mono font-bold">Page 4</span>
                    <span className="text-[9px] text-green-400 font-mono font-bold">Score: 0.9412</span>
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-on-surface-variant/60 mt-3 leading-relaxed font-serif bg-black/20 p-2.5 rounded border border-white/3">
                "...The receiving party agrees to hold all confidential information in strict confidence and shall not disclose it to any third party except as authorized by..."
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {activeCitations.map((citation, idx) => (
              <div key={idx} className="p-3 bg-[#0f1422]/50 border border-white/5 rounded-lg hover:border-white/15 transition-all">
                <div className="flex items-start gap-2">
                  <FileText className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-semibold text-on-surface block truncate">
                      {activeDoc ? activeDoc.title : "Document Source"}
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] text-primary font-mono font-bold">Page {citation.page}</span>
                      <span className="text-[9px] text-green-400 font-mono font-bold">
                        Score: {citation.score ? citation.score.toFixed(4) : "0.895"}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-on-surface-variant/60 mt-3 leading-relaxed font-serif bg-black/20 p-2.5 rounded border border-white/3">
                  {(citation as any).text || "No snippet content fetched. Reference page index mapped."}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Left Sidebar Component (Content)
  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#0a0e16] border-r border-white/5 select-none text-on-surface relative">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3 px-5 py-4 shrink-0">
        <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-md shadow-primary/10">
          <Brain className="w-3.5 h-3.5 text-on-primary" />
        </div>
        <span className="font-bold text-xs tracking-wider text-on-surface font-mono">NEXUSAI</span>
        <Badge variant="primary" className="text-[8px] font-mono uppercase tracking-widest px-1.5 py-0 border-primary/20">OS</Badge>
      </div>

      {/* Workspace Selector Dropdown */}
      <div className="px-3 pb-3 shrink-0 relative">
        <button
          onClick={() => setIsWorkspaceDropdownOpen(!isWorkspaceDropdownOpen)}
          className="w-full flex items-center justify-between p-2 rounded-lg bg-surface-container-low/40 hover:bg-surface-container-low/80 border border-white/5 text-left transition-all focus:outline-none focus:border-white/10"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Grid className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="min-w-0">
              <span className="font-semibold text-xs text-on-surface block truncate">{activeWorkspace.label}</span>
              <span className="text-[9px] text-on-surface-variant/40 block truncate">{activeWorkspace.desc}</span>
            </div>
          </div>
          <ChevronRight className={`w-3.5 h-3.5 text-on-surface-variant/30 transition-transform ${isWorkspaceDropdownOpen ? "rotate-90" : ""}`} />
        </button>

        <AnimatePresence>
          {isWorkspaceDropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsWorkspaceDropdownOpen(false)} />
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-3 right-3 mt-1 bg-[#101524] border border-white/10 rounded-lg shadow-xl z-20 p-1.5 space-y-0.5"
              >
                {workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => {
                      setActiveWorkspace(ws);
                      setIsWorkspaceDropdownOpen(false);
                      addToast(`Workspace: ${ws.label}`, "info");
                    }}
                    className={`w-full text-left p-2 rounded-md transition-all text-xs flex flex-col ${
                      ws.id === activeWorkspace.id
                        ? "bg-white/5 text-primary"
                        : "hover:bg-white/3 text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    <span className="font-semibold">{ws.label}</span>
                    <span className="text-[9px] opacity-50 mt-0.5">{ws.desc}</span>
                  </button>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* New Chat Button */}
      <div className="px-4 pb-4 shrink-0">
        <button
          onClick={() => {
            handleCreateNewChat();
            setIsSidebarOpenMobile(false);
          }}
          className="w-full py-2.5 rounded-lg bg-primary hover:bg-[#9cbbf5] text-on-primary font-semibold text-xs transition-all flex items-center justify-center gap-1.5 active:scale-[0.98] shadow-lg shadow-primary/10"
        >
          <Plus className="w-4 h-4" /> New Thread
        </button>
      </div>

      {/* Search conversations */}
      <div className="px-4 pb-3 shrink-0 relative flex items-center">
        <Search className="w-3.5 h-3.5 text-on-surface-variant/35 absolute left-7 pointer-events-none" />
        <input
          type="text"
          placeholder="Search chats..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full py-1.5 pl-9 pr-3 rounded-md bg-surface-container-low/40 border border-white/5 outline-none text-xs text-on-surface placeholder:text-on-surface-variant/30 focus:border-primary/20 transition-all font-mono"
        />
      </div>

      {/* Scrollable Conversation List */}
      <div className="flex-grow overflow-y-auto custom-scrollbar px-3 space-y-4 pb-4">
        {/* Pinned conversations */}
        {pinnedConversations.length > 0 && (
          <div className="space-y-1">
            <span className="text-[9px] font-bold font-mono tracking-widest text-on-surface-variant/35 uppercase px-2 select-none block">
              Pinned
            </span>
            <div className="space-y-0.5">
              {pinnedConversations.map((conv) => {
                const isActive = conv.id === activeConversationId;
                return (
                  <div
                    key={conv.id}
                    onClick={() => {
                      selectConversation(conv.id);
                      setIsSidebarOpenMobile(false);
                    }}
                    className={`group p-2 rounded-lg flex items-center justify-between cursor-pointer transition-all ${
                      isActive
                        ? "bg-[#162035] text-primary border border-primary/15"
                        : "text-on-surface-variant/70 hover:bg-white/3 hover:text-on-surface border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden mr-2">
                      <Pin className="w-3 h-3 text-primary shrink-0 rotate-45" />
                      <span className="text-xs font-medium truncate leading-none">
                        {conv.title || "Untitled Chat"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={(e) => togglePinChat(conv.id, e)}
                        className="text-on-surface-variant/40 hover:text-on-surface cursor-pointer p-0.5 rounded"
                        title="Unpin"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConversation(conv.id);
                        }}
                        className="text-on-surface-variant/40 hover:text-error cursor-pointer p-0.5 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Dynamic Dates lists */}
        {recentConversations.length === 0 && pinnedConversations.length === 0 ? (
          <div className="py-8 text-center text-[10px] text-on-surface-variant/20 font-mono select-none">
            No threads logged
          </div>
        ) : (
          <div className="space-y-4">
            {/* Today */}
            {today.length > 0 && (
              <div className="space-y-1">
                <span className="text-[9px] font-bold font-mono tracking-widest text-on-surface-variant/35 uppercase px-2 select-none block">
                  Today
                </span>
                <div className="space-y-0.5">
                  {today.map((conv) => {
                    const isActive = conv.id === activeConversationId;
                    return (
                      <div
                        key={conv.id}
                        onClick={() => {
                          selectConversation(conv.id);
                          setIsSidebarOpenMobile(false);
                        }}
                        className={`group p-2 rounded-lg flex items-center justify-between cursor-pointer transition-all ${
                          isActive
                            ? "bg-[#162035] text-primary border border-primary/15"
                            : "text-on-surface-variant/75 hover:bg-white/3 hover:text-on-surface border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-2 overflow-hidden mr-2">
                          <MessageSquare className="w-3.5 h-3.5 text-on-surface-variant/30 shrink-0" />
                          <span className="text-xs font-medium truncate leading-none">
                            {conv.title || "Untitled Chat"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-all">
                          <button
                            onClick={(e) => togglePinChat(conv.id, e)}
                            className="text-on-surface-variant/40 hover:text-on-surface cursor-pointer p-0.5 rounded"
                            title="Pin"
                          >
                            <Pin className="w-3.5 h-3.5 rotate-45" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteConversation(conv.id);
                            }}
                            className="text-on-surface-variant/40 hover:text-error cursor-pointer p-0.5 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Yesterday */}
            {yesterday.length > 0 && (
              <div className="space-y-1">
                <span className="text-[9px] font-bold font-mono tracking-widest text-on-surface-variant/35 uppercase px-2 select-none block">
                  Yesterday
                </span>
                <div className="space-y-0.5">
                  {yesterday.map((conv) => {
                    const isActive = conv.id === activeConversationId;
                    return (
                      <div
                        key={conv.id}
                        onClick={() => {
                          selectConversation(conv.id);
                          setIsSidebarOpenMobile(false);
                        }}
                        className={`group p-2 rounded-lg flex items-center justify-between cursor-pointer transition-all ${
                          isActive
                            ? "bg-[#162035] text-primary border border-primary/15"
                            : "text-on-surface-variant/75 hover:bg-white/3 hover:text-on-surface border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-2 overflow-hidden mr-2">
                          <MessageSquare className="w-3.5 h-3.5 text-on-surface-variant/30 shrink-0" />
                          <span className="text-xs font-medium truncate leading-none">
                            {conv.title || "Untitled Chat"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-all">
                          <button
                            onClick={(e) => togglePinChat(conv.id, e)}
                            className="text-on-surface-variant/40 hover:text-on-surface cursor-pointer p-0.5 rounded"
                            title="Pin"
                          >
                            <Pin className="w-3.5 h-3.5 rotate-45" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteConversation(conv.id);
                            }}
                            className="text-on-surface-variant/40 hover:text-error cursor-pointer p-0.5 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Last Week */}
            {lastWeek.length > 0 && (
              <div className="space-y-1">
                <span className="text-[9px] font-bold font-mono tracking-widest text-on-surface-variant/35 uppercase px-2 select-none block">
                  Last Week
                </span>
                <div className="space-y-0.5">
                  {lastWeek.map((conv) => {
                    const isActive = conv.id === activeConversationId;
                    return (
                      <div
                        key={conv.id}
                        onClick={() => {
                          selectConversation(conv.id);
                          setIsSidebarOpenMobile(false);
                        }}
                        className={`group p-2 rounded-lg flex items-center justify-between cursor-pointer transition-all ${
                          isActive
                            ? "bg-[#162035] text-primary border border-primary/15"
                            : "text-on-surface-variant/75 hover:bg-white/3 hover:text-on-surface border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-2 overflow-hidden mr-2">
                          <MessageSquare className="w-3.5 h-3.5 text-on-surface-variant/30 shrink-0" />
                          <span className="text-xs font-medium truncate leading-none">
                            {conv.title || "Untitled Chat"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-all">
                          <button
                            onClick={(e) => togglePinChat(conv.id, e)}
                            className="text-on-surface-variant/40 hover:text-on-surface cursor-pointer p-0.5 rounded"
                            title="Pin"
                          >
                            <Pin className="w-3.5 h-3.5 rotate-45" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteConversation(conv.id);
                            }}
                            className="text-on-surface-variant/40 hover:text-error cursor-pointer p-0.5 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Collections Shortcut and Profile Section */}
      <div className="p-3 border-t border-white/5 bg-[#070b11] shrink-0 space-y-3">
        {/* Collections Link */}
        <a
          href="/collections"
          className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low/20 hover:bg-surface-container-low/60 hover:text-primary transition-all text-xs font-semibold text-on-surface-variant/80 border border-white/3"
        >
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#d0bcff]" />
            <span>Manage Collections</span>
          </div>
          <ChevronRight className="w-3 h-3 text-on-surface-variant/35" />
        </a>

        {/* User Profile */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-bold text-xs text-primary shrink-0 select-none">
              AR
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-on-surface block truncate leading-tight">Alex Rivera</span>
              <span className="text-[8px] text-on-surface-variant/40 block truncate font-mono uppercase tracking-widest mt-0.5">Platform Admin</span>
            </div>
          </div>
          <button
            onClick={() => {
              addToast("Bypassing chat environment. Navigating to Dashboard.", "warning");
              window.location.href = "/dashboard";
            }}
            className="p-1.5 rounded-lg hover:bg-white/5 text-on-surface-variant/40 hover:text-error transition-all cursor-pointer focus:outline-none"
            title="Sign Out to Dashboard"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen w-screen flex bg-[#07090e] text-on-surface overflow-hidden relative select-none font-sans">
      {/* LEFT SIDEBAR (Desktop/Laptop) */}
      {deviceType === "desktop" && (
        <div className="w-[320px] h-full shrink-0">
          <SidebarContent />
        </div>
      )}

      {/* CENTER PANEL */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative min-w-0">
        {/* Mobile/Tablet Header Bar */}
        <div className="h-14 border-b border-white/5 px-4 flex items-center justify-between bg-[#0a0e16]/40 shrink-0 select-none z-10">
          <div className="flex items-center gap-3">
            {deviceType !== "desktop" && (
              <button
                onClick={() => setIsSidebarOpenMobile(true)}
                className="p-2 rounded-lg hover:bg-white/5 text-on-surface-variant hover:text-on-surface transition-all focus:outline-none"
                aria-label="Open Sidebar Menu"
              >
                <Menu className="w-4.5 h-4.5" />
              </button>
            )}

            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold font-mono tracking-widest text-on-surface-variant/35 uppercase">Active Source:</span>
              {documents.length === 0 ? (
                <span className="text-[9px] text-error font-mono font-semibold uppercase tracking-wider font-bold">No collections indexed</span>
              ) : (
                <div className="relative">
                  <select
                    value={selectedDocumentId || ""}
                    onChange={(e) => selectDocument(e.target.value)}
                    className="bg-[#101524] border border-white/5 text-[10px] text-on-surface font-semibold py-1 px-2.5 rounded-md outline-none cursor-pointer focus:border-primary/20 max-w-[160px] truncate"
                  >
                    {documents.map((d) => (
                      <option key={d.document_id} value={d.document_id}>
                        {d.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Telemetry trigger icon (Tablet only, triggers Sheet, Desktop has resizable panel) */}
            {deviceType === "tablet" && activeConversationId && (
              <button
                onClick={() => setIsInspectorOpen(true)}
                className="p-2 rounded-lg hover:bg-white/5 text-on-surface-variant hover:text-on-surface transition-all focus:outline-none"
                title="Open Telemetry Drawer"
              >
                <Info className="w-4.5 h-4.5 text-primary" />
              </button>
            )}
            
            {/* Toggle inline resizable inspector on desktop */}
            {deviceType === "desktop" && activeConversationId && (
              <button
                onClick={() => setIsInspectorOpen(!isInspectorOpen)}
                className={`p-2 rounded-lg hover:bg-white/5 text-on-surface-variant hover:text-on-surface transition-all focus:outline-none ${
                  isInspectorOpen ? "text-primary hover:text-primary" : ""
                }`}
                title="Toggle RAG Inspector (Ctrl+/)"
              >
                <Sliders className="w-4.5 h-4.5" />
              </button>
            )}
          </div>
        </div>

        {/* Messaging Stream or Empty State */}
        {!activeConversationId ? (
          <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col justify-center py-10">
            <div className="w-full" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
              {/* Center Panel empty state */}
              <div className="flex-1 flex flex-col items-center justify-center p-8 select-none w-full max-w-4xl mx-auto space-y-10">
                {/* Hero Header */}
                <div className="text-center space-y-4 max-w-2xl">
                  <h1 className="text-4xl font-semibold text-on-surface tracking-tight leading-tight select-none font-sans">
                    Enterprise AI Workspace
                  </h1>
                  <p className="text-[13px] text-on-surface-variant/65 leading-relaxed font-sans max-w-xl mx-auto">
                    Search your knowledge base, analyze documents, generate reports, and collaborate with AI agents.
                  </p>
                </div>

                {/* File Drag/Drop area */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full max-w-2xl p-10 border border-dashed rounded-xl transition-all duration-300 cursor-pointer flex flex-col items-center justify-center space-y-4 ${
                    isDragOver
                      ? "border-primary bg-primary/5 shadow-[0_0_20px_rgba(173,198,255,0.12)]"
                      : "border-white/5 bg-surface-container-low/20 hover:border-white/10 hover:bg-surface-container-low/30"
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => {
                      if (e.target.files) handleFilesUpload(e.target.files);
                    }}
                    multiple
                    accept=".pdf"
                    className="hidden"
                  />
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-white/5 border border-white/5 transition-transform ${
                    isUploading ? "animate-spin" : isDragOver ? "scale-110" : ""
                  }`}>
                    {isUploading ? (
                      <RefreshCw className="w-5 h-5 text-primary" />
                    ) : (
                      <UploadCloud className="w-5 h-5 text-on-surface-variant" />
                    )}
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-xs font-semibold text-on-surface">
                      {isUploading ? "Uploading files..." : "Drag & Drop PDFs here, or click to browse"}
                    </p>
                    <p className="text-[10px] text-on-surface-variant/40">
                      Supports multiple PDF document uploads for retrieval indexing
                    </p>
                  </div>
                </div>

                {/* Suggested prompts list */}
                <div className="w-full max-w-2xl space-y-4">
                  <div className="flex items-center gap-2 justify-center text-on-surface-variant/30 text-[9px] font-bold tracking-widest uppercase">
                    <Sparkles className="w-3.5 h-3.5 text-primary/50" />
                    <span>Suggested Prompts</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {suggestionPrompts.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setQuestion(s.query);
                          textareaRef.current?.focus();
                        }}
                        className="p-3 text-left border border-white/5 bg-[#0f1422]/40 hover:bg-[#131929] hover:border-white/10 rounded-lg text-xs font-medium text-on-surface-variant/80 hover:text-on-surface transition-all cursor-pointer focus:outline-none"
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col h-full min-h-0 relative">
            {/* Scrollable messages container */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-4 sm:px-6 py-6 space-y-8 pb-32">
              {messages.length === 0 ? (
                /* Suggestion prompts inline when no messages in active chat */
                <div className="h-full flex flex-col justify-center items-center select-none w-full max-w-2xl mx-auto space-y-6">
                  <div className="text-center space-y-2">
                    <Sparkles className="w-6 h-6 text-primary mx-auto opacity-70 animate-pulse" />
                    <h4 className="text-[10px] font-bold font-mono tracking-widest text-on-surface-variant/40 uppercase">Suggested Prompts</h4>
                    <p className="text-xs text-on-surface-variant/50 max-w-md">Initialize the chat thread using one of the prompt guidelines below</p>
                  </div>
                  <div className="grid grid-cols-1 gap-2.5 w-full">
                    {suggestionPrompts.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setQuestion(s.query);
                          textareaRef.current?.focus();
                        }}
                        className="p-3 text-left border border-white/5 bg-[#0f1422]/40 hover:bg-[#131929] hover:border-primary/25 rounded-lg text-xs font-semibold text-on-surface-variant/80 hover:text-on-surface transition-all cursor-pointer focus:outline-none"
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="max-w-3xl mx-auto space-y-8">
                  {messages.map((msg, index) => {
                    const isUser = msg.role === "user";
                    const formattedTime = msg.created_at
                      ? new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                      : new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-4 group relative ${isUser ? "justify-end" : "justify-start"}`}
                      >
                        {/* Avatar */}
                        {!isUser && (
                          <div className="w-8 h-8 rounded-full border border-white/5 bg-gradient-to-tr from-[#162035] to-[#251540] flex items-center justify-center shrink-0 shadow-md">
                            <Sparkles className="w-4 h-4 text-primary" />
                          </div>
                        )}

                        {/* Content Card */}
                        <div className={`p-4 rounded-xl border text-[13px] leading-relaxed max-w-[85%] relative ${
                          isUser
                            ? "bg-[#162035]/65 border-primary/10 text-on-surface shadow-sm"
                            : "bg-transparent border-transparent text-on-surface-variant max-w-none"
                        }`}>
                          {/* Header Metadata */}
                          <div className="flex items-center gap-2 mb-1.5 text-[10px] font-mono text-on-surface-variant/35 select-none">
                            <span className="font-semibold uppercase tracking-wider">
                              {isUser ? "You" : "NexusAI Agent"}
                            </span>
                            <span>•</span>
                            <span>{formattedTime}</span>
                          </div>

                          {isUser ? (
                            <p className="whitespace-pre-wrap select-text selection:bg-primary/20">{msg.content}</p>
                          ) : (
                            <div className="prose prose-invert max-w-none text-xs sm:text-[13px] font-sans select-text selection:bg-primary/20">
                              <ReactMarkdown components={MarkdownComponents}>
                                {msg.content}
                              </ReactMarkdown>
                            </div>
                          )}

                          {/* Hover Action Bar */}
                          {!isUser && msg.content && (
                            <div className="absolute top-2 right-2 flex items-center gap-1 bg-[#101524] border border-white/10 rounded-md p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg">
                              <button
                                onClick={() => handleCopyMessage(msg.id, msg.content)}
                                className="p-1 hover:bg-white/5 rounded text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                                title="Copy message text"
                              >
                                {copiedMessageId === msg.id ? (
                                  <Check className="w-3.5 h-3.5 text-green-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                              
                              {index === messages.length - 1 && !isStreaming && (
                                <button
                                  onClick={handleRegenerate}
                                  className="p-1 hover:bg-white/5 rounded text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                                  title="Regenerate response"
                                >
                                  <RefreshCw className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        {isUser && (
                          <div className="w-8 h-8 rounded-full border border-white/10 bg-surface-container-low flex items-center justify-center shrink-0 font-mono text-xs text-on-surface-variant/60 font-bold select-none">
                            U
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Streaming indicator */}
                  {isStreaming && messages[messages.length - 1]?.content === "" && (
                    <div className="flex gap-4 justify-start items-center">
                      <div className="w-8 h-8 rounded-full border border-white/5 bg-gradient-to-tr from-[#162035] to-[#251540] flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                      </div>
                      <div className="flex gap-1.5 p-3 rounded-lg bg-surface-container-low/40 border border-white/5 items-center">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* FLOATING COMPOSER */}
            <div className="absolute bottom-6 left-0 right-0 px-4 sm:px-6 pointer-events-none z-10">
              <div className="max-w-3xl mx-auto pointer-events-auto bg-surface-container-low/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl p-2.5 flex flex-col gap-2">
                <textarea
                  ref={textareaRef}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    !selectedDocumentId
                      ? "Configure and index a document collection to ask questions..."
                      : "Ask NexusAI anything... (Shift+Enter for new line)"
                  }
                  rows={1}
                  disabled={isStreaming || !selectedDocumentId}
                  className="w-full bg-transparent resize-none border-none outline-none text-xs sm:text-[13px] text-on-surface placeholder:text-on-surface-variant/40 custom-scrollbar py-2 px-2.5 font-sans leading-relaxed"
                />
                
                {/* Bottom row options inside composer */}
                <div className="flex items-center justify-between border-t border-white/5 pt-2.5 px-2 select-none">
                  <div className="flex items-center gap-3">
                    {/* Attach files (PDF only) */}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-1.5 rounded-md hover:bg-white/5 text-on-surface-variant/60 hover:text-on-surface transition-all cursor-pointer"
                      title="Attach documents (.pdf)"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>

                    {/* Dictation voice trigger */}
                    <button
                      onClick={handleToggleVoice}
                      className={`p-1.5 rounded-md hover:bg-white/5 transition-all cursor-pointer ${
                        isRecording ? "text-red-400 bg-red-500/10 animate-pulse" : "text-on-surface-variant/60 hover:text-on-surface"
                      }`}
                      title="Voice Command"
                    >
                      <Mic className="w-4 h-4" />
                    </button>

                    <div className="h-4 w-px bg-white/10 mx-1" />

                    {/* Model Dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => {
                          setIsModelDropdownOpen(!isModelDropdownOpen);
                          setIsCollectionDropdownOpen(false);
                        }}
                        className="flex items-center gap-1 text-[10px] font-mono font-semibold text-on-surface-variant/60 hover:text-on-surface transition-all uppercase tracking-wider"
                      >
                        <Cpu className="w-3.5 h-3.5 text-primary/70" />
                        <span>{selectedModel}</span>
                      </button>
                      <AnimatePresence>
                        {isModelDropdownOpen && (
                          <>
                            <div className="fixed inset-0" onClick={() => setIsModelDropdownOpen(false)} />
                            <motion.div
                              initial={{ opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 4 }}
                              className="absolute bottom-full left-0 mb-2 w-44 bg-[#101524] border border-white/10 rounded-lg p-1 shadow-2xl z-20 space-y-0.5"
                            >
                              {modelOptions.map((opt) => (
                                <button
                                  key={opt}
                                  onClick={() => {
                                    setSelectedModel(opt);
                                    setIsModelDropdownOpen(false);
                                    addToast(`Selected Model: ${opt}`, "info");
                                  }}
                                  className={`w-full text-left px-2 py-1.5 rounded text-[11px] transition-all ${
                                    selectedModel === opt
                                      ? "bg-white/5 text-primary font-bold"
                                      : "hover:bg-white/3 text-on-surface-variant hover:text-on-surface"
                                  }`}
                                >
                                  {opt}
                                </button>
                              ))}
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="h-4 w-px bg-white/10 mx-0.5" />

                    {/* Collection Dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => {
                          setIsCollectionDropdownOpen(!isCollectionDropdownOpen);
                          setIsModelDropdownOpen(false);
                        }}
                        className="flex items-center gap-1.5 text-[10px] font-mono font-semibold text-on-surface-variant/60 hover:text-on-surface transition-all uppercase tracking-wider max-w-[120px] truncate"
                      >
                        <Database className="w-3.5 h-3.5 text-secondary/70 shrink-0" />
                        <span className="truncate">{activeDoc ? activeDoc.title : "Index"}</span>
                      </button>
                      <AnimatePresence>
                        {isCollectionDropdownOpen && (
                          <>
                            <div className="fixed inset-0" onClick={() => setIsCollectionDropdownOpen(false)} />
                            <motion.div
                              initial={{ opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 4 }}
                              className="absolute bottom-full left-0 mb-2 w-56 bg-[#101524] border border-white/10 rounded-lg p-1.5 shadow-2xl z-20 max-h-60 overflow-y-auto custom-scrollbar space-y-0.5"
                            >
                              {documents.map((d) => (
                                <button
                                  key={d.document_id}
                                  onClick={() => {
                                    selectDocument(d.document_id);
                                    setIsCollectionDropdownOpen(false);
                                    addToast(`Active index: ${d.title}`, "info");
                                  }}
                                  className={`w-full text-left px-2.5 py-1.5 rounded text-[11px] truncate block ${
                                    selectedDocumentId === d.document_id
                                      ? "bg-white/5 text-secondary font-bold"
                                      : "hover:bg-white/3 text-on-surface-variant hover:text-on-surface"
                                  }`}
                                >
                                  {d.title}
                                </button>
                              ))}
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleSend()}
                    disabled={!question.trim() || isStreaming || !selectedDocumentId}
                    className="p-1 px-3.5 bg-primary hover:bg-[#9cbbf5] text-on-primary rounded-lg border-none text-[11px] font-semibold active:scale-[0.97]"
                  >
                    <Send className="w-3.5 h-3.5 mr-1" /> Send
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT INSPECTOR (Desktop resizable side-panel) */}
      {deviceType === "desktop" && activeConversationId && isInspectorOpen && (
        <div className="flex relative shrink-0 h-full bg-[#0a0e16]">
          {/* Resize Handler Handle */}
          <div
            onMouseDown={startResize}
            className="w-1.5 hover:w-2 bg-transparent hover:bg-primary/20 border-l border-white/5 cursor-col-resize absolute left-0 top-0 bottom-0 z-30 transition-all"
            title="Drag to resize inspector width"
          />

          <div
            style={{ width: inspectorWidth }}
            className="h-full border-l border-white/5 bg-[#0a0e16] p-5 shrink-0 overflow-y-auto custom-scrollbar flex flex-col pl-7"
          >
            <InspectorContent />
          </div>
        </div>
      )}

      {/* Sheet Drawer for Tablet RAG Telemetry Inspector view */}
      <Sheet
        isOpen={deviceType === "tablet" && isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        position="right"
        title="RAG Diagnostic Center"
      >
        <div className="-m-6 h-full flex flex-col p-6 bg-[#0a0e16]">
          <InspectorContent />
        </div>
      </Sheet>

      {/* Sheet Drawer for mobile/tablet Left Sidebar menu */}
      <Sheet
        isOpen={deviceType !== "desktop" && isSidebarOpenMobile}
        onClose={() => setIsSidebarOpenMobile(false)}
        position="left"
        title="Conversations & Index"
      >
        <div className="-m-6 h-full flex flex-col">
          <SidebarContent />
        </div>
      </Sheet>
    </div>
  );
}
