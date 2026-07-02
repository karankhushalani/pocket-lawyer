import React, { useCallback, useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { Plus, FileText, MessageSquare } from "lucide-react-native";
import { api } from "../../services/api";
import { useAuthStore } from "../../store/useAuthStore";
import { Document } from "../../types";
import { DocumentCard } from "../../components/DocumentCard";

function SkeletonCard() {
  return (
    <View className="bg-surface/60 border border-border/20 rounded-xl p-4 mb-4 animate-pulse">
      <View className="h-5 bg-border/30 rounded w-3/4 mb-2" />
      <View className="h-3 bg-border/20 rounded w-1/3 mb-3" />
      <View className="h-3 bg-border/20 rounded w-full mb-1.5" />
      <View className="h-3 bg-border/20 rounded w-2/3" />
    </View>
  );
}

export default function HomeScreen() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [chatCount, setChatCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  const fetchData = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const [docRes, chatRes] = await Promise.all([
        api.get("/documents/"),
        api.get("/chat/messages").catch(() => ({ data: [] as any[] })),
      ]);
      setDocuments(docRes.data);
      setChatCount(chatRes.data.length);
    } catch {
      setDocuments([]);
      setChatCount(0);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData(false);
  };

  const avatarLetter = user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "?";

  return (
    <View className="flex-1 bg-background">
      <View className="px-4 pt-5 pb-3 flex-row items-center justify-between border-b border-border/30">
        <Text className="text-white text-xl font-bold tracking-widest">Pocket Lawyer</Text>
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/profile")}
          className="bg-primary/50 border border-accent/30 w-9 h-9 rounded-full items-center justify-center"
        >
          <Text className="text-accent font-bold text-sm">{avatarLetter}</Text>
        </TouchableOpacity>
      </View>

      {loading && documents.length === 0 ? (
        <View className="flex-1 px-4 pt-4">
          <View className="flex-row gap-3 mb-5">
            <View className="flex-1 bg-surface/60 border border-border/20 rounded-xl p-4">
              <View className="h-7 bg-border/20 rounded w-12 mb-2" />
              <View className="h-3 bg-border/20 rounded w-20" />
            </View>
            <View className="flex-1 bg-surface/60 border border-border/20 rounded-xl p-4">
              <View className="h-7 bg-border/20 rounded w-12 mb-2" />
              <View className="h-3 bg-border/20 rounded w-20" />
            </View>
          </View>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : (
        <FlatList
          data={documents}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <DocumentCard
              id={item.id}
              title={item.title}
              document_type={item.document_type}
              summary={item.summary}
              created_at={item.created_at}
              risk_flag_count={item.risk_flags?.length ?? 0}
            />
          )}
          ListHeaderComponent={
            <View className="flex-row gap-3 px-4 pt-4 pb-2">
              <View className="flex-1 bg-surface/80 border border-border/40 rounded-xl p-4 shadow-lg">
                <View className="flex-row items-center gap-2 mb-1">
                  <FileText size={16} color="#c9a84c" />
                  <Text className="text-muted text-[11px] font-bold uppercase tracking-wider">
                    Documents
                  </Text>
                </View>
                <Text className="text-white text-2xl font-bold">{documents.length}</Text>
              </View>
              <View className="flex-1 bg-surface/80 border border-border/40 rounded-xl p-4 shadow-lg">
                <View className="flex-row items-center gap-2 mb-1">
                  <MessageSquare size={16} color="#c9a84c" />
                  <Text className="text-muted text-[11px] font-bold uppercase tracking-wider">
                    Chats
                  </Text>
                </View>
                <Text className="text-white text-2xl font-bold">{chatCount}</Text>
              </View>
            </View>
          }
          ListEmptyComponent={
            <View className="items-center justify-center px-8 pt-16">
              <FileText size={40} color="#c9a84c" className="mb-4" />
              <Text className="text-white font-bold text-lg text-center">
                No documents yet
              </Text>
              <Text className="text-muted text-sm text-center mt-2 leading-5">
                Tap + to analyze your first legal document.
              </Text>
            </View>
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#c9a84c" />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 96 }}
          className="flex-1 px-4"
        />
      )}

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => router.push("/(tabs)/upload")}
        className="absolute bottom-8 right-6 bg-accent w-14 h-14 rounded-full items-center justify-center shadow-xl shadow-accent/30"
      >
        <Plus size={28} color="#0f1923" />
      </TouchableOpacity>
    </View>
  );
}
