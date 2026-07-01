import React from "react";
import { View, Text } from "react-native";
import { Scale, MessageSquare } from "lucide-react-native";
import { ChatMessage } from "../types";

interface ChatBubbleProps {
  message: ChatMessage;
}

export const ChatBubble = ({ message }: ChatBubbleProps) => {
  const isUser = message.role === "user";

  return (
    <View className={`flex-row my-2 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <View className="bg-primary border border-accent/20 p-1.5 rounded-full mr-2 self-end mb-1">
          <Scale size={14} color="#c9a84c" />
        </View>
      )}
      
      <View
        className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
          isUser
            ? "bg-primary border border-accent/10 rounded-tr-none"
            : "bg-surface border border-border/40 rounded-tl-none"
        }`}
      >
        <Text className="text-white text-[15px] leading-6 font-normal tracking-wide">
          {message.content}
        </Text>
        
        <Text className="text-[10px] text-muted mt-1.5 self-end tracking-wider">
          {new Date(message.created_at).toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>

      {isUser && (
        <View className="bg-surface border border-border/40 p-1.5 rounded-full ml-2 self-end mb-1">
          <MessageSquare size={14} color="#8fa3b5" />
        </View>
      )}
    </View>
  );
};

export default ChatBubble;
