import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { FileText, Calendar, ShieldAlert } from "lucide-react-native";
import { Document } from "../types";

interface DocumentCardProps {
  document: Document;
  onPress: () => void;
}

export const DocumentCard = ({ document, onPress }: DocumentCardProps) => {
  const formattedDate = new Date(document.created_at).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      className="bg-surface border border-border/40 rounded-xl p-4 mb-4 shadow-lg shadow-black/20"
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-row items-center flex-1 pr-2">
          <View className="bg-primary/50 border border-accent/20 p-2 rounded-lg mr-3">
            <FileText size={22} color="#c9a84c" />
          </View>
          <View className="flex-1">
            <Text className="text-white font-semibold text-base tracking-wide" numberOfLines={1}>
              {document.title}
            </Text>
            <View className="flex-row items-center mt-1">
              <Calendar size={12} color="#8fa3b5" className="mr-1" />
              <Text className="text-muted text-xs font-medium mr-3">
                {formattedDate}
              </Text>
              {document.document_type && (
                <View className="bg-primary/30 border border-accent/30 px-2 py-0.5 rounded">
                  <Text className="text-accent text-[10px] font-bold uppercase tracking-wider">
                    {document.document_type}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>

      {document.summary && (
        <Text className="text-muted text-sm mt-3 leading-5" numberOfLines={2}>
          {document.summary}
        </Text>
      )}

      <View className="flex-row items-center justify-between border-t border-border/30 mt-4 pt-3">
        <View className="flex-row items-center">
          <ShieldAlert size={14} color="#8fa3b5" className="mr-1" />
          <Text className="text-muted text-xs capitalize">
            {document.jurisdiction} Jurisdiction
          </Text>
        </View>
        <Text className="text-accent font-semibold text-xs tracking-wider uppercase">
          Review & Chat →
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default DocumentCard;
