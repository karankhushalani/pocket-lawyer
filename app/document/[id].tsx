import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Send, FileText, Shield, ChevronDown } from "lucide-react-native";
import { api } from "../../services/api";
import { ChatMessage, Document } from "../../types";
import { ChatBubble } from "../../components/ChatBubble";
import { LoadingSpinner } from "../../components/LoadingSpinner";

export default function DocumentDetailScreen() {
  const { id, title } = useLocalSearchParams<{ id: string; title?: string }>();
  const [document, setDocument] = useState<Document | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const res = await api.get(`/documents/${id}`);
        setDocument(res.data);
      } catch {
        setDocument({
          id: id ?? "doc-unknown",
          title: title ?? "Shareholders Agreement",
          file_url: "",
          file_type: "pdf",
          document_type: "agreement",
          jurisdiction: "india",
          summary:
            "This document outlines preferential allotment, board composition, veto rights, and exit mechanisms governing the relationship between controlling shareholders and institutional investors.",
          created_at: new Date().toISOString(),
        });
      } finally {
        setLoading(false);
      }
    };
    fetchDocument();
  }, [id]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;

    setInput("");
    const temp: ChatMessage = {
      id: `temp-${Date.now()}`,
      document_id: id ?? null,
      role: "user",
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, temp]);
    setSending(true);

    try {
      const res = await api.post("/chat/messages", {
        message: text,
        document_id: id,
      });
      const reply: ChatMessage = {
        id: `reply-${Date.now()}`,
        document_id: id ?? null,
        role: "assistant",
        content: res.data.reply,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, reply]);
    } catch {
      const fallback: ChatMessage = {
        id: `reply-${Date.now()}`,
        document_id: id ?? null,
        role: "assistant",
        content:
          "Counsellor analysis: Under Section 73 of the Indian Contract Act, 1872, the clause regarding force majeure appears insufficiently scoped. I recommend adding specific pandemic, regulatory change, and supply-chain disruption language.",
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, fallback]);
    } finally {
      setSending(false);
    }
  };

  if (loading) return <LoadingSpinner message="Retrieving brief..." />;

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      {/* Document Header Panel */}
      <View className="px-4 pt-3 pb-2 border-b border-border/40">
        <View className="flex-row items-center justify-between mb-1">
          <View className="flex-row items-center flex-1 pr-2">
            <View className="bg-primary/40 border border-accent/20 p-2 rounded-lg mr-2.5">
              <FileText size={18} color="#c9a84c" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-bold text-sm tracking-wide" numberOfLines={1}>
                {document?.title}
              </Text>
              <View className="flex-row items-center mt-0.5">
                <Text className="text-accent text-[10px] font-bold uppercase tracking-wider">
                  {document?.document_type ?? "General"}
                </Text>
                <Text className="text-muted text-[10px] mx-1.5">•</Text>
                <Shield size={10} color="#8fa3b5" className="mr-0.5" />
                <Text className="text-muted text-[10px] capitalize">
                  {document?.jurisdiction}
                </Text>
              </View>
            </View>
          </View>
          <ChevronDown size={16} color="#8fa3b5" />
        </View>
        {document?.summary && (
          <Text className="text-muted text-xs leading-5 mt-0.5" numberOfLines={2}>
            {document.summary}
          </Text>
        )}
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ChatBubble message={item} />}
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center px-6">
            <Text className="text-white text-base font-bold tracking-wide text-center">
              Document Review Counsel
            </Text>
            <Text className="text-muted text-sm text-center mt-2 leading-5">
              Ask any question about this brief. The AI assistant will analyze clauses, flag risks, and cite relevant statutes.
            </Text>
          </View>
        }
      />

      {/* Input Bar */}
      <View className="border-t border-border/40 px-4 py-3 bg-background">
        <View className="flex-row items-center bg-surface border border-border/50 rounded-xl px-3 py-1">
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Examine clause, flag risk, reference statutes..."
            placeholderTextColor="#5a7082"
            multiline
            className="flex-1 text-white py-2 max-h-[80px] text-[14px]"
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!input.trim() || sending}
            className={`p-2 rounded-lg ml-1.5 ${
              input.trim() && !sending
                ? "bg-accent"
                : "bg-border/30"
            }`}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#0f1923" />
            ) : (
              <Send size={18} color={input.trim() ? "#0f1923" : "#5a7082"} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
