import axios from "axios";
import { Platform } from "react-native";
import { useAuthStore } from "../store/useAuthStore";

// Default to Android Emulator loopback or local host for iOS/web
const DEFAULT_API_URL = Platform.OS === "android" ? "http://10.0.2.2:8000" : "http://localhost:8000";

export const api = axios.create({
  baseURL: DEFAULT_API_URL + "/api/v1",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    const idToken = useAuthStore.getState().idToken;
    if (idToken) {
      config.headers.Authorization = `Bearer ${idToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
