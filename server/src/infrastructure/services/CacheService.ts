import { getRedisClient } from "../database/redis.client";
import { ICacheService } from "../../domain/services/ICacheService";

export class CacheService implements ICacheService {
  async get<T>(key: string): Promise<T | null> {
    const redis = getRedisClient();
    const value = await redis.get(key);
    return value ? (JSON.parse(value) as T) : null;
  }

  async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    const redis = getRedisClient();
    await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  }

  async invalidatePattern(pattern: string): Promise<void> {
    const redis = getRedisClient();
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }
}

export const cacheService = new CacheService();
