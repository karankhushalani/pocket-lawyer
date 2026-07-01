import React from "react";
import { Tabs } from "expo-router";
import { Scale, Briefcase, FileText, User } from "lucide-react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#c9a84c",
        tabBarInactiveTintColor: "#8fa3b5",
        tabBarStyle: {
          backgroundColor: "#0f1923",
          borderTopColor: "#243c4f",
          borderTopWidth: 1.5,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerStyle: {
          backgroundColor: "#0f1923",
          borderBottomColor: "#243c4f",
          borderBottomWidth: 1,
        },
        headerTintColor: "#c9a84c",
        headerTitleStyle: {
          fontWeight: "bold",
          letterSpacing: 1,
        },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Chambers",
          tabBarLabel: "Chambers",
          tabBarIcon: ({ color, size }) => (
            <Briefcase size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="upload"
        options={{
          title: "Ingestion",
          tabBarLabel: "Ingestion",
          tabBarIcon: ({ color, size }) => (
            <FileText size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="laws"
        options={{
          title: "Legislation",
          tabBarLabel: "Legislation",
          tabBarIcon: ({ color, size }) => (
            <Scale size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Counsel Profile",
          tabBarLabel: "Profile",
          tabBarIcon: ({ color, size }) => (
            <User size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
