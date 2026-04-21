"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useAuthStore } from "@/store/auth.store";
import { useJobsStore, ACTIVE_STATUSES } from "@/store/jobs.store";
import { useLogout } from "@/hooks/use-auth";
import { getSongName } from "@/lib/song-names";
import type { JobEvent } from "@/types/api.types";

interface ProfilePopupProps {
  onClose: () => void;
}

export function ProfilePopup({ onClose }: ProfilePopupProps) {
  const user = useAuthStore((s) => s.user);
  const jobs = useJobsStore((s) => s.jobs);
  const recentCompleted = useJobsStore((s) => s.recentCompleted);
  const clearUnread = useJobsStore((s) => s.clearUnread);
  const activeJobs = Object.values(jobs).filter((j) => ACTIVE_STATUSES.includes(j.status));
  const failedJobs = Object.values(jobs).filter((j) => j.status === "FAILED");
  const logout = useLogout();

  useEffect(() => { clearUnread(); }, [clearUnread]);

  const initial = user?.email?.[0]?.toUpperCase() ?? "U";

  const popupRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  const hasAnyJobs = activeJobs.length > 0 || failedJobs.length > 0 || recentCompleted.length > 0;

  return (
    <div
      ref={popupRef}
      className="absolute right-0 top-11 z-50 w-[400px] overflow-hidden rounded-[20px] animate-slide-down"
      style={{
        background: "rgba(22,25,28,1)",
        boxShadow: "0px 0px 24px rgba(0,0,0,0.48)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-5 pb-3">
        <div className="flex items-center gap-3">
          {/* Avatar — solid gradient circle */}
          <div
            className="flex size-[60px] shrink-0 items-center justify-center rounded-full text-[20px] font-medium text-white"
            style={{
              background: "linear-gradient(180deg, rgba(199,0,255,1), rgba(255,44,155,1))",
            }}
          >
            {initial}
          </div>
          <div>
            <p className="text-[16px] font-medium" style={{ color: "rgba(228,230,232,1)" }}>
              {user?.email?.split("@")[0] ?? "User"}
            </p>
            <p className="text-[14px]" style={{ color: "rgba(137,140,146,1)" }}>
              @{user?.email?.split("@")[0] ?? "user"}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-md p-1 transition-colors"
          style={{ color: "rgba(119,122,128,1)" }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Credits card */}
      <div className="mx-4 mb-3">
        <div
          className="flex h-[50px] items-center justify-between rounded-[12px] px-4"
          style={{ background: "rgba(33,37,41,1)" }}
        >
          <div className="flex items-center gap-1.5">
            <span className="text-[14px] font-semibold" style={{ color: "rgba(228,230,232,1)" }}>
              0/0 credits
            </span>
            <span
              className="inline-flex size-[18px] items-center justify-center rounded-full border text-[10px] leading-none"
              style={{ borderColor: "rgba(119,122,128,1)", color: "rgba(119,122,128,1)" }}
            >
              i
            </span>
          </div>
          <button
            className="flex items-center gap-1 text-[14px] font-medium"
            style={{ color: "rgba(119,122,128,1)" }}
          >
            Top Up
            <svg width="6" height="10" viewBox="0 0 6 10" fill="none">
              <path d="M1 1L5 5L1 9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: "1px solid rgba(48,52,56,1)" }} />

      {/* Jobs list */}
      {hasAnyJobs && (
        <div className="px-4 py-2">
          {activeJobs.map((job) => (
            <ActiveJobItem key={job.jobId} job={job} />
          ))}
          {failedJobs.map((job) => (
            <FailedJobItem key={job.jobId} job={job} onDismiss={() => useJobsStore.getState().removeJob(job.jobId)} />
          ))}
          {recentCompleted.map((job) => (
            <CompletedJobItem key={job.jobId} job={job} />
          ))}
        </div>
      )}

      {/* Divider */}
      {hasAnyJobs && <div style={{ borderTop: "1px solid rgba(48,52,56,1)" }} />}

      {/* Logout */}
      <div className="px-4 py-3">
        <button
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
          className="w-full rounded-lg py-2 text-[13px] font-medium transition-colors disabled:opacity-50"
          style={{ color: "rgba(137,140,146,1)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(228,230,232,1)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(137,140,146,1)")}
        >
          {logout.isPending ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </div>
  );
}

// ─── Shared ───────────────────────────────────────────────────────────────────

const GRADIENTS = [
  "linear-gradient(135deg, #1a1a3e, #3a1a5c)",
  "linear-gradient(135deg, #3e1a1a, #5c1a3a)",
  "linear-gradient(135deg, #1a3e1a, #1a5c3a)",
  "linear-gradient(135deg, #3a2a1a, #5c4a2e)",
  "linear-gradient(135deg, #1a2a3e, #1a3a5c)",
];

function gradientFor(promptId: string): string {
  let h = 0;
  for (let i = 0; i < promptId.length; i++) h = (h * 31 + promptId.charCodeAt(i)) >>> 0;
  return GRADIENTS[h % GRADIENTS.length];
}

// ─── Failed job card ──────────────────────────────────────────────────────────

function FailedJobItem({ job, onDismiss }: { job: JobEvent; onDismiss: () => void }) {
  const isInvalidPrompt = job.errorMessage?.toLowerCase().includes("valid") ?? false;

  if (!isInvalidPrompt) {
    // Red "Oops! Server busy" card
    return (
      <div
        className="my-2 flex items-start justify-between gap-3 rounded-[12px] p-3"
        style={{ background: "#EE0D3714" }}
      >
        <div className="flex items-start gap-2">
          <Image src="/icons/exclamation.svg" alt="" width={18} height={18} className="mt-0.5 shrink-0" />
          <div>
            <p className="text-[13px] font-semibold" style={{ color: "#EE0D37" }}>
              Oops! Server busy.
            </p>
            <p className="mt-0.5 text-[12px]" style={{ color: "rgba(137,140,146,1)" }}>
              {job.errorMessage ?? "Could not process your request. Please try again."}
            </p>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="shrink-0 text-[16px] leading-none transition-colors"
          style={{ color: "rgba(93,97,101,1)" }}
        >
          ×
        </button>
      </div>
    );
  }

  // Orange "Invalid Prompt" card
  return (
    <div
      className="my-2 flex gap-3 rounded-[12px] p-3"
      style={{ background: "rgba(29,33,37,1)" }}
    >
      <div
        className="flex size-[60px] shrink-0 items-center justify-center rounded-[16px] text-[32px]"
        style={{ background: "#D89C3A" }}
      >
        <span className="text-[32px] leading-none">🥲</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-semibold text-white">Invalid Prompt</p>
        <p className="mt-0.5 text-[12px]" style={{ color: "rgba(93,97,101,1)" }}>
          {job.message && job.message.length > 35 ? job.message.slice(0, 35) + "…" : job.message}
        </p>
        <p className="mt-1.5 text-[13px] font-medium" style={{ color: "rgba(228,230,232,1)" }}>
          {job.errorMessage}
        </p>
        <div className="mt-3 flex gap-2">
          <button
            className="rounded-[8px] px-3 py-1.5 text-[12px] font-semibold text-white"
            style={{ background: "rgba(255,97,0,1)" }}
          >
            Try Again
          </button>
          <button
            onClick={onDismiss}
            className="rounded-[8px] px-3 py-1.5 text-[12px] font-medium"
            style={{ color: "rgba(137,140,146,1)" }}
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Active job row ───────────────────────────────────────────────────────────

function ActiveJobItem({ job }: { job: JobEvent }) {
  const isQueued = job.status === "QUEUED" || job.status === "DISPATCHED";
  const songName = getSongName(job.promptId);

  return (
    <div className="flex items-center gap-3 py-2.5">
      {/* Thumbnail */}
      <div
        className="relative size-[64px] shrink-0 overflow-hidden rounded-[16px]"
        style={{ background: gradientFor(job.promptId) }}
      >
        {/* Pulsing overlay for processing */}
        {!isQueued && (
          <div
            className="absolute inset-0 animate-pulse"
            style={{ background: "rgba(255,255,255,0.05)" }}
          />
        )}
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1 overflow-hidden">
        <p
          className="truncate text-[16px]"
          style={{ color: isQueued ? "rgba(93,97,101,1)" : "rgba(191,194,200,1)" }}
        >
          {job.message ?? songName}
        </p>
        <p className="mt-0.5 text-[14px]" style={{ color: "rgba(93,97,101,1)" }}>
          {isQueued ? "Waiting in queue…" : "Starting AI audio engine"}
        </p>
      </div>
    </div>
  );
}

// ─── Completed job row ────────────────────────────────────────────────────────

function CompletedJobItem({ job }: { job: JobEvent }) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const songName = getSongName(job.promptId);
  const subtitle = job.message
    ? job.message.length > 45 ? job.message.slice(0, 45) + "…" : job.message
    : songName;

  const togglePlay = () => {
    if (!job.audioUrl) return;
    if (!audioRef.current) {
      audioRef.current = new Audio(job.audioUrl);
      audioRef.current.onended = () => setPlaying(false);
    }
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else { audioRef.current.play().catch(() => setPlaying(false)); setPlaying(true); }
  };

  return (
    <div className="flex items-center gap-3 py-2.5">
      {/* Thumbnail with gradient overlay + play icon */}
      <button
        onClick={togglePlay}
        className="relative size-[64px] shrink-0 overflow-hidden rounded-[16px]"
        style={{ background: gradientFor(job.promptId) }}
      >
        {/* Bottom gradient overlay */}
        <div
          className="absolute inset-0 rounded-[16px]"
          style={{ background: "linear-gradient(transparent, rgba(0,0,0,0.75))" }}
        />
        {/* Play / pause icon — always visible */}
        <div className="absolute inset-0 flex items-center justify-center">
          {playing ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="white">
              <rect x="3" y="3" width="5" height="14" rx="1.5" />
              <rect x="12" y="3" width="5" height="14" rx="1.5" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="white">
              <path d="M5 3L17 10L5 17V3Z" />
            </svg>
          )}
        </div>
      </button>

      {/* Text */}
      <div className="min-w-0 flex-1 overflow-hidden">
        <p className="truncate text-[16px]" style={{ color: "rgba(228,230,232,1)" }}>
          {songName}
        </p>
        <p className="mt-0.5 truncate text-[14px]" style={{ color: "rgba(137,140,146,1)" }}>
          {subtitle}
        </p>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-1">
        {/* Three-dot menu */}
        <button
          className="flex size-[32px] items-center justify-center rounded-full transition-colors"
          style={{ color: "rgba(137,140,146,1)" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(48,52,56,1)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="8" cy="3" r="1.5" />
            <circle cx="8" cy="8" r="1.5" />
            <circle cx="8" cy="13" r="1.5" />
          </svg>
        </button>
        {/* Share */}
        <button
          className="flex size-[32px] items-center justify-center rounded-full transition-colors"
          style={{ color: "rgba(137,140,146,1)" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(48,52,56,1)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="13" cy="3" r="1.5" />
            <circle cx="3" cy="8" r="1.5" />
            <circle cx="13" cy="13" r="1.5" />
            <path d="M4.5 7.2L11.5 4M4.5 8.8L11.5 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
