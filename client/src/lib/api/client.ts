import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/auth.store";
import type { ApiResponse, RefreshResponse } from "@/types/api.types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export const apiClient = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  headers: { "Content-Type": "application/json" },
});

// ─── Request: attach access token ────────────────────────────────────────────

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response: silent token refresh on 401 ───────────────────────────────────

let isRefreshing = false;
let refreshQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function drainQueue(token: string | null, err: unknown) {
  refreshQueue.forEach((p) => (token ? p.resolve(token) : p.reject(err)));
  refreshQueue = [];
}

apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    original._retry = true;

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        refreshQueue.push({ resolve, reject });
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return apiClient(original);
      });
    }

    isRefreshing = true;

    try {
      const { refreshToken } = useAuthStore.getState();
      if (!refreshToken) throw new Error("No refresh token");

      const { data } = await axios.post<ApiResponse<RefreshResponse>>(
        `${BASE_URL}/api/v1/auth/refresh`,
        { refreshToken },
      );

      const newAccessToken = data.data.accessToken;
      const newRefreshToken = data.data.refreshToken;

      useAuthStore.getState().setAuth(
        useAuthStore.getState().user!,
        newAccessToken,
        newRefreshToken,
      );

      // also refresh the isLoggedIn cookie TTL
      document.cookie = "isLoggedIn=true; path=/; max-age=604800; SameSite=Lax";

      drainQueue(newAccessToken, null);
      original.headers.Authorization = `Bearer ${newAccessToken}`;
      return apiClient(original);
    } catch (refreshError) {
      drainQueue(null, refreshError);
      useAuthStore.getState().clearAuth();
      document.cookie = "isLoggedIn=; path=/; max-age=0";
      window.location.href = "/login";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
