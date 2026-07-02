import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import auth from "@react-native-firebase/auth";
import { User } from "../types";

const STORAGE_KEY = "@pocket-lawyer/auth-user";

interface AuthUser {
  uid: string;
  email: string | null;
  name: string | null;
  token: string;
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  setUser: (user: AuthUser) => Promise<void>;
  clearUser: () => Promise<void>;
  refreshToken: () => Promise<string | null>;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,

  setUser: async (user) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    set({ user, isLoading: false });
  },

  clearUser: async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    set({ user: null, isLoading: false });
  },

  refreshToken: async () => {
    const firebaseUser = auth().currentUser;
    if (!firebaseUser) {
      await get().clearUser();
      return null;
    }
    const token = await firebaseUser.getIdToken(true);
    const current = get().user;
    if (current) {
      const updated = { ...current, token };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      set({ user: updated });
    }
    return token;
  },

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const user: AuthUser = JSON.parse(raw);
        set({ user, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));
