import React, { Component, ErrorInfo, ReactNode } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { AlertTriangle } from "lucide-react-native";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 bg-background items-center justify-center px-8">
          <View className="bg-red-900/20 border border-red-500/30 p-4 rounded-full mb-5">
            <AlertTriangle size={40} color="#f87171" />
          </View>
          <Text className="text-white text-lg font-bold text-center mb-2">
            Something went wrong
          </Text>
          <Text className="text-muted text-sm text-center leading-5 mb-6">
            An unexpected error occurred. Please restart the app.
          </Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => this.setState({ hasError: false, error: null })}
            className="bg-accent rounded-xl px-8 py-3"
          >
            <Text className="text-background font-bold tracking-wider uppercase">
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
