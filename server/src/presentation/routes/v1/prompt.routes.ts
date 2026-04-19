import { Router } from "express";
import { PromptController } from "../../controllers/PromptController";
import { PromptRepository } from "../../../infrastructure/repositories/PromptRepository";
import { GenerationJobRepository } from "../../../infrastructure/repositories/GenerationJobRepository";
import { CreatePromptUseCase } from "../../../application/usecases/prompt/CreatePromptUseCase";
import { authenticate } from "../../middlewares/auth.middleware";
import { rateLimitByTier } from "../../middlewares/rateLimit.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { CreatePromptSchema } from "../../../application/dtos/prompt/CreatePromptDto";

const promptRepository = new PromptRepository();
const generationJobRepository = new GenerationJobRepository();
const createPromptUseCase = new CreatePromptUseCase(promptRepository, generationJobRepository);
const promptController = new PromptController(createPromptUseCase);

const router = Router();

// POST /api/v1/prompts
// authenticate → rateLimitByTier → validate body → create prompt + job
router.post(
  "/",
  authenticate,
  rateLimitByTier,
  validate(CreatePromptSchema),
  promptController.create,
);

export default router;
