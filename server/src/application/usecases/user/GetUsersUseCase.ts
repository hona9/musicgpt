import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { ICacheService } from "../../../domain/services/ICacheService";
import { UserEntity } from "../../../domain/entities/User";
import { CursorPaginationQuery } from "../../dtos/shared/CursorPaginationDto";
import { PageResult } from "../../../shared/types/pagination.types";
import { decodeCursor } from "../../../shared/utils/cursor";
import { CACHE_TTL_SECONDS } from "../../../config/limits";

export class GetUsersUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly cacheService: ICacheService,
  ) {}

  async execute(query: CursorPaginationQuery): Promise<PageResult<UserEntity>> {
    const cacheKey = `cache:users:${query.cursor ?? "first"}:${query.limit}`;

    const cached = await this.cacheService.get<PageResult<UserEntity>>(cacheKey);
    if (cached) return cached;

    const cursor = query.cursor ? decodeCursor(query.cursor) : null;
    const result = await this.userRepository.findAll(cursor, query.limit);

    await this.cacheService.set(cacheKey, result, CACHE_TTL_SECONDS);

    return result;
  }
}
