import { Worker, Job } from "bullmq";
import { env } from "../../config/env";
import { promptQueue, PROMPT_QUEUE_NAME } from "./prompt.queue";
import { PromptJobData } from "../../shared/types/queue.types";
import { GenerationJobRepository } from "../repositories/GenerationJobRepository";
import { NotificationRepository } from "../repositories/NotificationRepository";
import { socketIOService } from "../services/SocketIOService";
import { JobStatus } from "../../shared/types/enums";

const generationJobRepository = new GenerationJobRepository();
const notificationRepository = new NotificationRepository();

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ─── Generation Worker ────────────────────────────────────────────────────────

async function processGenerationJob(job: Job<PromptJobData>): Promise<void> {
  // job.id equals GenerationJob.id — set explicitly by the scheduler when dispatching.
  const generationJobId = job.id!;
  const { promptId, userId } = job.data;

  await generationJobRepository.updateStatus(generationJobId, JobStatus.PROCESSING);
  socketIOService.emitToUser(userId, { jobId: generationJobId, promptId, userId, status: "job:processing" });

  await delay(5000 + Math.random() * 5000);

  const audioUrl = `https://cdn.musicgpt.fake/audio/${promptId}.mp3`;
  await generationJobRepository.updateStatus(generationJobId, JobStatus.COMPLETED, { audioUrl });

  socketIOService.emitToUser(userId, { jobId: generationJobId, promptId, userId, status: "job:completed", audioUrl });

  await notificationRepository.create(userId, promptId, "Your track is ready!");
}

export function startPromptWorker(): void {
  const worker = new Worker<PromptJobData>(
    PROMPT_QUEUE_NAME,
    processGenerationJob,
    {
      connection: { url: env.redis_url },
      concurrency: 5,
    },
  );

  worker.on("failed", async (job, err) => {
    if (!job) return;
    const isLastAttempt = job.attemptsMade >= (job.opts.attempts ?? 1);
    if (!isLastAttempt) return;

    const generationJobId = job.id!;
    const { promptId, userId } = job.data;

    await generationJobRepository.updateStatus(generationJobId, JobStatus.FAILED, {
      errorMessage: err.message,
    });

    socketIOService.emitToUser(userId, {
      jobId: generationJobId,
      promptId,
      userId,
      status: "job:failed",
      errorMessage: err.message,
    });
  });
}

// ─── Scheduler ───────────────────────────────────────────────────────────────

async function runSchedulerTick(): Promise<void> {
  const jobs = await generationJobRepository.findQueuedJobs(50);
  if (jobs.length === 0) return;

  await generationJobRepository.markManyDispatched(jobs.map((j) => j.id));

  for (const job of jobs) {
    await promptQueue.add(
      "generate",
      { promptId: job.promptId, userId: job.userId, text: "" },
      {
        priority: job.priority,
        jobId: job.id,
      },
    );
  }
}

export function startScheduler(): void {
  setInterval(() => {
    runSchedulerTick().catch((err) => {
      console.error("[scheduler] tick failed:", err);
    });
  }, 5000);
}
