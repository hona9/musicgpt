"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { useAuthStore } from "@/store/auth.store";
import { useJobsStore, ACTIVE_STATUSES } from "@/store/jobs.store";
import { useLogout } from "@/hooks/use-auth";
import { getSongName } from "@/lib/song-names"; // fallback for jobs that pre-date server-side titles
import type { JobEvent } from "@/types/api.types";

interface ProfilePopupProps {
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLButtonElement | null>;
  closeRef?: React.MutableRefObject<(() => void) | null>;
}

export function ProfilePopup({ onClose, triggerRef, closeRef }: ProfilePopupProps) {
  const user = useAuthStore((s) => s.user);
  const jobs = useJobsStore((s) => s.jobs);
  const recentCompleted = useJobsStore((s) => s.recentCompleted);
  const clearUnread = useJobsStore((s) => s.clearUnread);
  const activeJobs = Object.values(jobs).filter((j) => ACTIVE_STATUSES.includes(j.status));
  const failedJobs = Object.values(jobs).filter((j) => j.status === "FAILED");
  const logout = useLogout();
  const [closing, setClosing] = useState(false);

  useEffect(() => { clearUnread(); }, [clearUnread]);

  const initial = user?.email?.[0]?.toUpperCase() ?? "U";

  const close = useCallback(() => {
    setClosing(true);
    setTimeout(() => onClose(), 150);
  }, [onClose]);

  useEffect(() => {
    if (closeRef) closeRef.current = close;
  }, [close, closeRef]);

  const popupRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (triggerRef?.current?.contains(e.target as Node)) return;
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        close();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [close, triggerRef]);

  const hasAnyJobs = activeJobs.length > 0 || failedJobs.length > 0 || recentCompleted.length > 0;

  return (
    <div
      ref={popupRef}
      className={`absolute right-0 top-[68px] z-50 flex h-[639px] w-[min(400px,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-[20px] border ${closing ? "animate-popup-close" : "animate-popup-open"}`}
      style={{
        background: "#16191C",
        border: "1px solid #1D2125",
        boxShadow: "0px 0px 24px 0px #0000007A",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-5 pb-3">
        <div className="flex items-center gap-3">
          {/* Avatar — initial with gradient ring */}
          <div
            className="shrink-0 rounded-full p-[3px]"
            style={{
              background: "linear-gradient(314.53deg, #C800FF 17.23%, #FF2C9B 38.51%, #FF7B00 66.07%, #FF8504 78.98%, #FFD363 87%)",
              boxShadow: "0px 4px 32.6px -13px rgba(200,0,255,0.8)",
            }}
          >
            <div
              className="flex size-[54px] items-center justify-center rounded-full text-[20px] font-medium text-white"
              style={{ background: "rgb(22,25,28)" }}
            >
              {initial}
            </div>
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
          className="rounded-md p-1 transition-colors"
          style={{ color: "rgba(119,122,128,1)" }}
        >
          <Image src="/icons/Settings icon 1.svg" width={18} height={20} alt="Settings" />
        </button>
      </div>

      {/* Credits card */}
      <div className="mx-4 mb-3">
        <div
          className="flex h-[50px] w-[368px] max-w-full items-center justify-between rounded-[12px] p-4"
          style={{ background: "#212529" }}
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

      {/* Jobs list / empty state */}
      <div className="flex-1 overflow-y-auto">
        {hasAnyJobs ? (
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
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2">
            <p className="text-[14px] font-medium" style={{ color: "rgba(93,97,101,1)" }}>No activity yet</p>
            <p className="text-[12px]" style={{ color: "rgba(60,63,67,1)" }}>Your generated songs will appear here</p>
          </div>
        )}
      </div>

      {/* Divider */}
      <div style={{ borderTop: "1px solid rgba(48,52,56,1)" }} />

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

const PROCESSING_DURATION_MS = 9_000;
const EASE_OUT_CUBIC = (t: number) => 1 - Math.pow(1 - t, 3);
const THUMBNAIL_BG = "radial-gradient(806.32% 145.65% at 94.2% 0%, rgba(255,98,0,0.5) 0%, rgba(170,0,255,0.3) 30.42%, rgba(0,0,0,0) 100%), radial-gradient(227.54% 59.42% at 42.03% 86.23%, rgba(255,98,0,0.5) 0%, rgba(170,0,255,0.3) 30.42%, rgba(0,0,0,0) 100%), url(/images/image.jpg) center / cover";
const RING_BG = "radial-gradient(806.32% 145.65% at 94.2% 0%, #FF6200 0%, rgba(170,0,255,0.5) 30.42%, rgba(0,0,0,0) 100%), radial-gradient(227.54% 59.42% at 42.03% 86.23%, #FF6200 0%, rgba(170,0,255,0.5) 30.42%, rgba(0,0,0,0) 100%)";

function ActiveJobItem({ job }: { job: JobEvent }) {
  const isQueued = job.status === "QUEUED" || job.status === "DISPATCHED";
  const isProcessing = job.status === "PROCESSING";

  // Start at 4% immediately so it feels responsive
  const [pct, setPct] = useState(isProcessing ? 4 : 0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  const tick = useCallback(() => {
    if (!startRef.current) startRef.current = Date.now();
    const elapsed = Date.now() - startRef.current;
    const raw = Math.min(1, elapsed / PROCESSING_DURATION_MS);
    const next = Math.round(4 + EASE_OUT_CUBIC(raw) * 84); // 4% → 88%
    setPct(Math.min(next, 88));
    if (next < 88) rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    if (!isProcessing) return;
    startRef.current = null;
    setPct(4);
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [isProcessing, tick]);

  return (
    <div
      className="flex h-[80px] w-full items-center rounded-[12px] p-[8px] gap-[10.11px] overflow-hidden"
      style={{
        background: isProcessing
          ? `linear-gradient(90deg, #1D2125 ${pct}%, #16191C ${pct}%)`
          : "#16191C",
        transition: "background 0.4s ease",
      }}
    >
      {/* Thumbnail */}
      <div className="shrink-0 rounded-[17px] p-px" style={{ background: RING_BG }}>
        <div
          className="relative flex size-[62px] items-center justify-center overflow-hidden rounded-[16px]"
          style={{ background: THUMBNAIL_BG }}
        >
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.45)" }} />
          {isProcessing ? (
            <span className="relative text-[12px] font-medium text-white" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}>
              {pct}%
            </span>
          ) : (
            <div className="relative flex items-center gap-[3px]">
              {[0, 1, 2].map((i) => (
                <div key={i} className="size-[4px] rounded-full bg-white"
                  style={{ animation: `pulse-opacity 1.2s ease-in-out ${i * 0.2}s infinite` }} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1 overflow-hidden">
        <p className="truncate text-[11.79px] font-normal leading-[1] tracking-[0]" style={{ color: "rgba(191,194,200,1)" }}>
          {job.message ?? ""}
        </p>
        <p className="mt-1 text-[11.79px] font-normal leading-[1] tracking-[0]" style={{ color: "rgba(93,97,101,1)" }}>
          {isQueued ? "In queue…" : "Generating"}
        </p>
      </div>
    </div>
  );
}

// ─── Completed job row ────────────────────────────────────────────────────────

function CompletedJobItem({ job }: { job: JobEvent }) {
  const [playing, setPlaying] = useState(false);
  const [hovered, setHovered] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const songName = job.title ?? getSongName(job.promptId);
  const subtitle = job.message ?? "";

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
      className="relative flex h-[80px] w-full items-center rounded-[12px] p-[8px] gap-[10.11px] overflow-hidden"
      style={{ background: "#16191C" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Hover glow — scales from center */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[12px]"
        style={{
          background: "rgba(255,255,255,0.07)",
          opacity: hovered ? 1 : 0,
          transform: hovered ? "scale(1)" : "scale(0.88)",
          transition: "opacity 0.2s ease, transform 0.2s ease",
          transformOrigin: "center",
        }}
      />
      {/* Thumbnail — overlay always present, play button appears on hover */}
      <button
        onClick={togglePlay}
        className="relative size-[62px] shrink-0 overflow-hidden rounded-[16px]"
        style={{ background: gradientFor(job.promptId) }}
      >
        {/* Persistent dark overlay */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(transparent 30%, rgba(0,0,0,0.6))" }} />
        {/* Play button — hover only */}
        {(hovered || playing) && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.3)" }}>
            <div
              className="flex size-[28px] items-center justify-center rounded-full"
              style={{ background: "rgba(255,255,255,0.2)" }}
            >
              {playing ? (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="white">
                  <rect x="1" y="1" width="4" height="10" rx="1" />
                  <rect x="7" y="1" width="4" height="10" rx="1" />
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="white">
                  <path d="M3 2L10 6L3 10V2Z" />
                </svg>
              )}
            </div>
          </div>
        )}
      </button>

      {/* Text */}
      <div className="min-w-0 flex-1 overflow-hidden">
        <p className="truncate text-[11.79px] font-normal leading-[1] tracking-[0]" style={{ color: "rgba(228,230,232,1)" }}>
          {songName}
        </p>
        <p className="mt-1 truncate text-[11.79px] font-normal leading-[1] tracking-[0]" style={{ color: "rgba(137,140,146,1)" }}>
          {subtitle}
        </p>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-1">
        {/* Hover-only actions */}
        {hovered && (
          <>
            {/* Like — Thumbs.svg rotated 180° */}
            <button className="flex size-[28px] items-center justify-center rounded-full transition-colors hover:bg-[rgba(48,52,56,1)]">
              <Image src="/icons/Thumbs.svg" width={14} height={14} alt="Like" style={{ transform: "rotate(180deg)" }} />
            </button>
            {/* Dislike — Thumbs.svg as-is */}
            <button className="flex size-[28px] items-center justify-center rounded-full transition-colors hover:bg-[rgba(48,52,56,1)]">
              <Image src="/icons/Thumbs.svg" width={14} height={14} alt="Dislike" />
            </button>
            {/* Download */}
            <button className="flex size-[28px] items-center justify-center rounded-full transition-colors hover:bg-[rgba(48,52,56,1)]" style={{ color: "rgba(137,140,146,1)" }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 2V11M4 8L8 12L12 8" /><path d="M2 14H14" />
              </svg>
            </button>
          </>
        )}

        {/* Three-dot menu — rotated 90° (horizontal dots), always visible */}
        <button
          className="flex size-[28px] items-center justify-center rounded-full transition-colors hover:bg-[rgba(48,52,56,1)]"
          style={{ color: "rgba(137,140,146,1)" }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style={{ transform: "rotate(90deg)" }}>
            <circle cx="8" cy="3" r="1.5" />
            <circle cx="8" cy="8" r="1.5" />
            <circle cx="8" cy="13" r="1.5" />
          </svg>
        </button>
      </div>
    </div>
  );
}
