import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { AppError } from "../../shared/errors";
import { env } from "../../config/env";

// "fail" = client error (4xx), "error" = server error (5xx) — JSend-style
function resolveStatus(statusCode: number): "error" | "fail" {
  return statusCode >= 500 ? "error" : "fail";
}

function handleOperationalError(
  err: AppError,
  res: Response,
): void {
  const body: Record<string, unknown> = {
    status: resolveStatus(err.statusCode),
    message: err.message,
  };

  if (env.node_env !== "production") {
    body.stack = err.stack;
  }

  res.status(err.statusCode).json(body);
}

function handleUnknownError(err: unknown, res: Response): void {
  console.error("[UNHANDLED ERROR]", err);

  const body: Record<string, unknown> = {
    status: "error",
    message:
      env.node_env === "production"
        ? "Something went wrong. Please try again later."
        : err instanceof Error
          ? err.message
          : String(err),
  };

  if (env.node_env !== "production" && err instanceof Error) {
    body.stack = err.stack;
  }

  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(body);
}

// Converts known third-party errors into AppError so the handler stays clean.
function normalizeError(err: unknown): AppError | null {
  if (err instanceof AppError) return err;

  // Prisma unique constraint violation
  if (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: string }).code === "P2002"
  ) {
    return new AppError("A record with that value already exists.", StatusCodes.CONFLICT);
  }

  // Prisma record not found
  if (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: string }).code === "P2025"
  ) {
    return new AppError("Record not found.", StatusCodes.NOT_FOUND);
  }

  // JWT errors
  if (err instanceof Error && err.name === "JsonWebTokenError") {
    return new AppError("Invalid token.", StatusCodes.UNAUTHORIZED);
  }

  if (err instanceof Error && err.name === "TokenExpiredError") {
    return new AppError("Token has expired.", StatusCodes.UNAUTHORIZED);
  }

  return null;
}

export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const normalized = normalizeError(err);

  if (normalized) {
    handleOperationalError(normalized, res);
    return;
  }

  handleUnknownError(err, res);
}
