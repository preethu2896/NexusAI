import {
  DocumentResponse,
  ConversationResponse,
  MessageResponse,
} from "../types";

const API_BASE = "/api/v1";

export const api = {
  // Document Operations
  async getDocuments(): Promise<DocumentResponse[]> {
    const res = await fetch(`${API_BASE}/documents`);
    if (!res.ok) throw new Error("Failed to fetch documents");
    const json = await res.json();
    return json.success ? json.data.items : [];
  },

  async uploadDocument(file: File, title: string): Promise<DocumentResponse> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);

    const res = await fetch(`${API_BASE}/documents/upload`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error("Failed to upload document");
    const json = await res.json();
    if (!json.success) throw new Error(json.error?.message || "Upload failed");
    return json.data;
  },

  async deleteDocument(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/documents/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete document");
    const json = await res.json();
    return !!json.success;
  },

  // Conversation Operations
  async getConversations(): Promise<ConversationResponse[]> {
    const res = await fetch(`${API_BASE}/chats`);
    if (!res.ok) throw new Error("Failed to fetch conversations");
    const json = await res.json();
    return json.success ? json.data : [];
  },

  async createConversation(title?: string): Promise<ConversationResponse> {
    const res = await fetch(`${API_BASE}/chats`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(title ? { title } : {}),
    });
    if (!res.ok) throw new Error("Failed to create conversation");
    const json = await res.json();
    if (!json.success) throw new Error("Failed to create conversation");
    return json.data;
  },

  async getConversation(id: string): Promise<ConversationResponse> {
    const res = await fetch(`${API_BASE}/chats/${id}`);
    if (!res.ok) throw new Error("Failed to fetch conversation");
    const json = await res.json();
    if (!json.success) throw new Error("Conversation not found");
    return json.data;
  },

  async deleteConversation(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/chats/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete conversation");
    const json = await res.json();
    return !!json.success;
  },

  // Message Operations
  async getMessages(conversationId: string): Promise<MessageResponse[]> {
    const res = await fetch(`${API_BASE}/chats/${conversationId}/messages`);
    if (!res.ok) throw new Error("Failed to fetch chat messages");
    const json = await res.json();
    return json.success ? json.data : [];
  },

  async queryChat(
    conversationId: string,
    documentId: string,
    question: string,
    topK = 5
  ): Promise<unknown> {
    const res = await fetch(
      `${API_BASE}/chats/${conversationId}/query?document_id=${documentId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, top_k: topK }),
      }
    );
    if (!res.ok) throw new Error("Failed to run chat query");
    const json = await res.json();
    if (!json.success) throw new Error(json.error?.message || "Query failed");
    return json.data;
  },
};
