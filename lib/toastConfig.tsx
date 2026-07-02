import React from "react";
import { View, Text } from "react-native";
import { BaseToastProps } from "react-native-toast-message";
import { CheckCircle2, AlertTriangle, Info } from "lucide-react-native";

export default {
  success: (props: BaseToastProps) => (
    <View className="bg-surface border border-green-500/40 mx-4 mt-2 rounded-xl px-4 py-3 flex-row items-start gap-3 shadow-2xl">
      <CheckCircle2 size={18} color="#22c55e" className="mt-0.5" />
      <View className="flex-1">
        <Text className="text-white text-sm font-bold">{props.text1}</Text>
        {props.text2 && <Text className="text-muted text-xs mt-0.5">{props.text2}</Text>}
      </View>
    </View>
  ),
  error: (props: BaseToastProps) => (
    <View className="bg-surface border border-red-500/40 mx-4 mt-2 rounded-xl px-4 py-3 flex-row items-start gap-3 shadow-2xl">
      <AlertTriangle size={18} color="#f87171" className="mt-0.5" />
      <View className="flex-1">
        <Text className="text-white text-sm font-bold">{props.text1}</Text>
        {props.text2 && <Text className="text-muted text-xs mt-0.5">{props.text2}</Text>}
      </View>
    </View>
  ),
  info: (props: BaseToastProps) => (
    <View className="bg-surface border border-accent/40 mx-4 mt-2 rounded-xl px-4 py-3 flex-row items-start gap-3 shadow-2xl">
      <Info size={18} color="#c9a84c" className="mt-0.5" />
      <View className="flex-1">
        <Text className="text-white text-sm font-bold">{props.text1}</Text>
        {props.text2 && <Text className="text-muted text-xs mt-0.5">{props.text2}</Text>}
      </View>
    </View>
  ),
};
