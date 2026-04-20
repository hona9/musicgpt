"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getSocket } from "@/lib/socket/socket.client";
import { useJobsStore } from "@/store/jobs.store";
import { useAuthStore } from "@/store/auth.store";
import { patchJobInPages } from "@/lib/utils";
import type { JobEvent, JobStatus, InfinitePromptsData } from "@/types/api.types";

const WS_STATUS_MAP: Record<string, JobStatus> = {
  "job:processing": "PROCESSING",
  "job:completed": "COMPLETED",
  "job:failed": "FAILED",
};

function normalize(raw: JobEvent): JobEvent {
  const mapped = WS_STATUS_MAP[raw.status as string];
  return mapped ? { ...raw, status: mapped } : raw;
}

export function useJobUpdates() {
  const qc = useQueryClient();
  const setJobEvent = useJobsStore((s) => s.setJobEvent);
  const removeJob = useJobsStore((s) => s.removeJob);
  const accessToken = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const onProcessing = (raw: JobEvent) => {
      setJobEvent(normalize(raw));
    };

    const onCompleted = (raw: JobEvent) => {
      const event = normalize(raw);
      setJobEvent(event);
      qc.setQueryData<InfinitePromptsData>(["prompts"], (old) =>
        old ? patchJobInPages(old, event) : old,
      );
      setTimeout(() => removeJob(event.jobId), 3000);
    };

    const onFailed = (raw: JobEvent) => {
      const event = normalize(raw);
      setJobEvent(event);
      qc.setQueryData<InfinitePromptsData>(["prompts"], (old) =>
        old ? patchJobInPages(old, event) : old,
      );
    };

    socket.on("job:processing", onProcessing);
    socket.on("job:completed", onCompleted);
    socket.on("job:failed", onFailed);

    return () => {
      socket.off("job:processing", onProcessing);
      socket.off("job:completed", onCompleted);
      socket.off("job:failed", onFailed);
    };
  }, [qc, setJobEvent, removeJob, accessToken]);
}
