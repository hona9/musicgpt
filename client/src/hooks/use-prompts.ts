"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import { promptsApi } from "@/lib/api/prompts.api";
import type { PromptsPage } from "@/types/api.types";

export function usePrompts() {
  return useInfiniteQuery({
    queryKey: ["prompts"],
    queryFn: ({ pageParam }) =>
      promptsApi
        .list({ cursor: pageParam as string | undefined, limit: 20 })
        .then((r) => r.data.data),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}

export function useCreatePrompt() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (text: string) =>
      promptsApi.create({ text }).then((r) => r.data.data),
    onSuccess: () => {
      // Invalidate prompts list so recent strip refreshes after job completes
      qc.invalidateQueries({ queryKey: ["prompts"] });
    },
  });
}
