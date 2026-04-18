import { Queue, QueueEvents } from "bullmq";
import { env } from "../../config/env";
import { PromptJobData } from "../../shared/types/queue.types";


export const PROMPT_QUEUE_NAME = "prompt-generation";

const connection = { url: env.redis_url };

// Queue used by the application layer to enqueue jobs.
export const promptQueue = new Queue<PromptJobData>(PROMPT_QUEUE_NAME, {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 200 },
  },
});

// QueueEvents allows listening for job lifecycle events (used by WebSocket layer).
export const promptQueueEvents = new QueueEvents(PROMPT_QUEUE_NAME, {
  connection,
});
