"use client";

import { useState, useEffect, useCallback } from "react";
import { PromptBox } from "@/components/home/prompt-box";
import { GeneratingView } from "@/components/home/generating-view";
import { CompleteView } from "@/components/home/complete-view";
import { RecentStrip } from "@/components/home/recent-strip";
import { ProfilePopup } from "@/components/profile/profile-popup";
import { useCreatePrompt } from "@/hooks/use-prompts";
import { useJobsStore } from "@/store/jobs.store";
import { useAuthStore } from "@/store/auth.store";

type AppState = "empty" | "generating" | "complete";

interface ActiveJob {
  promptId: string;
  jobId: string;
  promptText: string;
}

interface CompletedTrack {
  promptId: string;
  jobId: string;
  audioUrl: string | null;
  promptText: string;
}

export default function HomePage() {
  const [appState, setAppState] = useState<AppState>("empty");
  const [promptText, setPromptText] = useState("");
  const [activeJob, setActiveJob] = useState<ActiveJob | null>(null);
  const [completedTrack, setCompletedTrack] = useState<CompletedTrack | null>(null);
  const [genProgress, setGenProgress] = useState(0);
  const [showProfile, setShowProfile] = useState(false);

  const jobs = useJobsStore((s) => s.jobs);
  const user = useAuthStore((s) => s.user);
  const createPrompt = useCreatePrompt();

  const initial = user?.email?.[0]?.toUpperCase() ?? "U";

  // Simulate progress from 0 → 85%, then hold until socket fires
  useEffect(() => {
    if (appState !== "generating") return;
    setGenProgress(0);
    let p = 0;
    const iv = setInterval(() => {
      p += 1.4;
      if (p >= 85) {
        clearInterval(iv);
        setGenProgress(85);
        return;
      }
      setGenProgress(p);
    }, 50);
    return () => clearInterval(iv);
  }, [appState]);

  // Watch for job completion via socket events in jobs store
  useEffect(() => {
    if (!activeJob || appState !== "generating") return;
    const job = jobs[activeJob.jobId];
    if (!job) return;

    if (job.status === "COMPLETED") {
      // Animate to 100% then transition
      setGenProgress(100);
      setTimeout(() => {
        setCompletedTrack({
          promptId: activeJob.promptId,
          jobId: activeJob.jobId,
          audioUrl: job.audioUrl ?? null,
          promptText: activeJob.promptText,
        });
        setAppState("complete");
      }, 400);
    } else if (job.status === "FAILED") {
      setAppState("empty");
      setActiveJob(null);
    }
  }, [jobs, activeJob, appState]);

  const handleSubmit = useCallback(async () => {
    if (!promptText.trim() || createPrompt.isPending) return;
    try {
      const result = await createPrompt.mutateAsync(promptText.trim());
      setActiveJob({
        promptId: result.promptId,
        jobId: result.jobId,
        promptText: promptText.trim(),
      });
      setAppState("generating");
    } catch {
      // Error handled by API client (shows 429 or auth errors)
    }
  }, [promptText, createPrompt]);

  const handleNewPrompt = useCallback(() => {
    setAppState("empty");
    setPromptText("");
    setActiveJob(null);
    setCompletedTrack(null);
    setGenProgress(0);
  }, []);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Topbar */}
      <div
        className="flex h-12 shrink-0 items-center justify-end px-5"
        style={{ borderBottom: "1px solid #1f1f1f" }}
      >
        {/* Avatar */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowProfile((p) => !p);
            }}
            className="relative flex size-9 items-center justify-center"
          >
            {/* Spinning ring */}
            <div
              className="absolute inset-[-2px] rounded-full"
              style={{
                background:
                  "conic-gradient(#e8820c, #f59e0b, transparent 70%, #e8820c)",
                animation: "spin-ring 4s linear infinite",
              }}
            />
            {/* Inner circle */}
            <div
              className="absolute inset-[1px] flex items-center justify-center rounded-full text-[14px] font-bold"
              style={{ background: "#2a2a2a" }}
            >
              {initial}
            </div>
            {/* Notification badge */}
            <div
              className="absolute -right-0.5 -top-0.5 z-10 flex size-3.5 items-center justify-center rounded-full text-[8px] font-bold text-white"
              style={{
                background: "#3b82f6",
                border: "2px solid #0c0c0c",
              }}
            >
              2
            </div>
          </button>

          {showProfile && (
            <ProfilePopup onClose={() => setShowProfile(false)} />
          )}
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* ── Empty State ── */}
        {appState === "empty" && (
          <div className="flex flex-1 flex-col items-center justify-center px-10 animate-fade-up">
            <h1
              className="mb-8 text-center text-[36px] font-bold"
              style={{ letterSpacing: "-0.025em" }}
            >
              What Song to Create?
            </h1>
            <PromptBox
              value={promptText}
              onChange={setPromptText}
              onSubmit={handleSubmit}
              isLoading={createPrompt.isPending}
            />
            {createPrompt.error && (
              <p className="mt-3 text-[12px]" style={{ color: "#f87171" }}>
                {(createPrompt.error as { response?: { data?: { message?: string } } })
                  ?.response?.data?.message ??
                  "Failed to submit. Please try again."}
              </p>
            )}
          </div>
        )}

        {/* ── Generating State ── */}
        {appState === "generating" && (
          <GeneratingView prompt={promptText} progress={genProgress} />
        )}

        {/* ── Complete State ── */}
        {appState === "complete" && completedTrack && (
          <CompleteView track={completedTrack} onNewPrompt={handleNewPrompt} />
        )}

        {/* Recent generations strip — always visible in empty state */}
        {appState === "empty" && <RecentStrip />}
      </div>
    </div>
  );
}
