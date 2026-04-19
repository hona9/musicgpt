import { prisma } from "../database/prisma.client";
import {
  IUserRepository,
  CreateUserData,
  UserWithCredentials,
  UserWithRefreshToken,
} from "../../domain/repositories/IUserRepository";
import { UserEntity } from "../../domain/entities/User";

export class UserRepository implements IUserRepository {
  async findById(id: string): Promise<UserEntity | null> {
    const user = await prisma.user.findUnique({ where: { id } });
    return user ? this.toEntity(user) : null;
  }

  async findByEmail(email: string): Promise<UserWithCredentials | null> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    return { ...this.toEntity(user), passwordHash: user.passwordHash };
  }

  async findByRefreshToken(token: string): Promise<UserWithRefreshToken | null> {
    const user = await prisma.user.findUnique({ where: { refreshToken: token } });
    if (!user || !user.refreshToken || !user.refreshTokenExpiresAt) return null;
    return {
      ...this.toEntity(user),
      refreshToken: user.refreshToken,
      refreshTokenExpiresAt: user.refreshTokenExpiresAt,
    };
  }

  async create(data: CreateUserData): Promise<UserEntity> {
    const user = await prisma.user.create({ data });
    return this.toEntity(user);
  }

  async updateRefreshToken(
    userId: string,
    token: string | null,
    expiresAt: Date | null,
  ): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: token, refreshTokenExpiresAt: expiresAt },
    });
  }

  private toEntity(user: {
    id: string;
    email: string;
    tier: UserEntity["tier"];
    createdAt: Date;
    updatedAt: Date;
  }): UserEntity {
    return {
      id: user.id,
      email: user.email,
      tier: user.tier,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
