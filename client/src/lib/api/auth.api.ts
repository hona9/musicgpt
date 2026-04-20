import { apiClient } from "./client";
import type {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from "@/types/api.types";

export const authApi = {
  login: (body: LoginRequest) =>
    apiClient.post<ApiResponse<LoginResponse>>("/auth/login", body),

  register: (body: RegisterRequest) =>
    apiClient.post<ApiResponse<RegisterResponse>>("/auth/register", body),

  logout: (refreshToken: string) =>
    apiClient.post<ApiResponse<null>>("/auth/logout", { refreshToken }),

  me: () => apiClient.get<ApiResponse<{ user: import("@/types/api.types").User }>>("/auth/me"),
};
