import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Info, X } from "lucide-react-native";

const STORAGE_KEY = "@pocket-lawyer/disclaimer-accepted";

export function DisclaimerBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((val) => {
      if (val !== "true") setVisible(true);
    });
  }, []);

  const dismiss = async () => {
    await AsyncStorage.setItem(STORAGE_KEY, "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <View className="bg-yellow-900/30 border-b border-yellow-500/30 px-4 py-2.5">
      <View className="flex-row items-start gap-2">
        <Info size={14} color="#fbbf24" className="mt-0.5" />
        <View className="flex-1">
          <Text className="text-yellow-300 text-[11px] font-bold uppercase tracking-wider">
            AI-Generated Counsel
          </Text>
          <Text className="text-yellow-200/80 text-[11px] leading-4 mt-0.5">
            Responses are AI-generated and may contain errors. Not a substitute for professional legal advice.
          </Text>
        </View>
        <TouchableOpacity onPress={dismiss} className="p-1">
          <X size={14} color="#fbbf24" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default DisclaimerBanner;
