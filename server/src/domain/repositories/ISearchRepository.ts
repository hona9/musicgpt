import { UserEntity } from "../entities/User";
import { PromptWithJobEntity } from "../entities/PromptWithJob";
import { CursorData, PageResult } from "../../shared/types/pagination.types";

export interface ISearchRepository {
  searchUsers(q: string, cursor: CursorData | null, limit: number): Promise<PageResult<UserEntity>>;
  searchPrompts(q: string, userId: string, cursor: CursorData | null, limit: number): Promise<PageResult<PromptWithJobEntity>>;
}
