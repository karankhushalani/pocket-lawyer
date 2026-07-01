import React from "react";
import { View, ActivityIndicator, Text } from "react-native";

export const LoadingSpinner = ({ message }: { message?: string }) => {
  return (
    <View className="flex-1 justify-center items-center bg-background p-4">
      <ActivityIndicator size="large" color="#c9a84c" />
      {message && (
        <Text className="text-muted mt-3 text-center font-medium tracking-wide">
          {message}
        </Text>
      )}
    </View>
  );
};

export default LoadingSpinner;
