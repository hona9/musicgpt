import { getRedisClient } from "../database/redis.client";
import { RATE_LIMIT_WINDOW_SECONDS } from "../../config/limits";

export interface RateLimitResult {
  allowed: boolean;
  current: number;
  limit: number;
  resetInSeconds: number;
}

export class RateLimiterService {
  async check(userId: string, limit: number): Promise<RateLimitResult> {
    const redis = getRedisClient();
    const key = `rate_limit:${userId}`;

    const pipeline = redis.multi();
    pipeline.incr(key);
    pipeline.ttl(key);
    const results = await pipeline.exec();

    const current = results![0]![1] as number;
    let ttl = results![1]![1] as number;

    // Key was just created by INCR — set the 1-hour window expiry.
    if (current === 1) {
      await redis.expire(key, RATE_LIMIT_WINDOW_SECONDS);
      ttl = RATE_LIMIT_WINDOW_SECONDS;
    }

    return {
      allowed: current <= limit,
      current,
      limit,
      resetInSeconds: ttl > 0 ? ttl : RATE_LIMIT_WINDOW_SECONDS,
    };
  }
}
