import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ScrollView,
  Dimensions,
  Animated,
  Easing,
  BackHandler,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Send,
  FileText,
  AlertTriangle,
  Scale,
  X,
} from "lucide-react-native";
import { useDocument, useChatHistory, useSendMessage } from "../../hooks/useQueries";
import { showError } from "../../lib/toast";
import { impactLight } from "../../lib/haptics";
import { ChatMessage } from "../../types";
import { ChatBubble } from "../../components/ChatBubble";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { EmptyState } from "../../components/EmptyState";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const SUGGESTED_QUESTIONS = [
  "What are my obligations?",
  "What are the risks?",
  "Summarize in simple terms",
  "Is this enforceable in India?",
];

function TypingIndicator({ sending, dotOpacity }: { sending: boolean; dotOpacity: Animated.Value }) {
  if (!sending) return null;
  return (
    <View className="flex-row items-center py-3 pl-1">
      <View className="bg-primary border border-accent/20 p-1.5 rounded-full mr-2">
        <Scale size={14} color="#c9a84c" />
      </View>
      <View className="bg-surface border border-border/40 rounded-2xl rounded-tl-none px-4 py-3 flex-row gap-1.5">
        {[0, 1, 2].map((i) => (
          <Animated.View
            key={i}
            style={{ opacity: dotOpacity }}
            className="w-2 h-2 rounded-full bg-accent"
          />
        ))}
      </View>
    </View>
  );
}

