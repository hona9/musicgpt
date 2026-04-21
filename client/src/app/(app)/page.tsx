"use client";

import { useState, useCallback } from "react";
import { PromptBox } from "@/components/home/prompt-box";
import { RecentStrip } from "@/components/home/recent-strip";
import { ProfilePopup } from "@/components/profile/profile-popup";
import { useCreatePrompt } from "@/hooks/use-prompts";
import { useJobsStore, ACTIVE_STATUSES } from "@/store/jobs.store";
import { useAuthStore } from "@/store/auth.store";

export default function HomePage() {
  const [promptText, setPromptText] = useState("");
  const [showProfile, setShowProfile] = useState(false);

  const user = useAuthStore((s) => s.user);
  const setJobEvent = useJobsStore((s) => s.setJobEvent);
  const removeJob = useJobsStore((s) => s.removeJob);
  const jobs = useJobsStore((s) => s.jobs);
  const unreadCount = useJobsStore((s) => s.unreadCount);
  const activeJobs = Object.values(jobs).filter((j) => ACTIVE_STATUSES.includes(j.status));
  const createPrompt = useCreatePrompt();

  const initial = user?.email?.[0]?.toUpperCase() ?? "U";

  const handleSubmit = useCallback(async () => {
    if (!promptText.trim() || createPrompt.isPending) return;
    const text = promptText.trim();

    // ── Test simulations ──────────────────────────────────────────────────────
    if (text === "error") {
      const jobId = `sim-error-${Date.now()}`;
      const promptId = `sim-prompt-${Date.now()}`;
      setJobEvent({ jobId, promptId, status: "QUEUED", message: text });
      setPromptText("");
      setShowProfile(true);
      setTimeout(() => setJobEvent({ jobId, promptId, status: "PROCESSING", message: text }), 1200);
      setTimeout(() => setJobEvent({ jobId, promptId, status: "FAILED", message: text, errorMessage: "An unexpected server error occurred. Please try again." }), 3500);
      return;
    }
    if (text === "invalid") {
      const jobId = `sim-invalid-${Date.now()}`;
      const promptId = `sim-prompt-${Date.now()}`;
      setJobEvent({ jobId, promptId, status: "FAILED", message: text, errorMessage: "Your prompt does not seem to be valid. Please provide a prompt related to song creation, remixing, covers, or similar music tasks." });
      setPromptText("");
      setShowProfile(true);
      return;
    }
    // ─────────────────────────────────────────────────────────────────────────

    // Seed immediately so the popup shows the pulsating row right away
    const tempId = `temp-${Date.now()}`;
    setJobEvent({ jobId: tempId, promptId: tempId, status: "QUEUED", message: text });
    setPromptText("");
    setShowProfile(true);

    try {
      const result = await createPrompt.mutateAsync(text);
      removeJob(tempId);
      setJobEvent({ jobId: result.jobId, promptId: result.promptId, status: "QUEUED", message: text });
    } catch (err) {
      const apiMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? "Failed to submit. Please try again.";
      setJobEvent({ jobId: tempId, promptId: tempId, status: "FAILED", message: text, errorMessage: apiMessage });
    }
  }, [promptText, createPrompt, setJobEvent, removeJob]);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Topbar */}
      <div
        className="flex h-12 shrink-0 items-center justify-end px-5"
        style={{  }}
      >
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowProfile((p) => !p);
            }}
            className="relative flex size-9 items-center justify-center rounded-full text-[14px] font-bold"
            style={{
              background:
                "linear-gradient(#2a2a2a, #2a2a2a) padding-box, linear-gradient(314.53deg, #C800FF, #FF2C9B, #FF7B00, #FF8504, #FFD363) border-box",
              border: "2px solid transparent",
              boxShadow: "0px 4px 32.6px -13px rgba(200,0,255,0.8)",
            }}
          >
            {initial}
            {/* Badge: active jobs or unread notifications */}
            {(activeJobs.length > 0 || unreadCount > 0) && (
              <div
                className="absolute -right-[2px] -top-[2px] z-10 flex size-4 items-center justify-center rounded-full text-[8px] font-bold"
                style={{ background: "#6BFFAC", color: "#0c0c0c" }}
              >
                {activeJobs.length > 0 ? activeJobs.length : unreadCount}
              </div>
            )}
          </button>

          {showProfile && (
            <ProfilePopup onClose={() => setShowProfile(false)} />
          )}
        </div>
      </div>

      {/* Main content — always the empty/prompt state */}
      <div className="flex flex-1 flex-col overflow-y-auto">
        {/* Centered column capped at 1240px */}
        <div className="mx-auto flex w-full max-w-[1240px] flex-1 flex-col">
          {/* Prompt area — vertically centered */}
          <div className="flex min-h-[81vh] flex-col items-center justify-center py-10 animate-fade-up">
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
          </div>

          {/* Recent generations — flows below prompt area */}
          <div>
            <RecentStrip />
          </div>
        </div>
      </div>
    </div>
  );
}
