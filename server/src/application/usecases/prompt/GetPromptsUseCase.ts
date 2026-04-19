import { IPromptRepository } from "../../../domain/repositories/IPromptRepository";
import { ICacheService } from "../../../domain/services/ICacheService";
import { PromptWithJobEntity } from "../../../domain/entities/PromptWithJob";
import { CursorPaginationQuery } from "../../dtos/shared/CursorPaginationDto";
import { PageResult } from "../../../shared/types/pagination.types";
import { decodeCursor } from "../../../shared/utils/cursor";
import { CACHE_TTL_SECONDS } from "../../../config/limits";

export class GetPromptsUseCase {
  constructor(
    private readonly promptRepository: IPromptRepository,
    private readonly cacheService: ICacheService,
  ) {}

  async execute(userId: string, query: CursorPaginationQuery): Promise<PageResult<PromptWithJobEntity>> {
    const cacheKey = `cache:prompts:${userId}:${query.cursor ?? "first"}:${query.limit}`;

    const cached = await this.cacheService.get<PageResult<PromptWithJobEntity>>(cacheKey);
    if (cached) return cached;

    const cursor = query.cursor ? decodeCursor(query.cursor) : null;
    const result = await this.promptRepository.findByUserId(userId, cursor, query.limit);

    await this.cacheService.set(cacheKey, result, CACHE_TTL_SECONDS);

    return result;
  }
}
