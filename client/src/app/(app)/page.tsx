"use client";

import { useState, useCallback } from "react";
import { PromptBox } from "@/components/home/prompt-box";
import { RecentStrip } from "@/components/home/recent-strip";
import { ProfilePopup } from "@/components/profile/profile-popup";
import { useCreatePrompt } from "@/hooks/use-prompts";
import { useJobsStore } from "@/store/jobs.store";
import { useAuthStore } from "@/store/auth.store";

export default function HomePage() {
  const [promptText, setPromptText] = useState("");
  const [showProfile, setShowProfile] = useState(false);

  const user = useAuthStore((s) => s.user);
  const setJobEvent = useJobsStore((s) => s.setJobEvent);
  const activeJobs = useJobsStore((s) => s.activeJobs)();
  const createPrompt = useCreatePrompt();

  const initial = user?.email?.[0]?.toUpperCase() ?? "U";

  const handleSubmit = useCallback(async () => {
    if (!promptText.trim() || createPrompt.isPending) return;
    const text = promptText.trim();
    try {
      const result = await createPrompt.mutateAsync(text);
      setJobEvent({ jobId: result.jobId, promptId: result.promptId, status: "QUEUED", message: text });
      setPromptText("");
      setShowProfile(true);
    } catch {
      // error surfaced via createPrompt.error below
    }
  }, [promptText, createPrompt, setJobEvent]);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Topbar */}
      <div
        className="flex h-12 shrink-0 items-center justify-end px-5"
        style={{ borderBottom: "1px solid #1f1f1f" }}
      >
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
                background: "conic-gradient(#e8820c, #f59e0b, transparent 70%, #e8820c)",
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
            {/* Active jobs badge */}
            {activeJobs.length > 0 && (
              <div
                className="absolute -right-0.5 -top-0.5 z-10 flex size-3.5 items-center justify-center rounded-full text-[8px] font-bold text-white"
                style={{ background: "#3b82f6", border: "2px solid #0c0c0c" }}
              >
                {activeJobs.length}
              </div>
            )}
          </button>

          {showProfile && (
            <ProfilePopup onClose={() => setShowProfile(false)} />
          )}
        </div>
      </div>

      {/* Main content — always the empty/prompt state */}
      <div className="flex flex-1 flex-col overflow-hidden">
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
                ?.response?.data?.message ?? "Failed to submit. Please try again."}
            </p>
          )}
        </div>

        <RecentStrip />
      </div>
    </div>
  );
}
