export interface User {
  user_id: string;
  email: string;
  name: string | null;
}

export interface Document {
  id: string;
  title: string;
  file_url: string;
  file_type: string;
  document_type: string | null;
  jurisdiction: string;
  summary: string | null;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  document_id: string | null;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface LawChunk {
  id: string;
  act_name: string;
  act_short: string;
  section: string;
  chunk_text: string;
}
