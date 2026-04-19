import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { CreatePromptUseCase } from "../../application/usecases/prompt/CreatePromptUseCase";

export class PromptController {
  constructor(private readonly createPromptUseCase: CreatePromptUseCase) {}

  create = async (req: Request, res: Response): Promise<void> => {
    const { sub: userId, tier } = req.user!;
    const result = await this.createPromptUseCase.execute(req.body, userId, tier);

    res.status(StatusCodes.ACCEPTED).json({
      status: "success",
      data: {
        promptId: result.prompt.id,
        jobId: result.job.id,
        jobStatus: result.job.status,
      },
    });
  };
}
