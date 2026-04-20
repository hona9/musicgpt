import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AuthUser {
  id: string;
  email: string;
  tier: "FREE" | "PAID";
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;

  setAuth: (user: AuthUser, accessToken: string, refreshToken: string) => void;
  setAccessToken: (token: string) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,

      setAuth: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken }),

      setAccessToken: (token) => set({ accessToken: token }),

      clearAuth: () => set({ user: null, accessToken: null, refreshToken: null }),

      isAuthenticated: () => Boolean(get().accessToken && get().user),
    }),
    {
      name: "musicgpt-auth",
      // Only persist refreshToken + user to localStorage. accessToken stays in memory.
      partialize: (state) => ({
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    },
  ),
);
