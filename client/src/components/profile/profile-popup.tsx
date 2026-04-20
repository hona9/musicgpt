"use client";

import { useEffect, useRef, useState } from "react";
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
  const [alertVisible, setAlertVisible] = useState(true);
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

  const hasAnyJobs = activeJobs.length > 0 || recentCompleted.length > 0;

  return (
    <div
      ref={popupRef}
      className="absolute right-0 top-11 z-50 w-[320px] overflow-hidden rounded-[14px] border animate-slide-down"
      style={{
        background: "#1a1612",
        borderColor: "#2e2820",
        boxShadow: "0 20px 60px rgba(0,0,0,0.7)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pb-3 pt-4">
        <div className="flex items-center gap-2.5">
          <div
            className="flex size-11 items-center justify-center rounded-full text-[17px] font-bold"
            style={{
              background:
                "linear-gradient(#1a1612, #1a1612) padding-box, linear-gradient(314.53deg, #C800FF, #FF2C9B, #FF7B00, #FF8504, #FFD363) border-box",
              border: "2px solid transparent",
              boxShadow: "0px 4px 32.6px -13px rgba(200,0,255,0.8)",
            }}
          >
            {initial}
          </div>
          <div>
            <p className="text-[14px] font-semibold">{user?.email?.split("@")[0] ?? "User"}</p>
            <p className="text-[12px] text-muted-foreground">@{user?.email?.split("@")[0] ?? "user"}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="#444" />
            <path d="M5.5 5.5L10.5 10.5M10.5 5.5L5.5 10.5" stroke="#666" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Credits row */}
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{ borderTop: "1px solid #2a2218", borderBottom: "1px solid #2a2218" }}
      >
        <div className="flex items-center gap-1.5">
          <span className="text-[14px] font-semibold">0/0 credits</span>
          <span
            className="inline-flex size-3.5 items-center justify-center rounded-full border text-[9px] leading-none"
            style={{ borderColor: "#4a4a4a", color: "#4a4a4a" }}
          >
            i
          </span>
        </div>
        <button className="flex items-center gap-1 text-[12px] text-muted-foreground transition-colors hover:text-foreground">
          Top Up <span className="text-[10px]">›</span>
        </button>
      </div>

      {/* Insufficient credits alert */}
      {alertVisible && (
        <div
          className="mx-3 mt-2.5 flex items-center justify-between gap-2.5 rounded-[10px] border p-3"
          style={{ background: "#2a1e0e", borderColor: "#4a3010" }}
        >
          <div className="flex-1">
            <div className="mb-0.5 flex items-center gap-1.5">
              <span className="text-[12px]">⚠️</span>
              <span className="text-[12px] font-semibold" style={{ color: "#f59e0b" }}>
                Insufficient credits
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">Your credit balance : 0</p>
          </div>
          <button
            className="shrink-0 rounded-lg px-3 py-1.5 text-[11px] font-semibold text-white"
            style={{ background: "#e8820c" }}
          >
            Top Up
          </button>
          <button
            onClick={() => setAlertVisible(false)}
            className="shrink-0 text-[14px] leading-none transition-colors hover:text-foreground"
            style={{ color: "#4a4a4a" }}
          >
            ×
          </button>
        </div>
      )}

      {/* Jobs list — active + completed */}
      {hasAnyJobs && (
        <div className="px-3 py-1">
          {/* Active jobs */}
          {activeJobs.map((job, i) => (
            <ActiveJobItem
              key={job.jobId}
              job={job}
              version={`v${i + 1}`}
              isLast={i === activeJobs.length - 1 && recentCompleted.length === 0}
            />
          ))}

          {/* Completed jobs */}
          {recentCompleted.map((job, i) => (
            <CompletedJobItem
              key={job.jobId}
              job={job}
              isLast={i === recentCompleted.length - 1}
            />
          ))}
        </div>
      )}

      {/* Server busy banner */}
      {activeJobs.some((j) => j.status === "QUEUED" || j.status === "DISPATCHED") && (
        <div
          className="mx-3 mb-2.5 rounded-[10px] border p-2.5"
          style={{ background: "#1e1010", borderColor: "#3a1515" }}
        >
          <div className="mb-0.5 flex items-center gap-1.5">
            <span className="text-[11px]">⚠️</span>
            <span className="text-[12px] font-medium" style={{ color: "#f87171" }}>
              Oops! Server busy.
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">Processing your request.</p>
        </div>
      )}

      {/* Logout */}
      <div style={{ borderTop: "1px solid #2a2218" }} className="px-4 py-3">
        <button
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
          className="w-full rounded-lg py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-[#2a2218] hover:text-foreground disabled:opacity-50"
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

// ─── Active job row ───────────────────────────────────────────────────────────

function ActiveJobItem({ job, version, isLast }: { job: JobEvent; version: string; isLast: boolean }) {
  const [progress, setProgress] = useState(job.progress ?? 0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (job.status !== "PROCESSING") return;
    let p = 0;
    intervalRef.current = setInterval(() => {
      p += 1.4;
      if (p >= 85) { clearInterval(intervalRef.current!); setProgress(85); return; }
      setProgress(p);
    }, 50);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [job.status]);

  const statusText =
    job.status === "QUEUED" || job.status === "DISPATCHED"
      ? "Waiting in queue…"
      : "Processing your audio...";

  return (
    <div
      className="flex items-center gap-2.5 py-2"
      style={{ borderBottom: isLast ? "none" : "1px solid #1f1f1f" }}
    >
      <div
        className="relative size-12 shrink-0 overflow-hidden rounded-lg"
        style={{ background: gradientFor(job.promptId) }}
      >
        <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.45)" }}>
          <span className="text-[13px] font-bold text-white">{Math.round(progress)}%</span>
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[12px]" style={{ color: "#f0f0f0", marginBottom: 3 }}>
          {job.message ?? getSongName(job.promptId)}
        </p>
        <p className="text-[11px] text-muted-foreground">{statusText}</p>
      </div>
      <span
        className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold"
        style={{ background: "#1c1c1c", color: "#7a7a7a", border: "1px solid #2a2a2a" }}
      >
        {version}
      </span>
    </div>
  );
}

