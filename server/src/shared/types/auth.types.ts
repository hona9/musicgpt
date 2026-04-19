import { SubscriptionTier } from "./enums";

export interface AuthUser {
  id: string;
  email: string;
  tier: SubscriptionTier;
}

export interface AuthTokensResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}
