import { Prisma } from "../../generated/prisma";
import { prisma } from "../database/prisma.client";
import { ISearchRepository } from "../../domain/repositories/ISearchRepository";
import { SearchItemEntity, SearchItemType } from "../../domain/entities/SearchItem";
import { PageResult } from "../../shared/types/pagination.types";
import { SearchCursorData, encodeSearchCursor } from "../../shared/utils/cursor";

interface SearchRow {
  type: string;
  id: string;
  display: string;
  tier: string | null;
  audioUrl: string | null;
  promptText: string | null;
  createdAt: Date;
  score: number | bigint;
}

export class SearchRepository implements ISearchRepository {
  async search(q: string, cursor: SearchCursorData | null, limit: number): Promise<PageResult<SearchItemEntity>> {
    const likePattern = `%${q}%`;

    const cursorClause = cursor
      ? Prisma.sql`
          AND (
            score < ${cursor.score}
            OR (score = ${cursor.score} AND "createdAt" < ${cursor.createdAt})
            OR (score = ${cursor.score} AND "createdAt" = ${cursor.createdAt} AND id < ${cursor.id})
          )
        `
      : Prisma.empty;

    const rows = await prisma.$queryRaw<SearchRow[]>`
      WITH results AS (
        SELECT
          'user'::text                                                      AS type,
          u.id,
          u.email                                                           AS display,
          u.tier::text                                                      AS tier,
          NULL::text                                                        AS "audioUrl",
          NULL::text                                                        AS "promptText",
          u."createdAt",
          CASE WHEN LOWER(u.email) = LOWER(${q}) THEN 2 ELSE 1 END         AS score
        FROM "User" u
        WHERE u.email ILIKE ${likePattern}

        UNION ALL

        SELECT
          'audio'::text                                                     AS type,
          p.id,
          COALESCE(g.title, p.text)                                         AS display,
          NULL::text                                                        AS tier,
          g."audioUrl",
          p.text                                                            AS "promptText",
          p."createdAt",
          CASE
            WHEN LOWER(COALESCE(g.title, '')) = LOWER(${q})
              OR LOWER(p.text) = LOWER(${q}) THEN 2
            ELSE 1
          END                                                               AS score
        FROM "Prompt" p
        INNER JOIN "GenerationJob" g ON g."promptId" = p.id
        WHERE g.status = 'COMPLETED'
          AND (p.text ILIKE ${likePattern} OR g.title ILIKE ${likePattern})
      )
      SELECT * FROM results
      WHERE TRUE ${cursorClause}
      ORDER BY score DESC, "createdAt" DESC, id DESC
      LIMIT ${limit + 1}
    `;

    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;
    const last = items[items.length - 1];
    const nextCursor =
      hasMore && last
        ? encodeSearchCursor(Number(last.score), last.createdAt, last.id)
        : null;

    return {
      items: items.map((r) => ({
        type: r.type as SearchItemType,
        id: r.id,
        display: r.display,
        tier: r.tier ?? undefined,
        audioUrl: r.audioUrl,
        promptText: r.promptText ?? undefined,
        createdAt: r.createdAt,
        score: Number(r.score),
      })),
      nextCursor,
    };
  }
}
