import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Scale, BookOpen } from "lucide-react-native";
import { LawChunk } from "../types";

interface LawCardProps {
  law: LawChunk;
  onPress?: () => void;
}

export const LawCard = ({ law, onPress }: LawCardProps) => {
  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.8 : 1}
      onPress={onPress}
      className="bg-surface border border-border/40 rounded-xl p-4 mb-4 shadow-lg shadow-black/20"
    >
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center flex-1 pr-2">
          <View className="bg-primary/50 border border-accent/20 p-2 rounded-lg mr-3">
            <Scale size={18} color="#c9a84c" />
          </View>
          <View className="flex-1">
            <Text className="text-white font-bold text-base tracking-wide" numberOfLines={1}>
              {law.section}
            </Text>
            <Text className="text-accent text-xs font-semibold tracking-wider uppercase mt-0.5">
              {law.act_short} • {law.act_name}
            </Text>
          </View>
        </View>
        <BookOpen size={16} color="#8fa3b5" />
      </View>

      <Text className="text-muted text-sm leading-6 tracking-wide mt-1" numberOfLines={4}>
        {law.chunk_text}
      </Text>

      {onPress && (
        <Text className="text-accent text-right font-bold text-xs mt-3 tracking-widest uppercase">
          Read Full Provision →
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default LawCard;
