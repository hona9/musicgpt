import { ITokenBlacklistService } from "../../domain/services/ITokenBlacklistService";
import { getRedisClient } from "../database/redis.client";

const BLACKLIST_PREFIX = "blacklist:";

export class TokenBlacklistService implements ITokenBlacklistService {
  async add(jti: string, ttlSeconds: number): Promise<void> {
    await getRedisClient().set(
      `${BLACKLIST_PREFIX}${jti}`,
      "1",
      "EX",
      ttlSeconds,
    );
  }

  async has(jti: string): Promise<boolean> {
    const result = await getRedisClient().get(`${BLACKLIST_PREFIX}${jti}`);

    return result !== null;
  }
}
