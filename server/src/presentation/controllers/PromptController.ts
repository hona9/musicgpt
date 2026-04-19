import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { CreatePromptUseCase } from "../../application/usecases/prompt/CreatePromptUseCase";
import { GetPromptsUseCase } from "../../application/usecases/prompt/GetPromptsUseCase";
import { CursorPaginationSchema } from "../../application/dtos/shared/CursorPaginationDto";

export class PromptController {
  constructor(
    private readonly createPromptUseCase: CreatePromptUseCase,
    private readonly getPromptsUseCase: GetPromptsUseCase,
  ) {}

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

  list = async (req: Request, res: Response): Promise<void> => {
    const { sub: userId } = req.user!;
    const query = CursorPaginationSchema.parse(req.query);
    const result = await this.getPromptsUseCase.execute(userId, query);

    res.status(StatusCodes.OK).json({
      status: "success",
      data: result,
    });
  };
}
