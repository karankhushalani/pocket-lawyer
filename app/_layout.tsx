import React, { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAuthStore } from "../store/useAuthStore";
import { LoadingSpinner } from "../components/LoadingSpinner";

export default function RootLayout() {
  const { user, isLoading, hydrate } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    hydrate();
  }, []);

  // Handle Route Guard/Redirects
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!user && !inAuthGroup) {
      // Direct user to Login if not logged in
      router.replace("/(auth)/login");
    } else if (user && inAuthGroup) {
      // Send user to Home tabs if already logged in
      router.replace("/(tabs)");
    }
  }, [user, isLoading, segments]);

  if (isLoading) {
    return <LoadingSpinner message="Securing connection with Chambers..." />;
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: "#0f1923",
          },
          headerTintColor: "#c9a84c",
          headerTitleStyle: {
            fontWeight: "bold",
            letterSpacing: 1,
          },
          contentStyle: {
            backgroundColor: "#0f1923",
          },
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
    </>
  );
}
