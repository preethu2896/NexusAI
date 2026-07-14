import { create } from "zustand";
import { api } from "../services/api";
import {
  ConversationResponse,
  MessageResponse,
  DocumentResponse,
  Citation,
} from "../types";

interface ChatState {
  conversations: ConversationResponse[];
  activeConversationId: string | null;
  messages: MessageResponse[];
  documents: DocumentResponse[];
  selectedDocumentId: string | null;
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  isStreaming: boolean;
  activeLatencyMs: number | null;
  activeModelUsed: string | null;
  activeCitations: Citation[];
  
  fetchConversations: () => Promise<void>;
  selectConversation: (id: string | null) => Promise<void>;
  fetchDocuments: () => Promise<void>;
  selectDocument: (id: string | null) => void;
  createConversation: (title?: string) => Promise<string>;
  deleteConversation: (id: string) => Promise<void>;
  sendMessageStream: (question: string, topK?: number) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  messages: [],
  documents: [],
  selectedDocumentId: null,
  isLoadingConversations: false,
  isLoadingMessages: false,
  isStreaming: false,
  activeLatencyMs: null,
  activeModelUsed: null,
  activeCitations: [],

  fetchConversations: async () => {
    set({ isLoadingConversations: true });
    try {
      const list = await api.getConversations();
      set({ conversations: list });
    } catch (err) {
      console.error(err);
    } finally {
      set({ isLoadingConversations: false });
    }
  },

  selectConversation: async (id) => {
    set({ activeConversationId: id, activeLatencyMs: null, activeModelUsed: null, activeCitations: [] });
    if (!id) {
      set({ messages: [] });
      return;
    }
    set({ isLoadingMessages: true });
    try {
      const msgs = await api.getMessages(id);
      set({ messages: msgs });
      // If the last message has citations, metadata, load them into context
      const lastMsg = msgs[msgs.length - 1];
      if (lastMsg && lastMsg.role === "assistant") {
        set({
          activeCitations: lastMsg.citations || [],
          activeLatencyMs: lastMsg.latency_ms,
          activeModelUsed: lastMsg.model_used,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      set({ isLoadingMessages: false });
    }
  },

  fetchDocuments: async () => {
    try {
      const docs = await api.getDocuments();
      set({ documents: docs });
      if (docs.length > 0 && !get().selectedDocumentId) {
        set({ selectedDocumentId: docs[0].document_id });
      }
    } catch (err) {
      console.error(err);
    }
  },

  selectDocument: (id) => {
    set({ selectedDocumentId: id });
  },

  createConversation: async (title) => {
    const newConv = await api.createConversation(title);
    await get().fetchConversations();
    await get().selectConversation(newConv.id);
    return newConv.id;
  },

  deleteConversation: async (id) => {
    await api.deleteConversation(id);
    await get().fetchConversations();
    if (get().activeConversationId === id) {
      set({ activeConversationId: null, messages: [], activeCitations: [], activeLatencyMs: null, activeModelUsed: null });
    }
  },

  sendMessageStream: async (question, topK = 3) => {
    const { activeConversationId, selectedDocumentId } = get();
    if (!activeConversationId || !selectedDocumentId) return;

    // Append user query message locally
    const tempUserMsg: MessageResponse = {
      id: "temp-user-" + Date.now(),
      conversation_id: activeConversationId,
      role: "user",
      content: question,
      citations: [],
      model_used: null,
      latency_ms: null,
      created_at: new Date().toISOString(),
    };

    // Append assistant placeholder
    const tempAssistantMsg: MessageResponse = {
      id: "temp-assistant-" + Date.now(),
      conversation_id: activeConversationId,
      role: "assistant",
      content: "",
      citations: [],
      model_used: null,
      latency_ms: null,
      created_at: new Date().toISOString(),
    };

    set((state) => ({
      messages: [...state.messages, tempUserMsg, tempAssistantMsg],
      isStreaming: true,
      activeLatencyMs: null,
      activeModelUsed: null,
      activeCitations: [],
    }));

    try {
      const response = await fetch(
        `/api/v1/chats/${activeConversationId}/stream?document_id=${selectedDocumentId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question, top_k: topK }),
        }
      );

      if (!response.ok) {
        throw new Error("Streaming connection failed.");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) return;

      let answerBuffer = "";
      let chunkBuffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        chunkBuffer += decoder.decode(value, { stream: true });
        const lines = chunkBuffer.split("\n");
        chunkBuffer = lines.pop() || "";

        for (const line of lines) {
          const cleanLine = line.trim();
          if (!cleanLine.startsWith("data: ")) continue;

          const dataStr = cleanLine.slice(6).trim();
          if (!dataStr) continue;

          try {
            const payload = JSON.parse(dataStr);
            if (payload.type === "token") {
              answerBuffer += payload.content;
              // Update assistant placeholder content
              set((state) => ({
                messages: state.messages.map((m) =>
                  m.id === tempAssistantMsg.id
                    ? { ...m, content: answerBuffer }
                    : m
                ),
              }));
            } else if (payload.type === "citation") {
              // Collect citation event
              const page: number = payload.page;
              // We'll query messages afterwards to get the full resolved list, but append locally for UI display in real-time
              const localCitation: Citation = {
                document_id: selectedDocumentId,
                chunk_id: null,
                page: page,
                score: null,
              };
              set((state) => ({
                activeCitations: [...state.activeCitations, localCitation],
              }));
            } else if (payload.type === "metadata") {
              set({
                activeLatencyMs: payload.latency_ms,
                activeModelUsed: payload.model_used,
              });
            } else if (payload.type === "done") {
              // Streaming finished
            }
          } catch (e) {
            console.error("SSE parse error", e, dataStr);
          }
        }
      }

      // Re-fetch chat messages to get exact database version with IDs and completed schemas
      const finalMsgs = await api.getMessages(activeConversationId);
      set({ messages: finalMsgs });
      const lastMsg = finalMsgs[finalMsgs.length - 1];
      if (lastMsg && lastMsg.role === "assistant") {
        set({
          activeCitations: lastMsg.citations || [],
          activeLatencyMs: lastMsg.latency_ms,
          activeModelUsed: lastMsg.model_used,
        });
      }
    } catch (err) {
      console.error("Stream failed", err);
      // Replace assistant message with error text
      set((state) => ({
        messages: state.messages.map((m) =>
          m.id === tempAssistantMsg.id
            ? {
                ...m,
                content:
                  "An error occurred while streaming response. Please verify connection and try again.",
              }
            : m
        ),
      }));
    } finally {
      set({ isStreaming: false });
    }
  },
}));
