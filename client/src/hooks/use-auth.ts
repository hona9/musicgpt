"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api/auth.api";
import { useAuthStore } from "@/store/auth.store";
import { disconnectSocket } from "@/lib/socket/socket.client";
import type { LoginRequest, RegisterRequest } from "@/types/api.types";

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginRequest) =>
      authApi.login(data).then((r) => r.data.data),
    onSuccess: ({ user, accessToken, refreshToken }) => {
      setAuth(user, accessToken, refreshToken);
      document.cookie = "isLoggedIn=true; path=/; max-age=604800; SameSite=Lax";
      router.push("/");
    },
  });
}

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: RegisterRequest) => {
      await authApi.register(data);
      const loginRes = await authApi.login(data);
      return loginRes.data.data;
    },
    onSuccess: ({ user, accessToken, refreshToken }) => {
      setAuth(user, accessToken, refreshToken);
      document.cookie = "isLoggedIn=true; path=/; max-age=604800; SameSite=Lax";
      router.push("/");
    },
  });
}

export function useLogout() {
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  return useMutation({
    mutationFn: () =>
      refreshToken ? authApi.logout(refreshToken).catch(() => null) : Promise.resolve(null),
    onSettled: () => {
      disconnectSocket();
      clearAuth();
      document.cookie = "isLoggedIn=; path=/; max-age=0";
      window.location.href = "/login";
    },
  });
}
