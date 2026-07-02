import React from "react";
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { Plus, FileText, MessageSquare } from "lucide-react-native";
import { useAuthStore } from "../../store/useAuthStore";
import { useDocuments } from "../../hooks/useQueries";
import { DocumentCard } from "../../components/DocumentCard";
import { EmptyState } from "../../components/EmptyState";

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
  const { data: documents = [], isLoading, refetch, isRefetching } = useDocuments();
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const avatarLetter = user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "?";
  const chatCount = 0;

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

      {isLoading && documents.length === 0 ? (
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
            <EmptyState
              icon="documents"
              title="No documents yet"
              subtitle="Tap + to analyze your first legal document."
            />
          }
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#c9a84c" />
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
