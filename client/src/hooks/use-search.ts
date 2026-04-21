"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { searchApi } from "@/lib/api/search.api";

export function useSearch(query: string) {
  return useInfiniteQuery({
    queryKey: ["search", query],
    queryFn: ({ pageParam }) =>
      searchApi
        .search({ q: query, limit: 10, cursor: pageParam })
        .then((r) => r.data.data),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: query.trim().length >= 2,
    staleTime: 30_000,
  });
}
