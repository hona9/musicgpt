import Redis from "ioredis";
import { env } from "../../config/env";

let instance: Redis | null = null;

export function getRedisClient(): Redis {
  if (!instance) {
    instance = new Redis(env.redis_url, {
      maxRetriesPerRequest: null, // required by BullMQ when sharing a connection
    });
  }
  return instance;
}
