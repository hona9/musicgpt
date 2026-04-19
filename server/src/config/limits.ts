import { SubscriptionTier } from "../shared/types/enums";

export const JOB_PRIORITY: Record<SubscriptionTier, number> = {
  [SubscriptionTier.PAID]: 10,
  [SubscriptionTier.FREE]: 0,
};

export const RATE_LIMIT_MAX: Record<SubscriptionTier, number> = {
  [SubscriptionTier.PAID]: 20,
  [SubscriptionTier.FREE]: 3,
};

// Redis key pattern: rate_limit:{userId}
export const RATE_LIMIT_WINDOW_SECONDS = 60 * 60; // 1 hour

export const REFRESH_TOKEN_TTL_DAYS = 10;
export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
export const CACHE_TTL_SECONDS = 60;
