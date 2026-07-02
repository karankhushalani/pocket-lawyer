import axios from "axios";
import { Platform } from "react-native";
import { useAuthStore } from "../store/useAuthStore";
import { getIdToken } from "./auth";

const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === "android" ? "http://10.0.2.2:8000" : "http://localhost:8000");

export const api = axios.create({
  baseURL: BASE_URL + "/api/v1",
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(async (config) => {
  const token = useAuthStore.getState().user?.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  pendingQueue.forEach((p) => {
    if (token) p.resolve(token);
    else p.reject(error);
  });
  pendingQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }
    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({
          resolve: (token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          },
          reject,
        });
      });
    }

    isRefreshing = true;
    try {
      const newToken = await getIdToken();
      if (newToken) {
        const store = useAuthStore.getState();
        if (store.user) {
          await store.setUser({ ...store.user, token: newToken });
        }
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      }
      await useAuthStore.getState().clearUser();
      processQueue(new Error("Session expired"));
      return Promise.reject(error);
    } catch (refreshError) {
      processQueue(refreshError);
      await useAuthStore.getState().clearUser();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
