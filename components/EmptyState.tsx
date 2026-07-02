import React from "react";
import { View, Text } from "react-native";
import { FileText, Search, MessageSquare } from "lucide-react-native";

interface EmptyStateProps {
  icon: "documents" | "search" | "chat";
  title: string;
  subtitle?: string;
}

const ICONS = {
  documents: { Icon: FileText, color: "#c9a84c" as const },
  search: { Icon: Search, color: "#c9a84c" as const },
  chat: { Icon: MessageSquare, color: "#c9a84c" as const },
};

export function EmptyState({ icon, title, subtitle }: EmptyStateProps) {
  const { Icon, color } = ICONS[icon];

  return (
    <View className="items-center justify-center px-8 pt-16">
      <View className="bg-primary/40 border border-accent/20 p-4 rounded-full mb-4">
        <Icon size={32} color={color} />
      </View>
      <Text className="text-white font-bold text-lg text-center">{title}</Text>
      {subtitle && (
        <Text className="text-muted text-sm text-center mt-2 leading-5">
          {subtitle}
        </Text>
      )}
    </View>
  );
}

export default EmptyState;
