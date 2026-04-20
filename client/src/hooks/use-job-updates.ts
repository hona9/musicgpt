"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getSocket } from "@/lib/socket/socket.client";
import { useJobsStore } from "@/store/jobs.store";
import { patchJobInPages } from "@/lib/utils";
import type { JobEvent, InfinitePromptsData } from "@/types/api.types";

export function useJobUpdates() {
  const qc = useQueryClient();
  const setJobEvent = useJobsStore((s) => s.setJobEvent);
  const removeJob = useJobsStore((s) => s.removeJob);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const onProcessing = (event: JobEvent) => {
      setJobEvent(event);
    };

    const onCompleted = (event: JobEvent) => {
      setJobEvent(event);
      qc.setQueryData<InfinitePromptsData>(["prompts"], (old) =>
        old ? patchJobInPages(old, event) : old,
      );
      setTimeout(() => removeJob(event.jobId), 3000);
    };

    const onFailed = (event: JobEvent) => {
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
  }, [qc, setJobEvent, removeJob]);
}
