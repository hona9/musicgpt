import { create } from "zustand";
import type { JobEvent, JobStatus } from "@/types/api.types";

const ACTIVE_STATUSES: JobStatus[] = ["QUEUED", "DISPATCHED", "PROCESSING"];

interface JobsState {
  jobs: Record<string, JobEvent>;
  setJobEvent: (event: JobEvent) => void;
  removeJob: (jobId: string) => void;
  activeJobs: () => JobEvent[];
}

export const useJobsStore = create<JobsState>()((set, get) => ({
  jobs: {},

  setJobEvent: (event) =>
    set((s) => ({ jobs: { ...s.jobs, [event.jobId]: event } })),

  removeJob: (jobId) =>
    set((s) => {
      const { [jobId]: _, ...rest } = s.jobs;
      return { jobs: rest };
    }),

  activeJobs: () =>
    Object.values(get().jobs).filter((j) =>
      ACTIVE_STATUSES.includes(j.status),
    ),
}));
