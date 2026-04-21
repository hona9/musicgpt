import { SearchItemEntity } from "../entities/SearchItem";
import { SearchCursorData } from "../../shared/utils/cursor";
import { PageResult } from "../../shared/types/pagination.types";

export interface ISearchRepository {
  search(q: string, cursor: SearchCursorData | null, limit: number): Promise<PageResult<SearchItemEntity>>;
}
