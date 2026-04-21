import { Prisma } from "../../generated/prisma";
import { prisma } from "../database/prisma.client";
import { ISearchRepository } from "../../domain/repositories/ISearchRepository";
import { UserEntity } from "../../domain/entities/User";
import { PromptWithJobEntity } from "../../domain/entities/PromptWithJob";
import { GenerationJobEntity } from "../../domain/entities/GenerationJob";
import { JobStatus, SubscriptionTier } from "../../shared/types/enums";
import { CursorData, PageResult } from "../../shared/types/pagination.types";
import { encodeCursor } from "../../shared/utils/cursor";

interface UserRow {
  id: string;
  email: string;
  tier: string;
  createdAt: Date;
  updatedAt: Date;
}

interface PromptRow {
  id: string;
  userId: string;
  text: string;
  createdAt: Date;
  jobId: string;
  jobStatus: string;
  jobPriority: number;
  title: string | null;
  audioUrl: string | null;
  errorMessage: string | null;
  jobCreatedAt: Date;
  jobUpdatedAt: Date;
}

export class SearchRepository implements ISearchRepository {
  async searchUsers(q: string, cursor: CursorData | null, limit: number): Promise<PageResult<UserEntity>> {
    const cursorClause = cursor
      ? Prisma.sql`AND ("createdAt" < ${cursor.createdAt} OR ("createdAt" = ${cursor.createdAt} AND id < ${cursor.id}))`
      : Prisma.empty;

    const rows = await prisma.$queryRaw<UserRow[]>`
      SELECT id, email, tier::text, "createdAt", "updatedAt"
      FROM "User"
      WHERE to_tsvector('english', email) @@ websearch_to_tsquery('english', ${q})
      ${cursorClause}
      ORDER BY
        ts_rank(to_tsvector('english', email), websearch_to_tsquery('english', ${q})) DESC,
        "createdAt" DESC,
        id DESC
      LIMIT ${limit + 1}
    `;

    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore ? encodeCursor(items[items.length - 1].id, items[items.length - 1].createdAt) : null;

    return {
      items: items.map((r) => ({
        id: r.id,
        email: r.email,
        tier: r.tier as SubscriptionTier,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      })),
      nextCursor,
    };
  }

  async searchPrompts(q: string, userId: string, cursor: CursorData | null, limit: number): Promise<PageResult<PromptWithJobEntity>> {
    const cursorClause = cursor
      ? Prisma.sql`AND (p."createdAt" < ${cursor.createdAt} OR (p."createdAt" = ${cursor.createdAt} AND p.id < ${cursor.id}))`
      : Prisma.empty;

    const rows = await prisma.$queryRaw<PromptRow[]>`
      SELECT
        p.id,
        p."userId",
        p.text,
        p."createdAt",
        g.id           AS "jobId",
        g.status::text AS "jobStatus",
        g.priority     AS "jobPriority",
        g.title,
        g."audioUrl",
        g."errorMessage",
        g."createdAt"  AS "jobCreatedAt",
        g."updatedAt"  AS "jobUpdatedAt"
      FROM "Prompt" p
      INNER JOIN "GenerationJob" g ON g."promptId" = p.id
      WHERE g.status = 'COMPLETED'
        AND p."userId" = ${userId}
        AND to_tsvector('english', p.text) @@ websearch_to_tsquery('english', ${q})
        ${cursorClause}
      ORDER BY
        ts_rank(to_tsvector('english', p.text), websearch_to_tsquery('english', ${q})) DESC,
        p."createdAt" DESC,
        p.id DESC
      LIMIT ${limit + 1}
    `;

    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore ? encodeCursor(items[items.length - 1].id, items[items.length - 1].createdAt) : null;

    return {
      items: items.map((r) => this.toPromptWithJob(r)),
      nextCursor,
    };
  }

  private toPromptWithJob(r: PromptRow): PromptWithJobEntity {
    const job: GenerationJobEntity = {
      id: r.jobId,
      promptId: r.id,
      userId: r.userId,
      status: r.jobStatus as JobStatus,
      priority: r.jobPriority,
      title: r.title,
      audioUrl: r.audioUrl,
      errorMessage: r.errorMessage,
      createdAt: r.jobCreatedAt,
      updatedAt: r.jobUpdatedAt,
    };
    return {
      id: r.id,
      userId: r.userId,
      text: r.text,
      createdAt: r.createdAt,
      job,
    };
  }
}
