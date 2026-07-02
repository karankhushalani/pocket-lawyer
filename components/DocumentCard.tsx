import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Calendar } from "lucide-react-native";
import { impactLight } from "../lib/haptics";

interface DocumentCardProps {
  id: string;
  title: string;
  document_type: string | null;
  summary: string | null;
  created_at: string;
  risk_flag_count: number;
}

const TYPE_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  contract: { bg: "bg-blue-900/40", text: "text-blue-300", label: "CONTRACT" },
  fir: { bg: "bg-red-900/40", text: "text-red-300", label: "FIR" },
  notice: { bg: "bg-orange-900/40", text: "text-orange-300", label: "NOTICE" },
  agreement: { bg: "bg-green-900/40", text: "text-green-300", label: "AGREEMENT" },
  pleading: { bg: "bg-rose-900/40", text: "text-rose-300", label: "PLEADING" },
  affidavit: { bg: "bg-teal-900/40", text: "text-teal-300", label: "AFFIDAVIT" },
  deed: { bg: "bg-emerald-900/40", text: "text-emerald-300", label: "DEED" },
  will: { bg: "bg-stone-900/40", text: "text-stone-300", label: "WILL" },
  petition: { bg: "bg-indigo-900/40", text: "text-indigo-300", label: "PETITION" },
  order: { bg: "bg-slate-900/40", text: "text-slate-300", label: "ORDER" },
  judgment: { bg: "bg-cyan-900/40", text: "text-cyan-300", label: "JUDGMENT" },
};

export function DocumentCard({
  id,
  title,
  document_type,
  summary,
  created_at,
  risk_flag_count,
}: DocumentCardProps) {
  const router = useRouter();
  const typeStyle = document_type
    ? TYPE_COLORS[document_type.toLowerCase()] ?? {
        bg: "bg-primary/30",
        text: "text-accent",
        label: document_type.toUpperCase(),
      }
    : null;

  const formattedDate = new Date(created_at).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.push(`/document/${id}`)}
      className="bg-surface border border-border/40 rounded-xl p-4 mb-4 shadow-lg shadow-black/20"
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-2">
          <View className="flex-row items-center gap-2 mb-1.5">
            <Text className="text-white font-semibold text-base tracking-wide flex-1" numberOfLines={1}>
              {title}
            </Text>
            {risk_flag_count > 0 && (
              <TouchableOpacity onPress={impactLight} className="bg-red-600/20 border border-red-500/40 rounded-full px-2 py-0.5">
                <Text className="text-red-400 text-[10px] font-bold">{risk_flag_count} risk</Text>
              </TouchableOpacity>
            )}
          </View>
          <View className="flex-row items-center gap-2">
            {typeStyle && (
              <View className={`${typeStyle.bg} border border-white/10 px-2 py-0.5 rounded`}>
                <Text className={`${typeStyle.text} text-[10px] font-bold tracking-wider`}>
                  {typeStyle.label}
                </Text>
              </View>
            )}
            <View className="flex-row items-center">
              <Calendar size={11} color="#8fa3b5" className="mr-1" />
              <Text className="text-muted text-xs font-medium">{formattedDate}</Text>
            </View>
          </View>
        </View>
      </View>

      {summary && (
        <Text className="text-muted text-sm mt-3 leading-5" numberOfLines={2}>
          {summary}
        </Text>
      )}
    </TouchableOpacity>
  );
}

export default DocumentCard;
