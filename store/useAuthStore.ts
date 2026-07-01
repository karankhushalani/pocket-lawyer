import { create } from "zustand";
import { User } from "../types";

interface AuthState {
  user: User | null;
  idToken: string | null;
  isLoading: boolean;
  setAuth: (user: User | null, idToken: string | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  idToken: null,
  isLoading: true,
  setAuth: (user, idToken) => set({ user, idToken, isLoading: false }),
  setLoading: (loading) => set({ isLoading: loading }),
  logout: () => set({ user: null, idToken: null, isLoading: false }),
}));
