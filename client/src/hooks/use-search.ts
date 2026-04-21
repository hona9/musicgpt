"use client";

import { useQuery } from "@tanstack/react-query";
import { searchApi } from "@/lib/api/search.api";

export function useSearch(query: string) {
  return useQuery({
    queryKey: ["search", query],
    queryFn: () => searchApi.search({ q: query, limit: 8 }).then((r) => r.data.data),
    enabled: query.trim().length >= 2,
    staleTime: 30_000,
  });
}
