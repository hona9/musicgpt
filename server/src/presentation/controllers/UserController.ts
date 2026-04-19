import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { GetUsersUseCase } from "../../application/usecases/user/GetUsersUseCase";
import { CursorPaginationSchema } from "../../application/dtos/shared/CursorPaginationDto";

export class UserController {
  constructor(private readonly getUsersUseCase: GetUsersUseCase) {}

  list = async (req: Request, res: Response): Promise<void> => {
    const query = CursorPaginationSchema.parse(req.query);
    const result = await this.getUsersUseCase.execute(query);

    res.status(StatusCodes.OK).json({
      status: "success",
      data: result,
    });
  };
}
