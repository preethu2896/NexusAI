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
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { useChatStore } from "../../store/chatStore";

export default function AIChat() {
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
    createConversation,
    deleteConversation,
    sendMessageStream,
  } = useChatStore();

  const [question, setQuestion] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [topK, setTopK] = useState(3);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
    fetchDocuments();
  }, [fetchConversations, fetchDocuments]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  const handleCreateNewChat = async () => {
    const title = `Chat session #${conversations.length + 1}`;
    await createConversation(title);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isStreaming || !selectedDocumentId) return;

    const queryText = question;
    setQuestion("");
    await sendMessageStream(queryText, topK);
  };

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeDoc = documents.find((d) => d.document_id === selectedDocumentId);

  return (
    <div className="h-[calc(100vh-8rem)] -m-8 flex overflow-hidden">
      {/* LEFT PANE: Conversations list */}
      <div className="w-64 bg-surface-container-low/60 border-r border-white/5 flex flex-col h-full shrink-0">
        <div className="p-4 border-b border-white/5 space-y-3">
          <Button onClick={handleCreateNewChat} className="w-full">
            <Plus className="w-4 h-4 mr-1" /> New Chat
          </Button>
          <Input
            icon={<SearchIcon className="w-3.5 h-3.5" />}
            placeholder="Search threads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex-grow overflow-y-auto custom-scrollbar p-2 space-y-1">
          {filteredConversations.length === 0 ? (
            <div className="py-8 text-center text-xs text-on-surface-variant/30 font-mono">
              No threads found
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isActive = conv.id === activeConversationId;
              return (
                <div
                  key={conv.id}
                  onClick={() => selectConversation(conv.id)}
                  className={`group p-3 rounded-md flex items-center justify-between cursor-pointer transition-all ${
                    isActive
                      ? "bg-surface-container-high border-glow-subtle border-primary/20 text-on-surface"
                      : "text-on-surface-variant/80 hover:bg-white/5 hover:text-on-surface"
                  }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden mr-2">
                    <MessageSquare
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? "text-primary" : "text-on-surface-variant/40"
                      }`}
                    />
                    <span className="text-xs font-semibold truncate">
                      {conv.title || "Untitled Chat"}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(conv.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-on-surface-variant/40 hover:text-error transition-all p-1"
                    title="Delete thread"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* CENTER PANE: Active Chat Log */}
      <div className="flex-1 flex flex-col h-full bg-surface-container-lowest/20 overflow-hidden relative">
        {!activeConversationId ? (
          <div className="flex-grow flex flex-col items-center justify-center p-8 text-center select-none">
            <div className="w-12 h-12 rounded-lg bg-primary-container/10 border border-primary/20 flex items-center justify-center text-primary mb-4 animate-bounce">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-md font-bold text-on-surface">
              Begin a RAG Chat Session
            </h3>
            <p className="text-xs text-on-surface-variant/50 max-w-sm mt-1">
              Select an existing thread from the sidebar or click &quot;New Chat&quot; to start querying reference documents in real-time.
            </p>
          </div>
        ) : (
          <>
            {/* Scrollable messages area */}
            <div className="flex-grow overflow-y-auto custom-scrollbar p-6 space-y-6">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-xs text-on-surface-variant/40 font-mono">
                  Ask a question to search indexed context and stream grounded answers.
                </div>
              ) : (
                messages.map((msg) => {
                  const isUser = msg.role === "user";
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-4 max-w-3xl ${
                        isUser ? "ml-auto flex-row-reverse" : "mr-auto"
                      }`}
                    >
                      {/* Avatar */}
                      <div
                        className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 text-xs font-bold ${
                          isUser
                            ? "bg-primary-container/20 border-primary/20 text-primary"
                            : "bg-secondary-container/20 border-secondary/20 text-secondary"
                        }`}
                      >
                        {isUser ? "U" : "AI"}
                      </div>

                      {/* Content block */}
                      <div
                        className={`p-4 rounded-lg border text-sm max-w-2xl leading-relaxed ${
                          isUser
                            ? "bg-surface-container border-white/5 text-on-surface"
                            : "bg-surface-container-low border-white/5 text-on-surface"
                        }`}
                      >
                        {isUser ? (
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        ) : (
                          <div className="prose prose-invert max-w-none text-xs">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              {isStreaming && messages[messages.length - 1]?.content === "" && (
                <div className="flex gap-4 max-w-3xl mr-auto items-center">
                  <div className="w-8 h-8 rounded-full bg-secondary-container/20 border border-secondary/20 text-secondary flex items-center justify-center text-xs font-bold animate-pulse">
                    AI
                  </div>
                  <div className="flex gap-1.5 p-3 rounded-lg bg-surface-container-low border border-white/5 text-xs text-on-surface-variant">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce delay-100" />
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce delay-200" />
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce delay-300" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Bottom input area */}
            <div className="p-4 border-t border-white/5 bg-surface-container-lowest/40">
              <form onSubmit={handleSend} className="max-w-3xl mx-auto flex items-center gap-3">
                <div className="flex-1 relative flex items-center">
                  <Input
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder={
                      !selectedDocumentId
                        ? "Select a document in Topbar to start querying..."
                        : `Ask question to index context...`
                    }
                    disabled={isStreaming || !selectedDocumentId}
                  />
                  <div className="absolute right-2 flex items-center gap-1.5 bg-white/5 px-2 py-0.5 rounded border border-white/5 text-[9px] font-mono text-on-surface-variant/60">
                    <span>Top K:</span>
                    <select
                      value={topK}
                      onChange={(e) => setTopK(Number(e.target.value))}
                      className="bg-transparent text-on-surface outline-none font-bold border-none"
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
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
              {!selectedDocumentId && (
                <p className="text-[10px] text-center text-error mt-2 font-semibold">
                  ⚠️ Ingestion Index Empty. Please upload reference PDFs in the Knowledge Base first.
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {/* RIGHT PANE: Citations & Context Inspector */}
      {activeConversationId && (
        <div className="w-72 bg-surface-container border-l border-white/5 flex flex-col h-full shrink-0 p-4 overflow-y-auto custom-scrollbar space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface font-mono border-b border-white/5 pb-2">
            RAG Context Audits
          </h3>

          {/* Configuration Parameters */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-on-surface-variant/60 font-medium">Target Model</span>
              <Badge variant="primary" className="font-mono">
                {activeModelUsed || "gpt-4o-mini-stream"}
              </Badge>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-on-surface-variant/60 font-medium">Vector Index</span>
              <span className="font-mono text-on-surface font-semibold text-[10px]">
                ChromaDB
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-on-surface-variant/60 font-medium">Response Speed</span>
              {activeLatencyMs ? (
                <span className="font-mono text-green-400 font-bold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {activeLatencyMs.toFixed(0)} ms
                </span>
              ) : (
                <span className="text-on-surface-variant/40 font-mono">--</span>
              )}
            </div>
          </div>

          {/* Citations List */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold font-mono tracking-widest text-on-surface-variant/40 uppercase">
              Citations Mapped ({activeCitations.length})
            </h4>

            {activeCitations.length === 0 ? (
              <div className="py-6 text-center text-xs text-on-surface-variant/30 font-mono border border-dashed border-white/5 rounded-md">
                No citations referenced
              </div>
            ) : (
              <div className="space-y-3">
                {activeCitations.map((citation, idx) => (
                  <Card key={idx} variant="highest" className="p-3.5 relative overflow-hidden">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary shrink-0" />
                        <div>
                          <span className="text-xs font-semibold text-on-surface block truncate max-w-[150px]">
                            {activeDoc ? activeDoc.title : "Reference Document"}
                          </span>
                          <span className="text-[10px] text-primary font-bold font-mono block mt-0.5">
                            Page {citation.page}
                          </span>
                        </div>
                      </div>
                    </div>
                    {citation.score !== null && (
                      <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[9px] font-mono text-on-surface-variant/50">
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 text-secondary" />
                          Distance Score
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
      )}
    </div>
  );
}

// Minimal placeholder Search icon to satisfy typescript imports
const SearchIcon = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m21-21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
    />
  </svg>
);
