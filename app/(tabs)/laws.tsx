import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { Search, BookOpen } from "lucide-react-native";
import { useLaws, useLawSearch } from "../../hooks/useQueries";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { EmptyState } from "../../components/EmptyState";

interface ActSummary {
  act_name: string;
  act_short: string;
  chunk_count: number;
}

export default function LegislationScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { data: acts = [], isLoading: actsLoading, refetch: refetchActs, isRefetching } = useLaws();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: results = [], isLoading: searchLoading } = useLawSearch(searchQuery);

  const handleSearchImmediate = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) return;
    setSearched(true);
    setSearchQuery(query);
  };

  const handleChangeText = (text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!text.trim()) {
      setSearched(false);
      setSearchQuery("");
      return;
    }
    debounceRef.current = setTimeout(() => {
      setSearched(true);
      setSearchQuery(text);
    }, 400);
  };

  const displayData = searched ? results : acts;

  const loading = actsLoading || searchLoading;
  if (loading && !isRefetching) {
    return (
      <View className="flex-1 bg-background px-4">
        <View className="mt-5 mb-4">
          <Text className="text-white text-lg font-bold tracking-wide uppercase">
            Statutory Legislation Search
          </Text>
        </View>
        <View className="flex-row items-center bg-surface border border-border/50 rounded-xl px-3 py-1 mb-5">
          <Search size={20} color="#c9a84c" className="mr-2.5" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search laws, sections..."
            placeholderTextColor="#5a7082"
            className="flex-1 text-white py-3 text-[15px]"
          />
        </View>
        <LoadingSpinner message="Loading legislation index..." />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background px-4">
      <View className="mt-5 mb-4">
        <Text className="text-white text-lg font-bold tracking-wide uppercase">
          Legislation
        </Text>
        <Text className="text-muted text-xs font-semibold tracking-wider mt-0.5">
          Central Indian bare acts
        </Text>
      </View>

      <View className="flex-row items-center bg-surface border border-border/50 rounded-xl px-3 py-1 mb-5">
        <Search size={20} color="#c9a84c" className="mr-2.5" />
        <TextInput
          value={query}
          onChangeText={handleChangeText}
          onSubmitEditing={handleSearchImmediate}
          placeholder="Semantic search, e.g. breach of contract"
          placeholderTextColor="#5a7082"
          returnKeyType="search"
          className="flex-1 text-white py-3 text-[15px]"
        />
        {query.length > 0 && (
          <TouchableOpacity
            onPress={handleSearchImmediate}
            className="bg-primary px-3 py-1.5 rounded-lg border border-accent/20"
          >
            <Text className="text-accent text-xs font-bold uppercase tracking-wider">Search</Text>
          </TouchableOpacity>
        )}
      </View>

      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-muted text-xs font-bold tracking-wider uppercase">
          {searched ? "Search Results" : "Principal Acts & Statutes"}
        </Text>
        {searched && (
          <TouchableOpacity
            onPress={() => {
              setSearched(false);
              setQuery("");
            }}
          >
            <Text className="text-accent text-xs font-bold">Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {searched && displayData.length === 0 ? (
        <EmptyState
          icon="search"
          title="No matches found"
          subtitle="Try a different search term."
        />
      ) : (
        <FlatList
          data={displayData}
          keyExtractor={(item: any) =>
            searched ? `${item.act_name}-${item.section}` : item.act_short
          }
          numColumns={searched ? 1 : 2}
          columnWrapperStyle={searched ? undefined : { gap: 12 }}
          renderItem={({ item }) => {
            if (searched) {
              const chunk = item as any;
              return (
                <TouchableOpacity
                  activeOpacity={0.8}
                  className="bg-surface border border-border/40 rounded-xl p-4 mb-3 flex-1"
                  style={searched ? {} : { maxWidth: "48%" }}
                >
                  <Text className="text-accent font-bold text-xs uppercase tracking-wider mb-1">
                    {chunk.act_short} S.{chunk.section}
                  </Text>
                  <Text className="text-white text-[13px] leading-5" numberOfLines={4}>
                    {chunk.chunk_text}
                  </Text>
                </TouchableOpacity>
              );
            }
            const act = item as ActSummary;
            return (
              <TouchableOpacity
                key={act.act_short}
                activeOpacity={0.8}
                onPress={() => router.push(`/laws/${act.act_short}`)}
                className="bg-surface border border-border/40 rounded-xl p-4 mb-3 flex-1"
                style={{ maxWidth: "48%" }}
              >
                <Text className="text-accent text-2xl font-bold tracking-tight mb-1">
                  {act.act_short}
                </Text>
                <Text className="text-white text-sm leading-5" numberOfLines={2}>
                  {act.act_name}
                </Text>
                <Text className="text-muted text-xs mt-2 font-medium">
                  {act.chunk_count} section{act.chunk_count !== 1 ? "s" : ""}
                </Text>
              </TouchableOpacity>
            );
          }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => {
                setSearched(false);
                setQuery("");
                setSearchQuery("");
                refetchActs();
              }}
              tintColor="#c9a84c"
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
          ListFooterComponent={
            searched ? null : (
              <View className="bg-primary/20 border border-accent/20 rounded-xl p-4 mt-2 flex-row items-start">
                <BookOpen size={16} color="#c9a84c" className="mr-2.5 mt-0.5" />
                <View className="flex-1">
                  <Text className="text-white font-bold text-sm">
                    AI-Powered Search
                  </Text>
                  <Text className="text-muted text-xs leading-5 mt-1">
                    Search across all acts using semantic matching. Results are ranked by relevance
                    using vector embeddings.
                  </Text>
                </View>
              </View>
            )
          }
        />
      )}
    </View>
  );
}
