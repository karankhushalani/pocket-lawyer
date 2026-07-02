import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Search, ChevronDown, ChevronRight, MessageSquare } from "lucide-react-native";
import { api } from "../../services/api";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { EmptyState } from "../../components/EmptyState";

interface ActSection {
  act_name: string;
  act_short: string;
  section: string;
  chunk_text: string;
}

export default function ActSectionsScreen() {
  const { act_short } = useLocalSearchParams<{ act_short: string }>();
  const router = useRouter();
  const [sections, setSections] = useState<ActSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const fetchSections = useCallback(
    async (showLoader = true) => {
      if (showLoader) setLoading(true);
      try {
        const res = await api.get(`/laws/${act_short?.toUpperCase()}`);
        setSections(res.data);
      } catch {
        setSections([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [act_short]
  );

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  const filtered = useMemo(() => {
    if (!filter.trim()) return sections;
    const q = filter.toLowerCase();
    return sections.filter(
      (s) =>
        s.section.toLowerCase().includes(q) ||
        s.chunk_text.toLowerCase().includes(q)
    );
  }, [sections, filter]);

  const toggleExpand = (section: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  };

  const actName = sections[0]?.act_name || act_short?.toUpperCase() || "";

  if (loading) {
    return <LoadingSpinner message={`Loading ${act_short?.toUpperCase()} sections...`} />;
  }

  return (
    <View className="flex-1 bg-background px-4">
      <View className="mt-5 mb-4">
        <Text className="text-white text-lg font-bold tracking-wide uppercase">
          {act_short?.toUpperCase()}
        </Text>
        <Text className="text-muted text-xs font-semibold tracking-wider mt-0.5" numberOfLines={1}>
          {actName}
        </Text>
      </View>

      <View className="flex-row items-center bg-surface border border-border/50 rounded-xl px-3 py-1 mb-5">
        <Search size={18} color="#c9a84c" className="mr-2" />
        <TextInput
          value={filter}
          onChangeText={setFilter}
          placeholder="Filter sections..."
          placeholderTextColor="#5a7082"
          returnKeyType="search"
          className="flex-1 text-white py-2.5 text-[14px]"
        />
        {filter.length > 0 && (
          <TouchableOpacity onPress={() => setFilter("")}>
            <Text className="text-accent text-xs font-bold">Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {filtered.length > 0 && (
        <Text className="text-muted text-[11px] font-bold uppercase tracking-wider mb-2">
          {filtered.length} section{filtered.length !== 1 ? "s" : ""}
        </Text>
      )}

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.section}
        renderItem={({ item }) => {
          const isExpanded = expanded.has(item.section);
          return (
            <View className="bg-surface border border-border/40 rounded-xl mb-3 overflow-hidden">
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => toggleExpand(item.section)}
                className="flex-row items-center justify-between px-4 py-3"
              >
                <View className="flex-1 pr-2">
                  <Text className="text-white font-semibold text-sm" numberOfLines={1}>
                    {item.section}
                  </Text>
                </View>
                {isExpanded ? (
                  <ChevronDown size={16} color="#c9a84c" />
                ) : (
                  <ChevronRight size={16} color="#8fa3b5" />
                )}
              </TouchableOpacity>
              {isExpanded && (
                <View className="px-4 pb-3 border-t border-border/30 pt-2.5">
                  <Text className="text-muted text-sm leading-5 mb-3">
                    {item.chunk_text}
                  </Text>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() =>
                      Alert.alert(
                        "Ask Lex",
                        `Navigating to chat with context from ${item.section}.`,
                        [
                          { text: "Cancel", style: "cancel" },
                          {
                            text: "Go to Chat",
                            onPress: () => router.push("/(tabs)"),
                          },
                        ]
                      )
                    }
                    className="bg-accent/10 border border-accent/30 rounded-lg py-2.5 flex-row items-center justify-center"
                  >
                    <MessageSquare size={14} color="#c9a84c" className="mr-1.5" />
                    <Text className="text-accent text-xs font-bold tracking-wider uppercase">
                      Ask about this section
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchSections(false);
            }}
            tintColor="#c9a84c"
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="search"
            title={filter ? "No sections match your filter" : "No sections found"}
            subtitle={filter ? "Try a different search term." : `No sections available for ${act_short?.toUpperCase()}.`}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      />
    </View>
  );
}
