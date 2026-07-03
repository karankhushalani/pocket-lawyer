import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { User, ShieldAlert, Award, FileSpreadsheet, LogOut, CheckCircle2 } from "lucide-react-native";
import auth from "@react-native-firebase/auth";
import { useAuthStore } from "../../store/useAuthStore";

export default function ProfileScreen() {
  const { user, clearUser } = useAuthStore();

  const handleLogout = async () => {
    Alert.alert(
      "Terminate Connection",
      "Are you sure you want to securely close your active chambers session?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Terminate Session",
          style: "destructive",
          onPress: async () => {
            try {
              await auth().signOut();
            } catch (error) {
              console.warn("Local session termination initiated", error);
            } finally {
              clearUser();
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView className="flex-grow bg-background px-6 py-6">
      <View className="items-center mb-8">
        <View className="bg-primary/40 border border-accent/40 p-5 rounded-full mb-4 shadow-xl shadow-black/30">
          <User size={48} color="#c9a84c" />
        </View>
        <Text className="text-white text-xl font-bold tracking-wider text-center">
          {user?.name || "Senior Advocate / Counsel"}
        </Text>
        <Text className="text-accent text-xs font-bold tracking-widest uppercase mt-1">
          Bar Council Registered • India
        </Text>
        <Text className="text-muted text-sm mt-1">{user?.email || "advocate@chambers.com"}</Text>
      </View>

      <View className="bg-surface/80 border border-border/40 rounded-2xl p-5 mb-6 shadow-2xl">
        <Text className="text-white text-sm font-bold tracking-wider uppercase mb-4">
          Credentials & Clearence
        </Text>

        <View className="flex-row items-center justify-between mb-4 pb-3 border-b border-border/30">
          <View className="flex-row items-center">
            <Award size={18} color="#c9a84c" className="mr-3" />
            <Text className="text-white text-[15px] font-medium">Advocate License</Text>
          </View>
          <Text className="text-accent font-bold text-xs">VERIFIED</Text>
        </View>

        <View className="flex-row items-center justify-between mb-4 pb-3 border-b border-border/30">
          <View className="flex-row items-center">
            <CheckCircle2 size={18} color="#c9a84c" className="mr-3" />
            <Text className="text-white text-[15px] font-medium">SOC2 Type-II Clearance</Text>
          </View>
          <Text className="text-accent font-bold text-xs">AUTHORIZED</Text>
        </View>

        <View className="flex-row items-center justify-between mb-4 pb-3 border-b border-border/30">
          <View className="flex-row items-center">
            <ShieldAlert size={18} color="#c9a84c" className="mr-3" />
            <Text className="text-white text-[15px] font-medium">Chamber Encryption</Text>
          </View>
          <Text className="text-accent font-bold text-xs">AES-256</Text>
        </View>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <FileSpreadsheet size={18} color="#c9a84c" className="mr-3" />
            <Text className="text-white text-[15px] font-medium">Storage Vault Quota</Text>
          </View>
          <Text className="text-accent font-bold text-xs">12% / 5.0 GB</Text>
        </View>
      </View>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleLogout}
        className="bg-red-950/40 border border-red-500/35 rounded-xl py-4 flex-row justify-center items-center mb-12"
      >
        <LogOut size={18} color="#f87171" className="mr-2" />
        <Text className="text-red-400 font-bold tracking-widest uppercase">
          Terminate Connection
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
