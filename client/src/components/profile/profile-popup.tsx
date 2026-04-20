"use client";

import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useJobsStore } from "@/store/jobs.store";
import { useLogout } from "@/hooks/use-auth";
import type { JobEvent } from "@/types/api.types";

interface ProfilePopupProps {
  onClose: () => void;
}

export function ProfilePopup({ onClose }: ProfilePopupProps) {
  const user = useAuthStore((s) => s.user);
  const activeJobs = useJobsStore((s) => s.activeJobs)();
  const [alertVisible, setAlertVisible] = useState(true);
  const logout = useLogout();

  const initial = user?.email?.[0]?.toUpperCase() ?? "U";

  // Close on outside click
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
          {/* Avatar with spinning ring */}
          <div className="relative size-11">
            <div
              className="absolute inset-[-2px] rounded-full"
              style={{
                background: "conic-gradient(#e8820c, #f59e0b, transparent, #e8820c)",
                animation: "spin-ring 4s linear infinite",
              }}
            />
            <div
              className="absolute inset-[1px] flex items-center justify-center rounded-full text-[17px] font-bold"
              style={{ background: "#1a1612" }}
            >
              {initial}
            </div>
          </div>
          <div>
            <p className="text-[14px] font-semibold">
              {user?.email?.split("@")[0] ?? "User"}
            </p>
            <p className="text-[12px] text-muted-foreground">
              @{user?.email?.split("@")[0] ?? "user"}
            </p>
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
        <button
          className="flex items-center gap-1 text-[12px] text-muted-foreground transition-colors hover:text-foreground"
        >
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
            <p className="text-[11px] text-muted-foreground">
              Your credit balance : 0
            </p>
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

      {/* Active jobs list */}
      {activeJobs.length > 0 && (
        <div className="px-3 py-1">
          {activeJobs.map((job, i) => (
            <JobItem
              key={job.jobId}
              job={job}
              version={`v${i + 1}`}
              isLast={i === activeJobs.length - 1}
            />
          ))}
        </div>
      )}

      {/* Server busy error (static, shown when queue is active) */}
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
          <p className="text-[11px] text-muted-foreground">
            Processing your request.{" "}
            <span
              className="cursor-pointer underline"
              style={{ color: "#e8820c" }}
            >
              Retry
            </span>
          </p>
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

const JOB_GRADIENTS = [
  "linear-gradient(135deg, #1a1a3e, #3a1a5c)",
  "linear-gradient(135deg, #3e1a1a, #5c1a3a)",
  "linear-gradient(135deg, #1a3e1a, #1a5c3a)",
];

function JobItem({
  job,
  version,
  isLast,
}: {
  job: JobEvent;
  version: string;
  isLast: boolean;
}) {
  const [progress, setProgress] = useState(job.progress ?? 0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (job.status !== "PROCESSING") return;
    let p = 0;
    intervalRef.current = setInterval(() => {
      p += 1.4;
      if (p >= 85) {
        clearInterval(intervalRef.current!);
        setProgress(85);
        return;
      }
      setProgress(p);
    }, 50);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [job.status]);

  const displayProgress = Math.round(progress);

  const statusText =
    job.status === "QUEUED" || job.status === "DISPATCHED"
      ? "Waiting in queue…"
      : job.status === "PROCESSING"
      ? "Processing your audio..."
      : job.message ?? job.status;

  return (
    <div
      className="flex items-center gap-2.5 py-2"
      style={{ borderBottom: isLast ? "none" : "1px solid #1f1f1f" }}
    >
      {/* Thumbnail with progress */}
      <div
        className="relative size-12 shrink-0 overflow-hidden rounded-lg"
        style={{ background: JOB_GRADIENTS[0] }}
      >
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.45)" }}
        >
          <span className="text-[13px] font-bold text-white">{displayProgress}%</span>
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <p
          className="truncate text-[12px]"
          style={{ color: "#f0f0f0", marginBottom: 3 }}
        >
          {job.message ?? `Job ${job.jobId.slice(0, 8)}`}
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
