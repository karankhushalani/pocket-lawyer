import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, RefreshControl, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Briefcase, Filter, AlertTriangle } from "lucide-react-native";
import { api } from "../../services/api";
import { Document } from "../../types";
import { DocumentCard } from "../../components/DocumentCard";
import { LoadingSpinner } from "../../components/LoadingSpinner";

export default function ChambersHomeScreen() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchDocuments = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const response = await api.get("/documents/");
      setDocuments(response.data);
    } catch (error: any) {
      console.warn("Failed to fetch from backend, loading premium demo briefs", error.message);
      
      // Load Premium Mock Briefs on Connection Failure
      setDocuments([
        {
          id: "doc-1",
          title: "Shareholders Agreement - Tata Group & Softbank",
          file_url: "https://example.com/brief1.pdf",
          file_type: "pdf",
          document_type: "agreement",
          jurisdiction: "india",
          summary: "This document outlines the Series C funding conditions, liquidation preferences, voting covenants, and dispute mitigation parameters between Tata Group and SoftBank Ventures.",
          created_at: new Date().toISOString(),
        },
        {
          id: "doc-2",
          title: "Legal Notice of Intellectual Property Breach",
          file_url: "https://example.com/brief2.pdf",
          file_type: "pdf",
          document_type: "notice",
          jurisdiction: "india",
          summary: "An official demand letter alleging unauthorised deployment of trademarked cryptographic software assets, outlining mandatory cease & desist guidelines.",
          created_at: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: "doc-3",
          title: "Non-Disclosure Covenants - Reliance Jio Infocomm",
          file_url: "https://example.com/brief3.pdf",
          file_type: "pdf",
          document_type: "contract",
          jurisdiction: "india",
          summary: "Covenants governing mutual trade secret protections, high-tier encryption sharing, and proprietary 5G radio network infrastructure access guidelines.",
          created_at: new Date(Date.now() - 172800000).toISOString(),
        }
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDocuments(false);
  };

  const handleDocumentPress = (doc: Document) => {
    router.push({
      pathname: `/document/${doc.id}`,
      params: { title: doc.title, jurisdiction: doc.jurisdiction },
    });
  };

  if (loading) {
    return <LoadingSpinner message="Consulting database..." />;
  }

  return (
    <View className="flex-1 bg-background px-4">
      {/* Premium Header Accent */}
      <View className="flex-row items-center justify-between mt-5 mb-4">
        <View className="flex-row items-center">
          <Briefcase size={20} color="#c9a84c" className="mr-2" />
          <Text className="text-white text-lg font-bold tracking-wider uppercase">
            Active Briefcases
          </Text>
        </View>
        <TouchableOpacity className="bg-surface/60 border border-border/55 rounded-lg px-3 py-1.5 flex-row items-center">
          <Filter size={14} color="#8fa3b5" className="mr-1.5" />
          <Text className="text-muted text-xs font-bold uppercase tracking-wider">Filter</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={documents}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <DocumentCard document={item} onPress={() => handleDocumentPress(item)} />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#c9a84c" />
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-20 px-6">
            <AlertTriangle size={36} color="#c9a84c" className="mb-3" />
            <Text className="text-white font-bold text-center text-lg tracking-wide">
              No Document Records Found
            </Text>
            <Text className="text-muted text-center text-sm mt-2 leading-5">
              Navigate to the Ingestion tab to import corporate PDFs and establish vector-similarity briefs.
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );
}
