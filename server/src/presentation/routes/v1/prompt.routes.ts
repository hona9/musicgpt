import { Router } from "express";
import { PromptController } from "../../controllers/PromptController";
import { PromptRepository } from "../../../infrastructure/repositories/PromptRepository";
import { GenerationJobRepository } from "../../../infrastructure/repositories/GenerationJobRepository";
import { CreatePromptUseCase } from "../../../application/usecases/prompt/CreatePromptUseCase";
import { GetPromptsUseCase } from "../../../application/usecases/prompt/GetPromptsUseCase";
import { cacheService } from "../../../infrastructure/services/CacheService";
import { authenticate } from "../../middlewares/auth.middleware";
import { rateLimitByTier } from "../../middlewares/rateLimit.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { CreatePromptSchema } from "../../../application/dtos/prompt/CreatePromptDto";

const promptRepository = new PromptRepository();
const generationJobRepository = new GenerationJobRepository();
const createPromptUseCase = new CreatePromptUseCase(promptRepository, generationJobRepository, cacheService);
const getPromptsUseCase = new GetPromptsUseCase(promptRepository, cacheService);
const promptController = new PromptController(createPromptUseCase, getPromptsUseCase);

const router = Router();

// GET /api/v1/prompts?cursor=&limit=
router.get("/", authenticate, promptController.list);

// POST /api/v1/prompts
router.post(
  "/",
  authenticate,
  rateLimitByTier,
  validate(CreatePromptSchema),
  promptController.create,
);

export default router;
