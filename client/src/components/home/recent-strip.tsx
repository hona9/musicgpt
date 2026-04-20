"use client";

import { useRef, useState } from "react";
import { usePrompts } from "@/hooks/use-prompts";
import { useJobsStore, ACTIVE_STATUSES } from "@/store/jobs.store";
import type { PromptWithJob } from "@/types/api.types";

const GRADIENTS = [
  "linear-gradient(135deg, #2d5a27 0%, #4a8c3f 100%)",
  "linear-gradient(135deg, #1a3a5c 0%, #2e6b9e 100%)",
  "linear-gradient(135deg, #3d1a5c 0%, #6b2e9e 100%)",
  "linear-gradient(135deg, #5c3a1a 0%, #9e6b2e 100%)",
  "linear-gradient(135deg, #1a5c3a 0%, #2e9e6b 100%)",
  "linear-gradient(135deg, #5c1a3a 0%, #9e2e6b 100%)",
];

function deriveTitle(text: string): string {
  const words = text.trim().split(/\s+/);
  // Skip filler openers like "Create a", "Make a", "Generate a"
  const skip = new Set(["create", "make", "generate", "write", "compose", "a", "an", "the"]);
  const meaningful = words.filter((w) => !skip.has(w.toLowerCase()));
  const title = meaningful.slice(0, 4).join(" ");
  return title.length > 0 ? title : words.slice(0, 4).join(" ");
}

export function RecentStrip() {
  const { data, isLoading } = usePrompts();
  const jobs = useJobsStore((s) => s.jobs);
  const activeJobs = Object.values(jobs).filter((j) => ACTIVE_STATUSES.includes(j.status));

  const allPrompts = data?.pages.flatMap((p) => p.items) ?? [];
  const completedPrompts = allPrompts.filter((p) => p.job?.status === "COMPLETED").slice(0, 6);

  const hasContent = completedPrompts.length > 0 || isLoading || activeJobs.length > 0;
  if (!hasContent) return null;

  return (
    <div className="mx-auto w-[800px] shrink-0 pb-6 pt-4">
      <p className="mb-4 text-[15px] font-semibold">Recent generations</p>

      <div className="flex flex-col gap-5">
        {/* Completed tracks */}
        {completedPrompts.map((prompt, i) => (
          <CompletedRow key={prompt.id} prompt={prompt} gradient={GRADIENTS[i % GRADIENTS.length]} />
        ))}

        {/* Skeleton rows for active jobs */}
        {activeJobs.map((job) => (
          <SkeletonRow key={job.jobId} label={job.message} />
        ))}

        {/* Initial loading skeletons */}
        {isLoading && completedPrompts.length === 0 && (
          <>
            <SkeletonRow />
            <SkeletonRow />
          </>
        )}
      </div>
    </div>
  );
}

function CompletedRow({ prompt, gradient }: { prompt: PromptWithJob; gradient: string }) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrl = prompt.job?.audioUrl ?? null;

  const title = deriveTitle(prompt.text);
  const subtitle = prompt.text.length > 80 ? prompt.text.slice(0, 80) + "…" : prompt.text;

  const togglePlay = () => {
    if (!audioUrl) return;
    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => setPlaying(false);
    }
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play().catch(() => setPlaying(false));
      setPlaying(true);
    }
  };

  return (
    <div className="group flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-white/[0.04]">
      {/* Thumbnail */}
      <button
        onClick={togglePlay}
        className="relative size-[52px] shrink-0 overflow-hidden rounded-[10px]"
        style={{ background: gradient }}
        aria-label={playing ? "Pause" : "Play"}
      >
        <div
          className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100"
          style={{ background: "rgba(0,0,0,0.45)" }}
        >
          {playing ? (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="white">
              <rect x="2" y="1" width="4" height="12" rx="1" />
              <rect x="8" y="1" width="4" height="12" rx="1" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="white">
              <path d="M3 1.5L13 7L3 12.5V1.5Z" />
            </svg>
          )}
        </div>
      </button>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-semibold leading-snug">{title}</p>
        <p className="mt-0.5 truncate text-[12px]" style={{ color: "#6a6a6a" }}>
          {subtitle}
        </p>
      </div>

      {/* Menu button */}
      <div className="relative shrink-0">
        <button
          className="flex size-7 items-center justify-center rounded-full text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-white/10"
          aria-label="More options"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="8" cy="3" r="1.2" />
            <circle cx="8" cy="8" r="1.2" />
            <circle cx="8" cy="13" r="1.2" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function SkeletonRow({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl px-2 py-2">
      {/* Thumbnail skeleton */}
      <div
        className="size-[52px] shrink-0 animate-pulse rounded-[10px]"
        style={{ background: "#1e1e1e" }}
      />

      {/* Text skeleton */}
      <div className="min-w-0 flex-1 space-y-2">
        {label ? (
          <>
            <p className="truncate text-[13px] font-medium" style={{ color: "#4a4a4a" }}>
              {label.length > 40 ? label.slice(0, 40) + "…" : label}
            </p>
            <div className="h-2.5 w-3/5 animate-pulse rounded-full" style={{ background: "#1e1e1e" }} />
          </>
        ) : (
          <>
            <div className="h-3 w-2/5 animate-pulse rounded-full" style={{ background: "#1e1e1e" }} />
            <div className="h-2.5 w-3/5 animate-pulse rounded-full" style={{ background: "#1e1e1e" }} />
          </>
        )}
      </div>

      {/* Button skeleton */}
      <div
        className="size-7 shrink-0 animate-pulse rounded-full"
        style={{ background: "#1e1e1e" }}
      />
    </div>
  );
}
