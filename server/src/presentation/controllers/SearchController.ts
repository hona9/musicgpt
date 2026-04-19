import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { SearchUseCase } from "../../application/usecases/search/SearchUseCase";
import { SearchSchema } from "../../application/dtos/search/SearchDto";

export class SearchController {
  constructor(private readonly searchUseCase: SearchUseCase) {}

  search = async (req: Request, res: Response): Promise<void> => {
    const query = SearchSchema.parse(req.query);
    const result = await this.searchUseCase.execute(query);

    res.status(StatusCodes.OK).json({
      status: "success",
      data: result,
    });
  };
}
