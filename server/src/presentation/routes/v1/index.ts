import { Router } from "express";
import authRoutes from "./auth.routes";
import promptRoutes from "./prompt.routes";
import userRoutes from "./user.routes";
import searchRoutes from "./search.routes";

const v1Router = Router();

v1Router.use("/auth", authRoutes);
v1Router.use("/prompts", promptRoutes);
v1Router.use("/users", userRoutes);
v1Router.use("/search", searchRoutes);

export default v1Router;
