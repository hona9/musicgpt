import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { RegisterUseCase } from "../../application/usecases/auth/RegisterUseCase";
import { LoginUseCase } from "../../application/usecases/auth/LoginUseCase";
import { RefreshTokenUseCase } from "../../application/usecases/auth/RefreshTokenUseCase";
import { LogoutUseCase } from "../../application/usecases/auth/LogoutUseCase";
import { AuthUser } from "../../shared/types/auth.types";

export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
  ) {}

  register = async (req: Request, res: Response): Promise<void> => {
    const user = await this.registerUseCase.execute(req.body);
    res.status(StatusCodes.CREATED).json({ status: "success", data: { user } });
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const result = await this.loginUseCase.execute(req.body);
    res.status(StatusCodes.OK).json({ status: "success", data: result });
  };

  refresh = async (req: Request, res: Response): Promise<void> => {
    const result = await this.refreshTokenUseCase.execute(req.body.refreshToken);
    res.status(StatusCodes.OK).json({ status: "success", data: result });
  };

  me = (req: Request, res: Response): void => {
    const { sub, email, tier } = req.user!;
    const user: AuthUser = { id: sub, email, tier };
    res.status(StatusCodes.OK).json({ status: "success", data: { user } });
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    const { sub, jti, exp } = req.user!;
    await this.logoutUseCase.execute(sub, jti, exp!);
    res.status(StatusCodes.NO_CONTENT).send();
  };
}
