import { Router } from "express";
import { UserController } from "../../controllers/UserController";
import { UserRepository } from "../../../infrastructure/repositories/UserRepository";
import { GetUsersUseCase } from "../../../application/usecases/user/GetUsersUseCase";
import { cacheService } from "../../../infrastructure/services/CacheService";
import { authenticate } from "../../middlewares/auth.middleware";

const userRepository = new UserRepository();
const getUsersUseCase = new GetUsersUseCase(userRepository, cacheService);
const userController = new UserController(getUsersUseCase);

const router = Router();

// GET /api/v1/users?cursor=&limit=
router.get("/", authenticate, userController.list);

export default router;
