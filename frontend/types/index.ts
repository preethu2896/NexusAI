export interface DocumentResponse {
  document_id: string;
  filename: string;
  title: string;
  status: "pending" | "processing" | "indexed" | "failed";
  file_size_bytes: number | null;
  page_count: number | null;
  chunk_count: number;
  created_at: string;
  updated_at: string;
}

export interface ConversationResponse {
  id: string;
  title: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Citation {
  document_id: string | null;
  chunk_id: string | null;
  page: number;
  score: number | null;
}

export interface MessageResponse {
  id: string;
  conversation_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  citations: Citation[];
  model_used: string | null;
  latency_ms: number | null;
  created_at: string;
}

export interface ChatQueryRequest {
  question: string;
  top_k: number;
}
