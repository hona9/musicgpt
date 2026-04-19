import { prisma } from "../database/prisma.client";

export class NotificationRepository {
  async create(userId: string, promptId: string, message: string): Promise<void> {
    await prisma.notification.create({
      data: { userId, promptId, message },
    });
  }
}
