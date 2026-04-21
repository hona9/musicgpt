import { ISearchRepository } from "../../../domain/repositories/ISearchRepository";
import { SearchItemEntity } from "../../../domain/entities/SearchItem";
import { SearchQuery } from "../../dtos/search/SearchDto";
import { PageResult } from "../../../shared/types/pagination.types";
import { decodeSearchCursor } from "../../../shared/utils/cursor";

export class SearchUseCase {
  constructor(private readonly searchRepository: ISearchRepository) {}

  async execute(query: SearchQuery): Promise<PageResult<SearchItemEntity>> {
    const cursor = query.cursor ? decodeSearchCursor(query.cursor) : null;
    return this.searchRepository.search(query.q, cursor, query.limit);
  }
}
