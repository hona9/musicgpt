import { prisma } from "../database/prisma.client";
import {
  IGenerationJobRepository,
  CreateGenerationJobData,
  UpdateStatusExtra,
} from "../../domain/repositories/IGenerationJobRepository";
import { GenerationJobEntity } from "../../domain/entities/GenerationJob";
import { JobStatus } from "../../shared/types/enums";

export class GenerationJobRepository implements IGenerationJobRepository {
  async create(data: CreateGenerationJobData): Promise<GenerationJobEntity> {
    const job = await prisma.generationJob.create({ data });
    return this.toEntity(job);
  }

  async findQueuedJobs(limit: number): Promise<GenerationJobEntity[]> {
    const jobs = await prisma.generationJob.findMany({
      where: { status: JobStatus.QUEUED },
      orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
      take: limit,
    });
    return jobs.map(this.toEntity);
  }

  async markManyDispatched(jobIds: string[]): Promise<void> {
    await prisma.generationJob.updateMany({
      where: { id: { in: jobIds } },
      data: { status: JobStatus.DISPATCHED },
    });
  }

  async updateStatus(
    jobId: string,
    status: JobStatus,
    extra?: UpdateStatusExtra,
  ): Promise<GenerationJobEntity> {
    const job = await prisma.generationJob.update({
      where: { id: jobId },
      data: { status, ...extra },
    });
    return this.toEntity(job);
  }

  private toEntity(job: {
    id: string;
    promptId: string;
    userId: string;
    status: JobStatus;
    priority: number;
    title: string | null;
    audioUrl: string | null;
    errorMessage: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): GenerationJobEntity {
    return {
      id: job.id,
      promptId: job.promptId,
      userId: job.userId,
      status: job.status,
      priority: job.priority,
      title: job.title,
      audioUrl: job.audioUrl,
      errorMessage: job.errorMessage,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    };
  }
}
