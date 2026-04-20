"use client";

import { usePrompts } from "@/hooks/use-prompts";

const GRADIENTS = [
  "linear-gradient(135deg, #2d5a27 0%, #4a8c3f 100%)",
  "linear-gradient(135deg, #1a3a5c 0%, #2e6b9e 100%)",
  "linear-gradient(135deg, #3d1a5c 0%, #6b2e9e 100%)",
  "linear-gradient(135deg, #5c1a1a 0%, #9e2e2e 100%)",
];

export function RecentStrip() {
  const { data, isLoading } = usePrompts();

  const recentPrompts = data?.pages.flatMap((p) => p.items).slice(0, 2) ?? [];

  if (isLoading || recentPrompts.length === 0) return null;

  return (
    <div
      className="shrink-0"
      style={{ borderTop: "1px solid #1f1f1f", background: "#0c0c0c" }}
    >
      <div className="flex items-center justify-between px-6 pb-1.5 pt-3">
        <span className="text-[13px] font-semibold">Recent generations</span>
      </div>
      <div className="flex flex-col gap-2 px-6 pb-3.5">
        {recentPrompts.map((prompt, i) => (
          <div
            key={prompt.id}
            className="flex cursor-pointer items-center gap-3 py-1.5 opacity-100 transition-opacity hover:opacity-80"
          >
            {/* Album art */}
            <div
              className="relative size-11 shrink-0 overflow-hidden rounded-[7px]"
              style={{ background: GRADIENTS[i % GRADIENTS.length] }}
            >
              <div
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.4))",
                }}
              />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium">
                {prompt.text.length > 40
                  ? prompt.text.slice(0, 40) + "…"
                  : prompt.text}
              </p>
              <p
                className="truncate text-[11px]"
                style={{ color: "#7a7a7a", maxWidth: 500 }}
              >
                {prompt.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
