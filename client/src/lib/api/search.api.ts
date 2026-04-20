import { apiClient } from "./client";
import type { ApiResponse, SearchResult } from "@/types/api.types";

export const searchApi = {
  search: (params: { q: string; cursor?: string; limit?: number }) =>
    apiClient.get<ApiResponse<SearchResult>>("/search", { params }),
};
