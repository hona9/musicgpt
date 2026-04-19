import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env";
import { StatusCodes } from "http-status-codes";
import { swaggerSpec } from "./config/swagger";
import apiRouter from "./presentation/routes";
import { errorMiddleware } from "./presentation/middlewares/error.middleware";

const app: Application = express();

// ─── API Docs ─────────────────────────────────────────────────────────────────
// Mounted before helmet so swagger-ui assets aren't blocked by CSP headers.
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ─── Security ────────────────────────────────────────────────────────────────
app.use(helmet());

app.use(
  cors({
    origin: env.cors_origin,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

// ─── Request Parsing ─────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ─── Logging ─────────────────────────────────────────────────────────────────
app.use(morgan(env.node_env === "production" ? "combined" : "dev"));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/health", (_req: Request, res: Response) => {
  res.status(StatusCodes.OK).json({ status: "ok", environment: env.node_env });
});

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use("/api", apiRouter);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(StatusCodes.NOT_FOUND).json({ message: "Route not found" });
});

// ─── Global Error Handler ────────────────────────────────────────────────────
app.use(errorMiddleware);

export default app;
