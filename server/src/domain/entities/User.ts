import { SubscriptionTier } from "../../shared/types/enums";

export interface UserEntity {
  id: string;
  email: string;
  tier: SubscriptionTier;
  createdAt: Date;
  updatedAt: Date;
}
