import { UserEntity } from "../entities/User";
import { CursorData, PageResult } from "../../shared/types/pagination.types";

export interface UserWithCredentials extends UserEntity {
  passwordHash: string;
}

export interface UserWithRefreshToken extends UserEntity {
  refreshToken: string;
  refreshTokenExpiresAt: Date;
}

export interface CreateUserData {
  email: string;
  passwordHash: string;
  tier: import("../../shared/types/enums").SubscriptionTier;
}

export interface IUserRepository {
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserWithCredentials | null>;
  findByRefreshToken(token: string): Promise<UserWithRefreshToken | null>;
  create(data: CreateUserData): Promise<UserEntity>;
  updateRefreshToken(
    userId: string,
    token: string | null,
    expiresAt: Date | null,
  ): Promise<void>;
  findAll(cursor: CursorData | null, limit: number): Promise<PageResult<UserEntity>>;
}
