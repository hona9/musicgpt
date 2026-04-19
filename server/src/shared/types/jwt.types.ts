import { SubscriptionTier } from "./enums";

export interface AccessTokenPayload {
  sub: string; // userId
  jti: string; // unique ID — used for blacklisting on logout
  email: string;
  tier: SubscriptionTier;
  iat?: number;
  exp?: number;
}
