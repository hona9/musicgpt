import { prisma } from "../database/prisma.client";
import {
  IUserRepository,
  CreateUserData,
  UserWithCredentials,
  UserWithRefreshToken,
} from "../../domain/repositories/IUserRepository";
import { UserEntity } from "../../domain/entities/User";
import { CursorData, PageResult } from "../../shared/types/pagination.types";
import { encodeCursor } from "../../shared/utils/cursor";

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

  async findAll(cursor: CursorData | null, limit: number): Promise<PageResult<UserEntity>> {
    const rows = await prisma.user.findMany({
      where: cursor
        ? {
            OR: [
              { createdAt: { lt: cursor.createdAt } },
              { createdAt: { equals: cursor.createdAt }, id: { lt: cursor.id } },
            ],
          }
        : undefined,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit + 1,
    });

    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore
      ? encodeCursor(items[items.length - 1].id, items[items.length - 1].createdAt)
      : null;

    return { items: items.map(this.toEntity), nextCursor };
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
