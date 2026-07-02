import React, { useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Scale, MessageSquare } from "lucide-react-native";

interface SourceChip {
  act_name: string;
  section: string;
}

interface ChatBubbleProps {
  role: "user" | "assistant";
  content: string;
  sources?: SourceChip[];
  timestamp: string;
  onSourcePress?: (source: SourceChip) => void;
}

function renderMarkdown(text: string) {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    const trimmed = line.trim();

    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const rest = trimmed.slice(2);
      return (
        <View key={i} className="flex-row items-start mb-1">
          <Text className="text-white text-[15px] leading-6 mr-2">{"\u2022"}</Text>
          <Text className="text-white text-[15px] leading-6 flex-1">
            {renderInline(rest)}
          </Text>
        </View>
      );
    }

    return (
      <Text key={i} className="text-white text-[15px] leading-6">
        {renderInline(trimmed || " ")}
        {i < lines.length - 1 && "\n"}
      </Text>
    );
  });
}

function renderInline(text: string) {
  const parts: React.ReactNode[] = [];
  const regex = /\*\*(.+?)\*\*/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(
        <Text key={`t${last}`}>{text.slice(last, match.index)}</Text>
      );
    }
    parts.push(
      <Text key={`b${match.index}`} className="font-bold">
        {match[1]}
      </Text>
    );
    last = regex.lastIndex;
  }
  if (last < text.length) {
    parts.push(<Text key={`t${last}`}>{text.slice(last)}</Text>);
  }
  return parts.length > 0 ? parts : text;
}

export function ChatBubble({
  role,
  content,
  sources,
  timestamp,
  onSourcePress,
}: ChatBubbleProps) {
  const isUser = role === "user";

  const time = useMemo(
    () =>
      new Date(timestamp).toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      }),
    [timestamp]
  );

  return (
    <View className={`flex-row my-2 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <View className="bg-primary border border-accent/20 p-1.5 rounded-full mr-2 self-end mb-1">
          <Scale size={14} color="#c9a84c" />
        </View>
      )}

      <View className="max-w-[80%]">
        <View
          className={`rounded-2xl px-4 py-3 shadow-sm ${
            isUser
              ? "bg-primary border border-accent/10 rounded-tr-none"
              : "bg-surface border border-border/40 rounded-tl-none"
          }`}
        >
          {isUser ? (
            <Text className="text-white text-[15px] leading-6 font-normal tracking-wide">
              {content}
            </Text>
          ) : (
            <View className="text-white text-[15px] leading-6 font-normal tracking-wide">
              {renderMarkdown(content)}
            </View>
          )}

          <Text className="text-[10px] text-muted mt-1.5 self-end tracking-wider">
            {time}
          </Text>
        </View>

        {!isUser && sources && sources.length > 0 && (
          <View className="flex-row flex-wrap gap-1.5 mt-1.5 ml-1">
            {sources.map((s, i) => (
              <TouchableOpacity
                key={i}
                activeOpacity={0.7}
                onPress={() => onSourcePress?.(s)}
                className="bg-primary/30 border border-accent/20 px-2 py-0.5 rounded-full"
              >
                <Text className="text-accent text-[10px] font-bold tracking-wider">
                  {s.act_name.replace(/^Indian /, "").replace(/, 18\d\d|, 2\d\d\d/, "").substring(0, 16)} S.{s.section}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {isUser && (
        <View className="bg-surface border border-border/40 p-1.5 rounded-full ml-2 self-end mb-1">
          <MessageSquare size={14} color="#8fa3b5" />
        </View>
      )}
    </View>
  );
}

export default ChatBubble;
