import { create } from "zustand";
import type { JobEvent, JobStatus } from "@/types/api.types";

export const ACTIVE_STATUSES: JobStatus[] = ["QUEUED", "DISPATCHED", "PROCESSING"];

const MAX_RECENT_COMPLETED = 5;

interface JobsState {
  jobs: Record<string, JobEvent>;
  recentCompleted: JobEvent[];
  unreadCount: number;

  setJobEvent: (event: JobEvent) => void;
  removeJob: (jobId: string) => void;
  addRecentCompleted: (event: JobEvent) => void;
  incrementUnread: () => void;
  clearUnread: () => void;
}

export const useJobsStore = create<JobsState>()((set) => ({
  jobs: {},
  recentCompleted: [],
  unreadCount: 0,

  setJobEvent: (event) =>
    set((s) => ({ jobs: { ...s.jobs, [event.jobId]: { ...s.jobs[event.jobId], ...event } } })),

  removeJob: (jobId) =>
    set((s) => {
      const { [jobId]: _, ...rest } = s.jobs;
      return { jobs: rest };
    }),

  addRecentCompleted: (event) =>
    set((s) => {
      const merged = { ...s.jobs[event.jobId], ...event };
      return {
        recentCompleted: [merged, ...s.recentCompleted.filter((j) => j.jobId !== event.jobId)]
          .slice(0, MAX_RECENT_COMPLETED),
      };
    }),

  incrementUnread: () => set((s) => ({ unreadCount: s.unreadCount + 1 })),
  clearUnread: () => set({ unreadCount: 0 }),
}));