// ─── Completed job row ────────────────────────────────────────────────────────

function CompletedJobItem({ job, isLast }: { job: JobEvent; isLast: boolean }) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const songName = getSongName(job.promptId);
  const subtitle = job.message
    ? job.message.length > 40 ? job.message.slice(0, 40) + "…" : job.message
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
    <div
      className="group flex items-center gap-2.5 py-2"
      style={{ borderBottom: isLast ? "none" : "1px solid #1f1f1f" }}
    >
      {/* Thumbnail + play on hover */}
      <button
        onClick={togglePlay}
        className="relative size-12 shrink-0 overflow-hidden rounded-lg"
        style={{ background: gradientFor(job.promptId) }}
      >
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100" style={{ background: "rgba(0,0,0,0.5)" }}>
          {playing ? (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="white">
              <rect x="1" y="1" width="4" height="10" rx="1" />
              <rect x="7" y="1" width="4" height="10" rx="1" />
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="white">
              <path d="M2 1L11 6L2 11V1Z" />
            </svg>
          )}
        </div>
        {/* Completed dot */}
        <div
          className="absolute bottom-1 right-1 size-1.5 rounded-full"
          style={{ background: "#4ade80" }}
        />
      </button>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[12px] font-medium" style={{ color: "#f0f0f0", marginBottom: 3 }}>
          {songName}
        </p>
        <p className="truncate text-[11px] text-muted-foreground">{subtitle}</p>
      </div>

      {/* Checkmark badge */}
      <span
        className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold"
        style={{ background: "#0d2818", color: "#4ade80", border: "1px solid #1a4a2a" }}
      >
        done
      </span>
    </div>
  );
}
