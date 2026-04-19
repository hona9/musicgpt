import { IPromptRepository } from "../../../domain/repositories/IPromptRepository";
import { IGenerationJobRepository } from "../../../domain/repositories/IGenerationJobRepository";
import { ICacheService } from "../../../domain/services/ICacheService";
import { PromptEntity } from "../../../domain/entities/Prompt";
import { GenerationJobEntity } from "../../../domain/entities/GenerationJob";
import { CreatePromptDto } from "../../dtos/prompt/CreatePromptDto";
import { SubscriptionTier } from "../../../shared/types/enums";
import { JOB_PRIORITY } from "../../../config/limits";

export interface CreatePromptResult {
  prompt: PromptEntity;
  job: GenerationJobEntity;
}

export class CreatePromptUseCase {
  constructor(
    private readonly promptRepository: IPromptRepository,
    private readonly generationJobRepository: IGenerationJobRepository,
    private readonly cacheService: ICacheService,
  ) {}

  async execute(
    dto: CreatePromptDto,
    userId: string,
    tier: SubscriptionTier,
  ): Promise<CreatePromptResult> {
    const prompt = await this.promptRepository.create({
      userId,
      text: dto.text,
    });

    const priority = JOB_PRIORITY[tier];

    const job = await this.generationJobRepository.create({
      promptId: prompt.id,
      userId,
      priority,
    });

    // Invalidate the cached prompt list for this user.
    await this.cacheService.invalidatePattern(`cache:prompts:${userId}:*`);

    return { prompt, job };
  }
}
