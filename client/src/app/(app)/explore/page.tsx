"use client";

import { useState } from "react";
import { useSearch } from "@/hooks/use-search";
import { useDebounce } from "@/hooks/use-debounce";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Music, User } from "lucide-react";
import type { SearchItem } from "@/types/api.types";

export default function ExplorePage() {
  const [input, setInput] = useState("");
  const query = useDebounce(input, 400);

  const { data, isFetching, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useSearch(query);

  const items = data?.pages.flatMap((p) => p.items) ?? [];
  const hasQuery = query.trim().length >= 2;

  return (
    <div className="flex flex-col gap-6 px-8 py-10 max-w-[800px] mx-auto w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/40 pointer-events-none" />
        <Input
          className="pl-10 h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl focus-visible:ring-white/20"
          placeholder="Search users or music..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>

      {hasQuery ? (
        <div className="flex flex-col gap-2">
          {isFetching && items.length === 0 &&
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-[58px] rounded-xl bg-white/5" />
            ))}

          {!isFetching && items.length === 0 && (
            <p className="text-white/40 text-sm text-center py-10">
              No results for &ldquo;{query}&rdquo;
            </p>
          )}

          {items.map((item) => (
            <SearchResultRow key={`${item.type}-${item.id}`} item={item} />
          ))}

          {hasNextPage && (
            <Button
              variant="ghost"
              className="text-white/40 hover:text-white text-sm mt-2 self-center"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? "Loading..." : "Load more"}
            </Button>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 py-20 text-white/25">
          <Search className="size-10" />
          <p className="text-sm">Type at least 2 characters to search</p>
        </div>
      )}
    </div>
  );
}

function SearchResultRow({ item }: { item: SearchItem }) {
  const isAudio = item.type === "audio";

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors cursor-pointer border border-white/[0.06]">
      <div className="flex items-center justify-center size-9 rounded-full bg-white/10 shrink-0">
        {isAudio ? (
          <Music className="size-4 text-white/60" />
        ) : (
          <User className="size-4 text-white/60" />
        )}
      </div>

      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <span className="text-white text-sm font-medium truncate">{item.display}</span>
        {isAudio && item.promptText && item.display !== item.promptText && (
          <span className="text-white/40 text-xs truncate">{item.promptText}</span>
        )}
      </div>

      <div className="shrink-0">
        {!isAudio && item.tier && (
          <Badge
            variant="outline"
            className="text-[11px] border-white/20 text-white/50 rounded-full"
          >
            {item.tier}
          </Badge>
        )}
        {isAudio && (
          <Badge
            variant="outline"
            className="text-[11px] border-white/20 text-white/50 rounded-full"
          >
            audio
          </Badge>
        )}
      </div>
    </div>
  );
}
