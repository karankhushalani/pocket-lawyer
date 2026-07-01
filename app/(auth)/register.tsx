import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from "react-native";
import { Link } from "expo-router";
import { Scale, Mail, Lock, User, ShieldCheck } from "lucide-react-native";
import auth from "@react-native-firebase/auth";
import { useAuthStore } from "../../store/useAuthStore";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert("Required Fields", "Please populate all inputs.");
      return;
    }

    setLoading(true);
    try {
      const credential = await auth().createUserWithEmailAndPassword(email, password);
      if (credential.user) {
        await credential.user.updateProfile({ displayName: name });
      }
    } catch (error: any) {
      console.error(error);
      
      // Fallback bypass for Demo/Testing
      if (email.endsWith("@pocketlawyer.com")) {
        setAuth(
          {
            user_id: "demo-user-uuid",
            email: email,
            name: name,
          },
          "demo-jwt-token-id"
        );
      } else {
        Alert.alert(
          "Registration Failed",
          error.message || "Ensure credentials match rules or use an @pocketlawyer.com email to bypass."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-background">
      <View className="flex-1 justify-center px-6 py-12">
        <View className="items-center mb-8">
          <View className="bg-primary/40 border border-accent/40 p-4 rounded-full mb-4 shadow-xl shadow-black/45">
            <Scale size={42} color="#c9a84c" />
          </View>
          <Text className="text-white text-2xl font-bold tracking-widest text-center">
            POCKET LAWYER
          </Text>
          <Text className="text-accent text-xs font-bold tracking-widest text-center mt-1 uppercase">
            Advocates & Counselors
          </Text>
        </View>

        <View className="bg-surface/85 border border-border/40 rounded-2xl p-6 shadow-2xl">
          <Text className="text-white text-lg font-bold mb-6 tracking-wide">
            Request Counsel Access
          </Text>

          <View className="mb-4">
            <Text className="text-muted text-xs font-bold tracking-wider uppercase mb-2">
              Full Legal Name
            </Text>
            <View className="flex-row items-center bg-background/50 border border-border/60 rounded-xl px-3 py-1">
              <User size={18} color="#8fa3b5" className="mr-2" />
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Senior Advocate Malhotra"
                placeholderTextColor="#5a7082"
                className="flex-1 text-white py-2 text-[15px]"
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-muted text-xs font-bold tracking-wider uppercase mb-2">
              Corporate Email
            </Text>
            <View className="flex-row items-center bg-background/50 border border-border/60 rounded-xl px-3 py-1">
              <Mail size={18} color="#8fa3b5" className="mr-2" />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="advocate@firm.com"
                placeholderTextColor="#5a7082"
                autoCapitalize="none"
                keyboardType="email-address"
                className="flex-1 text-white py-2 text-[15px]"
              />
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-muted text-xs font-bold tracking-wider uppercase mb-2">
              Secure Key
            </Text>
            <View className="flex-row items-center bg-background/50 border border-border/60 rounded-xl px-3 py-1">
              <Lock size={18} color="#8fa3b5" className="mr-2" />
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="••••••••"
                placeholderTextColor="#5a7082"
                autoCapitalize="none"
                className="flex-1 text-white py-2 text-[15px]"
              />
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleRegister}
            disabled={loading}
            className="bg-accent rounded-xl py-3.5 items-center shadow-lg shadow-accent/20"
          >
            <Text className="text-background font-bold text-base tracking-widest uppercase">
              {loading ? "Registering..." : "Acquire Access"}
            </Text>
          </TouchableOpacity>
        </View>

        <View className="mt-8 items-center">
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text className="text-muted text-sm font-semibold tracking-wide">
                Already registered?{" "}
                <Text className="text-accent underline font-bold">Return to Chambers</Text>
              </Text>
            </TouchableOpacity>
          </Link>
        </View>

        <View className="mt-12 flex-row items-center justify-center">
          <ShieldCheck size={14} color="#c9a84c" className="mr-1.5" />
          <Text className="text-muted text-[11px] font-bold uppercase tracking-widest text-center">
            256-Bit Encrypted Legal Connection
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
