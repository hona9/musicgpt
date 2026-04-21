import { JobStatus } from "../../shared/types/enums";
import { GenerationJobEntity } from "../entities/GenerationJob";

export interface CreateGenerationJobData {
  promptId: string;
  userId: string;
  priority: number;
}

export interface UpdateStatusExtra {
  title?: string;
  audioUrl?: string;
  errorMessage?: string;
}

export interface IGenerationJobRepository {
  create(data: CreateGenerationJobData): Promise<GenerationJobEntity>;
  findQueuedJobs(limit: number): Promise<GenerationJobEntity[]>;
  markManyDispatched(jobIds: string[]): Promise<void>;
  updateStatus(
    jobId: string,
    status: JobStatus,
    extra?: UpdateStatusExtra,
  ): Promise<GenerationJobEntity>;
}
