import { prisma } from "../database/prisma.client";
import {
  IPromptRepository,
  CreatePromptData,
} from "../../domain/repositories/IPromptRepository";
import { PromptEntity } from "../../domain/entities/Prompt";

export class PromptRepository implements IPromptRepository {
  async create(data: CreatePromptData): Promise<PromptEntity> {
    const prompt = await prisma.prompt.create({ data });
    return this.toEntity(prompt);
  }

  async findById(id: string): Promise<PromptEntity | null> {
    const prompt = await prisma.prompt.findUnique({ where: { id } });
    return prompt ? this.toEntity(prompt) : null;
  }

  private toEntity(prompt: {
    id: string;
    userId: string;
    text: string;
    createdAt: Date;
  }): PromptEntity {
    return {
      id: prompt.id,
      userId: prompt.userId,
      text: prompt.text,
      createdAt: prompt.createdAt,
    };
  }
}
