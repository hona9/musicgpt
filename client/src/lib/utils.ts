import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { InfinitePromptsData, JobEvent } from "@/types/api.types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function patchJobInPages(
  data: InfinitePromptsData,
  event: JobEvent,
): InfinitePromptsData {
  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      prompts: page.prompts.map((p) =>
        p.job?.id === event.jobId || p.id === event.promptId
          ? {
              ...p,
              job: p.job
                ? {
                    ...p.job,
                    status: event.status,
                    audioUrl: event.audioUrl ?? p.job.audioUrl,
                    errorMessage: event.errorMessage ?? p.job.errorMessage,
                  }
                : null,
            }
          : p,
      ),
    })),
  }
}
