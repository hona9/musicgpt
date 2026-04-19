import { ISearchRepository } from "../../../domain/repositories/ISearchRepository";
import { UserEntity } from "../../../domain/entities/User";
import { PromptWithJobEntity } from "../../../domain/entities/PromptWithJob";
import { SearchQuery } from "../../dtos/search/SearchDto";
import { PageResult } from "../../../shared/types/pagination.types";
import { decodeCursor } from "../../../shared/utils/cursor";

export interface SearchResult {
  users: PageResult<UserEntity>;
  prompts: PageResult<PromptWithJobEntity>;
}

export class SearchUseCase {
  constructor(private readonly searchRepository: ISearchRepository) {}

  async execute(query: SearchQuery): Promise<SearchResult> {
    const cursor = query.cursor ? decodeCursor(query.cursor) : null;

    const [users, prompts] = await Promise.all([
      this.searchRepository.searchUsers(query.q, cursor, query.limit),
      this.searchRepository.searchPrompts(query.q, cursor, query.limit),
    ]);

    return { users, prompts };
  }
}
