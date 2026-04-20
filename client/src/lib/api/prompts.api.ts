import { apiClient } from "./client";
import type {
  ApiResponse,
  CreatePromptRequest,
  CreatePromptResponse,
  PromptsPage,
} from "@/types/api.types";

export const promptsApi = {
  list: (params: { cursor?: string; limit?: number } = {}) =>
    apiClient.get<ApiResponse<PromptsPage>>("/prompts", { params }),

  create: (body: CreatePromptRequest) =>
    apiClient.post<ApiResponse<CreatePromptResponse>>("/prompts", body),
};
