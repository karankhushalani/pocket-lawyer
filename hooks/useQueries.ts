import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import { Document, ChatMessage } from "../types";

export function useDocuments() {
  return useQuery({
    queryKey: ["documents"],
    queryFn: async () => {
      const res = await api.get("/documents/");
      return res.data as Document[];
    },
  });
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: ["document", id],
    queryFn: async () => {
      const res = await api.get(`/documents/${id}`);
      return res.data as Document;
    },
    enabled: !!id,
  });
}

export function useChatHistory(documentId: string) {
  return useQuery({
    queryKey: ["chat-history", documentId],
    queryFn: async () => {
      const res = await api.get(`/chat/history/${documentId}`);
      return res.data as ChatMessage[];
    },
    enabled: !!documentId,
  });
}

export function useLaws() {
  return useQuery({
    queryKey: ["laws"],
    queryFn: async () => {
      const res = await api.get("/laws");
      return res.data as Array<{
        act_name: string;
        act_short: string;
        chunk_count: number;
      }>;
    },
  });
}

export function useLawSearch(query: string) {
  return useQuery({
    queryKey: ["law-search", query],
    queryFn: async () => {
      const res = await api.get("/laws/search", { params: { q: query } });
      return res.data as Array<{
        act_name: string;
        section: string;
        chunk_text: string;
      }>;
    },
    enabled: !!query.trim(),
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await api.post("/documents/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 120000,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}

export function useSendMessage() {
  return useMutation({
    mutationFn: async (body: {
      message: string;
      document_id: string;
      conversation_id?: string;
    }) => {
      const res = await api.post("/chat", body);
      return res.data as {
        response: string;
        sources: Array<{ act_name: string; section: string }>;
        message_id: string;
      };
    },
  });
}
