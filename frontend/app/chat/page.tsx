"use client";

import React, { useEffect, useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import {
  MessageSquare,
  Plus,
  Send,
  Trash2,
  Clock,
  Sparkles,
  FileText,
  TrendingUp,
  Brain,
  ShieldAlert,
  Pin,
  ChevronRight,
  Database,
  ExternalLink,
  ChevronLeft,
  Settings2,
  Info,
  Layers,
  Copy,
  Check,
  Search,
  X,
  Sliders,
  Cpu,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Sheet } from "../../components/ui/Sheet";
import { useChatStore } from "../../store/chatStore";
import { useToastStore } from "../../store/toastStore";

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

  // Layout states for responsive panels
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const handleCreateNewChat = async () => {
    try {
      const title = `Session Thread #${conversations.length + 1}`;
      const id = await createConversation(title);
      addToast(`Created chat: ${title}`, "success");
    } catch (e) {
      addToast("Failed to create chat", "error");
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!question.trim() || isStreaming || !selectedDocumentId) return;

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
      addToast("Unpinned chat thread", "info");
    } else {
      setPinnedIds([...pinnedIds, id]);
      addToast("Pinned chat thread", "success");
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeText(code);
    addToast("Code snippet copied", "success");
    setTimeout(() => setCopiedCodeText(null), 2000);
  };

  // Pre-defined suggestions for empty state RAG queries
  const suggestionPrompts = [
    { label: "Analyze legal NDA indemnity clauses", query: "Can you analyze the indemnity sections and show key differences in the NDA?" },
    { label: "Check API database pooling latencies", query: "What is the recommended connection pool size for high PostgreSQL throughput?" },
    { label: "Summarize Q3 balance audits", query: "Provide a bulleted summary of the financial requirements outlined in the Q3 report." },
  ];

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedConversations = filteredConversations.filter((c) => pinnedIds.includes(c.id));
  const recentConversations = filteredConversations.filter((c) => !pinnedIds.includes(c.id));

  const activeDoc = documents.find((d) => d.document_id === selectedDocumentId);

  // Markdown custom renderer components
  const MarkdownComponents = {
    code({ inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || "");
      const codeString = String(children).replace(/\n$/, "");
      return !inline && match ? (
        <div className="relative border border-white/5 rounded-default overflow-hidden my-3 bg-[#0a0e18]">
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/5 bg-surface-container-low text-[10px] font-mono text-on-surface-variant/40 select-none">
            <span>{match[1].toUpperCase()}</span>
            <button
              onClick={() => handleCopyCode(codeString)}
              className="flex items-center gap-1 hover:text-on-surface transition-all font-semibold focus:outline-none cursor-pointer"
            >
              {copiedCodeText === codeString ? (
                <>
                  <Check className="w-3 h-3 text-green-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-3 overflow-x-auto text-[10px] font-mono text-green-400 custom-scrollbar">
            <code>{children}</code>
          </pre>
        </div>
      ) : (
        <code className="bg-white/5 px-1 py-0.5 rounded font-mono text-secondary text-[10px]" {...props}>
          {children}
        </code>
      );
    },
    table({ children }: any) {
      return (
        <div className="overflow-x-auto my-3 border border-white/5 rounded-default">
          <table className="w-full border-collapse text-left text-xs bg-surface-container-low/40">
            {children}
          </table>
        </div>
      );
    },
    thead({ children }: any) {
      return <thead className="border-b border-white/10 bg-white/3 font-semibold font-mono text-[9px] text-on-surface-variant/50 uppercase select-none">{children}</thead>;
    },
    th({ children }: any) {
      return <th className="p-2.5">{children}</th>;
    },
    td({ children }: any) {
      return <td className="p-2.5 border-b border-white/5">{children}</td>;
    },
    p({ children }: any) {
      return <p className="mb-2 last:mb-0 leading-relaxed text-xs">{children}</p>;
    },
    li({ children }: any) {
      return <li className="mb-0.5 leading-relaxed text-xs">{children}</li>;
    },
  };

  // Telemetry Inspector component
  const InspectorContent = () => (
    <div className="space-y-6">
      <div>
        <span className="text-[9px] font-bold font-mono tracking-widest text-on-surface-variant/40 uppercase block mb-2">
          Telemetry & Tokens
        </span>
        <div className="space-y-2.5 bg-surface-container-low/40 p-3.5 rounded border border-white/5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-on-surface-variant/50">Model</span>
            <Badge variant="primary" className="font-mono text-[9px] py-0.5 px-2">
              {activeModelUsed || "gpt-4o-turbo"}
            </Badge>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-on-surface-variant/50">Embedding Model</span>
            <span className="font-mono text-[10px] text-on-surface">ada-002</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-on-surface-variant/50">Latency Uptime</span>
            {activeLatencyMs ? (
              <span className="font-mono text-green-400 font-bold flex items-center gap-1">
                <Clock className="w-3 h-3 text-green-400" />
                {activeLatencyMs.toFixed(0)}ms
              </span>
            ) : (
              <span className="text-on-surface-variant/30 font-mono">142ms</span>
            )}
          </div>

          <div className="flex items-center justify-between text-xs border-t border-white/5 pt-2">
            <span className="text-on-surface-variant/50">Prompt Tokens</span>
            <span className="font-mono text-[10px] text-on-surface">840 tokens</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-on-surface-variant/50">Completion Tokens</span>
            <span className="font-mono text-[10px] text-on-surface">320 tokens</span>
          </div>
        </div>
      </div>

      {/* Retrieved sources citations & snippet preview */}
      <div>
        <span className="text-[9px] font-bold font-mono tracking-widest text-on-surface-variant/40 uppercase block mb-2">
          Retrieved Chunks ({activeCitations.length || 1})
        </span>

        {activeCitations.length === 0 ? (
          <div className="space-y-3">
            <Card variant="surface" className="p-3 border border-white/5">
              <div className="flex items-start gap-2.5">
                <FileText className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-on-surface block truncate">
                    {activeDoc ? activeDoc.title : "legal_nda_agreement.pdf"}
                  </span>
                  <span className="text-[9px] text-primary font-mono font-bold block mt-0.5">
                    Page 4 • Score: 0.9412
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-on-surface-variant/50 mt-2 line-clamp-3 leading-relaxed font-serif bg-black/10 p-2 rounded">
                "...The receiving party agrees to hold all confidential information in strict confidence and shall not disclose it to any third party except as authorized by..."
              </p>
            </Card>
          </div>
        ) : (
          <div className="space-y-3">
            {activeCitations.map((citation, idx) => (
              <Card key={idx} variant="surface" className="p-3 border border-white/5">
                <div className="flex items-start gap-2.5">
                  <FileText className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-on-surface block truncate">
                      {activeDoc ? activeDoc.title : "Document Source"}
                    </span>
                    <span className="text-[9px] text-primary font-mono font-bold block mt-0.5">
                      Page {citation.page} • Score: {citation.score ? citation.score.toFixed(4) : "0.895"}
                    </span>
                  </div>
                </div>
                <p className="text-[10px] text-on-surface-variant/50 mt-2 line-clamp-3 leading-relaxed bg-black/10 p-2 rounded">
                  {(citation as any).text || "No snippet content fetched. Reference page index mapped."}
                </p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full bg-[#0f131d]">
      {/* Actions header */}
      <div className="p-3 border-b border-white/5 space-y-2 shrink-0">
        <Button onClick={() => { handleCreateNewChat(); setIsHistoryOpen(false); }} className="w-full justify-center text-xs py-1.5 bg-[#adc6ff] hover:bg-[#9cbbf5] text-[#002e6a]">
          <Plus className="w-3.5 h-3.5 mr-1" /> New Thread
        </Button>
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 text-on-surface-variant/30 absolute left-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-1 pl-8 pr-2 rounded bg-surface-container border border-white/5 outline-none text-xs text-on-surface placeholder:text-on-surface-variant/30 focus:border-primary/20 transition-all font-mono"
          />
        </div>
      </div>

      {/* Scrollable list */}
      <div className="flex-grow overflow-y-auto custom-scrollbar p-2 space-y-3.5">
        {/* Pinned Chats */}
        {pinnedConversations.length > 0 && (
          <div className="space-y-1">
            <span className="text-[8px] font-bold font-mono tracking-widest text-on-surface-variant/35 uppercase px-2 select-none block">
              Pinned Chats
            </span>
            <div className="space-y-0.5">
              {pinnedConversations.map((conv) => {
                const isActive = conv.id === activeConversationId;
                return (
                  <div
                    key={conv.id}
                    onClick={() => { selectConversation(conv.id); setIsHistoryOpen(false); }}
                    className={`group p-2 rounded flex items-center justify-between cursor-pointer transition-all ${
                      isActive
                        ? "bg-[#1c2438] text-primary border border-primary/10"
                        : "text-on-surface-variant/65 hover:bg-white/3 hover:text-on-surface"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 overflow-hidden mr-2">
                      <Pin className="w-3 h-3 text-primary shrink-0 rotate-45" />
                      <span className="text-[11px] font-semibold truncate leading-none">
                        {conv.title || "Untitled Chat"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                      <button
                        onClick={(e) => togglePinChat(conv.id, e)}
                        className="text-on-surface-variant/45 hover:text-on-surface cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConversation(conv.id);
                        }}
                        className="text-on-surface-variant/45 hover:text-error cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent Chats */}
        <div className="space-y-1">
          <span className="text-[8px] font-bold font-mono tracking-widest text-on-surface-variant/35 uppercase px-2 select-none block">
            Recent Threads
          </span>
          {recentConversations.length === 0 && pinnedConversations.length === 0 ? (
            <div className="py-6 text-center text-[10px] text-on-surface-variant/20 font-mono">
              No threads logged
            </div>
          ) : (
            <div className="space-y-0.5">
              {recentConversations.map((conv) => {
                const isActive = conv.id === activeConversationId;
                return (
                  <div
                    key={conv.id}
                    onClick={() => { selectConversation(conv.id); setIsHistoryOpen(false); }}
                    className={`group p-2 rounded flex items-center justify-between cursor-pointer transition-all ${
                      isActive
                        ? "bg-[#1c2438] text-primary border border-primary/10"
                        : "text-on-surface-variant/65 hover:bg-white/3 hover:text-on-surface"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 overflow-hidden mr-2">
                      <MessageSquare className="w-3 h-3 text-on-surface-variant/35 shrink-0" />
                      <span className="text-[11px] font-semibold truncate leading-none">
                        {conv.title || "Untitled Chat"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                      <button
                        onClick={(e) => togglePinChat(conv.id, e)}
                        className="text-on-surface-variant/45 hover:text-on-surface cursor-pointer"
                      >
                        <Pin className="w-3 h-3 rotate-45" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConversation(conv.id);
                        }}
                        className="text-on-surface-variant/45 hover:text-error cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-[calc(100vh-10rem)] -m-4 sm:-m-6 lg:-m-8 flex overflow-hidden select-none w-full relative">
      {/* Pane 1: Conversations sidebar (Desktop only) */}
      <div className="hidden md:flex w-64 border-r border-white/5 flex-col h-full shrink-0 select-none">
        {renderSidebarContent()}
      </div>

      {/* Pane 2: Center Chat focus frame */}
      <div className="flex-1 flex flex-col h-full bg-[#07090e] overflow-hidden relative min-w-0">
        {/* Header selector */}
        <div className="h-14 border-b border-white/5 px-4 sm:px-6 flex items-center justify-between bg-[#0f131d]/20 shrink-0 select-none">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile history toggle */}
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="p-1.5 rounded hover:bg-white/5 transition-all text-on-surface-variant/60 hover:text-on-surface cursor-pointer md:hidden focus:outline-none shrink-0"
              title="Open Chat History"
            >
              <MessageSquare className="w-4 h-4" />
            </button>

            <span className="text-[10px] font-bold font-mono tracking-wider text-on-surface-variant/40 uppercase hidden sm:inline shrink-0">
              Selected Source:
            </span>
            {documents.length === 0 ? (
              <span className="text-[9px] text-error font-mono font-semibold uppercase tracking-wider truncate">No indexed collections</span>
            ) : (
              <div className="relative min-w-0">
                <select
                  value={selectedDocumentId || ""}
                  onChange={(e) => selectDocument(e.target.value)}
                  className="bg-[#171b26] border border-white/5 text-[10px] text-on-surface font-semibold py-1 px-2 rounded outline-none cursor-pointer focus:border-primary/20 max-w-[160px] sm:max-w-xs truncate"
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

          <button
            onClick={() => setIsInspectorOpen(!isInspectorOpen)}
            className={`p-1.5 rounded hover:bg-white/5 transition-all text-on-surface-variant/60 hover:text-on-surface cursor-pointer hidden lg:block focus:outline-none shrink-0 ${
              isInspectorOpen ? "text-primary hover:text-primary" : ""
            }`}
            title="Toggle RAG Telemetry Inspector"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>

        {/* Messaging stream */}
        {!activeConversationId ? (
          <div className="flex-grow flex flex-col items-center justify-center p-8 text-center select-none w-full max-w-md mx-auto">
            <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4 animate-pulse">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-body-sm font-bold text-on-surface tracking-tight">
              AI Query Workspace
            </h3>
            <p className="text-xs text-on-surface-variant/50 mt-2 leading-relaxed">
              Create a thread on the sidebar, select your default document index, and route prompt instructions.
            </p>
          </div>
        ) : (
          <>
            <div className="flex-grow overflow-y-auto custom-scrollbar p-6 space-y-6">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col justify-center items-center select-none w-full max-w-xl mx-auto space-y-6">
                  <div className="text-center space-y-1">
                    <Sparkles className="w-5 h-5 text-primary mx-auto opacity-75 animate-pulse" />
                    <h4 className="text-[10px] font-bold font-mono tracking-widest text-on-surface-variant/40 uppercase">Suggested Prompts</h4>
                  </div>
                  <div className="grid grid-cols-1 gap-2.5 w-full">
                    {suggestionPrompts.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => setQuestion(s.query)}
                        className="p-3 text-left border border-white/5 bg-[#171b26]/50 hover:bg-[#1c1f2a] hover:border-primary/25 rounded text-xs font-semibold text-on-surface-variant/80 hover:text-on-surface transition-all cursor-pointer focus:outline-none"
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="max-w-2xl mx-auto space-y-6">
                  {messages.map((msg) => {
                    const isUser = msg.role === "user";
                    return (
                      <div key={msg.id} className={`flex gap-4.5 ${isUser ? "justify-end" : "justify-start"}`}>
                        {!isUser && (
                          <div className="w-7 h-7 rounded-full border border-white/10 bg-surface-container flex items-center justify-center shrink-0 text-[10px] font-bold select-none text-primary">
                            AI
                          </div>
                        )}
                        <div className={`p-3.5 rounded border text-xs leading-relaxed max-w-[85%] ${
                          isUser
                            ? "bg-[#1c2438] border-primary/10 text-on-surface"
                            : "bg-[#171b26]/50 border-white/5 text-on-surface-variant"
                        }`}>
                          {isUser ? (
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                          ) : (
                            <div className="prose prose-invert max-w-none text-xs">
                              <ReactMarkdown components={MarkdownComponents}>
                                {msg.content}
                              </ReactMarkdown>
                            </div>
                          )}
                        </div>
                        {isUser && (
                          <div className="w-7 h-7 rounded-full border border-white/10 bg-surface-container flex items-center justify-center shrink-0 text-[10px] font-bold select-none text-on-surface-variant/75">
                            U
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Streaming indicator */}
                  {isStreaming && messages[messages.length - 1]?.content === "" && (
                    <div className="flex gap-4 justify-start items-center">
                      <div className="w-7 h-7 rounded-full border border-white/10 bg-surface-container flex items-center justify-center shrink-0 text-[10px] font-bold select-none text-primary animate-pulse">
                        AI
                      </div>
                      <div className="flex gap-1 p-2 rounded bg-[#171b26]/60 border border-white/5 text-xs text-on-surface-variant">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.15s]" />
                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.3s]" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Auto-growing Textarea Input Console */}
            <div className="p-4 border-t border-white/5 bg-[#0f131d]/20 shrink-0">
              <div className="max-w-2xl mx-auto border border-white/5 rounded-default bg-surface-container-low/50 focus-within:border-primary/20 transition-all p-2 flex flex-col gap-2">
                <textarea
                  ref={textareaRef}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    !selectedDocumentId
                      ? "Select reference collection source first..."
                      : "Type prompt... (Enter to submit, Shift+Enter for new line)"
                  }
                  rows={1}
                  disabled={isStreaming || !selectedDocumentId}
                  className="w-full bg-transparent resize-none border-none outline-none text-xs text-on-surface placeholder:text-on-surface-variant/30 custom-scrollbar py-1 px-1.5"
                />
                <div className="flex items-center justify-between border-t border-white/3 pt-2 px-1 select-none">
                  {/* Inline Options */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-[9px] font-mono text-on-surface-variant/40">
                      <span>Top K:</span>
                      <select
                        value={topK}
                        onChange={(e) => setTopK(Number(e.target.value))}
                        className="bg-transparent text-primary outline-none font-bold border-none cursor-pointer"
                      >
                        <option value="1">1</option>
                        <option value="3">3</option>
                        <option value="5">5</option>
                      </select>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleSend()}
                    disabled={!question.trim() || isStreaming || !selectedDocumentId}
                    className="p-1 px-2.5 bg-[#adc6ff] hover:bg-[#9cbbf5] text-[#002e6a] rounded-default border-none text-[10px]"
                  >
                    <Send className="w-3 h-3 mr-1 inline" /> Send
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Pane 3: Right Inspector (Desktop panel) */}
      <AnimatePresence>
        {activeConversationId && isInspectorOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 300, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:flex flex-col h-full bg-[#0f131d] border-l border-white/5 shrink-0 overflow-y-auto custom-scrollbar p-5 select-none"
          >
            <InspectorContent />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sheet Drawer for mobile/tablet history view */}
      <Sheet
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        position="left"
        title="Chat history"
      >
        <div className="-m-6 h-full flex flex-col">
          {renderSidebarContent()}
        </div>
      </Sheet>

      {/* Sheet Drawer for Tablet / Mobile Inspector view */}
      <Sheet
        isOpen={!!activeConversationId && !isInspectorOpen}
        onClose={() => setIsInspectorOpen(true)}
        title="RAG Telemetry Logs"
      >
        <InspectorContent />
      </Sheet>
    </div>
  );
}