export default function DocumentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: document, isLoading: docLoading } = useDocument(id ?? "");
  const { data: history = [], isLoading: historyLoading } = useChatHistory(id ?? "");
  const sendMutation = useSendMessage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showSources, setShowSources] = useState<{
    act_name: string;
    section: string;
  } | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    setMessages(history);
  }, [history]);

  useEffect(() => {
    if (!id) return;
    const onBack = () => {
      router.back();
      return true;
    };
    BackHandler.addEventListener("hardwareBackPress", onBack);
    return () => BackHandler.removeEventListener("hardwareBackPress", onBack);
  }, [id]);

  const handleSend = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || sending) return;
    setInput("");

    const temp: ChatMessage = {
      id: `temp-${Date.now()}`,
      document_id: id ?? null,
      role: "user",
      content: msg,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, temp]);
    setSending(true);
    impactLight();

    try {
      const res = await sendMutation.mutateAsync({
        message: msg,
        document_id: id ?? "",
        conversation_id: "default",
      });
      const reply: ChatMessage = {
        id: `reply-${Date.now()}`,
        document_id: id ?? null,
        role: "assistant",
        content: res.response,
        sources: res.sources,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, reply]);
    } catch (err: any) {
      showError("Chat Error", err.response?.data?.detail || "Failed to get response");
      const fallback: ChatMessage = {
        id: `reply-${Date.now()}`,
        document_id: id ?? null,
        role: "assistant",
        content:
          "I'm sorry, I'm unable to reach my reasoning engine right now. Please check your connection and try again.",
        sources: [],
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, fallback]);
    } finally {
      setSending(false);
    }
  };

  const riskCount = document?.risk_flags?.length ?? 0;
  const dotOpacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (!sending) {
      dotOpacity.setValue(0.3);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(dotOpacity, { toValue: 1, duration: 500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(dotOpacity, { toValue: 0.3, duration: 500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [sending]);

  if (docLoading || historyLoading) return <LoadingSpinner message="Retrieving brief..." />;

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <ScrollView
        className="bg-surface/80 border-b border-border/30"
        style={{ maxHeight: SCREEN_HEIGHT * 0.3 }}
      >
        <View className="px-4 py-3">
          <View className="flex-row items-start justify-between mb-2">
            <View className="flex-1 pr-3">
              <View className="flex-row items-center gap-2 mb-1">
                <FileText size={16} color="#c9a84c" />
                <Text className="text-white font-bold text-sm tracking-wide flex-1" numberOfLines={2}>
                  {document?.title}
                </Text>
              </View>
              <View className="flex-row items-center gap-2 mt-1">
                {document?.document_type && (
                  <View className="bg-primary/30 border border-accent/30 px-2 py-0.5 rounded">
                    <Text className="text-accent text-[10px] font-bold uppercase tracking-wider">
                      {document.document_type}
                    </Text>
                  </View>
                )}
                {riskCount > 0 && (
                  <View className="bg-red-600/20 border border-red-500/40 rounded-full px-2 py-0.5">
                    <Text className="text-red-400 text-[10px] font-bold">
                      {riskCount} risk{riskCount > 1 ? "s" : ""}
                    </Text>
                  </View>
                )}
              </View>
            </View>
            <TouchableOpacity
              onPress={() => router.back()}
              className="bg-border/30 p-1.5 rounded-full"
            >
              <X size={16} color="#8fa3b5" />
            </TouchableOpacity>
          </View>
          {document?.summary && (
            <Text className="text-muted text-xs leading-5" numberOfLines={3}>
              {document.summary}
            </Text>
          )}
          {riskCount > 0 && (
            <View className="bg-red-900/15 border border-red-500/30 rounded-xl p-2.5 mt-2 flex-row items-start gap-2">
              <AlertTriangle size={13} color="#f87171" className="mt-0.5" />
              <Text className="text-red-400 text-[11px] font-medium flex-1">
                {document?.risk_flags?.[0]}
                {riskCount > 1 && ` +${riskCount - 1} more`}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChatBubble
            role={item.role}
            content={item.content}
            sources={item.sources}
            timestamp={item.created_at}
            onSourcePress={(s) => setShowSources(s)}
          />
        )}
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <EmptyState
            icon="chat"
            title="Lex Document Counsel"
            subtitle="Ask anything about this document. Lex will cite relevant statutes and flag risks."
          />
        }
        ListFooterComponent={<TypingIndicator sending={sending} dotOpacity={dotOpacity} />}
      />

      {messages.length === 0 && (
        <View className="px-4 pb-1">
          <Text className="text-muted text-[11px] font-bold uppercase tracking-wider mb-2">
            Suggested questions
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.map((q) => (
              <TouchableOpacity
                key={q}
                activeOpacity={0.7}
                onPress={() => {
                  setInput(q);
                }}
                className="bg-surface/70 border border-border/50 rounded-full px-3.5 py-2"
              >
                <Text className="text-accent text-xs font-medium">{q}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <View className="border-t border-border/40 px-4 py-2.5 bg-background">
        <View className="flex-row items-center bg-surface border border-border/50 rounded-xl px-3 py-1">
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask about this document..."
            placeholderTextColor="#5a7082"
            multiline
            className="flex-1 text-white py-2 max-h-[80px] text-[14px]"
          />
          <TouchableOpacity
            onPress={() => handleSend()}
            disabled={!input.trim() || sending}
            className={`p-2 rounded-lg ml-1.5 ${
              input.trim() && !sending ? "bg-accent" : "bg-border/30"
            }`}
          >
            <Send size={18} color={input.trim() && !sending ? "#0f1923" : "#5a7082"} />
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={showSources !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSources(null)}
      >
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-surface border-t border-border/40 rounded-t-2xl px-5 py-5 max-h-[50%]">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-white font-bold text-sm tracking-wide uppercase">
                Source Reference
              </Text>
              <TouchableOpacity onPress={() => setShowSources(null)}>
                <X size={18} color="#8fa3b5" />
              </TouchableOpacity>
            </View>
            {showSources && (
              <>
                <Text className="text-accent font-bold text-base mb-1">
                  {showSources.act_name}
                </Text>
                <Text className="text-white text-sm font-semibold mb-3">
                  Section {showSources.section}
                </Text>
                <Text className="text-muted text-xs leading-5">
                  Lex cited this provision as relevant to your query. Search this act in the
                  Legislation tab to read the full text.
                </Text>
              </>
            )}
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}
