import { Request, Response, NextFunction } from "express";
import { RateLimiterService } from "../../infrastructure/services/RateLimiterService";
import { TooManyRequestsError } from "../../shared/errors";
import { RATE_LIMIT_MAX } from "../../config/limits";

const rateLimiterService = new RateLimiterService();

export async function rateLimitByTier(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const { sub: userId, tier } = req.user!;
  const limit = RATE_LIMIT_MAX[tier];

  const result = await rateLimiterService.check(userId, limit);

  if (!result.allowed) {
    throw new TooManyRequestsError(
      `Rate limit exceeded. ${limit} requests per hour allowed. Resets in ${result.resetInSeconds}s.`,
    );
  }

  next();
}
