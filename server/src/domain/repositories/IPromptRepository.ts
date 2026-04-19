import { PromptEntity } from "../entities/Prompt";
import { PromptWithJobEntity } from "../entities/PromptWithJob";
import { CursorData, PageResult } from "../../shared/types/pagination.types";

export interface CreatePromptData {
  userId: string;
  text: string;
}

export interface IPromptRepository {
  create(data: CreatePromptData): Promise<PromptEntity>;
  findById(id: string): Promise<PromptEntity | null>;
  findByUserId(userId: string, cursor: CursorData | null, limit: number): Promise<PageResult<PromptWithJobEntity>>;
}
