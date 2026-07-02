import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { Search, Scale, BookOpen } from "lucide-react-native";
import { api } from "../../services/api";
import { LoadingSpinner } from "../../components/LoadingSpinner";

interface ActSummary {
  act_name: string;
  act_short: string;
  chunk_count: number;
}

export default function LegislationScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ActSummary[]>([]);
  const [acts, setActs] = useState<ActSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await api.get("/laws/search", { params: { q } });
      setResults(res.data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearchImmediate = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    doSearch(query);
  };

  const handleChangeText = (text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!text.trim()) {
      setSearched(false);
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(() => doSearch(text), 400);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const fetchActs = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const res = await api.get("/laws");
      setActs(res.data);
    } catch {
      setActs([
        { act_name: "Indian Penal Code, 1860", act_short: "IPC", chunk_count: 142 },
        { act_name: "Code of Criminal Procedure, 1973", act_short: "CrPC", chunk_count: 98 },
        { act_name: "Indian Contract Act, 1872", act_short: "ICA", chunk_count: 65 },
        { act_name: "Companies Act, 2013", act_short: "CA", chunk_count: 210 },
        { act_name: "Indian Evidence Act, 1872", act_short: "IEA", chunk_count: 46 },
        { act_name: "Constitution of India, 1950", act_short: "COI", chunk_count: 85 },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchActs();
  }, [fetchActs]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await api.get("/laws/search", { params: { q: query } });
      setResults(res.data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const displayData = searched ? results : acts;
  const isSearchResult = searched && !query.trim();

  if (loading && !refreshing) {
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
        <View className="items-center justify-center py-16">
          <Scale size={32} color="#c9a84c" className="mb-3" />
          <Text className="text-white font-bold text-base">No matches found</Text>
          <Text className="text-muted text-sm text-center mt-1">
            Try a different search term.
          </Text>
        </View>
      ) : (
        <FlatList
          data={displayData}
          keyExtractor={(item: any) =>
            searched ? `${item.act_name}-${item.section}` : item.act_short
          }
          numColumns={2}
          columnWrapperStyle={{ gap: 12 }}
          renderItem={({ item, index }) => {
            if (searched) {
              const chunk = item as any;
              return (
                <TouchableOpacity
                  activeOpacity={0.8}
                  className="bg-surface border border-border/40 rounded-xl p-4 mb-3 flex-1"
                  style={{ maxWidth: "48%" }}
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
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                setSearched(false);
                setQuery("");
                fetchActs(false);
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
