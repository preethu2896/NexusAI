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
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Sheet } from "../../components/ui/Sheet";
import { useChatStore } from "../../store/chatStore";
import { useToastStore } from "../../store/toastStore";
import { motion, AnimatePresence } from "framer-motion";

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
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
    fetchDocuments();
  }, [fetchConversations, fetchDocuments]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  const handleCreateNewChat = async () => {
    try {
      const title = `Session Thread #${conversations.length + 1}`;
      const id = await createConversation(title);
      addToast(`Created chat: ${title}`, "success");
    } catch (e) {
      addToast("Failed to create chat", "error");
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isStreaming || !selectedDocumentId) return;

    const queryText = question;
    setQuestion("");
    await sendMessageStream(queryText, topK);
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

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    addToast("Copied text to clipboard", "success");
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
        <div className="relative border border-white/5 rounded-default overflow-hidden my-4 bg-[#0a0e18]">
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-surface-container-low text-[10px] font-mono text-on-surface-variant/40 select-none">
            <span>{match[1].toUpperCase()}</span>
            <button
              onClick={() => handleCopyCode(codeString)}
              className="flex items-center gap-1 hover:text-on-surface transition-all font-semibold focus:outline-none"
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
          <pre className="p-4 overflow-x-auto text-[11px] font-mono text-green-400 custom-scrollbar">
            <code>{children}</code>
          </pre>
        </div>
      ) : (
        <code className="bg-white/5 px-1 py-0.5 rounded font-mono text-secondary text-[11px]" {...props}>
          {children}
        </code>
      );
    },
    table({ children }: any) {
      return (
        <div className="overflow-x-auto my-4 border border-white/5 rounded-default">
          <table className="w-full border-collapse text-left text-xs bg-surface-container-low/40">
            {children}
          </table>
        </div>
      );
    },
    thead({ children }: any) {
      return <thead className="border-b border-white/10 bg-white/3 font-semibold font-mono text-[10px] text-on-surface-variant/50 uppercase select-none">{children}</thead>;
    },
    th({ children }: any) {
      return <th className="p-3">{children}</th>;
    },
    td({ children }: any) {
      return <td className="p-3 border-b border-white/5">{children}</td>;
    },
    p({ children }: any) {
      return <p className="mb-3 last:mb-0 leading-relaxed text-xs">{children}</p>;
    },
    li({ children }: any) {
      return <li className="mb-1 leading-relaxed text-xs">{children}</li>;
    },
  };

  // Responsive Inspector component content
  const InspectorContent = () => (
    <div className="space-y-6">
      <div>
        <span className="text-[9px] font-bold font-mono tracking-widest text-on-surface-variant/40 uppercase block mb-3">
          RAG Pipeline Audit
        </span>
        <div className="space-y-3.5 bg-surface-container-low/40 p-4 rounded-default border border-white/5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-on-surface-variant/50">Target Model</span>
            <Badge variant="primary" className="font-mono text-[10px]">
              {activeModelUsed || "gpt-4o"}
            </Badge>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-on-surface-variant/50">Vector DB</span>
            <span className="font-mono text-on-surface font-semibold text-[10px]">ChromaDB</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-on-surface-variant/50">Query Speed</span>
            {activeLatencyMs ? (
              <span className="font-mono text-green-400 font-bold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {activeLatencyMs.toFixed(0)}ms
              </span>
            ) : (
              <span className="text-on-surface-variant/30 font-mono">--</span>
            )}
          </div>
        </div>
      </div>

      {/* Citations list */}
      <div>
        <span className="text-[9px] font-bold font-mono tracking-widest text-on-surface-variant/40 uppercase block mb-3">
          Retrieved Citations ({activeCitations.length})
        </span>

        {activeCitations.length === 0 ? (
          <div className="py-8 text-center text-xs text-on-surface-variant/20 font-mono border border-dashed border-white/5 rounded-default select-none">
            No active citation maps
          </div>
        ) : (
          <div className="space-y-3.5">
            {activeCitations.map((citation, idx) => (
              <Card key={idx} variant="surface" className="p-4 relative overflow-hidden flex flex-col justify-between">
                <div className="flex items-start gap-2.5">
                  <FileText className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-on-surface block truncate">
                      {activeDoc ? activeDoc.title : "Ingested Document Source"}
                    </span>
                    <span className="text-[10px] text-primary font-mono font-bold block mt-1">
                      Page Index: {citation.page}
                    </span>
                  </div>
                </div>

                {citation.score !== null && (
                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-on-surface-variant/40 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-secondary" />
                      Distance Similarity
                    </span>
                    <strong className="text-secondary">{citation.score.toFixed(4)}</strong>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="h-[calc(100vh-10rem)] -m-4 sm:-m-6 lg:-m-8 flex overflow-hidden select-none">
      {/* Pane 1: Conversations list */}
      <div className="w-64 bg-surface-container-lowest border-r border-white/5 flex flex-col h-full shrink-0 select-none">
        {/* Actions header */}
        <div className="p-4 border-b border-white/5 space-y-3 shrink-0">
          <Button onClick={handleCreateNewChat} className="w-full justify-center">
            <Plus className="w-4 h-4 mr-1.5" /> New Chat
          </Button>
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-on-surface-variant/30 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search chat history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-1.5 pl-9 pr-3 rounded-default bg-surface-container-low border border-white/5 outline-none text-xs text-on-surface placeholder:text-on-surface-variant/30 focus:border-primary/20 transition-all"
            />
          </div>
        </div>

        {/* Scrollable list */}
        <div className="flex-grow overflow-y-auto custom-scrollbar p-2 space-y-4">
          {/* Pinned Chats */}
          {pinnedConversations.length > 0 && (
            <div>
              <span className="text-[9px] font-bold font-mono tracking-widest text-on-surface-variant/40 uppercase px-2 select-none block mb-1">
                Pinned Chats
              </span>
              <div className="space-y-0.5">
                {pinnedConversations.map((conv) => {
                  const isActive = conv.id === activeConversationId;
                  return (
                    <div
                      key={conv.id}
                      onClick={() => selectConversation(conv.id)}
                      className={`group p-2.5 rounded-default flex items-center justify-between cursor-pointer transition-all ${
                        isActive
                          ? "bg-surface-container border border-white/5 text-on-surface"
                          : "text-on-surface-variant/65 hover:bg-white/3 hover:text-on-surface"
                      }`}
                    >
                      <div className="flex items-center gap-2 overflow-hidden mr-2">
                        <Pin className="w-3 h-3 text-primary shrink-0 rotate-45" />
                        <span className="text-xs font-semibold truncate leading-none">
                          {conv.title || "Untitled Chat"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                        <button
                          onClick={(e) => togglePinChat(conv.id, e)}
                          className="text-on-surface-variant/45 hover:text-on-surface"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteConversation(conv.id);
                          }}
                          className="text-on-surface-variant/45 hover:text-error"
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
          <div>
            <span className="text-[9px] font-bold font-mono tracking-widest text-on-surface-variant/40 uppercase px-2 select-none block mb-1">
              Recent Conversations
            </span>
            {recentConversations.length === 0 && pinnedConversations.length === 0 ? (
              <div className="py-8 text-center text-xs text-on-surface-variant/20 font-mono">
                Empty Thread history
              </div>
            ) : (
              <div className="space-y-0.5">
                {recentConversations.map((conv) => {
                  const isActive = conv.id === activeConversationId;
                  return (
                    <div
                      key={conv.id}
                      onClick={() => selectConversation(conv.id)}
                      className={`group p-2.5 rounded-default flex items-center justify-between cursor-pointer transition-all ${
                        isActive
                          ? "bg-surface-container border border-white/5 text-on-surface"
                          : "text-on-surface-variant/65 hover:bg-white/3 hover:text-on-surface"
                      }`}
                    >
                      <div className="flex items-center gap-2 overflow-hidden mr-2">
                        <MessageSquare className="w-3.5 h-3.5 text-on-surface-variant/35 shrink-0" />
                        <span className="text-xs font-semibold truncate leading-none">
                          {conv.title || "Untitled Chat"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                        <button
                          onClick={(e) => togglePinChat(conv.id, e)}
                          className="text-on-surface-variant/45 hover:text-on-surface"
                        >
                          <Pin className="w-3 h-3 rotate-45" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteConversation(conv.id);
                          }}
                          className="text-on-surface-variant/45 hover:text-error"
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

      {/* Pane 2: Center Chat Feed */}
      <div className="flex-1 flex flex-col h-full bg-surface overflow-hidden relative">
        {/* Document Context Header Selector */}
        <div className="h-14 border-b border-white/5 px-6 flex items-center justify-between bg-surface-container-lowest/30 shrink-0 select-none">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-on-surface-variant/50">Ingested Index:</span>
            {documents.length === 0 ? (
              <span className="text-[10px] text-error font-semibold uppercase tracking-wider">No files uploaded</span>
            ) : (
              <div className="relative">
                <select
                  value={selectedDocumentId || ""}
                  onChange={(e) => selectDocument(e.target.value)}
                  className="bg-[#171b26] border border-white/5 text-xs text-on-surface font-semibold py-1 px-2.5 rounded outline-none cursor-pointer focus:border-primary/20"
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
            className={`p-1.5 rounded hover:bg-white/5 transition-all text-on-surface-variant/60 hover:text-on-surface cursor-pointer hidden lg:block focus:outline-none ${
              isInspectorOpen ? "text-primary hover:text-primary" : ""
            }`}
            title="Inspect RAG Citations"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>

        {/* Message Log */}
        {!activeConversationId ? (
          <div className="flex-grow flex flex-col items-center justify-center p-8 text-center select-none max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4 animate-bounce">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-body-base font-bold text-on-surface tracking-tight">
              Enterprise Agentic RAG Workstation
            </h3>
            <p className="text-xs text-on-surface-variant/50 mt-2.5 leading-relaxed">
              Select an existing conversation thread or create a new session. Choose a reference document database schema to begin query routing.
            </p>
          </div>
        ) : (
          <>
            <div className="flex-grow overflow-y-auto custom-scrollbar p-6 space-y-6">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col justify-center items-center select-none max-w-xl mx-auto space-y-8">
                  <div className="text-center space-y-2">
                    <Sparkles className="w-6 h-6 text-primary mx-auto opacity-75" />
                    <h4 className="text-xs font-bold font-mono tracking-widest text-on-surface-variant/40 uppercase">Suggested Prompts</h4>
                  </div>
                  <div className="grid grid-cols-1 gap-3 w-full">
                    {suggestionPrompts.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => setQuestion(s.query)}
                        className="p-3 text-left border border-white/5 bg-[#171b26]/50 hover:bg-[#1c1f2a] hover:border-primary/20 rounded-default text-xs font-semibold text-on-surface-variant/80 hover:text-on-surface transition-all cursor-pointer focus:outline-none"
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="max-w-3xl mx-auto space-y-6">
                  {messages.map((msg) => {
                    const isUser = msg.role === "user";
                    return (
                      <div key={msg.id} className={`flex gap-4 ${isUser ? "justify-end" : "justify-start"}`}>
                        {!isUser && (
                          <div className="w-8 h-8 rounded-full border border-white/10 bg-surface-container flex items-center justify-center shrink-0 text-xs font-bold select-none text-primary">
                            AI
                          </div>
                        )}
                        <div className={`p-4 rounded-default border text-xs leading-relaxed max-w-[85%] ${
                          isUser
                            ? "bg-surface-container-low border-primary/10 text-on-surface"
                            : "bg-[#171b26]/60 border-white/5 text-on-surface-variant"
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
                          <div className="w-8 h-8 rounded-full border border-white/10 bg-surface-container flex items-center justify-center shrink-0 text-xs font-bold select-none text-on-surface-variant/75">
                            U
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Streaming pulse placeholder */}
                  {isStreaming && messages[messages.length - 1]?.content === "" && (
                    <div className="flex gap-4 justify-start items-center">
                      <div className="w-8 h-8 rounded-full border border-white/10 bg-surface-container flex items-center justify-center shrink-0 text-xs font-bold select-none text-primary animate-pulse">
                        AI
                      </div>
                      <div className="flex gap-1.5 p-3 rounded-default bg-[#171b26]/60 border border-white/5 text-xs text-on-surface-variant">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input area */}
            <div className="p-4 border-t border-white/5 bg-surface-container-lowest/30 shrink-0">
              <form onSubmit={handleSend} className="max-w-3xl mx-auto flex items-center gap-3">
                <div className="flex-1 relative flex items-center">
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder={
                      !selectedDocumentId
                        ? "Please select a reference index first..."
                        : "Ask RAG database..."
                    }
                    disabled={isStreaming || !selectedDocumentId}
                    className="w-full py-2.5 pl-4 pr-24 rounded-default bg-surface-container-low border border-white/5 outline-none text-xs text-on-surface placeholder:text-on-surface-variant/30 focus:border-primary/20 transition-all"
                  />
                  <div className="absolute right-3 flex items-center gap-1.5 bg-[#0a0e18] px-2 py-0.5 rounded border border-white/10 text-[9px] font-mono text-on-surface-variant/40">
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
                  type="submit"
                  disabled={!question.trim() || isStreaming || !selectedDocumentId}
                  className="px-3"
                >
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </form>
            </div>
          </>
        )}
      </div>

      {/* Pane 3: Right Inspector (Desktop panel) */}
      <AnimatePresence>
        {activeConversationId && isInspectorOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="hidden lg:flex flex-col h-full bg-surface-container-lowest/50 border-l border-white/5 shrink-0 overflow-y-auto custom-scrollbar p-6 select-none"
          >
            <InspectorContent />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sheet Drawer for Tablet / Mobile Inspector view */}
      <Sheet
        isOpen={!!activeConversationId && !isInspectorOpen}
        onClose={() => setIsInspectorOpen(true)}
        title="RAG Inspector Logs"
      >
        <InspectorContent />
      </Sheet>
    </div>
  );
}

// Temporary Lucide fallback
const X = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);
