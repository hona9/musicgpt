import { Router } from "express";
import { SearchController } from "../../controllers/SearchController";
import { SearchRepository } from "../../../infrastructure/repositories/SearchRepository";
import { SearchUseCase } from "../../../application/usecases/search/SearchUseCase";
import { authenticate } from "../../middlewares/auth.middleware";

const searchRepository = new SearchRepository();
const searchUseCase = new SearchUseCase(searchRepository);
const searchController = new SearchController(searchUseCase);

const router = Router();

// GET /api/v1/search?q=&cursor=&limit=
router.get("/", authenticate, searchController.search);

export default router;
