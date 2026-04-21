import { prisma } from "../database/prisma.client";
import {
  IPromptRepository,
  CreatePromptData,
} from "../../domain/repositories/IPromptRepository";
import { PromptEntity } from "../../domain/entities/Prompt";
import { PromptWithJobEntity } from "../../domain/entities/PromptWithJob";
import { GenerationJobEntity } from "../../domain/entities/GenerationJob";
import { JobStatus } from "../../shared/types/enums";
import { CursorData, PageResult } from "../../shared/types/pagination.types";
import { encodeCursor } from "../../shared/utils/cursor";

export class PromptRepository implements IPromptRepository {
  async create(data: CreatePromptData): Promise<PromptEntity> {
    const prompt = await prisma.prompt.create({ data });
    return this.toEntity(prompt);
  }

  async findById(id: string): Promise<PromptEntity | null> {
    const prompt = await prisma.prompt.findUnique({ where: { id } });
    return prompt ? this.toEntity(prompt) : null;
  }

  async findByUserId(
    userId: string,
    cursor: CursorData | null,
    limit: number,
  ): Promise<PageResult<PromptWithJobEntity>> {
    const rows = await prisma.prompt.findMany({
      where: {
        userId,
        ...(cursor
          ? {
              OR: [
                { createdAt: { lt: cursor.createdAt } },
                { createdAt: { equals: cursor.createdAt }, id: { lt: cursor.id } },
              ],
            }
          : {}),
      },
      include: { job: true },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit + 1,
    });

    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore
      ? encodeCursor(items[items.length - 1].id, items[items.length - 1].createdAt)
      : null;

    return {
      items: items.map((r) => this.toEntityWithJob(r)),
      nextCursor,
    };
  }

  private toEntity(prompt: { id: string; userId: string; text: string; createdAt: Date }): PromptEntity {
    return {
      id: prompt.id,
      userId: prompt.userId,
      text: prompt.text,
      createdAt: prompt.createdAt,
    };
  }

  private toEntityWithJob(row: {
    id: string;
    userId: string;
    text: string;
    createdAt: Date;
    job: {
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
    } | null;
  }): PromptWithJobEntity {
    const job: GenerationJobEntity | null = row.job
      ? {
          id: row.job.id,
          promptId: row.job.promptId,
          userId: row.job.userId,
          status: row.job.status,
          priority: row.job.priority,
          title: row.job.title,
          audioUrl: row.job.audioUrl,
          errorMessage: row.job.errorMessage,
          createdAt: row.job.createdAt,
          updatedAt: row.job.updatedAt,
        }
      : null;

    return {
      id: row.id,
      userId: row.userId,
      text: row.text,
      createdAt: row.createdAt,
      job,
    };
  }
}
