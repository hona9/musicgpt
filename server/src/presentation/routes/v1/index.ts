import { Router } from "express";
import authRoutes from "./auth.routes";
import promptRoutes from "./prompt.routes";

const v1Router = Router();

v1Router.use("/auth", authRoutes);
v1Router.use("/prompts", promptRoutes);

export default v1Router;
