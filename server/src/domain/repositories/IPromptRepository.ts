import { PromptEntity } from "../entities/Prompt";

export interface CreatePromptData {
  userId: string;
  text: string;
}

export interface IPromptRepository {
  create(data: CreatePromptData): Promise<PromptEntity>;
  findById(id: string): Promise<PromptEntity | null>;
}
