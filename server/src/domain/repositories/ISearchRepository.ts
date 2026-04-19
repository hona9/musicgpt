import { UserEntity } from "../entities/User";
import { PromptWithJobEntity } from "../entities/PromptWithJob";
import { CursorData, PageResult } from "../../shared/types/pagination.types";

export interface ISearchRepository {
  searchPrompts(q: string, cursor: CursorData | null, limit: number): Promise<PageResult<PromptWithJobEntity>>;
  searchUsers(q: string, cursor: CursorData | null, limit: number): Promise<PageResult<UserEntity>>;
}
