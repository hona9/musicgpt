import { Router } from "express";
import { AuthController } from "../../controllers/AuthController";
import { UserRepository } from "../../../infrastructure/repositories/UserRepository";
import { JwtService } from "../../../infrastructure/services/JwtService";
import { TokenBlacklistService } from "../../../infrastructure/services/TokenBlacklistService";
import { RegisterUseCase } from "../../../application/usecases/auth/RegisterUseCase";
import { LoginUseCase } from "../../../application/usecases/auth/LoginUseCase";
import { RefreshTokenUseCase } from "../../../application/usecases/auth/RefreshTokenUseCase";
import { LogoutUseCase } from "../../../application/usecases/auth/LogoutUseCase";
import { authenticate } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { RegisterSchema } from "../../../application/dtos/auth/RegisterDto";
import { LoginSchema } from "../../../application/dtos/auth/LoginDto";
import { RefreshTokenSchema } from "../../../application/dtos/auth/RefreshTokenDto";

const userRepository = new UserRepository();
const jwtService = new JwtService();
const blacklistService = new TokenBlacklistService();

const controller = new AuthController(
  new RegisterUseCase(userRepository),
  new LoginUseCase(userRepository, jwtService),
  new RefreshTokenUseCase(userRepository, jwtService),
  new LogoutUseCase(userRepository, blacklistService),
);

const router = Router();

router.post("/register", validate(RegisterSchema), controller.register);
router.post("/login", validate(LoginSchema), controller.login);
router.post("/refresh", validate(RefreshTokenSchema), controller.refresh);
router.get("/me", authenticate, controller.me);
router.post("/logout", authenticate, controller.logout);

export default router;
