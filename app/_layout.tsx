import React, { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native-safe-area-context";
import { View } from "react-native";
import { useAuthStore } from "../store/useAuthStore";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { DisclaimerBanner } from "../components/DisclaimerBanner";
import toastConfig from "../lib/toastConfig";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 2,
    },
  },
});

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading, hydrate } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    hydrate();
  }, []);

  useEffect(() => {
    if (isLoading) return;
    const inAuthGroup = segments[0] === "(auth)";
    if (!user && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (user && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [user, isLoading, segments]);

  if (isLoading) {
    return <LoadingSpinner message="Securing connection with Chambers..." />;
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
          <StatusBar style="light" />
          <AuthGuard>
            <View className="flex-1">
              <DisclaimerBanner />
              <Stack
                screenOptions={{
                  headerStyle: { backgroundColor: "#0f1923" },
                  headerTintColor: "#c9a84c",
                  headerTitleStyle: { fontWeight: "bold", letterSpacing: 1 },
                  contentStyle: { backgroundColor: "#0f1923" },
                  headerShadowVisible: false,
                }}
              >
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen
                  name="document/[id]"
                  options={{
                    title: "Document Analysis",
                    headerBackTitle: "Back",
                  }}
                />
              </Stack>
            </View>
          </AuthGuard>
          <Toast config={toastConfig} />
        </SafeAreaView>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
